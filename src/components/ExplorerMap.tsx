import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, type GestureResponderEvent, type LayoutChangeEvent, Pressable, StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import Svg, { G, Path, Rect } from "react-native-svg";
import { WEB_BASE_URL } from "@/src/constants/config";
import { flattenCategories } from "@/src/constants/discovery";
import { radius, spacing, useAppTheme } from "@/src/theme/theme";
import type { Category } from "@/src/types/api";

export type ExplorerMapMode = "domestic" | "international";
type Point = [number, number];
type Pan = { x: number; y: number };
type GeoFeature = { properties?: Record<string, unknown>; geometry?: { type?: string; coordinates?: unknown } };
type GeoCollection = { features?: GeoFeature[] };

const maps: Record<ExplorerMapMode, { assetPath: string; viewBox: string; background: string; prefix: string }> = {
  domestic: { assetPath: "/maps/india-states.geojson", viewBox: "0 0 202 258", background: "#F8FAFC", prefix: "DOM-" },
  international: { assetPath: "/maps/world-countries.geojson", viewBox: "0 0 248 168", background: "#D9F3F8", prefix: "INT-" },
};

const regionAliases: Record<string, string> = {
  "andaman and nicobar": "andaman and nicobar islands", orissa: "odisha", pondicherry: "puducherry", uttaranchal: "uttarakhand",
  "united states of america": "united states", usa: "united states", uae: "dubai", "united arab emirates": "dubai",
};
const internationalCodes: Record<string, string> = {
  argentina: "INT-ARGENTINA", australia: "INT-AUSTRALIA", bali: "INT-BALI", brazil: "INT-BRAZIL", canada: "INT-CANADA", china: "INT-CHINA", dubai: "INT-DUBAI", egypt: "INT-EGYPT", france: "INT-FRANCE", india: "INT-INDIA", malaysia: "INT-MALAYSIA", maldives: "INT-MALDIVES", mexico: "INT-MEXICO", russia: "INT-RUSSIA", singapore: "INT-SINGAPORE", "south africa": "INT-SOUTH-AFRICA", spain: "INT-SPAIN", switzerland: "INT-SWITZERLAND", thailand: "INT-THAILAND", turkey: "INT-TURKEY", "united kingdom": "INT-UK", "united states": "INT-USA", vietnam: "INT-VIETNAM",
};
const domesticCodes: Record<string, string> = {
  "andaman and nicobar": "DOM-AN", "andaman and nicobar islands": "DOM-AN", "andhra pradesh": "DOM-AP", "arunachal pradesh": "DOM-AR", assam: "DOM-AS", bihar: "DOM-BR", chandigarh: "DOM-CH", chhattisgarh: "DOM-CG", "dadra and nagar haveli": "DOM-DN", "dadra and nagar haveli and daman and diu": "DOM-DN", "daman and diu": "DOM-DD", delhi: "DOM-DL", goa: "DOM-GA", gujarat: "DOM-GJ", haryana: "DOM-HR", "himachal pradesh": "DOM-HP", "jammu and kashmir": "DOM-JK", ladakh: "DOM-LA", jharkhand: "DOM-JH", karnataka: "DOM-KA", kerala: "DOM-KL", lakshadweep: "DOM-LK", "madhya pradesh": "DOM-MP", maharashtra: "DOM-MH", manipur: "DOM-MN", meghalaya: "DOM-MG", mizoram: "DOM-MZ", nagaland: "DOM-NL", odisha: "DOM-OD", puducherry: "DOM-PY", punjab: "DOM-PB", rajasthan: "DOM-RJ", sikkim: "DOM-SK", "tamil nadu": "DOM-TN", telangana: "DOM-TS", tripura: "DOM-TR", "uttar pradesh": "DOM-UP", uttarakhand: "DOM-UK", "west bengal": "DOM-WB",
};
const regionColors = ["#F59E0B", "#0EA5E9", "#14B8A6", "#8B5CF6", "#EC4899", "#84CC16", "#F97316", "#06B6D4"];
const minZoom = 1;
const maxZoom = 2.25;
const zoomStep = .25;
const dragThreshold = 6;

