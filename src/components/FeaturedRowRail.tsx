import { FlatList, ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { PackageCard } from "@/src/components/PackageCard";
import { Section } from "@/src/components/Section";
import { radius, spacing, useAppTheme } from "@/src/theme/theme";
import { resolveAssetUrl } from "@/src/utils/assets";
import type { Category, FeaturedRow, PackageSummary } from "@/src/types/api";

export const featuredRowTitle = (row: FeaturedRow) => row.rowTitle || row.title || "Discover";
export const featuredRowsForPlacement = (rows: FeaturedRow[], placement: string) => rows
  .filter((row) => String(row.visibleOn ?? placement).trim().toLowerCase() === placement)
  .sort((left, right) => (left.sequence ?? Number.MAX_SAFE_INTEGER) - (right.sequence ?? Number.MAX_SAFE_INTEGER));

const categoryCode = (category: Category) => category.code || category.categoryCode || category.id;
const isPackage = (item: PackageSummary | Category): item is PackageSummary => Boolean((item as PackageSummary).packageCode);
const isCategory = (row: FeaturedRow) => String(row.rowType || row.type).toLowerCase() === "category";

/** A server-configured public row. Navigation carries rowId plus visibleOn, never title-based inference. */
export function FeaturedRowRail({ row, placement }: { row: FeaturedRow; placement: string }) {
  const theme = useAppTheme();
  const categoryRow = isCategory(row);
  const categories = row.items.filter((item): item is Category => !isPackage(item));
  const packages = row.items.filter((item): item is PackageSummary => isPackage(item));
  if (categoryRow && !categories.length) return null;
  if (!categoryRow && !packages.length) return null;
  const sourcePlacement = String(row.visibleOn || placement).toLowerCase();
  const openAll = () => {
    const params = { rowId: row.rowId || row.id, placement: sourcePlacement, title: featuredRowTitle(row) };
    router.push((categoryRow
      ? { pathname: "/category-collection/[rowId]", params }
      : { pathname: "/collection/[rowId]", params }) as never);
  };
  const action = <Pressable onPress={openAll} accessibilityRole="button" accessibilityLabel={`View all ${featuredRowTitle(row)}`}><Text style={{ color: theme.colors.accent, fontWeight: "800" }}>View all</Text></Pressable>;
  if (categoryRow) return <Section title={featuredRowTitle(row)} action={action}>
    <FlatList horizontal data={categories} showsHorizontalScrollIndicator={false} keyExtractor={categoryCode} contentContainerStyle={styles.horizontal} renderItem={({ item: category }) => {
        const code = categoryCode(category);
        const image = resolveAssetUrl(category.image || category.thumbnailUrl);
        return <Pressable onPress={() => router.push({ pathname: "/category/[code]", params: { code, name: category.name || category.title } })} accessibilityRole="button" accessibilityLabel={`Browse ${category.name || category.title}`} style={[styles.categoryCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          {image ? <ImageBackground source={{ uri: image }} style={styles.categoryImage} imageStyle={{ borderRadius: radius.md }}><View style={styles.imageVeil}><Text numberOfLines={2} style={styles.categoryText}>{category.name || category.title}</Text></View></ImageBackground> : <View style={styles.categoryFallback}><Text numberOfLines={2} style={{ color: theme.colors.text, fontWeight: "800", fontSize: 16 }}>{category.name || category.title}</Text></View>}
        </Pressable>;
      }} />
  </Section>;
  return <Section title={featuredRowTitle(row)} action={action}><FlatList horizontal data={packages} showsHorizontalScrollIndicator={false} keyExtractor={(item, index) => item.packageCode || item.code || String(index)} contentContainerStyle={styles.horizontal} renderItem={({ item }) => <PackageCard item={item} />} /></Section>;
}

const styles = StyleSheet.create({
  horizontal: { gap: spacing.sm, paddingRight: spacing.md },
  categoryCard: { width: 172, height: 122, borderRadius: radius.md, borderWidth: 1, overflow: "hidden" },
  categoryImage: { flex: 1 }, imageVeil: { flex: 1, justifyContent: "flex-end", padding: spacing.sm, backgroundColor: "rgba(0,0,0,.30)" },
  categoryText: { color: "#fff", fontSize: 15, fontWeight: "800" }, categoryFallback: { flex: 1, justifyContent: "flex-end", padding: spacing.sm },
});
