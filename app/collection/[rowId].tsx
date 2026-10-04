import { FlatList, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { catalogApi } from "@/src/api/services";
import { PackageCard } from "@/src/components/PackageCard";
import { featuredRowBehavior } from "@/src/components/FeaturedRowRail";
import { Screen } from "@/src/components/Screen";
import { EmptyView, ErrorView, LoadingView } from "@/src/components/StateViews";
import { spacing } from "@/src/theme/theme";
import type { FeaturedRow, PackageSummary } from "@/src/types/api";

const isPackage = (item: PackageSummary | unknown): item is PackageSummary => Boolean((item as PackageSummary).packageCode);

export default function CollectionScreen() {
  const { rowId, placement, title } = useLocalSearchParams<{ rowId: string; placement?: string; title?: string }>();
  const activePlacement = String(placement || "home").toLowerCase();
  const query = useQuery({ queryKey: ["collection", activePlacement, rowId], queryFn: () => catalogApi.featured(activePlacement), enabled: Boolean(rowId) });
  if (query.isLoading) return <Screen><LoadingView label={`Loading ${title || "collection"}…`} /></Screen>;
  if (query.isError) return <Screen><ErrorView retry={() => query.refetch()} message="This collection is unavailable right now." /></Screen>;
  const row = (query.data ?? []).find((item: FeaturedRow) => {
    const visibleOn = String(item.visibleOn || activePlacement).toLowerCase();
    return (item.rowId || item.id) === rowId && (visibleOn === activePlacement || visibleOn === "both");
  });
  const packages = row && featuredRowBehavior(row as FeaturedRow) !== "category" ? row.items.filter(isPackage) : [];
  return <Screen scroll={false}><FlatList data={packages} numColumns={2} keyExtractor={(item) => item.packageCode || item.code} columnWrapperStyle={styles.row} contentContainerStyle={styles.list} renderItem={({ item }) => <PackageCard item={item} compact />} ListEmptyComponent={<EmptyView title="No journeys in this collection" message="The live collection may have changed. Please return and choose another row." />} /></Screen>;
}
const styles = StyleSheet.create({ list: { padding: spacing.md, gap: spacing.sm, paddingBottom: 100 }, row: { gap: spacing.sm } });
