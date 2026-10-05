import { Animated, Image, Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { router, usePathname } from "expo-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useAuth } from "@/src/auth/AuthProvider";
import { radius, spacing, type ThemePreference, useAppTheme, useThemePreference } from "@/src/theme/theme";

type MenuItem = { label: string; icon: keyof typeof Ionicons.glyphMap; route: string };
const generalItems: MenuItem[] = [
  { label: "Start Exploring", icon: "map-outline", route: "/global-explorer" },
  { label: "Gallery", icon: "images-outline", route: "/gallery" },
  { label: "Enquiry", icon: "mail-outline", route: "/enquiry" },
  { label: "World Time", icon: "time-outline", route: "/time-zones" },
  { label: "Chat with ATLAS", icon: "sparkles-outline", route: "/chatbot" },
];
const accountItems: MenuItem[] = [
  { label: "Edit Profile", icon: "person-outline", route: "/profile-edit" },
  { label: "My Trips", icon: "airplane-outline", route: "/(tabs)/trips" },
  { label: "Payment History", icon: "card-outline", route: "/payments" },
  { label: "Recently Viewed", icon: "time-outline", route: "/recently-viewed" },
  { label: "Notifications", icon: "notifications-outline", route: "/notifications" },
];

const lightHeaderBrandImage = require("@/assets/brand/starry-nights-light-theme.png");
const darkHeaderBrandImage = require("@/assets/brand/starry-nights-dark-theme.png");
const drawerBrandImage = require("@/assets/icon/starry-nights-icon.png");

const themeChoices: { value: ThemePreference; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: "light", label: "Light", icon: "sunny-outline" },
  { value: "dark", label: "Dark", icon: "moon-outline" },
  { value: "system", label: "System", icon: "phone-portrait-outline" },
];

