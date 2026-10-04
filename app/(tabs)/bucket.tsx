import { FlatList, StyleSheet } from "react-native";
import { useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { useAuth } from "@/src/auth/AuthProvider";
import { AuthGate } from "@/src/components/AuthGate";
import { PackageCard } from "@/src/components/PackageCard";
import { Screen } from "@/src/components/Screen";
import { EmptyView, ErrorView, LoadingView } from "@/src/components/StateViews";
import { spacing } from "@/src/theme/theme";

export default function BucketScreen() {
  const { isAuthenticated, bucketItems, bucketLoading, bucketError, reloadBucket } = useAuth();
  useFocusEffect(useCallback(() => { void reloadBucket(); }, [reloadBucket]));
  if (!isAuthenticated) return <Screen scroll={false}><AuthGate title="Save journeys for later" message="Sign in to keep a personal bucket list across your devices." /></Screen>;
  if (bucketLoading) return <Screen><LoadingView label="Loading saved journeys…" /></Screen>;
  if (bucketError) return <Screen><ErrorView retry={() => { void reloadBucket({ force: true }); }} message={bucketError} /></Screen>;
  return <Screen scroll={false}><FlatList data={bucketItems} keyExtractor={(item) => item.packageCode || item.code} numColumns={2} columnWrapperStyle={styles.row} contentContainerStyle={styles.list} renderItem={({ item }) => <PackageCard item={item} compact />} ListEmptyComponent={<EmptyView title="Your bucket list is waiting" message="Tap the heart on a package to save it here." />} /></Screen>;
}
const styles = StyleSheet.create({ list: { padding: spacing.md, gap: spacing.sm, paddingBottom: 100 }, row: { gap: spacing.sm } });
