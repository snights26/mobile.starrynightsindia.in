import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { catalogApi } from "@/src/api/services";
import { PrimaryButton } from "@/src/components/Form";
import { Screen } from "@/src/components/Screen";
import { radius, spacing, useAppTheme } from "@/src/theme/theme";

export default function AboutScreen() {
  const theme = useAppTheme();
  const statistics = useQuery({ queryKey: ["homepage-statistics"], queryFn: catalogApi.statistics });
  return <Screen>
    <View style={[styles.hero, { backgroundColor: theme.colors.nav }]}><Text style={styles.eyebrow}>STARRY NIGHTS INDIA</Text><Text style={styles.title}>Journeys designed to become stories.</Text><Text style={styles.heroCopy}>Domestic and international travel, thoughtfully planned for families, couples, groups, students, corporates and adventurers.</Text></View>
    <Text style={[styles.heading, { color: theme.colors.text }]}>Our story</Text>
    <Text style={[styles.body, { color: theme.colors.muted }]}>Founded in September 2017, Starry Nights India began as a trekking and adventure travel community in Maharashtra. It has grown into a travel company for domestic holidays, group departures, customised getaways and international journeys.</Text>
    <Text style={[styles.body, { color: theme.colors.muted }]}>The public website describes the same traveller-first focus across planning, hospitality, safety, and on-ground coordination. Every package in this app is drawn from the existing Starry Nights catalogue.</Text>
    <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}><Text style={[styles.heading, { color: theme.colors.text }]}>What we plan</Text><Text style={[styles.body, { color: theme.colors.muted }]}>Honeymoons · family holidays · group tours · educational tours · corporate travel · adventure experiences · domestic and international itineraries.</Text></View>
    {statistics.data?.length ? <View style={styles.statsGrid}>{statistics.data.map((stat) => <View style={[styles.stat, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]} key={stat.id}><Text numberOfLines={1} style={[styles.statValue, { color: theme.colors.accent }]}>{stat.value}</Text><Text numberOfLines={2} style={[styles.statTitle, { color: theme.colors.muted }]}>{stat.title}</Text></View>)}</View> : null}
    <PrimaryButton title="Explore journeys" onPress={() => router.push("/trending" as never)} />
  </Screen>;
}

const styles = StyleSheet.create({
  hero: { borderRadius: radius.lg, padding: spacing.xl, gap: spacing.sm }, eyebrow: { color: "#FCA5A5", fontWeight: "800", letterSpacing: 1 }, title: { color: "#fff", fontSize: 30, lineHeight: 36, fontWeight: "800" }, heroCopy: { color: "#E2E8F0", lineHeight: 21 }, heading: { fontSize: 22, fontWeight: "800" }, body: { fontSize: 15, lineHeight: 23 }, card: { borderWidth: 1, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.sm }, statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }, stat: { width: "48.4%", minHeight: 96, borderRadius: radius.md, borderWidth: 1, padding: spacing.md, justifyContent: "center", gap: 5 }, statValue: { fontSize: 25, fontWeight: "900" }, statTitle: { fontSize: 12, lineHeight: 17 },
});
