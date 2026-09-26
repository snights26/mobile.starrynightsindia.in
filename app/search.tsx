import { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { catalogApi } from "@/src/api/services";
import { AppInput } from "@/src/components/Form";
import { PackageCard } from "@/src/components/PackageCard";
import { Screen } from "@/src/components/Screen";
import { EmptyView, ErrorView, LoadingView } from "@/src/components/StateViews";
import { radius, spacing, useAppTheme } from "@/src/theme/theme";

const RECENT_KEY = "starry-nights.recent-searches.v1";
export default function SearchScreen() {
  const theme = useAppTheme(); const [query, setQuery] = useState(""); const [recent, setRecent] = useState<string[]>([]);
  const catalogue = useQuery({ queryKey: ["packages"], queryFn: () => catalogApi.packages() });
  useEffect(() => { void AsyncStorage.getItem(RECENT_KEY).then((value) => { try { setRecent(JSON.parse(value ?? "[]") as string[]); } catch { setRecent([]); } }); }, []);
  const results = useMemo(() => { const needle = query.trim().toLowerCase(); return needle ? (catalogue.data ?? []).filter((item) => JSON.stringify(item).toLowerCase().includes(needle)) : []; }, [catalogue.data, query]);
  const remember = (value: string) => { const trimmed = value.trim(); if (!trimmed) return; const next = [trimmed, ...recent.filter((current) => current.toLowerCase() !== trimmed.toLowerCase())].slice(0, 6); setRecent(next); void AsyncStorage.setItem(RECENT_KEY, JSON.stringify(next)); };
  if (catalogue.isLoading) return <Screen><LoadingView label="Loading the catalogue…" /></Screen>;
  if (catalogue.isError) return <Screen><ErrorView retry={() => catalogue.refetch()} message="Search is unavailable while the catalogue cannot be reached." /></Screen>;
  return <Screen scroll={false}><View style={styles.top}><View style={[styles.search, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}><Ionicons name="search" size={20} color={theme.colors.muted} /><AppInput autoFocus value={query} onChangeText={setQuery} onSubmitEditing={() => remember(query)} placeholder="Name, code, destination…" returnKeyType="search" style={styles.input} accessibilityLabel="Search packages" /></View>{query ? <Pressable onPress={() => setQuery("")}><Text style={{ color: theme.colors.accent, fontWeight: "700" }}>Clear</Text></Pressable> : null}</View><FlatList data={results} keyExtractor={(item) => item.packageCode || item.code} numColumns={2} columnWrapperStyle={styles.row} contentContainerStyle={styles.list} renderItem={({ item }) => <PackageCard item={item} compact />} ListHeaderComponent={!query && recent.length ? <View style={styles.recents}><Text style={[styles.recentTitle, { color: theme.colors.text }]}>Recent searches</Text><View style={styles.chips}>{recent.map((item) => <Pressable key={item} onPress={() => setQuery(item)} style={[styles.chip, { backgroundColor: theme.colors.soft }]}><Text style={{ color: theme.colors.text }}>{item}</Text></Pressable>)}</View></View> : null} ListEmptyComponent={query ? <EmptyView title="No matching packages" message="Try another destination, package code, or travel style." /> : <EmptyView title="Search Starry Nights" message="Search by destination, package name, category or code." />} /></Screen>;
}
const styles = StyleSheet.create({ top: { padding: spacing.md, flexDirection: "row", alignItems: "center", gap: spacing.sm }, search: { flex: 1, height: 50, borderRadius: radius.pill, borderWidth: 1, flexDirection: "row", alignItems: "center", paddingLeft: spacing.md }, input: { flex: 1, borderWidth: 0, backgroundColor: "transparent", minHeight: 46 }, list: { padding: spacing.md, gap: spacing.sm, paddingBottom: 60 }, row: { gap: spacing.sm }, recents: { gap: spacing.sm, paddingBottom: spacing.md }, recentTitle: { fontSize: 17, fontWeight: "800" }, chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs }, chip: { borderRadius: radius.pill, paddingVertical: 8, paddingHorizontal: 12 } });
