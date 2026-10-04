import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "@/src/auth/AuthProvider";
import { AuthGate } from "@/src/components/AuthGate";
import { Screen } from "@/src/components/Screen";
import { radius, spacing, useAppTheme } from "@/src/theme/theme";

const items: { label: string; icon: keyof typeof Ionicons.glyphMap; route: string }[] = [
  { label: "Edit Profile", icon: "person-outline", route: "/profile-edit" },
  { label: "My Trips", icon: "airplane-outline", route: "/(tabs)/trips" },
  { label: "Payment History", icon: "card-outline", route: "/payments" },
  { label: "Recently Viewed", icon: "time-outline", route: "/recently-viewed" },
  { label: "Notifications", icon: "notifications-outline", route: "/notifications" },
];

export default function AccountScreen() {
  const theme = useAppTheme();
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Screen scroll={false}><AuthGate title="Your Account" message="Sign in with Google to manage your Starry Nights account." /></Screen>;
  return <Screen><View style={[styles.list, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>{items.map((item) => <Pressable key={item.route} onPress={() => router.push(item.route as never)} accessibilityRole="button" style={[styles.item, { borderBottomColor: theme.colors.border }]}><Ionicons name={item.icon} size={22} color={theme.colors.accent} /><Text style={[styles.label, { color: theme.colors.text }]}>{item.label}</Text><Ionicons name="chevron-forward" size={20} color={theme.colors.muted} /></Pressable>)}</View></Screen>;
}

const styles = StyleSheet.create({ list: { borderWidth: 1, borderRadius: radius.md, overflow: "hidden" }, item: { minHeight: 58, paddingHorizontal: spacing.md, alignItems: "center", flexDirection: "row", gap: spacing.md, borderBottomWidth: 1 }, label: { flex: 1, fontWeight: "700", fontSize: 16 } });