/** Persistent tab header: it owns the status-bar inset and keeps search/actions reachable while a tab scrolls. */
export function MobileHeader() {
  const theme = useAppTheme();
  const { preference, setPreference } = useThemePreference();
  const { isAuthenticated, user } = useAuth();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const pathname = usePathname();
  const [menuVisible, setMenuVisible] = useState(false);
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);
  const drawerProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!menuVisible) return;
    drawerProgress.setValue(0);
    Animated.timing(drawerProgress, { toValue: 1, duration: 220, useNativeDriver: true }).start();
  }, [drawerProgress, menuVisible]);

  const closeDrawer = () => {
    Animated.timing(drawerProgress, { toValue: 0, duration: 180, useNativeDriver: true }).start(({ finished }) => {
      if (!finished) return;
      setMenuVisible(false);
    });
  };
  const navigate = (route: string) => {
    setPendingRoute(route);
    closeDrawer();
  };
  useEffect(() => {
    if (menuVisible || !pendingRoute) return;
    const frame = requestAnimationFrame(() => {
      setPendingRoute(null);
      router.push(pendingRoute as never);
    });
    return () => cancelAnimationFrame(frame);
  }, [menuVisible, pendingRoute]);
  const drawerTranslateX = drawerProgress.interpolate({ inputRange: [0, 1], outputRange: [-420, 0] });
  const headerBrandWidth = Math.min(210, Math.max(142, width * 0.48));
  const headerBrandImage = theme.dark ? darkHeaderBrandImage : lightHeaderBrandImage;
  const isProfile = pathname === "/profile";

  return <>
    <StatusBar style={theme.dark ? "light" : "dark"} backgroundColor={theme.colors.surface} />
    <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border, paddingTop: insets.top }]}>
      <View style={styles.topRow}>
        <Pressable onPress={() => setMenuVisible(true)} accessibilityRole="button" accessibilityLabel="Open navigation menu" style={[styles.iconButton, styles.headerIconButton, { backgroundColor: theme.colors.soft }]}>
          <Ionicons name="menu" size={23} color={theme.colors.text} />
        </Pressable>
        <Image source={headerBrandImage} resizeMode="contain" style={[styles.brandImage, { width: headerBrandWidth }]} accessibilityLabel="Starry Nights brand" />
        {isProfile ? <Pressable onPress={() => router.push("/account" as never)} accessibilityRole="button" accessibilityLabel="Open Your Account" hitSlop={8} style={[styles.iconButton, styles.headerIconButton, { backgroundColor: theme.colors.soft }]}><Ionicons name="settings-outline" size={21} color={theme.colors.text} /></Pressable> : <View style={styles.headerBalance} />}
      </View>
    </View>
    <View style={[styles.searchSurface, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}>
      <Pressable onPress={() => router.push("/search")} accessibilityRole="button" accessibilityLabel="Search packages" style={[styles.search, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Ionicons name="search" size={19} color={theme.colors.text} />
        <Text numberOfLines={1} style={[styles.searchLabel, { color: theme.colors.muted }]}>Search destinations and journeys</Text>
      </Pressable>
    </View>
    <Modal visible={menuVisible} transparent animationType="none" onRequestClose={() => closeDrawer()} statusBarTranslucent>
      <View style={styles.modalRoot}>
        <Animated.View style={[styles.drawerShell, { transform: [{ translateX: drawerTranslateX }] }]}>
          <SafeAreaView edges={["top", "bottom"]} style={[styles.drawer, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.drawerHeading}>
              <View style={styles.drawerHeadingCopy}><Image source={drawerBrandImage} resizeMode="contain" style={styles.drawerBrandImage} accessibilityLabel="Starry Nights brand" /><Text numberOfLines={1} style={{ color: theme.colors.muted }}>{isAuthenticated ? `Welcome, ${user?.name || "traveller"}` : "Start exploring"}</Text></View>
              <Pressable onPress={() => closeDrawer()} accessibilityRole="button" accessibilityLabel="Close navigation menu" style={[styles.iconButton, { backgroundColor: theme.colors.soft }]}><Ionicons name="close" size={22} color={theme.colors.text} /></Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.drawerContent} showsVerticalScrollIndicator={false}>
              <DrawerGroup label="Your Account">
                <View style={styles.menu}>{isAuthenticated
                  ? accountItems.map((item) => <DrawerItem key={item.route} item={item} onPress={() => navigate(item.route)} />)
                  : <DrawerItem item={{ label: "Login", icon: "log-in-outline", route: "/login" }} onPress={() => navigate("/login")} />}
                </View>
              </DrawerGroup>
              <DrawerGroup label="Explore">
                <View style={styles.menu}>{generalItems.map((item) => <DrawerItem key={item.route} item={item} onPress={() => navigate(item.route)} />)}</View>
              </DrawerGroup>
              <DrawerGroup label="Appearance">
                <View style={styles.themeChoices}>{themeChoices.map((choice) => {
                  const selected = preference === choice.value;
                  return <Pressable key={choice.value} onPress={() => setPreference(choice.value)} accessibilityRole="radio" accessibilityState={{ selected }} style={[styles.themeChoice, { borderColor: selected ? theme.colors.accent : theme.colors.border, backgroundColor: selected ? theme.colors.accentSoft : theme.colors.soft }]}><Ionicons name={choice.icon} size={17} color={selected ? theme.colors.accentStrong : theme.colors.muted} /><Text style={{ color: selected ? theme.colors.accentStrong : theme.colors.text, fontSize: 12, fontWeight: "800" }}>{choice.label}</Text></Pressable>;
                })}</View>
              </DrawerGroup>
              <View style={[styles.standaloneItem, { borderColor: theme.colors.border, backgroundColor: theme.colors.card }]}>
                <DrawerItem item={{ label: "Support and Information", icon: "settings-outline", route: "/settings" }} onPress={() => navigate("/settings")} />
              </View>
            </ScrollView>
          </SafeAreaView>
        </Animated.View>
        <Pressable accessibilityRole="button" accessibilityLabel="Close navigation menu" style={styles.backdrop} onPress={() => closeDrawer()} />
      </View>
    </Modal>
  </>;
}

function DrawerItem({ item, onPress }: { item: MenuItem; onPress: () => void }) {
  const theme = useAppTheme();
  return <Pressable onPress={onPress} accessibilityRole="button" style={[styles.menuItem, { borderBottomColor: theme.colors.border }]}><Ionicons name={item.icon} size={21} color={theme.colors.accent} /><Text style={[styles.menuLabel, { color: theme.colors.text }]}>{item.label}</Text><Ionicons name="chevron-forward" size={19} color={theme.colors.muted} /></Pressable>;
}

function DrawerGroup({ label, children }: { label: string; children: ReactNode }) {
  const theme = useAppTheme();
  return <View style={[styles.drawerGroup, { borderColor: theme.colors.border, backgroundColor: theme.colors.card }]}>
    <Text style={[styles.drawerGroupLabel, { color: theme.colors.text }]}>{label}</Text>
    <View style={[styles.drawerGroupBody, { borderTopColor: theme.colors.border }]}>{children}</View>
  </View>;
}

const styles = StyleSheet.create({
  header: { borderBottomWidth: StyleSheet.hairlineWidth, paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
  topRow: { minHeight: 56, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  brandImage: { height: 54, maxWidth: "58%" },
  iconButton: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  headerIconButton: {},
  headerBalance: { width: 42, height: 42 },
  searchSurface: { borderBottomWidth: StyleSheet.hairlineWidth, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  search: { minHeight: 42, borderRadius: radius.pill, borderWidth: 1, paddingHorizontal: spacing.md, gap: spacing.xs, flexDirection: "row", alignItems: "center" },
  searchLabel: { fontSize: 14, flex: 1 },
  modalRoot: { flex: 1, flexDirection: "row" },
  drawerShell: { width: "84%", maxWidth: 370, height: "100%" },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,.42)" },
  drawer: { flex: 1, paddingHorizontal: spacing.md },
  drawerHeading: { paddingTop: spacing.sm, paddingBottom: spacing.md, flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing.sm },
  drawerHeadingCopy: { flex: 1, minWidth: 0 },
  drawerBrandImage: { width: 72, height: 72, alignSelf: "flex-start" },
  drawerContent: { gap: spacing.sm, paddingBottom: spacing.xl },
  drawerGroup: { borderWidth: 1, borderRadius: radius.md, overflow: "hidden" },
  drawerGroupLabel: { minHeight: 48, paddingHorizontal: spacing.md, paddingTop: spacing.md, fontSize: 15, fontWeight: "900", letterSpacing: .2 },
  drawerGroupBody: { borderTopWidth: StyleSheet.hairlineWidth, paddingHorizontal: spacing.md, paddingBottom: spacing.xs },
  standaloneItem: { borderWidth: 1, borderRadius: radius.md, overflow: "hidden", paddingHorizontal: spacing.md },
  menu: { gap: 0 },
  menuItem: { minHeight: 55, flexDirection: "row", alignItems: "center", gap: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth },
  menuLabel: { flex: 1, fontWeight: "700", fontSize: 16 },
  themeChoices: { flexDirection: "row", gap: spacing.xs, paddingTop: spacing.sm },
  themeChoice: { flex: 1, minHeight: 48, borderWidth: 1, borderRadius: radius.md, alignItems: "center", justifyContent: "center", gap: 3 },
});
