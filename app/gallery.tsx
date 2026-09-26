import { useState } from "react";
import { FlatList, Image, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { publicApi } from "@/src/api/services";
import { Screen } from "@/src/components/Screen";
import { EmptyView, ErrorView, LoadingView } from "@/src/components/StateViews";
import { spacing, useAppTheme } from "@/src/theme/theme";
import { resolveAssetUrl } from "@/src/utils/assets";
import type { GalleryImage } from "@/src/types/api";

export default function GalleryScreen() {
  const theme = useAppTheme(); const gallery = useQuery({ queryKey: ["gallery"], queryFn: publicApi.gallery }); const [selected, setSelected] = useState<GalleryImage | null>(null);
  if (gallery.isLoading) return <Screen><LoadingView label="Loading gallery…" /></Screen>;
  if (gallery.isError) return <Screen><ErrorView retry={() => gallery.refetch()} message="The gallery could not be loaded." /></Screen>;
  return <Screen scroll={false}><FlatList data={gallery.data} numColumns={3} keyExtractor={(item) => item.id} contentContainerStyle={styles.grid} columnWrapperStyle={styles.row} renderItem={({ item }) => { const url = resolveAssetUrl(item.image || item.url); return <Pressable onPress={() => setSelected(item)} style={[styles.tile, { backgroundColor: theme.colors.soft }]}>{url ? <Image source={{ uri: url }} style={styles.image} /> : <Ionicons name="image-outline" size={26} color={theme.colors.muted} />}</Pressable>; }} ListEmptyComponent={<EmptyView title="Gallery is being curated" message="Please check back soon for traveler moments and destination inspiration." />} /><Modal visible={Boolean(selected)} transparent animationType="fade" onRequestClose={() => setSelected(null)}><View style={styles.modal}><Pressable onPress={() => setSelected(null)} accessibilityLabel="Close image" style={styles.close}><Ionicons name="close" size={28} color="#fff" /></Pressable>{resolveAssetUrl(selected?.image || selected?.url) ? <Image source={{ uri: resolveAssetUrl(selected?.image || selected?.url) }} style={styles.fullImage} resizeMode="contain" /> : null}<Text style={styles.caption}>{selected?.title || "Starry Nights gallery"}</Text></View></Modal></Screen>;
}
const styles = StyleSheet.create({ grid: { padding: spacing.xs, gap: spacing.xs }, row: { gap: spacing.xs }, tile: { flex: 1, aspectRatio: 1, alignItems: "center", justifyContent: "center", overflow: "hidden" }, image: { width: "100%", height: "100%" }, modal: { flex: 1, backgroundColor: "rgba(0,0,0,.94)", alignItems: "center", justifyContent: "center", padding: spacing.md }, close: { position: "absolute", top: 52, right: 20, zIndex: 2, padding: spacing.xs }, fullImage: { width: "100%", height: "82%" }, caption: { color: "#fff", marginTop: spacing.sm, fontWeight: "700" } });
