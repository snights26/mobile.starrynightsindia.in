import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { catalogApi } from "@/src/api/services";
import { WORLD_TIME_ZONES, flattenCategories, formatWorldTime } from "@/src/constants/discovery";
import { Screen } from "@/src/components/Screen";
import { EmptyView, ErrorView, LoadingView } from "@/src/components/StateViews";
import { radius, spacing, useAppTheme } from "@/src/theme/theme";

export default function TimeZonesScreen() {
  const theme = useAppTheme();
  const [now, setNow] = useState(() => new Date());
  const [selectedZone, setSelectedZone] = useState(WORLD_TIME_ZONES[0].timeZone);
  const categories = useQuery({ queryKey: ["category-tree"], queryFn: catalogApi.categoryTree });
  useEffect(() => { const interval = setInterval(() => setNow(new Date()), 1_000); return () => clearInterval(interval); }, []);
  const byCode = useMemo(() => new Map(flattenCategories(categories.data ?? []).map((item) => [item.code || item.categoryCode, item])), [categories.data]);
  const zones = useMemo(() => WORLD_TIME_ZONES.map((zone) => ({ ...zone, categories: zone.categoryCodes.map((code) => byCode.get(code)).filter((item): item is NonNullable<typeof item> => Boolean(item)) })).filter((zone) => zone.categories.length > 0), [byCode]);
  const active = zones.find((zone) => zone.timeZone === selectedZone) ?? zones[0];

  if (categories.isLoading) return <Screen><LoadingView label="Loading regional time zones…" /></Screen>;
  if (categories.isError) return <Screen><ErrorView retry={() => categories.refetch()} message="World time zones are unavailable right now." /></Screen>;
  if (!zones.length) return <Screen><EmptyView title="Regional time zones are unavailable" message="No destination regions are currently configured for time-zone browsing." /></Screen>;

  return <Screen><View style={styles.intro}><Text style={[styles.eyebrow, { color: theme.colors.accent }]}>LIVE TRAVEL TIME</Text><Text style={[styles.title, { color: theme.colors.text }]}>Explore packages by time zone</Text><Text style={{ color: theme.colors.muted }}>Tap a live clock to reveal the destination regions it covers.</Text></View><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail} accessibilityLabel="World time zones">{zones.map((zone) => <Pressable key={zone.timeZone} onPress={() => setSelectedZone(zone.timeZone)} accessibilityRole="button" accessibilityState={{ selected: active?.timeZone === zone.timeZone }} style={[styles.clock, { backgroundColor: active?.timeZone === zone.timeZone ? theme.colors.nav : theme.colors.card, borderColor: active?.timeZone === zone.timeZone ? theme.colors.nav : theme.colors.border }]}><Text style={[styles.time, { color: active?.timeZone === zone.timeZone ? "#fff" : theme.colors.text }]}>{formatWorldTime(zone.timeZone, now)}</Text><Text style={[styles.city, { color: active?.timeZone === zone.timeZone ? "#fff" : theme.colors.text }]}>{zone.regionName}</Text><Text style={{ color: active?.timeZone === zone.timeZone ? "#CBD5E1" : theme.colors.muted }}>{zone.zoneLabel}</Text><Text style={[styles.zoneName, { color: active?.timeZone === zone.timeZone ? "#CBD5E1" : theme.colors.muted }]}>{zone.timeZone}</Text></Pressable>)}</ScrollView>{active ? <View style={[styles.regions, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}><Text style={[styles.regionTitle, { color: theme.colors.text }]}>{active.regionName} regions</Text><Text style={{ color: theme.colors.muted }}>Choose a region to view its current package collection.</Text><View style={styles.regionList}>{active.categories.map((category) => <Pressable key={category.code || category.categoryCode} onPress={() => router.push({ pathname: "/category/[code]", params: { code: category.code || category.categoryCode, name: category.name || category.title } })} style={[styles.region, { backgroundColor: theme.colors.soft }]}><Text style={[styles.regionText, { color: theme.colors.text }]}>{category.name || category.title}</Text><Text style={{ color: theme.colors.accent }}>View packages →</Text></Pressable>)}</View></View> : null}</Screen>;
}

const styles = StyleSheet.create({
  intro: { gap: spacing.xs }, eyebrow: { fontWeight: "900", fontSize: 12, letterSpacing: 1 }, title: { fontSize: 27, fontWeight: "800", lineHeight: 33 }, rail: { gap: spacing.sm, paddingRight: spacing.md }, clock: { width: 210, padding: spacing.md, gap: 3, borderRadius: radius.lg, borderWidth: 1 }, time: { fontSize: 27, fontWeight: "900", letterSpacing: 1 }, city: { fontSize: 17, fontWeight: "800", marginTop: spacing.xs }, zoneName: { fontSize: 12, marginTop: spacing.xs }, regions: { borderRadius: radius.lg, padding: spacing.md, gap: spacing.xs, borderWidth: 1 }, regionTitle: { fontSize: 20, fontWeight: "800" }, regionList: { gap: spacing.xs, marginTop: spacing.sm }, region: { minHeight: 52, borderRadius: radius.sm, paddingHorizontal: spacing.sm, alignItems: "center", justifyContent: "space-between", flexDirection: "row", gap: spacing.sm }, regionText: { flex: 1, fontWeight: "700" },
});
