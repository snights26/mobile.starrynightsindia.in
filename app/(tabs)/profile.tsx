import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { useAuth } from "@/src/auth/AuthProvider";
import { AuthGate } from "@/src/components/AuthGate";
import { PackageCard } from "@/src/components/PackageCard";
import { Screen } from "@/src/components/Screen";
import { EmptyView, ErrorView } from "@/src/components/StateViews";
import { Section } from "@/src/components/Section";
import { radius, shadows, spacing, useAppTheme } from "@/src/theme/theme";

export default function ProfileScreen() {
  const theme = useAppTheme();
  const { user, isAuthenticated, logout, bucketItems, bucketLoading, bucketError, reloadBucket } = useAuth();
  useFocusEffect(useCallback(() => { void reloadBucket(); }, [reloadBucket]));
  if (!isAuthenticated || !user) return <Screen scroll={false}><AuthGate title="Your Starry Nights account" message="Sign in with Google to manage your profile, saved journeys, trips and payments." /></Screen>;
  return <Screen>
    <View style={[styles.hero, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }, shadows.card]}><View style={[styles.avatar, { backgroundColor: theme.colors.accent }]}><Text style={styles.avatarText}>{(user.name || "S").slice(0, 1).toUpperCase()}</Text></View><View style={styles.profileCopy}><Text style={[styles.name, { color: theme.colors.text }]}>{user.name}</Text><Text style={[styles.email, { color: theme.colors.muted }]}>{user.email}</Text>{!user.profileCompleted ? <Pressable onPress={() => router.push("/profile-edit")}><Text style={[styles.complete, { color: theme.colors.accent }]}>Complete your travel profile →</Text></Pressable> : null}</View></View>
    <Section title="My BucketList" action={<Pressable onPress={() => router.push("/(tabs)/bucket" as never)} accessibilityRole="button"><Text style={{ color: theme.colors.accent, fontWeight: "800" }}>View all</Text></Pressable>}>
      {bucketLoading ? <View style={[styles.bucketState, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}><ActivityIndicator color={theme.colors.accent} /><Text style={{ color: theme.colors.muted }}>Loading saved packages…</Text></View> : bucketError ? <ErrorView message={bucketError} retry={() => { void reloadBucket({ force: true }); }} /> : bucketItems.length ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bucketRail}>{bucketItems.slice(0, 8).map((item) => <PackageCard key={item.packageCode || item.code} item={item} compact />)}</ScrollView> : <EmptyView title="No bucket packages yet" message="Tap the heart on a journey to save it here." />}
    </Section>
    <Pressable onPress={() => void logout()} style={[styles.logout, { borderColor: theme.colors.accent }]}><Ionicons name="log-out-outline" size={20} color={theme.colors.accent} /><Text style={{ color: theme.colors.accent, fontWeight: "800" }}>Sign out</Text></Pressable>
  </Screen>;
}

const styles = StyleSheet.create({
  hero: { borderRadius: radius.lg, padding: spacing.lg, flexDirection: "row", alignItems: "center", gap: spacing.md, position: "relative", borderWidth: 1 },
  avatar: { width: 58, height: 58, borderRadius: 29, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontWeight: "800", fontSize: 24 },
  profileCopy: { flex: 1, minWidth: 0 }, name: { fontSize: 20, fontWeight: "800" }, email: { marginTop: 2 }, complete: { marginTop: spacing.xs, fontWeight: "700" },
  bucketRail: { gap: spacing.sm, paddingRight: spacing.md }, bucketState: { minHeight: 92, borderWidth: 1, borderRadius: radius.md, alignItems: "center", justifyContent: "center", gap: spacing.xs },
  logout: { minHeight: 52, borderWidth: 1, borderRadius: radius.pill, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: spacing.xs },
});
