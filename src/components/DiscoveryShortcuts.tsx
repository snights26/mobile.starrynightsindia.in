import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { radius, spacing, useAppTheme } from "@/src/theme/theme";

const shortcuts: { label: string; icon: keyof typeof Ionicons.glyphMap; route: string }[] = [
  { label: "Trending", icon: "flame-outline", route: "/trending" },
  { label: "Click to Explore", icon: "map-outline", route: "/global-explorer" },
  { label: "World time", icon: "time-outline", route: "/time-zones" },
  { label: "Chat with ATLAS", icon: "sparkles-outline", route: "/chatbot" },
];

export function DiscoveryShortcuts() {
  const theme = useAppTheme();
  return <View style={styles.grid}>{shortcuts.map((item) => <Pressable key={item.route} onPress={() => router.push(item.route as never)} accessibilityRole="button" accessibilityLabel={item.label} style={[styles.item, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}><Ionicons name={item.icon} size={21} color={theme.colors.accent} /><Text numberOfLines={2} style={[styles.label, { color: theme.colors.text }]}>{item.label}</Text></Pressable>)}</View>;
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  item: { width: "48.5%", minHeight: 78, padding: spacing.sm, borderRadius: radius.md, borderWidth: 1, gap: spacing.xs, justifyContent: "center" },
  label: { fontWeight: "800", fontSize: 13 },
});
