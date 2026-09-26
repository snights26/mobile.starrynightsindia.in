import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { radius, spacing, useAppTheme } from "@/src/theme/theme";

export function AuthGate({ title = "Sign in to continue", message = "Your Starry Nights account keeps your personal travel details in one place." }: { title?: string; message?: string }) { const theme = useAppTheme(); return <View style={[styles.box, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}><Ionicons name="person-circle-outline" size={44} color={theme.colors.accent} /><Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text><Text style={[styles.message, { color: theme.colors.muted }]}>{message}</Text><Pressable onPress={() => router.push("/login")} style={[styles.button, { backgroundColor: theme.colors.accent }]}><Text style={styles.buttonText}>Continue with Google</Text></Pressable></View>; }
const styles = StyleSheet.create({ box: { margin: spacing.md, borderWidth: 1, borderRadius: radius.lg, padding: spacing.xl, alignItems: "center", gap: spacing.sm }, title: { fontSize: 20, fontWeight: "800" }, message: { textAlign: "center", lineHeight: 20 }, button: { borderRadius: radius.pill, paddingHorizontal: spacing.lg, paddingVertical: 12, marginTop: spacing.xs }, buttonText: { color: "#fff", fontWeight: "800" } });
