import { FlatList, StyleSheet } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { customerApi } from "@/src/api/services";
import { useAuth } from "@/src/auth/AuthProvider";
import { AuthGate } from "@/src/components/AuthGate";
import { PackageCard } from "@/src/components/PackageCard";
import { Screen } from "@/src/components/Screen";
import { EmptyView, ErrorView, LoadingView } from "@/src/components/StateViews";
import { spacing } from "@/src/theme/theme";

export default function BucketScreen() {
  const { isAuthenticated } = useAuth(); const bucket = useQuery({ queryKey: ["bucket"], queryFn: customerApi.bucket, enabled: isAuthenticated });
  if (!isAuthenticated) return <Screen scroll={false}><AuthGate title="Save journeys for later" message="Sign in to keep a personal bucket list across your devices." /></Screen>;
  if (bucket.isLoading) return <Screen><LoadingView label="Loading saved journeys…" /></Screen>;
  if (bucket.isError) return <Screen><ErrorView retry={() => bucket.refetch()} message="Your saved packages could not be loaded." /></Screen>;
  return <Screen scroll={false}><FlatList data={bucket.data} keyExtractor={(item) => item.packageCode || item.code} numColumns={2} columnWrapperStyle={styles.row} contentContainerStyle={styles.list} renderItem={({ item }) => <PackageCard item={item} compact />} ListEmptyComponent={<EmptyView title="Your bucket list is waiting" message="Tap the heart on a package to save it here." />} /></Screen>;
}
const styles = StyleSheet.create({ list: { padding: spacing.md, gap: spacing.sm, paddingBottom: 100 }, row: { gap: spacing.sm } });
