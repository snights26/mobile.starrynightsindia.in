import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { radius, spacing, useAppTheme } from "@/src/theme/theme";

const menuItems: { label: string; icon: keyof typeof Ionicons.glyphMap; route: string }[] = [
  { label: "Trending", icon: "flame-outline", route: "/trending" },
  { label: "Start Exploring", icon: "map-outline", route: "/global-explorer" },
  { label: "World time", icon: "time-outline", route: "/time-zones" },
  { label: "Chat with ATLAS", icon: "sparkles-outline", route: "/chatbot" },
  { label: "Gallery", icon: "images-outline", route: "/gallery" },
  { label: "Settings & support", icon: "settings-outline", route: "/settings" },
];

/** Persistent tab header: it owns the status-bar inset and keeps search/actions reachable while a tab scrolls. */
export function MobileHeader() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const [menuVisible, setMenuVisible] = useState(false);
  const navigate = (route: string) => { setMenuVisible(false); router.push(route as never); };
  return <>
    <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border, paddingTop: insets.top }]}>
      <View style={styles.topRow}>
        <Pressable onPress={() => setMenuVisible(true)} accessibilityRole="button" accessibilityLabel="Open navigation menu" style={[styles.iconButton, { backgroundColor: theme.colors.soft }]}>
          <Ionicons name="menu" size={23} color={theme.colors.text} />
        </Pressable>
        <Text numberOfLines={1} style={styles.brand}>STARRY NIGHTS</Text>
        <Pressable onPress={() => router.push("/(tabs)/bucket" as never)} accessibilityRole="button" accessibilityLabel="Open bucket list" style={[styles.iconButton, { backgroundColor: theme.colors.soft }]}>
          <Ionicons name="heart-outline" size={22} color={theme.colors.accent} />
        </Pressable>
      </View>
      <Pressable onPress={() => router.push("/search")} accessibilityRole="button" accessibilityLabel="Search packages" style={[styles.search, { backgroundColor: theme.colors.soft, borderColor: theme.colors.border }]}>
        <Ionicons name="search" size={19} color={theme.colors.muted} />
        <Text style={[styles.searchLabel, { color: theme.colors.muted }]}>Search destinations and journeys</Text>
      </Pressable>
    </View>
    <Modal visible={menuVisible} transparent animationType="slide" onRequestClose={() => setMenuVisible(false)}>
      <View style={styles.modalRoot}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close navigation menu" style={styles.backdrop} onPress={() => setMenuVisible(false)} />
        <SafeAreaView edges={["top", "bottom"]} style={[styles.drawer, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.drawerHeading}><View><Text style={styles.drawerBrand}>STARRY NIGHTS</Text><Text style={{ color: theme.colors.muted }}>Start exploring</Text></View><Pressable onPress={() => setMenuVisible(false)} accessibilityRole="button" accessibilityLabel="Close navigation menu" style={[styles.iconButton, { backgroundColor: theme.colors.soft }]}><Ionicons name="close" size={22} color={theme.colors.text} /></Pressable></View>
          <View style={styles.menu}>{menuItems.map((item) => <Pressable key={item.route} onPress={() => navigate(item.route)} accessibilityRole="button" style={[styles.menuItem, { borderBottomColor: theme.colors.border }]}><Ionicons name={item.icon} size={21} color={theme.colors.accent} /><Text style={[styles.menuLabel, { color: theme.colors.text }]}>{item.label}</Text><Ionicons name="chevron-forward" size={19} color={theme.colors.muted} /></Pressable>)}</View>
        </SafeAreaView>
      </View>
    </Modal>
  </>;
}

const styles = StyleSheet.create({
  header: { borderBottomWidth: StyleSheet.hairlineWidth, paddingHorizontal: spacing.md, paddingBottom: spacing.sm, gap: spacing.sm },
  topRow: { minHeight: 48, flexDirection: "row", alignItems: "center", gap: spacing.sm },
  brand: { flex: 1, color: "#E50914", textAlign: "center", fontWeight: "900", fontSize: 16, letterSpacing: 1.15 },
  iconButton: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  search: { minHeight: 42, borderRadius: radius.pill, borderWidth: 1, paddingHorizontal: spacing.md, gap: spacing.xs, flexDirection: "row", alignItems: "center" },
  searchLabel: { fontSize: 14, flex: 1 },
  modalRoot: { flex: 1, flexDirection: "row", backgroundColor: "rgba(0,0,0,.38)" },
  backdrop: { flex: 1 },
  drawer: { width: "84%", maxWidth: 370, paddingHorizontal: spacing.md, gap: spacing.lg },
  drawerHeading: { paddingTop: spacing.sm, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  drawerBrand: { color: "#E50914", fontWeight: "900", letterSpacing: 1.1, fontSize: 17 },
  menu: { gap: 0 },
  menuItem: { minHeight: 55, flexDirection: "row", alignItems: "center", gap: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth },
  menuLabel: { flex: 1, fontWeight: "700", fontSize: 16 },
});
