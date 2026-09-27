import { useMemo } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import Svg, { Path, Rect } from "react-native-svg";
import { WEB_BASE_URL } from "@/src/constants/config";
import { flattenCategories } from "@/src/constants/discovery";
import { radius, spacing, useAppTheme } from "@/src/theme/theme";
import type { Category } from "@/src/types/api";

export type ExplorerMapMode = "domestic" | "international";
type Point = [number, number];
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
const regionColors = ["#F59E0B", "#0EA5E9", "#14B8A6", "#8B5CF6", "#EC4899", "#84CC16", "#F97316", "#06B6D4"];

const normalise = (value?: unknown) => {
  const raw = String(value ?? "").trim().toLowerCase();
  return regionAliases[raw] ?? raw;
};
const properties = (feature: GeoFeature) => feature.properties ?? {};
const featureName = (feature: GeoFeature) => properties(feature).name || properties(feature).NAME || properties(feature).ADMIN || properties(feature).ST_NM || "";
const featureCode = (feature: GeoFeature) => properties(feature).code || properties(feature).regionCode || properties(feature).REGION_CODE || "";

const polygons = (feature: GeoFeature): Point[][][] => {
  const geometry = feature.geometry;
  if (geometry?.type === "Polygon" && Array.isArray(geometry.coordinates)) return [geometry.coordinates as Point[][]];
  if (geometry?.type === "MultiPolygon" && Array.isArray(geometry.coordinates)) return geometry.coordinates as Point[][][];
  return [];
};
const rings = (feature: GeoFeature) => polygons(feature).flat();
const validRing = (ring: Point[]) => ring.length > 3 && ring.every((point) => Array.isArray(point) && Number.isFinite(point[0]) && Number.isFinite(point[1]));

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
  return mode === "international" ? internationalCodes[name] : undefined;
}

export function ExplorerMap({ mode, categories, selectedCode, onSelect }: { mode: ExplorerMapMode; categories: Category[]; selectedCode?: string; onSelect: (code: string) => void }) {
  const theme = useAppTheme();
  const config = maps[mode];
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

  if (map.isLoading) return <View style={[styles.state, { backgroundColor: theme.colors.soft }]}><ActivityIndicator color={theme.colors.accent} /><Text style={{ color: theme.colors.muted }}>Loading interactive map…</Text></View>;
  if (map.isError || !map.data) return <View style={[styles.state, { backgroundColor: theme.colors.soft }]}><Text style={[styles.stateTitle, { color: theme.colors.text }]}>Map unavailable</Text><Text style={{ color: theme.colors.muted }}>Use the region list below to explore current journeys.</Text></View>;

  return <View style={[styles.frame, { borderColor: theme.colors.border, backgroundColor: config.background }]}>
    <Svg width="100%" height={mode === "domestic" ? 340 : 236} viewBox={config.viewBox} accessibilityRole="image" accessibilityLabel={`${mode === "domestic" ? "India" : "World"} interactive region map`}>
      <Rect x="1" y="1" width={mode === "domestic" ? 200 : 246} height={mode === "domestic" ? 256 : 166} rx="12" fill={config.background} />
      {(map.data.features ?? []).map((feature, index) => {
        const code = resolveCode(feature, mode, categoryByName);
        const selectable = Boolean(code && code.startsWith(config.prefix));
        const selected = selectable && code === selectedCode;
        const label = String(featureName(feature) || code || "Map region");
        return <Path key={`${label}-${index}`} d={pathFor(feature, project)} fill={selected ? theme.colors.accent : selectable ? regionColors[index % regionColors.length] : "rgba(100,116,139,0.32)"} stroke={selected ? "#FFFFFF" : "rgba(15,23,42,0.42)"} strokeWidth={selected ? 1.4 : 0.35} opacity={selectable || selected ? 1 : 0.55} onPress={selectable ? () => onSelect(code!) : undefined} accessible={selectable} accessibilityLabel={selectable ? `Show packages for ${label}` : label} />;
      })}
    </Svg>
  </View>;
}

const styles = StyleSheet.create({
  frame: { borderWidth: 1, borderRadius: radius.lg, overflow: "hidden", padding: spacing.xs },
  state: { minHeight: 170, borderRadius: radius.lg, alignItems: "center", justifyContent: "center", gap: spacing.xs, padding: spacing.lg },
  stateTitle: { fontWeight: "800", fontSize: 16 },
});
