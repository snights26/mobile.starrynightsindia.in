import { StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { catalogApi } from "@/src/api/services";
import { FeaturedRowRail, featuredRowsForPlacement } from "@/src/components/FeaturedRowRail";
import { Screen } from "@/src/components/Screen";
import { EmptyView, ErrorView, LoadingView } from "@/src/components/StateViews";
import { radius, shadows, spacing, useAppTheme } from "@/src/theme/theme";

export default function TrendingScreen() {
  const theme = useAppTheme();
  const rows = useQuery({ queryKey: ["featured", "trending"], queryFn: () => catalogApi.featured("trending") });
  if (rows.isLoading) return <Screen><LoadingView label="Loading trending journeys…" /></Screen>;
  if (rows.isError) return <Screen><ErrorView retry={() => rows.refetch()} message="Trending journeys could not be loaded." /></Screen>;
  const visibleRows = featuredRowsForPlacement(rows.data ?? [], "trending");
  return <Screen>
    <View style={[styles.hero, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }, shadows.card]}><Text style={[styles.eyebrow, { color: theme.colors.accent }]}>WHAT TRAVELLERS LOVE NOW</Text><Text style={[styles.heroTitle, { color: theme.colors.text }]}>Trending journeys</Text><Text style={[styles.heroCopy, { color: theme.colors.muted }]}>Browse the live, server-curated collections that are currently drawing attention.</Text></View>
    {visibleRows.map((row) => <FeaturedRowRail key={row.id || row.rowId} row={row} placement="trending" />)}
    {!visibleRows.length ? <EmptyView title="No trending journeys yet" message="Please check back soon for the latest Starry Nights highlights." /> : null}
  </Screen>;
}

const styles = StyleSheet.create({
  hero: { borderRadius: radius.lg, padding: spacing.lg, gap: spacing.xs, borderWidth: 1 }, eyebrow: { fontSize: 11, letterSpacing: 1, fontWeight: "900" }, heroTitle: { fontSize: 26, fontWeight: "900" }, heroCopy: { lineHeight: 20 },
});
