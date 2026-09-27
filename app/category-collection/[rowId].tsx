import { FlatList, ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { catalogApi } from "@/src/api/services";
import { Screen } from "@/src/components/Screen";
import { EmptyView, ErrorView, LoadingView } from "@/src/components/StateViews";
import { radius, spacing, useAppTheme } from "@/src/theme/theme";
import { resolveAssetUrl } from "@/src/utils/assets";
import type { Category, FeaturedRow } from "@/src/types/api";

const categoryCode = (category: Category) => category.code || category.categoryCode || category.id;

/** Shows exactly the compact category collection configured for one public featured row. */
export default function CategoryCollectionScreen() {
  const { rowId, placement, title } = useLocalSearchParams<{ rowId: string; placement?: string; title?: string }>();
  const activePlacement = String(placement || "home").toLowerCase();
  const query = useQuery({ queryKey: ["category-collection", activePlacement, rowId], queryFn: () => catalogApi.featured(activePlacement), enabled: Boolean(rowId) });
  if (query.isLoading) return <Screen><LoadingView label={`Loading ${title || "categories"}…`} /></Screen>;
  if (query.isError) return <Screen><ErrorView retry={() => query.refetch()} message="This category collection is unavailable right now." /></Screen>;
  const row = (query.data ?? []).find((item: FeaturedRow) => (item.rowId || item.id) === rowId && String(item.visibleOn || activePlacement).toLowerCase() === activePlacement);
  const categories = (row?.items ?? []).filter((item): item is Category => !Boolean((item as { packageCode?: string }).packageCode));
  return <Screen scroll={false}><FlatList data={categories} numColumns={2} keyExtractor={categoryCode} contentContainerStyle={styles.list} columnWrapperStyle={styles.row} renderItem={({ item }) => <CategoryTile item={item} />} ListEmptyComponent={<EmptyView title="No categories in this collection" message="The live collection may have changed. Please return and choose another row." />} /></Screen>;
}

function CategoryTile({ item }: { item: Category }) {
  const theme = useAppTheme(); const image = resolveAssetUrl(item.image || item.thumbnailUrl); const code = categoryCode(item);
  return <Pressable accessibilityRole="button" accessibilityLabel={`Browse ${item.name || item.title}`} onPress={() => router.push({ pathname: "/category/[code]", params: { code, name: item.name || item.title } })} style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>{image ? <ImageBackground source={{ uri: image }} style={styles.image} imageStyle={{ borderRadius: radius.md }}><View style={styles.veil}><Text numberOfLines={2} style={styles.name}>{item.name || item.title}</Text></View></ImageBackground> : <View style={styles.empty}><Text numberOfLines={2} style={[styles.emptyText, { color: theme.colors.text }]}>{item.name || item.title}</Text></View>}</Pressable>;
}

const styles = StyleSheet.create({ list: { padding: spacing.md, gap: spacing.sm, paddingBottom: 100 }, row: { gap: spacing.sm }, card: { flex: 1, height: 142, borderRadius: radius.md, overflow: "hidden", borderWidth: 1 }, image: { flex: 1 }, veil: { flex: 1, justifyContent: "flex-end", padding: spacing.sm, backgroundColor: "rgba(0,0,0,.30)" }, name: { color: "#fff", fontWeight: "800", fontSize: 16 }, empty: { flex: 1, justifyContent: "flex-end", padding: spacing.sm }, emptyText: { fontWeight: "800", fontSize: 16 } });
