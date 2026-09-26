import { useMemo } from "react";
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { catalogApi, publicApi } from "@/src/api/services";
import { PackageCard } from "@/src/components/PackageCard";
import { ErrorView, LoadingView } from "@/src/components/StateViews";
import { Screen } from "@/src/components/Screen";
import { Section } from "@/src/components/Section";
import { radius, spacing, useAppTheme } from "@/src/theme/theme";
import { resolveAssetUrl } from "@/src/utils/assets";
import type { Category, FeaturedRow, PackageSummary } from "@/src/types/api";

function DiscoveryRow({ row }: { row: FeaturedRow }) {
  const theme = useAppTheme(); const packages = row.items.filter((item): item is PackageSummary => "packageCode" in item);
  const categories = row.items.filter((item): item is Category => "categoryCode" in item && !("packageCode" in item));
  if (!packages.length && !categories.length) return null;
  return <Section title={row.title || row.rowTitle || "Discover"} action={<Pressable onPress={() => router.push("/(tabs)/explore")}><Text style={{ color: theme.colors.accent, fontWeight: "700" }}>See all</Text></Pressable>}>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontal}>
      {packages.map((item) => <PackageCard item={item} key={item.packageCode || item.code} />)}
      {categories.map((item) => <Pressable key={item.code} onPress={() => router.push({ pathname: "/category/[code]", params: { code: item.code, name: item.name } })} style={[styles.categoryCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>{resolveAssetUrl(item.image || item.thumbnailUrl) ? <ImageBackground source={{ uri: resolveAssetUrl(item.image || item.thumbnailUrl) }} style={styles.categoryImage} imageStyle={{ borderRadius: radius.md }}><View style={styles.imageVeil}><Text style={styles.categoryText}>{item.name}</Text></View></ImageBackground> : <Text style={[styles.categoryFallback, { color: theme.colors.text }]}>{item.name}</Text>}</Pressable>)}
    </ScrollView>
  </Section>;
}

export default function HomeScreen() {
  const theme = useAppTheme();
  const content = useQuery({ queryKey: ["home"], queryFn: async () => Promise.all([catalogApi.heroes(), catalogApi.featured(), catalogApi.statistics(), publicApi.occasion()]) });
  const [heroes, rows, statistics, occasion] = content.data ?? [[], [], [], null];
  const fallbackPackages = useQuery({ queryKey: ["packages"], queryFn: () => catalogApi.packages(), enabled: Boolean(content.data && !(rows as FeaturedRow[]).some((row) => row.items.some((item) => "packageCode" in item))) });
  const fallbackRow = useMemo<FeaturedRow | null>(() => fallbackPackages.data?.length ? { id: "catalog", rowId: "catalog", title: "Featured journeys", type: "package", items: fallbackPackages.data.slice(0, 10) } : null, [fallbackPackages.data]);
  if (content.isLoading) return <Screen><LoadingView label="Finding remarkable journeys…" /></Screen>;
  if (content.isError) return <Screen><ErrorView message="We could not load the travel catalogue." retry={() => content.refetch()} /></Screen>;
  const hero = heroes[0];
  return <Screen>
    <Pressable onPress={() => router.push("/search")} accessibilityRole="search" style={[styles.search, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}><Ionicons name="search" size={20} color={theme.colors.muted} /><Text style={{ color: theme.colors.muted }}>Where would you like to go?</Text></Pressable>
    <Pressable onPress={() => hero?.link ? router.push("/(tabs)/explore") : router.push("/enquiry")} style={[styles.hero, { backgroundColor: theme.colors.nav }]}>{resolveAssetUrl(hero?.image) ? <ImageBackground source={{ uri: resolveAssetUrl(hero?.image) }} style={styles.heroImage}><View style={styles.heroOverlay}><Text style={styles.heroEyebrow}>STAR-RATED EXPERIENCES</Text><Text style={styles.heroTitle}>{hero?.title || "Travel beyond the ordinary"}</Text><Text style={styles.heroSubtitle}>{hero?.subtitle || "Curated holidays, group tours, and adventures for your next story."}</Text><View style={styles.heroButton}><Text style={styles.heroButtonText}>Explore journeys</Text><Ionicons name="arrow-forward" size={18} color="#fff" /></View></View></ImageBackground> : <View style={styles.heroOverlay}><Text style={styles.heroEyebrow}>STARRY NIGHTS HOLIDAYS</Text><Text style={styles.heroTitle}>Travel beyond the ordinary</Text><Text style={styles.heroSubtitle}>Curated holidays, group tours, and adventures for your next story.</Text><View style={styles.heroButton}><Text style={styles.heroButtonText}>Explore journeys</Text><Ionicons name="arrow-forward" size={18} color="#fff" /></View></View>}</Pressable>
    {occasion ? <Pressable onPress={() => router.push("/enquiry")} style={[styles.occasion, { backgroundColor: theme.colors.accentSoft }]}><Ionicons name="sparkles" color={theme.colors.accent} size={22} /><View style={{ flex: 1 }}><Text style={[styles.occasionTitle, { color: theme.colors.text }]}>{occasion.title}</Text>{occasion.message ? <Text numberOfLines={2} style={{ color: theme.colors.muted }}>{occasion.message}</Text> : null}</View></Pressable> : null}
    {(rows as FeaturedRow[]).map((row) => <DiscoveryRow row={row} key={row.id || row.rowId} />)}
    {!(rows as FeaturedRow[]).length && fallbackRow ? <DiscoveryRow row={fallbackRow} /> : null}
    {statistics.length ? <View style={[styles.stats, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>{statistics.map((stat) => <View style={styles.stat} key={stat.id}><Text style={[styles.statValue, { color: theme.colors.accent }]}>{stat.value}</Text><Text style={[styles.statTitle, { color: theme.colors.muted }]}>{stat.title}</Text></View>)}</View> : null}
    <View style={[styles.callout, { backgroundColor: theme.colors.soft }]}><Text style={[styles.calloutTitle, { color: theme.colors.text }]}>Need a trip made around you?</Text><Text style={{ color: theme.colors.muted }}>Tell us your dates, destination and travel style. Our team will help shape the details.</Text><Pressable onPress={() => router.push("/enquiry")} style={[styles.outlineAction, { borderColor: theme.colors.accent }]}><Text style={{ color: theme.colors.accent, fontWeight: "800" }}>Plan with Starry Nights</Text></Pressable></View>
  </Screen>;
}
const styles = StyleSheet.create({ search: { height: 50, borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: spacing.md, alignItems: "center", gap: spacing.sm, flexDirection: "row" }, hero: { minHeight: 282, borderRadius: radius.lg, overflow: "hidden" }, heroImage: { minHeight: 282, justifyContent: "flex-end" }, heroOverlay: { minHeight: 282, justifyContent: "flex-end", padding: spacing.lg, gap: spacing.xs, backgroundColor: "rgba(0,0,0,.36)" }, heroEyebrow: { color: "#fff", fontSize: 11, fontWeight: "800", letterSpacing: 1.2 }, heroTitle: { color: "#fff", fontWeight: "800", fontSize: 29, lineHeight: 35 }, heroSubtitle: { color: "#F8FAFC", fontSize: 14, lineHeight: 20 }, heroButton: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", gap: spacing.xs, marginTop: spacing.sm, backgroundColor: "#E50914", borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: 11 }, heroButtonText: { color: "#fff", fontWeight: "800" }, occasion: { flexDirection: "row", gap: spacing.sm, alignItems: "center", padding: spacing.md, borderRadius: radius.md }, occasionTitle: { fontWeight: "800", fontSize: 16 }, horizontal: { gap: spacing.sm, paddingRight: spacing.md }, categoryCard: { width: 172, height: 122, borderRadius: radius.md, borderWidth: 1, overflow: "hidden" }, categoryImage: { flex: 1 }, imageVeil: { flex: 1, justifyContent: "flex-end", padding: spacing.sm, backgroundColor: "rgba(0,0,0,.28)" }, categoryText: { color: "#fff", fontSize: 15, fontWeight: "800" }, categoryFallback: { padding: spacing.md, fontSize: 16, fontWeight: "800" }, stats: { borderRadius: radius.lg, borderWidth: 1, padding: spacing.md, flexDirection: "row", justifyContent: "space-around" }, stat: { flex: 1, alignItems: "center", gap: 3 }, statValue: { fontSize: 20, fontWeight: "800", textAlign: "center" }, statTitle: { fontSize: 11, textAlign: "center" }, callout: { padding: spacing.lg, borderRadius: radius.lg, gap: spacing.sm }, calloutTitle: { fontSize: 20, fontWeight: "800" }, outlineAction: { alignSelf: "flex-start", paddingHorizontal: spacing.md, paddingVertical: 10, borderRadius: radius.pill, borderWidth: 1, marginTop: spacing.xs } });
