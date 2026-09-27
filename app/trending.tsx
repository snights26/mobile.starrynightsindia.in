import { ScrollView, StyleSheet } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { catalogApi } from "@/src/api/services";
import { PackageCard } from "@/src/components/PackageCard";
import { Section } from "@/src/components/Section";
import { Screen } from "@/src/components/Screen";
import { EmptyView, ErrorView, LoadingView } from "@/src/components/StateViews";
import { spacing } from "@/src/theme/theme";
import type { FeaturedRow, PackageSummary } from "@/src/types/api";

export default function TrendingScreen() {
  const rows = useQuery({ queryKey: ["featured", "trending"], queryFn: () => catalogApi.featured("trending") });
  if (rows.isLoading) return <Screen><LoadingView label="Loading trending journeys…" /></Screen>;
  if (rows.isError) return <Screen><ErrorView retry={() => rows.refetch()} message="Trending journeys could not be loaded." /></Screen>;
  const visibleRows = (rows.data ?? []).map((row) => ({ ...row, packages: row.items.filter((item): item is PackageSummary => "packageCode" in item) })).filter((row) => row.packages.length);
  if (!visibleRows.length) return <Screen><EmptyView title="No trending journeys yet" message="Please check back soon for the latest Starry Nights highlights." /></Screen>;
  return <Screen>{visibleRows.map((row: FeaturedRow & { packages: PackageSummary[] }) => <Section key={row.id || row.rowId} title={row.title || row.rowTitle || "Trending journeys"}><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>{row.packages.map((item) => <PackageCard key={item.packageCode || item.code} item={item} />)}</ScrollView></Section>)}</Screen>;
}

const styles = StyleSheet.create({ rail: { gap: spacing.sm, paddingRight: spacing.md } });
