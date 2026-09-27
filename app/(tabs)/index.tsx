import { useEffect, useMemo, useRef, useState } from "react";
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { catalogApi, publicApi } from "@/src/api/services";
import { useAuth } from "@/src/auth/AuthProvider";
import { PackageCard } from "@/src/components/PackageCard";
import { CategoryRail } from "@/src/components/CategoryRail";
import { DiscoveryShortcuts } from "@/src/components/DiscoveryShortcuts";
import { ErrorView, LoadingView } from "@/src/components/StateViews";
import { Screen } from "@/src/components/Screen";
import { Section } from "@/src/components/Section";
import { radius, spacing, useAppTheme } from "@/src/theme/theme";
import { resolveAssetUrl } from "@/src/utils/assets";
import type { Category, FeaturedRow, Hero, PackageSummary } from "@/src/types/api";

const rowTitle = (row: FeaturedRow) => row.title || row.rowTitle || "Discover";
const codeFor = (category: Category) => category.code || category.categoryCode;

function DiscoveryRow({ row }: { row: FeaturedRow }) {
  const theme = useAppTheme();
  const packages = row.items.filter((item): item is PackageSummary => "packageCode" in item);
  // Featured-row category items are intentionally compact API objects
  // (`code`, `title`, `type`) rather than the full category-tree shape.
  const categories = row.items.filter((item): item is Category => !("packageCode" in item) && String((item as { type?: string }).type ?? "").toLowerCase() === "category");
  const isCategory = row.type === "category" || row.rowType === "category";
  if (!packages.length && !categories.length) return null;
  const openAll = () => {
    if (isCategory) { router.push("/categories" as never); return; }
    if ((row.rowId || row.id) === "catalog") { router.push("/(tabs)/explore"); return; }
    if (/trending/i.test(rowTitle(row))) { router.push("/(tabs)/trending" as never); return; }
    router.push({ pathname: "/collection/[rowId]", params: { rowId: row.rowId || row.id, title: rowTitle(row) } } as never);
  };
  return <Section title={rowTitle(row)} action={<Pressable onPress={openAll} accessibilityRole="button" accessibilityLabel={`View all ${rowTitle(row)}`}><Text style={{ color: theme.colors.accent, fontWeight: "700" }}>View all</Text></Pressable>}>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontal}>
      {packages.map((item) => <PackageCard item={item} key={item.packageCode || item.code} />)}
      {categories.map((item) => {
        const image = resolveAssetUrl(item.image || item.thumbnailUrl);
        return <Pressable key={codeFor(item)} onPress={() => router.push({ pathname: "/category/[code]", params: { code: codeFor(item), name: item.name || item.title } })} accessibilityRole="button" style={[styles.categoryCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>{image ? <ImageBackground source={{ uri: image }} style={styles.categoryImage} imageStyle={{ borderRadius: radius.md }}><View style={styles.imageVeil}><Text numberOfLines={2} style={styles.categoryText}>{item.name || item.title}</Text></View></ImageBackground> : <Text style={[styles.categoryFallback, { color: theme.colors.text }]}>{item.name || item.title}</Text>}</Pressable>;
      })}
    </ScrollView>
  </Section>;
}

function HomeHero({ heroes }: { heroes: Hero[] }) {
  const theme = useAppTheme();
  const pager = useRef<ScrollView>(null);
  const isUserInteracting = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const { width: windowWidth } = useWindowDimensions();
  const heroWidth = Math.max(1, windowWidth - spacing.md * 2);
  const slides: (Hero | undefined)[] = heroes.length ? heroes : [undefined];
  useEffect(() => { setActiveIndex((current) => Math.min(current, slides.length - 1)); }, [slides.length]);
  useEffect(() => {
    if (slides.length < 2) return;
    const interval = setInterval(() => {
      if (isUserInteracting.current) return;
      setActiveIndex((current) => {
        const next = (current + 1) % slides.length;
        pager.current?.scrollTo({ x: next * heroWidth, animated: true });
        return next;
      });
    }, 4_000);
    return () => clearInterval(interval);
  }, [heroWidth, slides.length]);
  useEffect(() => { pager.current?.scrollTo({ x: activeIndex * heroWidth, animated: false }); }, [activeIndex, heroWidth]);
  return <View style={styles.heroPager}>
    <ScrollView ref={pager} horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={{ width: heroWidth }} onScrollBeginDrag={() => { isUserInteracting.current = true; }} onMomentumScrollEnd={(event) => { isUserInteracting.current = false; setActiveIndex(Math.round(event.nativeEvent.contentOffset.x / heroWidth)); }}>
      {slides.map((hero, index) => {
        const image = resolveAssetUrl(hero?.image);
        return <View key={hero?.id || hero?.title || `fallback-${index}`} style={[styles.hero, { width: heroWidth, backgroundColor: theme.colors.nav }]}>
          {image ? <ImageBackground source={{ uri: image }} style={styles.heroImage} imageStyle={styles.heroImageContent}><View style={styles.heroText}><Text style={styles.heroEyebrow}>STAR-RATED EXPERIENCES</Text><Text numberOfLines={2} style={styles.heroTitle}>{hero?.title || "Travel beyond the ordinary"}</Text><Text numberOfLines={2} style={styles.heroSubtitle}>{hero?.subtitle || "Curated holidays, group tours, and adventures for your next story."}</Text></View></ImageBackground> : <View style={[styles.heroImage, styles.heroFallback]}><View style={styles.heroText}><Text style={styles.heroEyebrow}>STARRY NIGHTS HOLIDAYS</Text><Text numberOfLines={2} style={styles.heroTitle}>Travel beyond the ordinary</Text><Text numberOfLines={2} style={styles.heroSubtitle}>Curated holidays, group tours, and adventures for your next story.</Text></View></View>}
        </View>;
      })}
    </ScrollView>
    {slides.length > 1 ? <View style={styles.heroDots} accessibilityLabel={`${activeIndex + 1} of ${slides.length} hero slides`}>{slides.map((hero, index) => <View key={hero?.id || hero?.title || index} style={[styles.heroDot, { width: index === activeIndex ? 20 : 7, backgroundColor: index === activeIndex ? theme.colors.accent : theme.colors.border }]} />)}</View> : null}
  </View>;
}

export default function HomeScreen() {
  const theme = useAppTheme();
  const { isAuthenticated } = useAuth();
  const content = useQuery({ queryKey: ["home"], queryFn: async () => Promise.all([catalogApi.heroes(), catalogApi.featured(), catalogApi.statistics(), publicApi.occasion()]) });
  const categories = useQuery({ queryKey: ["home", "categories"], queryFn: catalogApi.categories });
  const [heroes, rows, statistics, occasion] = content.data ?? [[], [], [], null];
  const fallbackPackages = useQuery({ queryKey: ["packages"], queryFn: () => catalogApi.packages(), enabled: Boolean(content.data && !(rows as FeaturedRow[]).some((row) => row.items.some((item) => "packageCode" in item))) });
  const fallbackRow = useMemo<FeaturedRow | null>(() => fallbackPackages.data?.length ? { id: "catalog", rowId: "catalog", title: "Featured journeys", type: "package", items: fallbackPackages.data.slice(0, 10) } : null, [fallbackPackages.data]);
  if (content.isLoading) return <Screen><LoadingView label="Finding remarkable journeys…" /></Screen>;
  if (content.isError) return <Screen><ErrorView message="We could not load the travel catalogue." retry={() => content.refetch()} /></Screen>;
  const openBucket = () => router.push(isAuthenticated ? "/(tabs)/bucket" : "/login");
  return <Screen>
    <View style={styles.header}><View><Text style={[styles.brand, { color: theme.colors.text }]}>STARRY NIGHTS</Text><Text style={[styles.tagline, { color: theme.colors.muted }]}>Tours & treks made memorable</Text></View><View style={styles.headerActions}><Pressable onPress={() => router.push("/search")} accessibilityRole="button" accessibilityLabel="Search packages" style={[styles.headerButton, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}><Ionicons name="search" color={theme.colors.text} size={21} /></Pressable><Pressable onPress={openBucket} accessibilityRole="button" accessibilityLabel="Open bucket list" style={[styles.headerButton, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}><Ionicons name="heart-outline" color={theme.colors.accent} size={22} /></Pressable></View></View>
    <HomeHero heroes={heroes} />
    <DiscoveryShortcuts />
    {categories.data ? <CategoryRail categories={categories.data} /> : null}
    {occasion ? <Pressable onPress={() => router.push("/enquiry")} style={[styles.occasion, { backgroundColor: theme.colors.accentSoft }]}><Ionicons name="sparkles" color={theme.colors.accent} size={22} /><View style={{ flex: 1 }}><Text style={[styles.occasionTitle, { color: theme.colors.text }]}>{occasion.title}</Text>{occasion.message ? <Text numberOfLines={2} style={{ color: theme.colors.muted }}>{occasion.message}</Text> : null}</View></Pressable> : null}
    {(rows as FeaturedRow[]).map((row) => <DiscoveryRow row={row} key={row.id || row.rowId} />)}
    {!(rows as FeaturedRow[]).length && fallbackRow ? <DiscoveryRow row={fallbackRow} /> : null}
    {statistics.length ? <Section title="The Starry Nights difference"><View style={styles.statsGrid}>{statistics.map((stat) => <View style={[styles.stat, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]} key={stat.id}><Text style={[styles.statValue, { color: theme.colors.accent }]}>{stat.value}</Text><Text numberOfLines={2} style={[styles.statTitle, { color: theme.colors.muted }]}>{stat.title}</Text></View>)}</View></Section> : null}
    <View style={[styles.callout, { backgroundColor: theme.colors.soft }]}><Text style={[styles.calloutTitle, { color: theme.colors.text }]}>Need a trip made around you?</Text><Text style={{ color: theme.colors.muted }}>Tell us your dates, destination and travel style. Our team will help shape the details.</Text><Pressable onPress={() => router.push("/enquiry")} style={[styles.outlineAction, { borderColor: theme.colors.accent }]}><Text style={{ color: theme.colors.accent, fontWeight: "800" }}>Plan with Starry Nights</Text></Pressable></View>
  </Screen>;
}

const styles = StyleSheet.create({
  header: { minHeight: 52, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md },
  brand: { fontWeight: "900", letterSpacing: 1.1, fontSize: 16 }, tagline: { fontSize: 12, marginTop: 2 }, headerActions: { flexDirection: "row", gap: spacing.xs }, headerButton: { width: 44, height: 44, borderWidth: 1, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  heroPager: { alignItems: "center", gap: spacing.sm }, hero: { height: 278, borderRadius: radius.lg, overflow: "hidden" }, heroImage: { flex: 1, justifyContent: "flex-end" }, heroImageContent: { borderRadius: radius.lg }, heroFallback: { backgroundColor: "#0A0A0A" }, heroText: { padding: spacing.lg, paddingTop: spacing.xxxl, gap: spacing.xs, backgroundColor: "rgba(0,0,0,.38)" }, heroEyebrow: { color: "#FDE68A", fontSize: 11, fontWeight: "900", letterSpacing: 1.2 }, heroTitle: { color: "#fff", fontWeight: "800", fontSize: 27, lineHeight: 33 }, heroSubtitle: { color: "#F8FAFC", fontSize: 14, lineHeight: 20 }, heroDots: { flexDirection: "row", gap: 6, alignItems: "center", minHeight: 8 }, heroDot: { height: 7, borderRadius: 4 },
  occasion: { flexDirection: "row", gap: spacing.sm, alignItems: "center", padding: spacing.md, borderRadius: radius.md }, occasionTitle: { fontWeight: "800", fontSize: 16 }, horizontal: { gap: spacing.sm, paddingRight: spacing.md }, categoryCard: { width: 172, height: 122, borderRadius: radius.md, borderWidth: 1, overflow: "hidden" }, categoryImage: { flex: 1 }, imageVeil: { flex: 1, justifyContent: "flex-end", padding: spacing.sm, backgroundColor: "rgba(0,0,0,.28)" }, categoryText: { color: "#fff", fontSize: 15, fontWeight: "800" }, categoryFallback: { padding: spacing.md, fontSize: 16, fontWeight: "800" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }, stat: { width: "48.4%", minHeight: 94, borderRadius: radius.md, borderWidth: 1, padding: spacing.md, justifyContent: "center", gap: 5 }, statValue: { fontSize: 25, fontWeight: "900" }, statTitle: { fontSize: 12, lineHeight: 17 }, callout: { padding: spacing.lg, borderRadius: radius.lg, gap: spacing.sm }, calloutTitle: { fontSize: 20, fontWeight: "800" }, outlineAction: { alignSelf: "flex-start", paddingHorizontal: spacing.md, paddingVertical: 10, borderRadius: radius.pill, borderWidth: 1, marginTop: spacing.xs },
});
