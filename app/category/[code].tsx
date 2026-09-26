import { FlatList, StyleSheet, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { catalogApi } from "@/src/api/services";
import { PackageCard } from "@/src/components/PackageCard";
import { Screen } from "@/src/components/Screen";
import { EmptyView, ErrorView, LoadingView } from "@/src/components/StateViews";
import { spacing, useAppTheme } from "@/src/theme/theme";

export default function CategoryScreen() {
  const { code, name } = useLocalSearchParams<{ code: string; name?: string }>(); const theme = useAppTheme(); const result = useQuery({ queryKey: ["category", code], queryFn: () => catalogApi.categoryPackages(code), enabled: Boolean(code) });
  if (result.isLoading) return <Screen><LoadingView label="Loading packages…" /></Screen>;
  if (result.isError) return <Screen><ErrorView retry={() => result.refetch()} message="Packages for this destination are not available right now." /></Screen>;
  return <Screen scroll={false}><FlatList data={result.data} keyExtractor={(item) => item.packageCode || item.code} numColumns={2} columnWrapperStyle={styles.row} contentContainerStyle={styles.list} ListHeaderComponent={name ? <Text style={[styles.title, { color: theme.colors.text }]}>{name}</Text> : null} renderItem={({ item }) => <PackageCard item={item} compact />} ListEmptyComponent={<EmptyView title="No packages here yet" message="Try another destination or browse all journeys." />} /></Screen>;
}
const styles = StyleSheet.create({ list: { padding: spacing.md, gap: spacing.sm, paddingBottom: 60 }, row: { gap: spacing.sm }, title: { fontSize: 22, fontWeight: "800", paddingBottom: spacing.xs } });
