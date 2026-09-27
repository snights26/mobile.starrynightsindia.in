import { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { catalogApi } from "@/src/api/services";
import { flattenCategories } from "@/src/constants/discovery";
import { PackageCard } from "@/src/components/PackageCard";
import { Screen } from "@/src/components/Screen";
import { EmptyView, ErrorView, LoadingView } from "@/src/components/StateViews";
import { radius, spacing, useAppTheme } from "@/src/theme/theme";
import type { Category } from "@/src/types/api";

type ExplorerMode = "domestic" | "international";
const explorerCopy: Record<ExplorerMode, { title: string; eyebrow: string; description: string; prefix: string; fallback: string }> = {
  domestic: { title: "Explore India", eyebrow: "DOMESTIC EXPLORER", description: "Choose a state or region to discover its curated journeys.", prefix: "DOM-", fallback: "DOM-HP" },
  international: { title: "Explore the world", eyebrow: "INTERNATIONAL EXPLORER", description: "Choose a country or region to discover its curated international journeys.", prefix: "INT-", fallback: "INT-SINGAPORE" },
};

export default function GlobalExplorerScreen() {
  const theme = useAppTheme();
  const [mode, setMode] = useState<ExplorerMode>("domestic");
  const [selectedByMode, setSelectedByMode] = useState<Partial<Record<ExplorerMode, string>>>({ domestic: "DOM-HP", international: "INT-SINGAPORE" });
  const categoryTree = useQuery({ queryKey: ["category-tree"], queryFn: catalogApi.categoryTree });
  const copy = explorerCopy[mode];
  const regions = useMemo(() => flattenCategories(categoryTree.data ?? []).filter((item) => (item.code || item.categoryCode || "").startsWith(copy.prefix)).sort((left, right) => (left.name || left.title || "").localeCompare(right.name || right.title || "")), [categoryTree.data, copy.prefix]);
  const selectedCode = selectedByMode[mode];
  useEffect(() => { if (regions.some((item) => (item.code || item.categoryCode) === selectedCode)) return; const fallback = regions.find((item) => (item.code || item.categoryCode) === copy.fallback) ?? regions[0]; if (fallback) setSelectedByMode((current) => ({ ...current, [mode]: fallback.code || fallback.categoryCode })); }, [copy.fallback, mode, regions, selectedCode]);
  const selected = regions.find((item) => (item.code || item.categoryCode) === selectedCode);
  const packages = useQuery({ queryKey: ["global-explorer", selectedCode], queryFn: () => catalogApi.packages({ regionCode: selectedCode }), enabled: Boolean(selectedCode) });

  if (categoryTree.isLoading) return <Screen><LoadingView label="Loading the travel atlas…" /></Screen>;
  if (categoryTree.isError) return <Screen><ErrorView retry={() => categoryTree.refetch()} message="The Global Explorer could not load its destination regions." /></Screen>;

  const chooseMode = (next: ExplorerMode) => setMode(next);
  const chooseRegion = (region: Category) => setSelectedByMode((current) => ({ ...current, [mode]: region.code || region.categoryCode }));
  return <Screen scroll={false}><FlatList data={packages.data ?? []} keyExtractor={(item) => item.packageCode || item.code} numColumns={2} columnWrapperStyle={styles.row} contentContainerStyle={styles.list} renderItem={({ item }) => <PackageCard item={item} compact />} ListHeaderComponent={<View style={styles.header}><View style={[styles.hero, { backgroundColor: theme.colors.nav }]}><Ionicons name="map-outline" color="#fff" size={25} /><Text style={[styles.eyebrow, { color: "#FCA5A5" }]}>CURATED TRAVEL ATLAS</Text><Text style={styles.heroTitle}>Starry Nights Global Explorer</Text><Text style={styles.heroCopy}>Navigate India and the world by region, then open a refined collection of journeys for the place you choose.</Text></View><View style={[styles.switcher, { backgroundColor: theme.colors.soft }]}>{(["domestic", "international"] as ExplorerMode[]).map((item) => <Pressable key={item} onPress={() => chooseMode(item)} accessibilityRole="button" accessibilityState={{ selected: mode === item }} style={[styles.switch, mode === item ? { backgroundColor: theme.colors.accent } : undefined]}><Text style={{ color: mode === item ? "#fff" : theme.colors.text, fontWeight: "800" }}>{item === "domestic" ? "Domestic" : "International"}</Text></Pressable>)}</View><Text style={[styles.sectionEyebrow, { color: theme.colors.accent }]}>{copy.eyebrow}</Text><Text style={[styles.title, { color: theme.colors.text }]}>{copy.title}</Text><Text style={{ color: theme.colors.muted }}>{copy.description}</Text><FlatList data={regions} horizontal showsHorizontalScrollIndicator={false} keyExtractor={(item) => item.code || item.categoryCode} contentContainerStyle={styles.regions} renderItem={({ item }) => { const code = item.code || item.categoryCode; const selectedRegion = code === selectedCode; return <Pressable onPress={() => chooseRegion(item)} accessibilityRole="button" accessibilityState={{ selected: selectedRegion }} style={[styles.regionChip, { borderColor: selectedRegion ? theme.colors.accent : theme.colors.border, backgroundColor: selectedRegion ? theme.colors.accentSoft : theme.colors.card }]}><Text numberOfLines={1} style={{ color: selectedRegion ? theme.colors.accentStrong : theme.colors.text, fontWeight: "700" }}>{item.name || item.title}</Text></Pressable>; }} /><View style={styles.resultHeading}><View><Text style={[styles.sectionEyebrow, { color: theme.colors.accent }]}>{mode.toUpperCase()}</Text><Text style={[styles.resultsTitle, { color: theme.colors.text }]}>{selected?.name || selected?.title || "Choose a region"}</Text></View>{packages.isFetching ? <Text style={{ color: theme.colors.muted }}>Loading…</Text> : null}</View>{packages.isError ? <ErrorView retry={() => packages.refetch()} message="Packages for this region are unavailable right now." /> : null}</View>} ListEmptyComponent={packages.isLoading ? <LoadingView label="Loading regional packages…" /> : packages.isError ? null : <EmptyView title="No packages mapped yet" message={`No active packages are currently mapped to ${selected?.name || selected?.title || "this region"}.`} />} /></Screen>;
}

const styles = StyleSheet.create({
  list: { padding: spacing.md, gap: spacing.sm, paddingBottom: 100 }, row: { gap: spacing.sm }, header: { gap: spacing.sm, paddingBottom: spacing.sm }, hero: { borderRadius: radius.lg, padding: spacing.lg, gap: spacing.xs }, eyebrow: { fontSize: 12, letterSpacing: 1, fontWeight: "900" }, heroTitle: { color: "#fff", fontSize: 25, fontWeight: "800" }, heroCopy: { color: "#E2E8F0", lineHeight: 20 }, switcher: { padding: 4, borderRadius: radius.pill, flexDirection: "row" }, switch: { flex: 1, minHeight: 42, borderRadius: radius.pill, alignItems: "center", justifyContent: "center" }, sectionEyebrow: { fontSize: 12, fontWeight: "900", letterSpacing: .9 }, title: { fontSize: 23, fontWeight: "800" }, regions: { gap: spacing.xs, paddingRight: spacing.md, paddingVertical: spacing.xs }, regionChip: { maxWidth: 180, minHeight: 42, justifyContent: "center", paddingHorizontal: spacing.md, borderWidth: 1, borderRadius: radius.pill }, resultHeading: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing.sm, marginTop: spacing.xs }, resultsTitle: { fontSize: 20, fontWeight: "800" },
});
