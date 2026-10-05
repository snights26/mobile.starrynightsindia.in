import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState, Image, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { type PropsWithChildren, useCallback, useEffect, useRef, useState } from "react";
import { publicApi } from "@/src/api/services";
import { useAuth } from "@/src/auth/AuthProvider";
import { radius, shadows, spacing, useAppTheme } from "@/src/theme/theme";
import type { AppAnnouncement } from "@/src/types/api";

const appIcon = require("@/assets/icon/starry-nights-icon.png");
const seenStorageKey = "starry-nights.app-announcements.seen.v1";
const seenKey = (item: AppAnnouncement): string => `${item.id}:${item.version}`;

const readSeen = async (): Promise<Set<string>> => {
  try {
    const stored = await AsyncStorage.getItem(seenStorageKey);
    const values = stored ? JSON.parse(stored) : [];
    return new Set(Array.isArray(values) ? values.filter((value): value is string => typeof value === "string") : []);
  } catch { return new Set(); }
};

/** Server-published messages are independent from the account notifications feed. */
export function AppAnnouncementProvider({ children }: PropsWithChildren) {
  const theme = useAppTheme();
  const { isLoading } = useAuth();
  const [seen, setSeen] = useState<Set<string>>(new Set());
  const [seenReady, setSeenReady] = useState(false);
  const [announcements, setAnnouncements] = useState<AppAnnouncement[]>([]);
  const [visible, setVisible] = useState<AppAnnouncement | null>(null);
  const activeState = useRef(AppState.currentState);

  useEffect(() => { void readSeen().then((items) => { setSeen(items); setSeenReady(true); }); }, []);
  const refresh = useCallback(async () => {
    if (isLoading) return;
    try { setAnnouncements(await publicApi.appAnnouncements()); } catch { /* Announcements never block the app shell. */ }
  }, [isLoading]);
  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      const resumed = /inactive|background/.test(activeState.current) && nextState === "active";
      activeState.current = nextState;
      if (resumed) void refresh();
    });
    return () => subscription.remove();
  }, [refresh]);
  useEffect(() => {
    if (!seenReady || visible) return;
    setVisible(announcements.find((item) => !seen.has(seenKey(item))) ?? null);
  }, [announcements, seen, seenReady, visible]);

  const dismiss = useCallback((item: AppAnnouncement) => {
    setSeen((previous) => {
      const next = new Set(previous);
      next.add(seenKey(item));
      void AsyncStorage.setItem(seenStorageKey, JSON.stringify([...next])).catch(() => undefined);
      return next;
    });
    setVisible(null);
  }, []);
  const openLink = async (item: AppAnnouncement) => {
    dismiss(item);
    const link = item.link?.trim();
    if (!link) return;
    if (link.startsWith("/")) { router.push(link as never); return; }
    await Linking.openURL(link).catch(() => undefined);
  };

  return <>{children}<Modal transparent visible={Boolean(visible)} animationType="fade" onRequestClose={() => { if (visible) dismiss(visible); }} statusBarTranslucent>
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}><View style={styles.backdrop}><View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }, shadows.card]}>
      {visible ? <><Image source={appIcon} resizeMode="contain" style={styles.icon} accessibilityLabel="Starry Nights" /><Text style={[styles.title, { color: theme.colors.text }]}>{visible.title}</Text><ScrollView style={styles.messageScroll} contentContainerStyle={styles.messageContent} showsVerticalScrollIndicator><Text style={[styles.message, { color: theme.colors.muted }]}>{visible.message}</Text></ScrollView>{visible.link ? <Pressable accessibilityRole="button" onPress={() => void openLink(visible)} style={[styles.cta, { backgroundColor: theme.colors.accent }]}><Text style={styles.ctaText}>{visible.linkLabel || "Learn more"}</Text></Pressable> : null}<Pressable accessibilityRole="button" onPress={() => dismiss(visible)} style={[styles.close, { borderColor: theme.colors.border, backgroundColor: theme.colors.soft }]}><Text style={{ color: theme.colors.text, fontWeight: "800" }}>Close</Text></Pressable></> : null}
    </View></View></SafeAreaView>
  </Modal></>;
}

const styles = StyleSheet.create({
  safe: { flex: 1 }, backdrop: { flex: 1, justifyContent: "center", padding: spacing.lg, backgroundColor: "rgba(0,0,0,.56)" },
  card: { maxHeight: "82%", borderWidth: 1, borderRadius: radius.lg, padding: spacing.lg, alignItems: "center" }, icon: { width: 76, height: 76, marginBottom: spacing.sm },
  title: { textAlign: "center", fontSize: 21, fontWeight: "900" }, messageScroll: { alignSelf: "stretch", maxHeight: 250, marginTop: spacing.sm }, messageContent: { paddingVertical: spacing.xs },
  message: { textAlign: "center", lineHeight: 22, fontSize: 15 }, cta: { alignSelf: "stretch", minHeight: 48, marginTop: spacing.md, borderRadius: radius.pill, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.md },
  ctaText: { color: "#fff", fontWeight: "900" }, close: { alignSelf: "stretch", minHeight: 46, marginTop: spacing.sm, borderWidth: 1, borderRadius: radius.pill, alignItems: "center", justifyContent: "center" },
});
