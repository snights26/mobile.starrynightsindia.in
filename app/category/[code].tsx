import { FlatList, ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { catalogApi } from "@/src/api/services";
import { flattenCategories } from "@/src/constants/discovery";
import { PackageCard } from "@/src/components/PackageCard";
import { Screen } from "@/src/components/Screen";
import { EmptyView, ErrorView, LoadingView } from "@/src/components/StateViews";
import { radius, spacing, useAppTheme } from "@/src/theme/theme";
import type { Category } from "@/src/types/api";
import { resolveAssetUrl } from "@/src/utils/assets";

export default function CategoryScreen() {
  const { code, name } = useLocalSearchParams<{ code: string; name?: string }>();
  const theme = useAppTheme();
  const tree = useQuery({ queryKey: ["category-tree"], queryFn: catalogApi.categoryTree });
  const category = flattenCategories(tree.data ?? []).find((item) => (item.code || item.categoryCode) === code);
  const children = category?.children ?? [];
  const packages = useQuery({ queryKey: ["category", code], queryFn: () => catalogApi.categoryPackages(code), enabled: Boolean(code) && (tree.isError || (tree.isSuccess && !children.length)) });
  const title = name || category?.name || category?.title;

  if (tree.isLoading) return <Screen><LoadingView label="Loading destination categories…" /></Screen>;
  if (children.length) return <Screen scroll={false}><FlatList data={children} keyExtractor={(item) => item.code || item.categoryCode} numColumns={2} columnWrapperStyle={styles.row} contentContainerStyle={styles.list} ListHeaderComponent={title ? <View style={styles.header}><Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text><Text style={{ color: theme.colors.muted }}>Choose a destination to view its packages.</Text></View> : null} renderItem={({ item }) => <CategoryTile item={item} />} /></Screen>;
  if (packages.isLoading) return <Screen><LoadingView label="Loading packages…" /></Screen>;
  if (packages.isError) return <Screen><ErrorView retry={() => packages.refetch()} message="Packages for this destination are not available right now." /></Screen>;
  return <Screen scroll={false}><FlatList data={packages.data} keyExtractor={(item) => item.packageCode || item.code} numColumns={2} columnWrapperStyle={styles.row} contentContainerStyle={styles.list} ListHeaderComponent={title ? <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text> : null} renderItem={({ item }) => <PackageCard item={item} compact />} ListEmptyComponent={<EmptyView title="No packages here yet" message="Try another destination or browse all journeys." />} /></Screen>;
}

function CategoryTile({ item }: { item: Category }) {
  const theme = useAppTheme();
  const image = resolveAssetUrl(item.image || item.thumbnailUrl);
  return <Pressable onPress={() => router.push({ pathname: "/category/[code]", params: { code: item.code || item.categoryCode, name: item.name || item.title } })} accessibilityRole="button" accessibilityLabel={`Browse ${item.name || item.title}`} style={[styles.tile, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>{image ? <ImageBackground source={{ uri: image }} style={styles.tileImage} imageStyle={{ borderRadius: radius.md }}><View style={styles.shade}><Text numberOfLines={2} style={styles.tileTitle}>{item.name || item.title}</Text></View></ImageBackground> : <Text style={[styles.tileFallback, { color: theme.colors.text }]}>{item.name || item.title}</Text>}</Pressable>;
}

const styles = StyleSheet.create({ list: { padding: spacing.md, gap: spacing.sm, paddingBottom: 60 }, row: { gap: spacing.sm }, header: { gap: spacing.xs, paddingBottom: spacing.sm }, title: { fontSize: 22, fontWeight: "800", paddingBottom: spacing.xs }, tile: { flex: 1, minHeight: 122, borderWidth: 1, borderRadius: radius.md, overflow: "hidden" }, tileImage: { flex: 1 }, shade: { flex: 1, justifyContent: "flex-end", padding: spacing.sm, backgroundColor: "rgba(0,0,0,.3)" }, tileTitle: { color: "#fff", fontWeight: "800", fontSize: 15 }, tileFallback: { padding: spacing.sm, fontWeight: "800", fontSize: 15 } });
