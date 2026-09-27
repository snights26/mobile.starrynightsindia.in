import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "@/src/auth/AuthProvider";
import { AuthGate } from "@/src/components/AuthGate";
import { PackageCard } from "@/src/components/PackageCard";
import { Screen } from "@/src/components/Screen";
import { EmptyView } from "@/src/components/StateViews";
import { Section } from "@/src/components/Section";
import { radius, spacing, useAppTheme } from "@/src/theme/theme";

const menu: { label: string; icon: keyof typeof Ionicons.glyphMap; route: string }[] = [
  { label: "Edit Profile", icon: "person-outline", route: "/profile-edit" },
  { label: "My Trips", icon: "airplane-outline", route: "/(tabs)/trips" },
  { label: "Payment History", icon: "card-outline", route: "/payments" },
  { label: "Recently Viewed", icon: "time-outline", route: "/recently-viewed" },
  { label: "Notifications", icon: "notifications-outline", route: "/notifications" },
  { label: "Settings & Support", icon: "settings-outline", route: "/settings" },
];

export default function ProfileScreen() {
  const theme = useAppTheme();
  const { user, isAuthenticated, logout, bucketItems, bucketLoading } = useAuth();
  if (!isAuthenticated || !user) return <Screen scroll={false}><AuthGate title="Your Starry Nights account" message="Sign in with Google to manage your profile, saved journeys, trips and payments." /></Screen>;
  return <Screen>
    <View style={[styles.hero, { backgroundColor: theme.colors.nav }]}><View style={[styles.avatar, { backgroundColor: theme.colors.accent }]}><Text style={styles.avatarText}>{(user.name || "S").slice(0, 1).toUpperCase()}</Text></View><View style={{ flex: 1 }}><Text style={styles.name}>{user.name}</Text><Text style={styles.email}>{user.email}</Text>{!user.profileCompleted ? <Pressable onPress={() => router.push("/profile-edit")}><Text style={styles.complete}>Complete your travel profile →</Text></Pressable> : null}</View></View>
    <View style={[styles.menu, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>{menu.map((item) => <Pressable key={item.route} onPress={() => router.push(item.route as never)} style={[styles.menuItem, { borderBottomColor: theme.colors.border }]}><Ionicons name={item.icon} size={21} color={theme.colors.accent} /><Text style={[styles.menuText, { color: theme.colors.text }]}>{item.label}</Text><Ionicons name="chevron-forward" size={20} color={theme.colors.muted} /></Pressable>)}</View>
    <Section title="Bucket Packages" action={<Pressable onPress={() => router.push("/(tabs)/bucket" as never)} accessibilityRole="button"><Text style={{ color: theme.colors.accent, fontWeight: "800" }}>View all</Text></Pressable>}>
      {bucketLoading ? <View style={[styles.bucketState, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}><ActivityIndicator color={theme.colors.accent} /><Text style={{ color: theme.colors.muted }}>Loading saved packages…</Text></View> : bucketItems.length ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bucketRail}>{bucketItems.slice(0, 8).map((item) => <PackageCard key={item.packageCode || item.code} item={item} compact />)}</ScrollView> : <EmptyView title="No bucket packages yet" message="Tap the heart on a journey to save it here." />}
    </Section>
    <Pressable onPress={() => void logout()} style={[styles.logout, { borderColor: theme.colors.accent }]}><Ionicons name="log-out-outline" size={20} color={theme.colors.accent} /><Text style={{ color: theme.colors.accent, fontWeight: "800" }}>Sign out</Text></Pressable>
  </Screen>;
}

const styles = StyleSheet.create({
  hero: { borderRadius: radius.lg, padding: spacing.lg, flexDirection: "row", alignItems: "center", gap: spacing.md },
  avatar: { width: 58, height: 58, borderRadius: 29, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontWeight: "800", fontSize: 24 },
  name: { color: "#fff", fontSize: 20, fontWeight: "800" }, email: { color: "#CBD5E1", marginTop: 2 }, complete: { color: "#fff", marginTop: spacing.xs, fontWeight: "700" },
  menu: { borderWidth: 1, borderRadius: radius.lg, overflow: "hidden" }, menuItem: { flexDirection: "row", minHeight: 58, alignItems: "center", paddingHorizontal: spacing.md, gap: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth }, menuText: { flex: 1, fontSize: 16, fontWeight: "600" },
  bucketRail: { gap: spacing.sm, paddingRight: spacing.md }, bucketState: { minHeight: 92, borderWidth: 1, borderRadius: radius.md, alignItems: "center", justifyContent: "center", gap: spacing.xs },
  logout: { minHeight: 52, borderWidth: 1, borderRadius: radius.pill, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: spacing.xs },
});
