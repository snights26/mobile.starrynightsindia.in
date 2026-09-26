import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { customerApi } from "@/src/api/services";
import { useAuth } from "@/src/auth/AuthProvider";
import { AuthGate } from "@/src/components/AuthGate";
import { ChoiceChips } from "@/src/components/Form";
import { Screen } from "@/src/components/Screen";
import { EmptyView, ErrorView, LoadingView } from "@/src/components/StateViews";
import { radius, spacing, useAppTheme } from "@/src/theme/theme";
import { inr, readableDate } from "@/src/utils/format";

export default function TripsScreen() {
  const theme = useAppTheme(); const { isAuthenticated } = useAuth(); const [filter, setFilter] = useState("Upcoming");
  const trips = useQuery({ queryKey: ["tours"], queryFn: customerApi.tours, enabled: isAuthenticated });
  const data = useMemo(() => (trips.data ?? []).filter((item) => filter === "Upcoming" ? !item.pickupDate || new Date(item.pickupDate) >= new Date(new Date().toDateString()) : item.pickupDate && new Date(item.pickupDate) < new Date(new Date().toDateString())), [filter, trips.data]);
  if (!isAuthenticated) return <Screen scroll={false}><AuthGate title="Your trips, in one place" message="Sign in to view confirmed travel dates, accommodation, and payment status." /></Screen>;
  if (trips.isLoading) return <Screen><LoadingView label="Loading your trips…" /></Screen>;
  if (trips.isError) return <Screen><ErrorView retry={() => trips.refetch()} message="We could not load your trip information." /></Screen>;
  return <Screen scroll={false}><FlatList data={data} keyExtractor={(item) => item.tourId || item.id} contentContainerStyle={styles.list} ListHeaderComponent={<View style={styles.filter}><ChoiceChips values={["Upcoming", "Completed"]} selected={filter} onChange={setFilter} /></View>} ListEmptyComponent={<EmptyView title={filter === "Upcoming" ? "No upcoming trips" : "No completed trips"} message="When Starry Nights confirms a booking, it will appear here." />} renderItem={({ item }) => <Pressable onPress={() => router.push({ pathname: "/trip/[tourId]", params: { tourId: item.tourId } })} style={[styles.trip, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}><View style={styles.tripHead}><Text style={[styles.package, { color: theme.colors.text }]}>{item.packageName || "Starry Nights journey"}</Text><Text style={[styles.status, { color: theme.colors.accent }]}>{item.status || "Confirmed"}</Text></View><Text style={{ color: theme.colors.muted }}>{readableDate(item.pickupDate)}{item.duration ? ` · ${item.duration}` : ""}</Text>{item.pickupLocation ? <Text style={{ color: theme.colors.muted }}>Pickup: {item.pickupLocation}</Text> : null}<View style={styles.tripFoot}><Text style={[styles.amount, { color: theme.colors.text }]}>{inr(item.totalCost)}</Text><Text style={{ color: theme.colors.muted }}>{item.paymentStatus || "Payment status pending"}</Text></View></Pressable>} /></Screen>;
}
const styles = StyleSheet.create({ list: { padding: spacing.md, gap: spacing.sm, paddingBottom: 100 }, filter: { paddingBottom: spacing.xs }, trip: { borderWidth: 1, borderRadius: radius.md, padding: spacing.md, gap: 6 }, tripHead: { flexDirection: "row", justifyContent: "space-between", gap: spacing.sm }, package: { fontSize: 17, fontWeight: "800", flex: 1 }, status: { fontSize: 12, fontWeight: "800" }, tripFoot: { marginTop: spacing.xs, paddingTop: spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#CBD5E1", flexDirection: "row", justifyContent: "space-between", gap: spacing.sm }, amount: { fontWeight: "800" } });
