import { useEffect, useMemo, useRef, useState } from "react";
import { ImageBackground, Linking, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { catalogApi, publicApi } from "@/src/api/services";
import { PackageCard } from "@/src/components/PackageCard";
import { CategoryRail } from "@/src/components/CategoryRail";
import { DiscoveryShortcuts } from "@/src/components/DiscoveryShortcuts";
import { ErrorView, LoadingView } from "@/src/components/StateViews";
import { Screen } from "@/src/components/Screen";
import { Section } from "@/src/components/Section";
import { radius, spacing, useAppTheme } from "@/src/theme/theme";
import { resolveAssetUrl } from "@/src/utils/assets";
import type { Category, FeaturedRow, Hero, PackageSummary } from "@/src/types/api";
import { formatWorldTime } from "@/src/constants/discovery";

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

function HomeHero({ heroes }: { heroes: Hero[] }) {
  const theme = useAppTheme();
  const pager = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const { width: windowWidth } = useWindowDimensions();
  const heroWidth = Math.max(1, windowWidth - spacing.md * 2);
  const slides: (Hero | undefined)[] = heroes.length ? heroes : [undefined];

  useEffect(() => {
    if (slides.length < 2) return;
    const interval = setInterval(() => {
      setActiveIndex((current) => {
        const next = (current + 1) % slides.length;
        pager.current?.scrollTo({ x: next * heroWidth, animated: true });
        return next;
      });
    }, 4_000);
    return () => clearInterval(interval);
  }, [heroWidth, slides.length]);

  const openHero = (value?: Hero) => {
    const link = value?.link?.trim();
    if (/^https:\/\//i.test(link || "")) { void Linking.openURL(link!); return; }
    if (link?.startsWith("/package/")) { router.push(link as never); return; }
    if (link === "/gallery") { router.push("/gallery"); return; }
    if (link === "/time-zones") { router.push("/time-zones" as never); return; }
    if (link === "/global-explorer" || !link) { router.push("/global-explorer" as never); return; }
    router.push("/(tabs)/explore");
  };

  return <View style={styles.heroPager}>
    <ScrollView ref={pager} horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={{ width: heroWidth }} onMomentumScrollEnd={(event) => setActiveIndex(Math.round(event.nativeEvent.contentOffset.x / heroWidth))}>
      {slides.map((hero, index) => <Pressable key={hero?.id || hero?.title || `fallback-${index}`} onPress={() => openHero(hero)} accessibilityRole="button" accessibilityLabel={hero?.title || "Explore journeys"} style={[styles.hero, { width: heroWidth, backgroundColor: theme.colors.nav }]}>
        {resolveAssetUrl(hero?.image) ? <ImageBackground source={{ uri: resolveAssetUrl(hero?.image) }} style={styles.heroImage}><View style={styles.heroOverlay}><Text style={styles.heroEyebrow}>STAR-RATED EXPERIENCES</Text><Text style={styles.heroTitle}>{hero?.title || "Travel beyond the ordinary"}</Text><Text style={styles.heroSubtitle}>{hero?.subtitle || "Curated holidays, group tours, and adventures for your next story."}</Text><View style={styles.heroButton}><Text style={styles.heroButtonText}>Explore journeys</Text><Ionicons name="arrow-forward" size={18} color="#fff" /></View></View></ImageBackground> : <View style={styles.heroOverlay}><Text style={styles.heroEyebrow}>STARRY NIGHTS HOLIDAYS</Text><Text style={styles.heroTitle}>Travel beyond the ordinary</Text><Text style={styles.heroSubtitle}>Curated holidays, group tours, and adventures for your next story.</Text><View style={styles.heroButton}><Text style={styles.heroButtonText}>Explore journeys</Text><Ionicons name="arrow-forward" size={18} color="#fff" /></View></View>}
      </Pressable>)}
    </ScrollView>
    {slides.length > 1 ? <View style={styles.heroDots} accessibilityLabel={`${activeIndex + 1} of ${slides.length} hero slides`}>{slides.map((hero, index) => <View key={hero?.id || hero?.title || index} style={[styles.heroDot, { backgroundColor: index === activeIndex ? theme.colors.accent : theme.colors.border }]} />)}</View> : null}
  </View>;
}

export default function HomeScreen() {
  const theme = useAppTheme();
  const content = useQuery({ queryKey: ["home"], queryFn: async () => Promise.all([catalogApi.heroes(), catalogApi.featured(), catalogApi.statistics(), publicApi.occasion()]) });
  const categories = useQuery({ queryKey: ["home", "categories"], queryFn: catalogApi.categories });
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const interval = setInterval(() => setNow(new Date()), 1_000); return () => clearInterval(interval); }, []);
  const [heroes, rows, statistics, occasion] = content.data ?? [[], [], [], null];
  const fallbackPackages = useQuery({ queryKey: ["packages"], queryFn: () => catalogApi.packages(), enabled: Boolean(content.data && !(rows as FeaturedRow[]).some((row) => row.items.some((item) => "packageCode" in item))) });
  const fallbackRow = useMemo<FeaturedRow | null>(() => fallbackPackages.data?.length ? { id: "catalog", rowId: "catalog", title: "Featured journeys", type: "package", items: fallbackPackages.data.slice(0, 10) } : null, [fallbackPackages.data]);
  if (content.isLoading) return <Screen><LoadingView label="Finding remarkable journeys…" /></Screen>;
  if (content.isError) return <Screen><ErrorView message="We could not load the travel catalogue." retry={() => content.refetch()} /></Screen>;
  return <Screen>
    <Pressable onPress={() => router.push("/search")} accessibilityRole="search" style={[styles.search, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}><Ionicons name="search" size={20} color={theme.colors.muted} /><Text style={{ color: theme.colors.muted }}>Where would you like to go?</Text></Pressable>
    <HomeHero heroes={heroes} />
    <View style={styles.discoveryActions}><Pressable onPress={() => router.push("/global-explorer" as never)} accessibilityRole="button" style={[styles.discoveryAction, { backgroundColor: theme.colors.nav }]}><Ionicons name="map-outline" color="#fff" size={22} /><View style={{ flex: 1 }}><Text style={styles.discoveryActionTitle}>Global Explorer</Text><Text style={styles.discoveryActionCopy}>Discover journeys by region</Text></View><Ionicons name="chevron-forward" color="#fff" size={20} /></Pressable><Pressable onPress={() => router.push("/time-zones" as never)} accessibilityRole="button" style={[styles.discoveryAction, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1 }]}><Ionicons name="time-outline" color={theme.colors.accent} size={22} /><View style={{ flex: 1 }}><Text style={[styles.discoveryActionTitle, { color: theme.colors.text }]}>World time</Text><Text style={[styles.discoveryActionCopy, { color: theme.colors.muted }]}>IST · {formatWorldTime("Asia/Kolkata", now)}</Text></View><Ionicons name="chevron-forward" color={theme.colors.muted} size={20} /></Pressable></View>
    {categories.data ? <CategoryRail categories={categories.data} /> : null}
    <DiscoveryShortcuts />
    {occasion ? <Pressable onPress={() => router.push("/enquiry")} style={[styles.occasion, { backgroundColor: theme.colors.accentSoft }]}><Ionicons name="sparkles" color={theme.colors.accent} size={22} /><View style={{ flex: 1 }}><Text style={[styles.occasionTitle, { color: theme.colors.text }]}>{occasion.title}</Text>{occasion.message ? <Text numberOfLines={2} style={{ color: theme.colors.muted }}>{occasion.message}</Text> : null}</View></Pressable> : null}
    {(rows as FeaturedRow[]).map((row) => <DiscoveryRow row={row} key={row.id || row.rowId} />)}
    {!(rows as FeaturedRow[]).length && fallbackRow ? <DiscoveryRow row={fallbackRow} /> : null}
    {statistics.length ? <View style={[styles.stats, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>{statistics.map((stat) => <View style={styles.stat} key={stat.id}><Text style={[styles.statValue, { color: theme.colors.accent }]}>{stat.value}</Text><Text style={[styles.statTitle, { color: theme.colors.muted }]}>{stat.title}</Text></View>)}</View> : null}
    <View style={[styles.callout, { backgroundColor: theme.colors.soft }]}><Text style={[styles.calloutTitle, { color: theme.colors.text }]}>Need a trip made around you?</Text><Text style={{ color: theme.colors.muted }}>Tell us your dates, destination and travel style. Our team will help shape the details.</Text><Pressable onPress={() => router.push("/enquiry")} style={[styles.outlineAction, { borderColor: theme.colors.accent }]}><Text style={{ color: theme.colors.accent, fontWeight: "800" }}>Plan with Starry Nights</Text></Pressable></View>
  </Screen>;
}
const styles = StyleSheet.create({ search: { height: 50, borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: spacing.md, alignItems: "center", gap: spacing.sm, flexDirection: "row" }, heroPager: { alignItems: "center", gap: spacing.sm }, hero: { minHeight: 282, borderRadius: radius.lg, overflow: "hidden" }, heroImage: { minHeight: 282, justifyContent: "flex-end" }, heroOverlay: { minHeight: 282, justifyContent: "flex-end", padding: spacing.lg, gap: spacing.xs, backgroundColor: "rgba(0,0,0,.36)" }, heroEyebrow: { color: "#fff", fontSize: 11, fontWeight: "800", letterSpacing: 1.2 }, heroTitle: { color: "#fff", fontWeight: "800", fontSize: 29, lineHeight: 35 }, heroSubtitle: { color: "#F8FAFC", fontSize: 14, lineHeight: 20 }, heroButton: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", gap: spacing.xs, marginTop: spacing.sm, backgroundColor: "#E50914", borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: 11 }, heroButtonText: { color: "#fff", fontWeight: "800" }, heroDots: { flexDirection: "row", gap: 6, alignItems: "center" }, heroDot: { width: 7, height: 7, borderRadius: 4 }, discoveryActions: { gap: spacing.sm }, discoveryAction: { minHeight: 68, borderRadius: radius.md, padding: spacing.md, flexDirection: "row", alignItems: "center", gap: spacing.sm }, discoveryActionTitle: { color: "#fff", fontSize: 16, fontWeight: "800" }, discoveryActionCopy: { color: "#CBD5E1", marginTop: 2 }, occasion: { flexDirection: "row", gap: spacing.sm, alignItems: "center", padding: spacing.md, borderRadius: radius.md }, occasionTitle: { fontWeight: "800", fontSize: 16 }, horizontal: { gap: spacing.sm, paddingRight: spacing.md }, categoryCard: { width: 172, height: 122, borderRadius: radius.md, borderWidth: 1, overflow: "hidden" }, categoryImage: { flex: 1 }, imageVeil: { flex: 1, justifyContent: "flex-end", padding: spacing.sm, backgroundColor: "rgba(0,0,0,.28)" }, categoryText: { color: "#fff", fontSize: 15, fontWeight: "800" }, categoryFallback: { padding: spacing.md, fontSize: 16, fontWeight: "800" }, stats: { borderRadius: radius.lg, borderWidth: 1, padding: spacing.md, flexDirection: "row", justifyContent: "space-around" }, stat: { flex: 1, alignItems: "center", gap: 3 }, statValue: { fontSize: 20, fontWeight: "800", textAlign: "center" }, statTitle: { fontSize: 11, textAlign: "center" }, callout: { padding: spacing.lg, borderRadius: radius.lg, gap: spacing.sm }, calloutTitle: { fontSize: 20, fontWeight: "800" }, outlineAction: { alignSelf: "flex-start", paddingHorizontal: spacing.md, paddingVertical: 10, borderRadius: radius.pill, borderWidth: 1, marginTop: spacing.xs } });
