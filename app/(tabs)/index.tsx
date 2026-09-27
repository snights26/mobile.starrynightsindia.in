import { useEffect, useMemo, useRef, useState } from "react";
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { catalogApi, publicApi } from "@/src/api/services";
import { CategoryRail } from "@/src/components/CategoryRail";
import { FeaturedRowRail, featuredRowsForPlacement } from "@/src/components/FeaturedRowRail";
import { ErrorView } from "@/src/components/StateViews";
import { Screen } from "@/src/components/Screen";
import { radius, spacing, useAppTheme } from "@/src/theme/theme";
import { resolveAssetUrl } from "@/src/utils/assets";
import type { FeaturedRow, Hero } from "@/src/types/api";

function HomeHero({ heroes }: { heroes: Hero[] }) {
  const theme = useAppTheme();
  const pager = useRef<ScrollView>(null);
  const isUserInteracting = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const { width: windowWidth } = useWindowDimensions();
  const heroWidth = Math.max(1, windowWidth - spacing.md * 2);
  const heroHeight = Math.min(270, Math.max(218, Math.round(heroWidth * 0.62)));
  const heroTitleSize = windowWidth < 360 ? 21 : windowWidth < 430 ? 23 : 25;
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
        const title = hero?.title || "Travel beyond the ordinary";
        const subtitle = hero?.subtitle || "Curated holidays, group tours, and adventures for your next story.";
        const overlay = <View style={styles.heroText}><Text style={styles.heroEyebrow}>{image ? "STAR-RATED EXPERIENCES" : "STARRY NIGHTS HOLIDAYS"}</Text><Text numberOfLines={2} style={[styles.heroTitle, { fontSize: heroTitleSize, lineHeight: heroTitleSize + 5 }]}>{title}</Text><Text numberOfLines={2} style={styles.heroSubtitle}>{subtitle}</Text></View>;
        return <View key={hero?.id || hero?.title || `fallback-${index}`} style={[styles.hero, { width: heroWidth, height: heroHeight, backgroundColor: theme.colors.nav }]}>{image ? <ImageBackground source={{ uri: image }} style={styles.heroImage} imageStyle={styles.heroImageContent}>{overlay}</ImageBackground> : <View style={[styles.heroImage, styles.heroFallback]}>{overlay}</View>}</View>;
      })}
    </ScrollView>
    {slides.length > 1 ? <View style={styles.heroDots} accessibilityLabel={`${activeIndex + 1} of ${slides.length} hero slides`}>{slides.map((hero, index) => <View key={hero?.id || hero?.title || index} style={[styles.heroDot, { width: index === activeIndex ? 20 : 7, backgroundColor: index === activeIndex ? theme.colors.accent : theme.colors.border }]} />)}</View> : null}
  </View>;
}

export default function HomeScreen() {
  const theme = useAppTheme();
  const content = useQuery({ queryKey: ["home"], queryFn: async () => Promise.all([catalogApi.heroes(), catalogApi.featured("home"), publicApi.occasion()]) });
  const categories = useQuery({ queryKey: ["home", "categories"], queryFn: catalogApi.categories });
  const [heroes, fetchedRows, occasion] = content.data ?? [[], [], null];
  const rows = featuredRowsForPlacement(fetchedRows as FeaturedRow[], "home");
  const fallbackPackages = useQuery({ queryKey: ["home", "fallback-packages"], queryFn: () => catalogApi.packages(), enabled: Boolean(content.data && !rows.some((row) => row.items.some((item) => "packageCode" in item))) });
  const fallbackRow = useMemo<FeaturedRow | null>(() => fallbackPackages.data?.length ? { id: "catalog", rowId: "catalog", title: "Featured journeys", type: "package", visibleOn: "home", items: fallbackPackages.data.slice(0, 10) } : null, [fallbackPackages.data]);

  if (content.isError) return <Screen><ErrorView message="We could not load the travel catalogue." retry={() => content.refetch()} /></Screen>;
  return <Screen>
    <HomeHero heroes={heroes} />
    {categories.data ? <CategoryRail categories={categories.data} /> : null}
    {occasion ? <Pressable onPress={() => router.push("/enquiry")} style={[styles.occasion, { backgroundColor: theme.colors.accentSoft }]}><Ionicons name="sparkles" color={theme.colors.accent} size={22} /><View style={{ flex: 1 }}><Text style={[styles.occasionTitle, { color: theme.colors.text }]}>{occasion.title}</Text>{occasion.message ? <Text numberOfLines={2} style={{ color: theme.colors.muted }}>{occasion.message}</Text> : null}</View></Pressable> : null}
    {rows.map((row) => <FeaturedRowRail row={row} placement="home" key={row.id || row.rowId} />)}
    {!rows.length && fallbackRow ? <FeaturedRowRail row={fallbackRow} placement="home" /> : null}
    <View style={[styles.callout, { backgroundColor: theme.colors.soft }]}><Text style={[styles.calloutTitle, { color: theme.colors.text }]}>Need a trip made around you?</Text><Text style={{ color: theme.colors.muted }}>Tell us your dates, destination and travel style. Our team will help shape the details.</Text><Pressable onPress={() => router.push("/enquiry")} style={[styles.outlineAction, { borderColor: theme.colors.accent }]}><Text style={{ color: theme.colors.accent, fontWeight: "800" }}>Plan with Starry Nights</Text></Pressable></View>
  </Screen>;
}

const styles = StyleSheet.create({
  heroPager: { alignItems: "center", gap: spacing.sm }, hero: { borderRadius: radius.lg, overflow: "hidden" }, heroImage: { flex: 1, justifyContent: "flex-end" }, heroImageContent: { borderRadius: radius.lg }, heroFallback: { backgroundColor: "#0A0A0A" }, heroText: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: 3, backgroundColor: "rgba(0,0,0,.34)" }, heroEyebrow: { color: "#FDE68A", fontSize: 10, fontWeight: "900", letterSpacing: 1 }, heroTitle: { color: "#fff", fontWeight: "800" }, heroSubtitle: { color: "#F8FAFC", fontSize: 12, lineHeight: 17 }, heroDots: { flexDirection: "row", gap: 6, alignItems: "center", minHeight: 8 }, heroDot: { height: 7, borderRadius: 4 },
  occasion: { flexDirection: "row", gap: spacing.sm, alignItems: "center", padding: spacing.md, borderRadius: radius.md }, occasionTitle: { fontWeight: "800", fontSize: 16 }, callout: { padding: spacing.lg, borderRadius: radius.lg, gap: spacing.sm }, calloutTitle: { fontSize: 20, fontWeight: "800" }, outlineAction: { alignSelf: "flex-start", paddingHorizontal: spacing.md, paddingVertical: 10, borderRadius: radius.pill, borderWidth: 1, marginTop: spacing.xs },
});
