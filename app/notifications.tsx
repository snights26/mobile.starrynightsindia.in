import { Alert, FlatList, Image, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { customerApi, publicApi } from "@/src/api/services";
import { useAuth } from "@/src/auth/AuthProvider";
import { ChoiceChips } from "@/src/components/Form";
import { Screen } from "@/src/components/Screen";
import { EmptyView, ErrorView, LoadingView } from "@/src/components/StateViews";
import { radius, spacing, useAppTheme } from "@/src/theme/theme";
import { resolveAssetUrl } from "@/src/utils/assets";

const openUrl = async (raw?: string) => { const url = resolveAssetUrl(raw); if (!url || !/^https:\/\//i.test(url)) { Alert.alert("Document unavailable", "This notification does not include a usable secure document link."); return; } if (await Linking.canOpenURL(url)) await Linking.openURL(url); else Alert.alert("Unable to open document", "Your device cannot open this link."); };
export default function NotificationsScreen() {
  const theme = useAppTheme(); const { isAuthenticated } = useAuth(); const [selectedType, setSelectedType] = useState("All"); const notification = useQuery({ queryKey: ["notifications", isAuthenticated], queryFn: isAuthenticated ? customerApi.notifications : publicApi.notifications });
  const notificationTypes = (notification.data ?? []).map((item) => item.type).filter((item): item is string => Boolean(item));
  const types = ["All", ...Array.from(new Set(notificationTypes))];
  const data = useMemo(() => selectedType === "All" ? notification.data ?? [] : (notification.data ?? []).filter((item) => item.type === selectedType), [notification.data, selectedType]);
  if (notification.isLoading) return <Screen><LoadingView label="Loading updates…" /></Screen>;
  if (notification.isError) return <Screen><ErrorView retry={() => notification.refetch()} message="Updates could not be loaded." /></Screen>;
  return <Screen scroll={false}><FlatList data={data} keyExtractor={(item) => item.id || item.notificationId || item.title} contentContainerStyle={styles.list} ListHeaderComponent={types.length > 1 ? <View style={styles.filters}><ChoiceChips values={types} selected={selectedType} onChange={setSelectedType} /></View> : null} renderItem={({ item }) => <View style={[styles.item, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>{resolveAssetUrl(item.image || item.imageUrl) ? <Image source={{ uri: resolveAssetUrl(item.image || item.imageUrl) }} style={styles.image} /> : null}<View style={styles.copy}><Text style={[styles.title, { color: theme.colors.text }]}>{item.title}</Text>{item.message ? <Text style={{ color: theme.colors.muted, lineHeight: 20 }}>{item.message}</Text> : null}{item.pdf || item.pdfUrl ? <Pressable onPress={() => void openUrl(item.pdf || item.pdfUrl)} style={[styles.document, { borderColor: theme.colors.accent }]}><Text style={{ color: theme.colors.accent, fontWeight: "800" }}>Open document</Text></Pressable> : null}</View></View>} ListEmptyComponent={<EmptyView title="No updates right now" message="Travel alerts and personal booking updates will appear here." />} /></Screen>;
}
const styles = StyleSheet.create({ list: { padding: spacing.md, gap: spacing.sm, paddingBottom: 60 }, filters: { paddingBottom: spacing.xs }, item: { borderWidth: 1, borderRadius: radius.md, overflow: "hidden" }, image: { width: "100%", height: 150 }, copy: { padding: spacing.md, gap: spacing.xs }, title: { fontSize: 17, fontWeight: "800" }, document: { alignSelf: "flex-start", borderWidth: 1, borderRadius: radius.pill, paddingVertical: 9, paddingHorizontal: spacing.md, marginTop: spacing.xs } });
