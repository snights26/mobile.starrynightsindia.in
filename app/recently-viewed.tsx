import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { customerApi } from "@/src/api/services";
import { useAuth } from "@/src/auth/AuthProvider";
import { AuthGate } from "@/src/components/AuthGate";
import { Screen } from "@/src/components/Screen";
import { EmptyView, ErrorView, LoadingView } from "@/src/components/StateViews";
import { radius, spacing, useAppTheme } from "@/src/theme/theme";
import { readableDate } from "@/src/utils/format";

export default function RecentlyViewedScreen() {
  const theme = useAppTheme(); const { isAuthenticated } = useAuth(); const recent = useQuery({ queryKey: ["recent"], queryFn: customerApi.recent, enabled: isAuthenticated });
  const clear = () => Alert.alert("Clear recently viewed?", "This removes the history from your account.", [{ text: "Cancel", style: "cancel" }, { text: "Clear", style: "destructive", onPress: () => { void customerApi.clearRecent().then(() => recent.refetch()); } }]);
  if (!isAuthenticated) return <Screen><AuthGate title="Your recently viewed journeys" message="Sign in to review packages you have explored on this account." /></Screen>;
  if (recent.isLoading) return <Screen><LoadingView label="Loading your history…" /></Screen>;
  if (recent.isError) return <Screen><ErrorView retry={() => recent.refetch()} message="Recently viewed packages could not be loaded." /></Screen>;
  return <Screen scroll={false}><FlatList data={recent.data} keyExtractor={(item) => item.packageCode} contentContainerStyle={styles.list} ListHeaderComponent={recent.data?.length ? <Pressable onPress={clear} style={styles.clear}><Text style={{ color: theme.colors.accent, fontWeight: "800" }}>Clear history</Text></Pressable> : null} renderItem={({ item }) => <View style={[styles.item, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}><Pressable onPress={() => router.push({ pathname: "/package/[code]", params: { code: item.packageCode } })} style={{ flex: 1 }}><Text style={[styles.name, { color: theme.colors.text }]}>{item.packageName || item.name || item.packageCode}</Text><Text style={{ color: theme.colors.muted }}>Last viewed {readableDate(item.lastViewedAt)}</Text></Pressable><Pressable onPress={() => { void customerApi.removeRecent(item.packageCode).then(() => recent.refetch()); }} accessibilityLabel={`Remove ${item.packageName || item.packageCode} from history`}><Text style={{ color: theme.colors.accent, fontWeight: "800" }}>Remove</Text></Pressable></View>} ListEmptyComponent={<EmptyView title="Nothing viewed yet" message="Packages you open while signed in will appear here." />} /></Screen>;
}
const styles = StyleSheet.create({ list: { padding: spacing.md, gap: spacing.sm, paddingBottom: 60 }, clear: { alignSelf: "flex-end", paddingVertical: spacing.xs }, item: { borderWidth: 1, borderRadius: radius.md, padding: spacing.md, flexDirection: "row", alignItems: "center", gap: spacing.sm }, name: { fontWeight: "800", fontSize: 16, marginBottom: 4 } });
