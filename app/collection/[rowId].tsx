import { FlatList, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { catalogApi } from "@/src/api/services";
import { PackageCard } from "@/src/components/PackageCard";
import { Screen } from "@/src/components/Screen";
import { EmptyView, ErrorView, LoadingView } from "@/src/components/StateViews";
import { spacing } from "@/src/theme/theme";

export default function CollectionScreen() {
  const { rowId, title } = useLocalSearchParams<{ rowId: string; title?: string }>();
  const query = useQuery({ queryKey: ["collection", rowId], queryFn: () => catalogApi.packages({ rowId }), enabled: Boolean(rowId) });
  if (query.isLoading) return <Screen><LoadingView label={`Loading ${title || "collection"}…`} /></Screen>;
  if (query.isError) return <Screen><ErrorView retry={() => query.refetch()} message="This collection is unavailable right now." /></Screen>;
  return <Screen scroll={false}><FlatList data={query.data ?? []} numColumns={2} keyExtractor={(item) => item.packageCode || item.code} columnWrapperStyle={styles.row} contentContainerStyle={styles.list} renderItem={({ item }) => <PackageCard item={item} compact />} ListEmptyComponent={<EmptyView title="No journeys in this collection" message="Please check another collection or return later." />} /></Screen>;
}
const styles = StyleSheet.create({ list: { padding: spacing.md, gap: spacing.sm, paddingBottom: 100 }, row: { gap: spacing.sm } });
