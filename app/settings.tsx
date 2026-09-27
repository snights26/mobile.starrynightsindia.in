import { Alert, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { WEB_BASE_URL } from "@/src/constants/config";
import { Screen } from "@/src/components/Screen";
import { Accordion } from "@/src/components/Section";
import { radius, spacing, useAppTheme, useThemePreference, type ThemePreference } from "@/src/theme/theme";

const terms = ["Any changes in applicable tax structure as per Government notifications will be levied accordingly.", "Hotel check-in/check-out as per hotel policy.", "Base category room if not selected.", "Meals timings must be followed.", "Natural calamities expenses borne by client.", "Valid ID proof mandatory.", "Extra bed means extra mattress."];
const cancellation = ["30+ days: Advance non-refundable.", "30–15 days: 50% of total cost.", "14–7 days: 75% of total cost.", "7–1 days: 100% of total cost.", "No refund for No Shows."];
const openPolicy = async (path: string) => { const url = WEB_BASE_URL ? `${WEB_BASE_URL}${path}` : ""; if (!url || !(await Linking.canOpenURL(url))) { Alert.alert("Policy link unavailable", "Configure EXPO_PUBLIC_WEB_BASE_URL to open the current policy page."); return; } await Linking.openURL(url); };
export default function SettingsScreen() {
  const theme = useAppTheme();
  const { preference, setPreference } = useThemePreference();
  const choices: { value: ThemePreference; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { value: "light", label: "Light", icon: "sunny-outline" },
    { value: "dark", label: "Dark", icon: "moon-outline" },
    { value: "system", label: "System", icon: "phone-portrait-outline" },
  ];
  return <Screen>
    <View style={[styles.box, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Appearance</Text>
      <Text style={[styles.copy, { color: theme.colors.muted }]}>Choose a theme. Your choice applies immediately and stays on this device.</Text>
      <View style={styles.themeChoices}>{choices.map((choice) => {
        const selected = preference === choice.value;
        return <Pressable key={choice.value} onPress={() => setPreference(choice.value)} accessibilityRole="radio" accessibilityState={{ selected }} style={[styles.themeChoice, { borderColor: selected ? theme.colors.accent : theme.colors.border, backgroundColor: selected ? theme.colors.accentSoft : theme.colors.soft }]}>
          <Ionicons name={choice.icon} size={18} color={selected ? theme.colors.accentStrong : theme.colors.muted} /><Text style={{ color: selected ? theme.colors.accentStrong : theme.colors.text, fontWeight: "800" }}>{choice.label}</Text>
        </Pressable>;
      })}</View>
    </View>
    <View style={[styles.box, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}><Text style={[styles.title, { color: theme.colors.text }]}>Support & information</Text><Pressable onPress={() => router.push("/chatbot")} style={styles.row}><Ionicons name="sparkles-outline" size={21} color={theme.colors.accent} /><Text style={[styles.rowText, { color: theme.colors.text }]}>Chat with ATLAS</Text><Ionicons name="chevron-forward" size={18} color={theme.colors.muted} /></Pressable><Pressable onPress={() => router.push("/contact")} style={styles.row}><Ionicons name="help-circle-outline" size={21} color={theme.colors.accent} /><Text style={[styles.rowText, { color: theme.colors.text }]}>Contact Starry Nights</Text><Ionicons name="chevron-forward" size={18} color={theme.colors.muted} /></Pressable><Pressable onPress={() => router.push("/about")} style={styles.row}><Ionicons name="information-circle-outline" size={21} color={theme.colors.accent} /><Text style={[styles.rowText, { color: theme.colors.text }]}>About Starry Nights</Text><Ionicons name="chevron-forward" size={18} color={theme.colors.muted} /></Pressable></View><Accordion title="Terms & conditions" initiallyOpen>{terms.map((item) => <Text key={item} style={[styles.bullet, { color: theme.colors.muted }]}>• {item}</Text>)}<Pressable onPress={() => void openPolicy("/terms-and-conditions")}><Text style={[styles.open, { color: theme.colors.accent }]}>Open current terms on the website</Text></Pressable></Accordion><Accordion title="Cancellation & refund policy">{cancellation.map((item) => <Text key={item} style={[styles.bullet, { color: theme.colors.muted }]}>• {item}</Text>)}<Pressable onPress={() => void openPolicy("/cancellation-refund-policy")}><Text style={[styles.open, { color: theme.colors.accent }]}>Open current policy on the website</Text></Pressable></Accordion><Accordion title="Privacy, payment & service delivery"><Text style={[styles.bullet, { color: theme.colors.muted }]}>The existing public site keeps the full current text of these policies. Open the appropriate page to review the authoritative version.</Text><View style={styles.policyLinks}><Pressable onPress={() => void openPolicy("/privacy-policy")}><Text style={[styles.open, { color: theme.colors.accent }]}>Privacy</Text></Pressable><Pressable onPress={() => void openPolicy("/payment-policy")}><Text style={[styles.open, { color: theme.colors.accent }]}>Payment</Text></Pressable><Pressable onPress={() => void openPolicy("/service-delivery-policy")}><Text style={[styles.open, { color: theme.colors.accent }]}>Service delivery</Text></Pressable></View></Accordion></Screen>;
}
const styles = StyleSheet.create({ box: { borderWidth: 1, borderRadius: radius.lg, overflow: "hidden", paddingBottom: spacing.md }, title: { padding: spacing.md, fontSize: 20, fontWeight: "800" }, copy: { paddingHorizontal: spacing.md, lineHeight: 20 }, themeChoices: { flexDirection: "row", gap: spacing.xs, paddingHorizontal: spacing.md, marginTop: spacing.md }, themeChoice: { flex: 1, minHeight: 44, borderWidth: 1, borderRadius: radius.md, alignItems: "center", justifyContent: "center", gap: 4, flexDirection: "row" }, row: { minHeight: 58, paddingHorizontal: spacing.md, flexDirection: "row", alignItems: "center", gap: spacing.sm, borderTopColor: "#CBD5E1", borderTopWidth: StyleSheet.hairlineWidth }, rowText: { flex: 1, fontSize: 16, fontWeight: "600" }, bullet: { fontSize: 15, lineHeight: 23, marginBottom: 5 }, open: { fontWeight: "800", marginTop: spacing.sm }, policyLinks: { flexDirection: "row", gap: spacing.md, flexWrap: "wrap" } });
