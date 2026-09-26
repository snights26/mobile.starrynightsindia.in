import { useMemo, useState } from "react";
import { FlatList, ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { catalogApi } from "@/src/api/services";
import { PackageCard } from "@/src/components/PackageCard";
import { Screen } from "@/src/components/Screen";
import { EmptyView, ErrorView, LoadingView } from "@/src/components/StateViews";
import { AppInput } from "@/src/components/Form";
import { radius, spacing, useAppTheme } from "@/src/theme/theme";
import { resolveAssetUrl } from "@/src/utils/assets";
import type { Category } from "@/src/types/api";

export default function ExploreScreen() {
  const theme = useAppTheme(); const [query, setQuery] = useState("");
  const data = useQuery({ queryKey: ["explore", "catalog"], queryFn: async () => Promise.all([catalogApi.categories(), catalogApi.packages()]) });
  const [categories, packages] = data.data ?? [[], []];
  const filtered = useMemo(() => { const needle = query.trim().toLowerCase(); return needle ? packages.filter((item) => JSON.stringify(item).toLowerCase().includes(needle)) : packages; }, [packages, query]);
  if (data.isLoading) return <Screen><LoadingView label="Loading destinations…" /></Screen>;
  if (data.isError) return <Screen><ErrorView retry={() => data.refetch()} message="Destinations are temporarily unavailable." /></Screen>;
  return <Screen scroll={false}>
    <View style={styles.top}><Pressable onPress={() => router.push("/search")} style={[styles.searchButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}><Ionicons name="search" size={20} color={theme.colors.muted} /><Text style={{ color: theme.colors.muted }}>Search the catalogue</Text></Pressable></View>
    <FlatList data={filtered} keyExtractor={(item) => item.packageCode || item.code} numColumns={2} contentContainerStyle={styles.list} columnWrapperStyle={styles.row} ListHeaderComponent={<View style={styles.header}><Text style={[styles.heading, { color: theme.colors.text }]}>Explore by destination</Text><FlatList data={categories.filter((item: Category) => !item.isSubcategory).slice(0, 12)} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories} keyExtractor={(item) => item.code} renderItem={({ item }) => <Pressable onPress={() => router.push({ pathname: "/category/[code]", params: { code: item.code, name: item.name } })} style={[styles.category, { borderColor: theme.colors.border, backgroundColor: theme.colors.card }]}>{resolveAssetUrl(item.image || item.thumbnailUrl) ? <ImageBackground source={{ uri: resolveAssetUrl(item.image || item.thumbnailUrl) }} style={styles.categoryImage} imageStyle={{ borderRadius: radius.md }}><View style={styles.categoryShade}><Text style={styles.categoryName}>{item.name}</Text></View></ImageBackground> : <Text style={[styles.categoryNameFallback, { color: theme.colors.text }]}>{item.name}</Text>}</Pressable>} /><Text style={[styles.heading, { color: theme.colors.text, marginTop: spacing.lg }]}>All journeys</Text><AppInput value={query} onChangeText={setQuery} placeholder="Filter by name, code, category…" accessibilityLabel="Filter packages" /></View>} renderItem={({ item }) => <PackageCard item={item} compact />} ListEmptyComponent={<EmptyView title="No journeys found" message="Try a different destination or clear the filter." />} />
  </Screen>;
}
const styles = StyleSheet.create({ top: { padding: spacing.md, paddingBottom: 0 }, searchButton: { height: 48, borderWidth: 1, borderRadius: radius.pill, flexDirection: "row", gap: spacing.sm, alignItems: "center", paddingHorizontal: spacing.md }, list: { padding: spacing.md, paddingTop: spacing.sm, gap: spacing.sm, paddingBottom: 100 }, row: { gap: spacing.sm }, header: { gap: spacing.sm, paddingBottom: spacing.sm }, heading: { fontSize: 20, fontWeight: "800" }, categories: { gap: spacing.sm }, category: { width: 152, height: 105, borderRadius: radius.md, borderWidth: 1, overflow: "hidden" }, categoryImage: { flex: 1 }, categoryShade: { flex: 1, justifyContent: "flex-end", padding: spacing.sm, backgroundColor: "rgba(0,0,0,.3)" }, categoryName: { color: "#fff", fontWeight: "800", fontSize: 14 }, categoryNameFallback: { padding: spacing.sm, fontWeight: "800", fontSize: 14 } });