const normalise = (value?: unknown) => {
  const raw = String(value ?? "").trim().toLowerCase();
  return regionAliases[raw] ?? raw;
};
const properties = (feature: GeoFeature) => feature.properties ?? {};
const featureName = (feature: GeoFeature) => properties(feature).name || properties(feature).label || properties(feature).NAME || properties(feature).ADMIN || properties(feature).admin || properties(feature).ST_NM || properties(feature).NAME_1 || "";
const featureCode = (feature: GeoFeature) => properties(feature).code || properties(feature).regionCode || properties(feature).REGION_CODE || properties(feature).categoryCode || properties(feature).id || properties(feature).ISO_A3 || properties(feature).ADM1_PCODE || properties(feature).ST_CODE || "";
const slug = (value: string) => value.trim().toUpperCase().replace(/&/g, "AND").replace(/[^A-Z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const polygons = (feature: GeoFeature): Point[][][] => {
  const geometry = feature.geometry;
  if (geometry?.type === "Polygon" && Array.isArray(geometry.coordinates)) return [geometry.coordinates as Point[][]];
  if (geometry?.type === "MultiPolygon" && Array.isArray(geometry.coordinates)) return geometry.coordinates as Point[][][];
  return [];
};
const rings = (feature: GeoFeature) => polygons(feature).flat();
const validRing = (ring: Point[]) => ring.length > 3 && ring.every((point) => Array.isArray(point) && Number.isFinite(point[0]) && Number.isFinite(point[1]));

function containsPoint(ring: Point[], point: Point) {
  let inside = false;
  for (let current = 0, previous = ring.length - 1; current < ring.length; previous = current++) {
    const [x, y] = ring[current];
    const [previousX, previousY] = ring[previous];
    const intersects = (y > point[1]) !== (previousY > point[1])
      && point[0] < ((previousX - x) * (point[1] - y)) / (previousY - y) + x;
    if (intersects) inside = !inside;
  }
  return inside;
}

function projection(geo: GeoCollection, viewBox: string) {
  const [boxX, boxY, boxWidth, boxHeight] = viewBox.split(/\s+/).map(Number);
  const points = (geo.features ?? []).flatMap((feature) => rings(feature).flat()).filter((point): point is Point => Array.isArray(point) && Number.isFinite(point[0]) && Number.isFinite(point[1]));
  if (!points.length) return (point: Point): Point => point;
  const xs = points.map(([x]) => x); const ys = points.map(([, y]) => -y);
  const minX = Math.min(...xs); const maxX = Math.max(...xs); const minY = Math.min(...ys); const maxY = Math.max(...ys);
  const padding = Math.min(boxWidth, boxHeight) * 0.04;
  const scale = Math.min((boxWidth - padding * 2) / Math.max(maxX - minX, 1), (boxHeight - padding * 2) / Math.max(maxY - minY, 1));
  const offsetX = boxX + (boxWidth - (maxX - minX) * scale) / 2;
  const offsetY = boxY + (boxHeight - (maxY - minY) * scale) / 2;
  return ([x, y]: Point): Point => [offsetX + (x - minX) * scale, offsetY + (-y - minY) * scale];
}

function pathFor(feature: GeoFeature, project: (point: Point) => Point) {
  return polygons(feature).flatMap((polygon) => polygon.filter(validRing)).map((ring) => `M ${ring.map((point) => { const [x, y] = project(point); return `${x.toFixed(2)},${y.toFixed(2)}`; }).join(" L ")} Z`).join(" ");
}

function resolveCode(feature: GeoFeature, mode: ExplorerMapMode, categoriesByName: Map<string, Category>) {
  const direct = String(featureCode(feature));
  if (direct.startsWith(maps[mode].prefix)) return direct;
  const name = normalise(featureName(feature));
  const category = categoriesByName.get(name);
  if (category) return category.code || category.categoryCode;
  if (mode === "domestic") return domesticCodes[name] || `DOM-${slug(name)}`;
  return internationalCodes[name] || `INT-${slug(name)}`;
}

export function ExplorerMap({ mode, categories, selectedCode, onSelect }: { mode: ExplorerMapMode; categories: Category[]; selectedCode?: string; onSelect: (code: string) => void }) {
  const theme = useAppTheme();
  const config = maps[mode];
  const [zoom, setZoom] = useState(minZoom);
  const [pan, setPan] = useState<Pan>({ x: 0, y: 0 });
  const [svgLayout, setSvgLayout] = useState({ width: 0, height: 0 });
  const gesture = useRef<{ startX: number; startY: number; origin: Pan; dragged: boolean } | null>(null);
  const didPan = useRef(false);
  useEffect(() => { setZoom(minZoom); setPan({ x: 0, y: 0 }); gesture.current = null; didPan.current = false; }, [mode]);
  const categoryByName = useMemo(() => new Map(flattenCategories(categories).filter((item) => item.name || item.title).map((item) => [normalise(item.name || item.title), item])), [categories]);
  const map = useQuery({
    queryKey: ["explorer-map", mode, WEB_BASE_URL],
    queryFn: async (): Promise<GeoCollection> => {
      if (!WEB_BASE_URL) throw new Error("The public web base URL is not configured.");
      const response = await fetch(`${WEB_BASE_URL}${config.assetPath}`);
      if (!response.ok) throw new Error("Map data is unavailable.");
      const value = await response.json() as GeoCollection;
      if (!Array.isArray(value.features) || !value.features.length) throw new Error("Map data is empty.");
      return value;
    },
    staleTime: Infinity,
  });
  const project = useMemo(() => projection(map.data ?? { features: [] }, config.viewBox), [config.viewBox, map.data]);
  const [boxX, boxY, boxWidth, boxHeight] = config.viewBox.split(/\s+/).map(Number);
  const centerX = boxX + boxWidth / 2;
  const centerY = boxY + boxHeight / 2;
  const panLimits = (currentZoom: number) => ({ x: Math.max(0, boxWidth * (currentZoom - minZoom) / 2), y: Math.max(0, boxHeight * (currentZoom - minZoom) / 2) });
  const clampPan = (value: Pan, currentZoom: number): Pan => {
    if (currentZoom <= minZoom) return { x: 0, y: 0 };
    const limits = panLimits(currentZoom);
    return { x: Math.min(limits.x, Math.max(-limits.x, value.x)), y: Math.min(limits.y, Math.max(-limits.y, value.y)) };
  };
  const zoomTransform = `translate(${pan.x} ${pan.y}) translate(${centerX} ${centerY}) scale(${zoom}) translate(${-centerX} ${-centerY})`;
  const updateZoom = (direction: 1 | -1) => setZoom((current) => {
    const next = Math.min(maxZoom, Math.max(minZoom, Number((current + direction * zoomStep).toFixed(2))));
    setPan((previous) => clampPan(previous, next));
    return next;
  });
  const pointFor = (event: GestureResponderEvent): Point => [event.nativeEvent.locationX, event.nativeEvent.locationY];
  const screenScale = () => Math.min(svgLayout.width / boxWidth, svgLayout.height / boxHeight) || 1;
  const codeAtTouch = (event: GestureResponderEvent) => {
    const [touchX, touchY] = pointFor(event);
    const scale = screenScale();
    const insetX = (svgLayout.width - boxWidth * scale) / 2;
    const insetY = (svgLayout.height - boxHeight * scale) / 2;
    const transformed: Point = [(touchX - insetX) / scale, (touchY - insetY) / scale];
    const point: Point = [
      centerX + (transformed[0] - pan.x - centerX) / zoom,
      centerY + (transformed[1] - pan.y - centerY) / zoom,
    ];
    const feature = (map.data?.features ?? []).find((item) => polygons(item).some((polygon) => {
      const [outline, ...holes] = polygon.map((ring) => ring.map(project));
      return validRing(outline) && containsPoint(outline, point) && !holes.some((hole) => validRing(hole) && containsPoint(hole, point));
    }));
    if (!feature) return undefined;
    const code = resolveCode(feature, mode, categoryByName);
    return code.startsWith(config.prefix) ? code : undefined;
  };
  const onTouchStart = (event: GestureResponderEvent) => {
    const [startX, startY] = pointFor(event);
    didPan.current = false;
    gesture.current = { startX, startY, origin: pan, dragged: false };
  };
  const onTouchMove = (event: GestureResponderEvent) => {
    const activeGesture = gesture.current;
    if (!activeGesture || zoom <= minZoom) return;
    const [touchX, touchY] = pointFor(event);
    const dx = touchX - activeGesture.startX;
    const dy = touchY - activeGesture.startY;
    if (!activeGesture.dragged && Math.hypot(dx, dy) < dragThreshold) return;
    activeGesture.dragged = true;
    didPan.current = true;
    const scale = screenScale();
    setPan(clampPan({ x: activeGesture.origin.x + dx / scale, y: activeGesture.origin.y + dy / scale }, zoom));
  };
  const onTouchEnd = (event: GestureResponderEvent) => {
    const activeGesture = gesture.current;
    gesture.current = null;
    if (activeGesture?.dragged || didPan.current) {
      setTimeout(() => { didPan.current = false; }, 80);
      return;
    }
    const code = codeAtTouch(event);
    if (code) onSelect(code);
  };
  const onLayout = (event: LayoutChangeEvent) => setSvgLayout(event.nativeEvent.layout);

  if (map.isLoading) return <View style={[styles.state, { backgroundColor: theme.colors.soft }]}><ActivityIndicator color={theme.colors.accent} /><Text style={{ color: theme.colors.muted }}>Loading interactive map…</Text></View>;
  if (map.isError || !map.data) return <View style={[styles.state, { backgroundColor: theme.colors.soft }]}><Text style={[styles.stateTitle, { color: theme.colors.text }]}>Map unavailable</Text><Text style={{ color: theme.colors.muted }}>Use the region list below to explore current journeys.</Text></View>;

  return <View style={[styles.frame, { borderColor: theme.colors.border, backgroundColor: config.background }]}>
    <Svg width="100%" height={mode === "domestic" ? 340 : 236} viewBox={config.viewBox} preserveAspectRatio="xMidYMid meet" accessibilityRole="image" accessibilityLabel={`${mode === "domestic" ? "India" : "World"} interactive region map`} onLayout={onLayout} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} onTouchCancel={onTouchEnd}>
      <Rect x="1" y="1" width={mode === "domestic" ? 200 : 246} height={mode === "domestic" ? 256 : 166} rx="12" fill={config.background} />
      <G transform={zoomTransform}>
      {(map.data.features ?? []).map((feature, index) => {
        const code = resolveCode(feature, mode, categoryByName);
        const selectable = Boolean(code && code.startsWith(config.prefix));
        const selected = selectable && code === selectedCode;
        const label = String(featureName(feature) || code || "Map region");
        const path = pathFor(feature, project);
        return <G key={`${label}-${index}`}>
          <Path d={path} fill={selected ? theme.colors.accent : selectable ? regionColors[index % regionColors.length] : "rgba(100,116,139,0.32)"} stroke={selected ? theme.colors.accentStrong : "rgba(15,23,42,0.42)"} strokeWidth={selected ? 1.6 : 0.35} opacity={selectable || selected ? 1 : 0.55} pointerEvents="none" />
        </G>;
      })}
      </G>
    </Svg>
    <View style={styles.zoomControls} accessibilityLabel="Map zoom controls">
      <Pressable onPress={() => updateZoom(1)} disabled={zoom >= maxZoom} accessibilityRole="button" accessibilityLabel="Zoom in map" style={[styles.zoomButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, opacity: zoom >= maxZoom ? .45 : 1 }]}><Ionicons name="add" size={22} color={theme.colors.text} /></Pressable>
      <Pressable onPress={() => updateZoom(-1)} disabled={zoom <= minZoom} accessibilityRole="button" accessibilityLabel="Zoom out map" style={[styles.zoomButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, opacity: zoom <= minZoom ? .45 : 1 }]}><Ionicons name="remove" size={22} color={theme.colors.text} /></Pressable>
    </View>
  </View>;
}

const styles = StyleSheet.create({
  frame: { borderWidth: 1, borderRadius: radius.lg, overflow: "hidden", padding: spacing.xs, position: "relative" },
  zoomControls: { position: "absolute", top: spacing.sm, right: spacing.sm, gap: spacing.xs },
  zoomButton: { width: 42, height: 42, borderWidth: 1, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  state: { minHeight: 170, borderRadius: radius.lg, alignItems: "center", justifyContent: "center", gap: spacing.xs, padding: spacing.lg },
  stateTitle: { fontWeight: "800", fontSize: 16 },
});
