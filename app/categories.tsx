import { FlatList, ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { catalogApi } from "@/src/api/services";
import { Screen } from "@/src/components/Screen";
import { EmptyView, ErrorView, LoadingView } from "@/src/components/StateViews";
import { radius, spacing, useAppTheme } from "@/src/theme/theme";
import { resolveAssetUrl } from "@/src/utils/assets";
import type { Category } from "@/src/types/api";

export default function CategoriesScreen() {
  const query = useQuery({ queryKey: ["categories"], queryFn: catalogApi.categories });
  if (query.isLoading) return <Screen><LoadingView label="Loading categories…" /></Screen>;
  if (query.isError) return <Screen><ErrorView retry={() => query.refetch()} message="Categories are unavailable right now." /></Screen>;
  const categories = (query.data ?? []).filter((item) => !item.isSub && !item.isSubcategory);
  return <Screen scroll={false}><FlatList data={categories} numColumns={2} keyExtractor={(item) => item.code || item.categoryCode} contentContainerStyle={styles.list} columnWrapperStyle={styles.row} renderItem={({ item }) => <CategoryTile item={item} />} ListEmptyComponent={<EmptyView title="No categories yet" message="Destination categories will appear here when they are available." />} /></Screen>;
}

function CategoryTile({ item }: { item: Category }) {
  const theme = useAppTheme(); const image = resolveAssetUrl(item.image || item.thumbnailUrl); const code = item.code || item.categoryCode;
  return <Pressable accessibilityRole="button" accessibilityLabel={`Browse ${item.name || item.title}`} onPress={() => router.push({ pathname: "/category/[code]", params: { code, name: item.name || item.title } })} style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
    {image ? <ImageBackground source={{ uri: image }} style={styles.image} imageStyle={{ borderRadius: radius.md }}><View style={styles.veil}><Text style={styles.name}>{item.name || item.title}</Text></View></ImageBackground> : <View style={styles.empty}><Text style={[styles.emptyText, { color: theme.colors.text }]}>{item.name || item.title}</Text></View>}
  </Pressable>;
}
const styles = StyleSheet.create({ list: { padding: spacing.md, gap: spacing.sm, paddingBottom: 100 }, row: { gap: spacing.sm }, card: { flex: 1, height: 142, borderRadius: radius.md, overflow: "hidden", borderWidth: 1 }, image: { flex: 1 }, veil: { flex: 1, justifyContent: "flex-end", padding: spacing.sm, backgroundColor: "rgba(0,0,0,.30)" }, name: { color: "#fff", fontWeight: "800", fontSize: 16 }, empty: { flex: 1, justifyContent: "flex-end", padding: spacing.sm }, emptyText: { fontWeight: "800", fontSize: 16 } });
