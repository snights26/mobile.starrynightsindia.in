import { memo } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "@/src/auth/AuthProvider";
import { radius, shadows, spacing, useAppTheme } from "@/src/theme/theme";
import type { PackageSummary } from "@/src/types/api";
import { resolveAssetUrl } from "@/src/utils/assets";
import { inr } from "@/src/utils/format";

export const PackageCard = memo(function PackageCard({ item, compact = false }: { item: PackageSummary; compact?: boolean }) {
  const theme = useAppTheme(); const { isAuthenticated, likedCodes, toggleBucket } = useAuth();
  const code = item.packageCode || item.code; const saved = likedCodes.has(code.toUpperCase());
  const save = async () => { if (!isAuthenticated) { router.push("/login"); return; } try { await toggleBucket(item); } catch { /* optimistic state already reverts */ } };
  return <Pressable accessibilityRole="button" accessibilityLabel={`View ${item.name}`} onPress={() => router.push({ pathname: "/package/[code]", params: { code } })} style={[styles.card, compact ? styles.compact : styles.full, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }, shadows.card]}>
    <View style={styles.imageWrap}>{resolveAssetUrl(item.image || item.thumbnailUrl) ? <Image source={{ uri: resolveAssetUrl(item.image || item.thumbnailUrl) }} style={styles.image} resizeMode="cover" accessibilityLabel={`${item.name} package image`} /> : <View style={[styles.image, styles.placeholder, { backgroundColor: theme.colors.soft }]}><Ionicons name="image-outline" size={30} color={theme.colors.muted} /></View>}
      <Pressable onPress={(event) => { event.stopPropagation(); void save(); }} hitSlop={8} accessibilityRole="button" accessibilityLabel={saved ? `Remove ${item.name} from bucket list` : `Save ${item.name} to bucket list`} style={[styles.save, { backgroundColor: theme.colors.card }]}><Ionicons name={saved ? "heart" : "heart-outline"} size={20} color={saved ? theme.colors.accent : theme.colors.text} /></Pressable>
    </View>
    <View style={styles.body}><Text numberOfLines={2} style={[styles.name, { color: theme.colors.text }]}>{item.name || item.title}</Text>{!compact && <><Text numberOfLines={1} style={[styles.meta, { color: theme.colors.muted }]}>{item.duration || (item.days ? `${item.days} Days` : "Curated travel")}{item.pickup ? ` · ${item.pickup}` : ""}</Text><Text style={[styles.price, { color: theme.colors.accentStrong }]}>{inr(item.avgCost)}</Text></>}</View>
  </Pressable>;
});
const styles = StyleSheet.create({ card: { borderWidth: 1, borderRadius: radius.md, overflow: "hidden" }, full: { width: 248 }, compact: { width: 166 }, imageWrap: { height: 152, position: "relative" }, image: { width: "100%", height: "100%" }, placeholder: { alignItems: "center", justifyContent: "center" }, save: { position: "absolute", top: spacing.xs, right: spacing.xs, width: 38, height: 38, borderRadius: 19, justifyContent: "center", alignItems: "center", ...shadows.card }, body: { padding: spacing.sm, gap: 5 }, name: { fontSize: 15, fontWeight: "700", minHeight: 38 }, meta: { fontSize: 12 }, price: { fontSize: 13, fontWeight: "800" } });
