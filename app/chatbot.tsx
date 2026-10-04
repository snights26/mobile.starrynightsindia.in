import { useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import { Ionicons } from "@expo/vector-icons";
import { publicApi } from "@/src/api/services";
import { AppInput } from "@/src/components/Form";
import { PackageCard } from "@/src/components/PackageCard";
import { radius, spacing, useAppTheme } from "@/src/theme/theme";
import type { PackageSummary } from "@/src/types/api";

type Message = { id: string; sender: "user" | "atlas"; text?: string; packages?: PackageSummary[] };
const CHAT_KEY = "starry-nights.chat-session.v1";
const getSession = async () => { const current = await AsyncStorage.getItem(CHAT_KEY); if (current) return current; const next = `MOBILE-CHAT-${Crypto.randomUUID()}`; await AsyncStorage.setItem(CHAT_KEY, next); return next; };

export default function ChatbotScreen() {
  const theme = useAppTheme();
  const [sessionId, setSessionId] = useState("");
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<Message[]>([{ id: "welcome", sender: "atlas", text: "Hi, I’m ATLAS. Tell me where you would like to travel, your budget, duration, or travel style." }]);
  useEffect(() => { void getSession().then(setSessionId); }, []);
  const scrollToLatest = () => requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  const send = async () => {
    const value = input.trim();
    if (!value || sending || !sessionId) return;
    setMessages((current) => [...current, { id: `${Date.now()}-user`, sender: "user", text: value }]);
    setInput("");
    setSending(true);
    scrollToLatest();
    try {
      const response = await publicApi.chat(value, sessionId);
      if (response.sessionId && response.sessionId !== sessionId) { setSessionId(response.sessionId); void AsyncStorage.setItem(CHAT_KEY, response.sessionId); }
      setMessages((current) => [...current, { id: `${Date.now()}-atlas`, sender: "atlas", text: response.answer, packages: response.packages }]);
    } catch {
      setMessages((current) => [...current, { id: `${Date.now()}-error`, sender: "atlas", text: "I’m unable to reach the travel assistant right now. Please try again or contact Starry Nights directly." }]);
    } finally {
      setSending(false);
      setTimeout(scrollToLatest, 100);
    }
  };
  return <KeyboardAvoidingView style={[styles.page, { backgroundColor: theme.colors.background }]} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={0}>
    <SafeAreaView edges={["left", "right", "bottom"]} style={styles.safeArea}>
      <ScrollView ref={scrollRef} style={styles.messageList} contentContainerStyle={styles.messages} keyboardShouldPersistTaps="handled" keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"} onContentSizeChange={scrollToLatest}>
        <View style={[styles.identity, { backgroundColor: theme.colors.nav }]}><Text style={styles.identityName}>ATLAS</Text><Text style={styles.identityFullForm}>ADVANCE TRAVEL AND LOCATION ASSISTANCE SYSTEM</Text></View>
        {messages.map((message) => <View key={message.id} style={message.sender === "user" ? styles.userWrap : styles.atlasWrap}>{message.text ? <View style={[styles.bubble, message.sender === "user" ? { backgroundColor: theme.colors.accent } : { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}><Text style={{ color: message.sender === "user" ? "#fff" : theme.colors.text, lineHeight: 20 }}>{message.text}</Text></View> : null}{message.packages?.length ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.packages}>{message.packages.map((item) => <PackageCard item={item} key={item.packageCode || item.code} compact />)}</ScrollView> : null}</View>)}
        {sending ? <View style={styles.atlasWrap}><View style={[styles.bubble, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}><Text style={{ color: theme.colors.muted }}>ATLAS is thinking…</Text></View></View> : null}
      </ScrollView>
      <View style={[styles.inputBar, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}><AppInput value={input} onChangeText={setInput} onFocus={scrollToLatest} placeholder="Ask about trips…" multiline blurOnSubmit={false} textAlignVertical="top" style={styles.input} editable={!sending} accessibilityLabel="Message ATLAS" /><Pressable onPress={() => void send()} disabled={sending || !input.trim()} accessibilityRole="button" accessibilityLabel="Send message" style={[styles.send, { backgroundColor: theme.colors.accent, opacity: sending || !input.trim() ? .55 : 1 }]}><Ionicons name="send" color="#fff" size={20} /></Pressable></View>
    </SafeAreaView>
  </KeyboardAvoidingView>;
}
const styles = StyleSheet.create({ page: { flex: 1 }, safeArea: { flex: 1 }, messageList: { flex: 1 }, messages: { flexGrow: 1, padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.lg }, identity: { borderRadius: radius.lg, padding: spacing.lg, gap: spacing.xs }, identityName: { color: "#fff", fontSize: 24, fontWeight: "900", letterSpacing: 1.2 }, identityFullForm: { color: "#FCA5A5", fontSize: 11, lineHeight: 16, fontWeight: "800", letterSpacing: .45 }, userWrap: { alignItems: "flex-end", gap: spacing.xs }, atlasWrap: { alignItems: "flex-start", gap: spacing.xs }, bubble: { maxWidth: "86%", padding: spacing.md, borderRadius: radius.md, borderWidth: 1 }, packages: { gap: spacing.sm, paddingRight: spacing.md }, inputBar: { borderTopWidth: 1, padding: spacing.sm, flexDirection: "row", gap: spacing.xs, alignItems: "flex-end" }, input: { flex: 1, minHeight: 48, maxHeight: 120, paddingVertical: 12, lineHeight: 20 }, send: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", flexShrink: 0 } });
