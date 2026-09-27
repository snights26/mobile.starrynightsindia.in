import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Section } from "@/src/components/Section";
import { radius, spacing, useAppTheme } from "@/src/theme/theme";

const shortcuts: { label: string; icon: keyof typeof Ionicons.glyphMap; route: string }[] = [
  { label: "Trending", icon: "flame-outline", route: "/trending" },
  { label: "Gallery", icon: "images-outline", route: "/gallery" },
  { label: "What’s new", icon: "notifications-outline", route: "/notifications" },
  { label: "ATLAS", icon: "compass-outline", route: "/chatbot" },
  { label: "About", icon: "information-circle-outline", route: "/about" },
  { label: "Contact", icon: "call-outline", route: "/contact" },
];

export function DiscoveryShortcuts() {
  const theme = useAppTheme();
  return <Section title="Keep exploring"><View style={styles.grid}>{shortcuts.map((item) => <Pressable key={item.route} onPress={() => router.push(item.route as never)} accessibilityRole="button" accessibilityLabel={item.label} style={[styles.item, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}><Ionicons name={item.icon} size={21} color={theme.colors.accent} /><Text style={[styles.label, { color: theme.colors.text }]}>{item.label}</Text></Pressable>)}</View></Section>;
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  item: { width: "31.8%", minHeight: 82, padding: spacing.sm, borderRadius: radius.md, borderWidth: 1, gap: spacing.xs, justifyContent: "center" },
  label: { fontWeight: "800", fontSize: 13 },
});
