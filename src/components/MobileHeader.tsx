import { Animated, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useAuth } from "@/src/auth/AuthProvider";
import { radius, spacing, type ThemePreference, useAppTheme, useThemePreference } from "@/src/theme/theme";

type MenuItem = { label: string; icon: keyof typeof Ionicons.glyphMap; route: string };
type DrawerSection = "account" | "explore" | "appearance";

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
  { label: "Settings & Support", icon: "settings-outline", route: "/settings" },
];

const themeChoices: { value: ThemePreference; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: "light", label: "Light", icon: "sunny-outline" },
  { value: "dark", label: "Dark", icon: "moon-outline" },
  { value: "system", label: "System", icon: "phone-portrait-outline" },
];

/** Persistent tab header: it owns the status-bar inset and keeps search/actions reachable while a tab scrolls. */
export function MobileHeader() {
  const theme = useAppTheme();
  const { preference, setPreference } = useThemePreference();
  const { isAuthenticated, user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const [menuVisible, setMenuVisible] = useState(false);
  const [openSection, setOpenSection] = useState<DrawerSection | null>("account");
  const drawerProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!menuVisible) return;
    drawerProgress.setValue(0);
    setOpenSection("account");
    Animated.timing(drawerProgress, { toValue: 1, duration: 220, useNativeDriver: true }).start();
  }, [drawerProgress, menuVisible]);

  const closeDrawer = () => {
    Animated.timing(drawerProgress, { toValue: 0, duration: 180, useNativeDriver: true }).start(({ finished }) => {
      if (finished) setMenuVisible(false);
    });
  };
  const navigate = (route: string) => { closeDrawer(); router.push(route as never); };
  const toggleSection = (section: DrawerSection) => setOpenSection((current) => current === section ? null : section);
  const drawerTranslateX = drawerProgress.interpolate({ inputRange: [0, 1], outputRange: [-420, 0] });

  return <>
    <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border, paddingTop: insets.top }]}>
      <View style={styles.topRow}>
        <Pressable onPress={() => setMenuVisible(true)} accessibilityRole="button" accessibilityLabel="Open navigation menu" style={[styles.iconButton, { backgroundColor: theme.colors.soft }]}>
          <Ionicons name="menu" size={23} color={theme.colors.text} />
        </Pressable>
        <Text numberOfLines={1} style={styles.brand}>STARRY NIGHTS</Text>
        <View style={styles.headerBalance} />
      </View>
      <Pressable onPress={() => router.push("/search")} accessibilityRole="button" accessibilityLabel="Search packages" style={[styles.search, { backgroundColor: theme.colors.soft, borderColor: theme.colors.border }]}>
        <Ionicons name="search" size={19} color={theme.colors.muted} />
        <Text numberOfLines={1} style={[styles.searchLabel, { color: theme.colors.muted }]}>Search destinations and journeys</Text>
      </Pressable>
    </View>
    <Modal visible={menuVisible} transparent animationType="none" onRequestClose={closeDrawer} statusBarTranslucent>
      <View style={styles.modalRoot}>
        <Animated.View style={[styles.drawerShell, { transform: [{ translateX: drawerTranslateX }] }]}>
          <SafeAreaView edges={["top", "bottom"]} style={[styles.drawer, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.drawerHeading}>
              <View style={styles.drawerHeadingCopy}><Text style={styles.drawerBrand}>STARRY NIGHTS</Text><Text numberOfLines={1} style={{ color: theme.colors.muted }}>{isAuthenticated ? `Welcome, ${user?.name || "traveller"}` : "Start exploring"}</Text></View>
              <Pressable onPress={closeDrawer} accessibilityRole="button" accessibilityLabel="Close navigation menu" style={[styles.iconButton, { backgroundColor: theme.colors.soft }]}><Ionicons name="close" size={22} color={theme.colors.text} /></Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.drawerContent} showsVerticalScrollIndicator={false}>
              <DrawerAccordion label="Your Account" open={openSection === "account"} onPress={() => toggleSection("account")}>
                {isAuthenticated ? <><View style={styles.menu}>{accountItems.map((item) => <DrawerItem key={item.route} item={item} onPress={() => navigate(item.route)} />)}</View><Pressable onPress={() => { closeDrawer(); void logout(); }} accessibilityRole="button" style={[styles.logout, { borderColor: theme.colors.accent }]}><Ionicons name="log-out-outline" size={20} color={theme.colors.accent} /><Text style={{ color: theme.colors.accent, fontWeight: "800" }}>Logout</Text></Pressable></> : <Pressable onPress={() => navigate("/login")} accessibilityRole="button" style={[styles.login, { backgroundColor: theme.colors.accent }]}><Ionicons name="log-in-outline" size={20} color="#fff" /><Text style={styles.loginText}>Login</Text></Pressable>}
              </DrawerAccordion>
              <DrawerAccordion label="Explore" open={openSection === "explore"} onPress={() => toggleSection("explore")}>
                <View style={styles.menu}>{generalItems.map((item) => <DrawerItem key={item.route} item={item} onPress={() => navigate(item.route)} />)}</View>
              </DrawerAccordion>
              <DrawerAccordion label="Appearance" open={openSection === "appearance"} onPress={() => toggleSection("appearance")}>
                <View style={styles.themeChoices}>{themeChoices.map((choice) => {
                  const selected = preference === choice.value;
                  return <Pressable key={choice.value} onPress={() => setPreference(choice.value)} accessibilityRole="radio" accessibilityState={{ selected }} style={[styles.themeChoice, { borderColor: selected ? theme.colors.accent : theme.colors.border, backgroundColor: selected ? theme.colors.accentSoft : theme.colors.soft }]}><Ionicons name={choice.icon} size={17} color={selected ? theme.colors.accentStrong : theme.colors.muted} /><Text style={{ color: selected ? theme.colors.accentStrong : theme.colors.text, fontSize: 12, fontWeight: "800" }}>{choice.label}</Text></Pressable>;
                })}</View>
              </DrawerAccordion>
            </ScrollView>
          </SafeAreaView>
        </Animated.View>
        <Pressable accessibilityRole="button" accessibilityLabel="Close navigation menu" style={styles.backdrop} onPress={closeDrawer} />
      </View>
    </Modal>
  </>;
}

function DrawerItem({ item, onPress }: { item: MenuItem; onPress: () => void }) {
  const theme = useAppTheme();
  return <Pressable onPress={onPress} accessibilityRole="button" style={[styles.menuItem, { borderBottomColor: theme.colors.border }]}><Ionicons name={item.icon} size={21} color={theme.colors.accent} /><Text style={[styles.menuLabel, { color: theme.colors.text }]}>{item.label}</Text><Ionicons name="chevron-forward" size={19} color={theme.colors.muted} /></Pressable>;
}

function DrawerAccordion({ label, open, onPress, children }: { label: string; open: boolean; onPress: () => void; children: ReactNode }) {
  const theme = useAppTheme();
  return <View style={[styles.accordion, { borderColor: theme.colors.border, backgroundColor: theme.colors.card }]}>
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ expanded: open }} style={styles.accordionHeader}>
      <Text style={[styles.accordionLabel, { color: theme.colors.text }]}>{label}</Text>
      <Ionicons name={open ? "chevron-up" : "chevron-down"} size={20} color={theme.colors.muted} />
    </Pressable>
    {open ? <View style={[styles.accordionBody, { borderTopColor: theme.colors.border }]}>{children}</View> : null}
  </View>;
}

const styles = StyleSheet.create({
  header: { borderBottomWidth: StyleSheet.hairlineWidth, paddingHorizontal: spacing.md, paddingBottom: spacing.sm, gap: spacing.sm },
  topRow: { minHeight: 48, flexDirection: "row", alignItems: "center", gap: spacing.sm },
  brand: { flex: 1, color: "#E50914", textAlign: "center", fontWeight: "900", fontSize: 16, letterSpacing: 1.15 },
  iconButton: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  headerBalance: { width: 42, height: 42 },
  search: { minHeight: 42, borderRadius: radius.pill, borderWidth: 1, paddingHorizontal: spacing.md, gap: spacing.xs, flexDirection: "row", alignItems: "center" },
  searchLabel: { fontSize: 14, flex: 1 },
  modalRoot: { flex: 1, flexDirection: "row" },
  drawerShell: { width: "84%", maxWidth: 370, height: "100%" },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,.42)" },
  drawer: { flex: 1, paddingHorizontal: spacing.md },
  drawerHeading: { paddingTop: spacing.sm, paddingBottom: spacing.md, flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing.sm },
  drawerHeadingCopy: { flex: 1, minWidth: 0 },
  drawerBrand: { color: "#E50914", fontWeight: "900", letterSpacing: 1.1, fontSize: 17 },
  drawerContent: { gap: spacing.sm, paddingBottom: spacing.xl },
  accordion: { borderWidth: 1, borderRadius: radius.md, overflow: "hidden" },
  accordionHeader: { minHeight: 52, paddingHorizontal: spacing.md, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  accordionLabel: { fontSize: 15, fontWeight: "900", letterSpacing: .2 },
  accordionBody: { borderTopWidth: StyleSheet.hairlineWidth, paddingHorizontal: spacing.md, paddingBottom: spacing.xs },
  menu: { gap: 0 },
  menuItem: { minHeight: 55, flexDirection: "row", alignItems: "center", gap: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth },
  menuLabel: { flex: 1, fontWeight: "700", fontSize: 16 },
  themeChoices: { flexDirection: "row", gap: spacing.xs, paddingTop: spacing.sm },
  themeChoice: { flex: 1, minHeight: 48, borderWidth: 1, borderRadius: radius.md, alignItems: "center", justifyContent: "center", gap: 3 },
  login: { minHeight: 50, borderRadius: radius.pill, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: spacing.xs, marginTop: spacing.md },
  loginText: { color: "#fff", fontWeight: "900", fontSize: 16 },
  logout: { minHeight: 48, borderWidth: 1, borderRadius: radius.pill, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.xs, marginTop: spacing.md },
});
