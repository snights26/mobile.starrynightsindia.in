import { useEffect, useState } from "react";
import { Image, Platform, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { GOOGLE_AUTH_ENABLED, GOOGLE_CLIENT_IDS } from "@/src/constants/config";
// Expo Metro selects the matching .android/.ios/.web implementation at bundle time.
// eslint-disable-next-line import/no-unresolved
import { GoogleSignInButton } from "@/src/auth/GoogleSignInButton";
import { useAuth } from "@/src/auth/AuthProvider";
import { Screen } from "@/src/components/Screen";
import { radius, spacing, useAppTheme } from "@/src/theme/theme";

export default function LoginScreen() {
  const theme = useAppTheme();
  const { isAuthenticated } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated) router.back();
  }, [isAuthenticated]);

  const platformClientConfigured = Platform.OS === "android"
    ? Boolean(GOOGLE_CLIENT_IDS.webClientId && GOOGLE_CLIENT_IDS.androidClientId)
    : Platform.OS === "ios"
      ? Boolean(GOOGLE_CLIENT_IDS.iosClientId)
      : Boolean(GOOGLE_CLIENT_IDS.webClientId);
  const configured = GOOGLE_AUTH_ENABLED && platformClientConfigured;
  const missingClientLabel = Platform.OS === "android" ? "Android and Web" : Platform.OS === "ios" ? "iOS" : "Web";

  return <Screen><View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}><Image source={require("../assets/starry-nights-holidays.png")} style={styles.logo} resizeMode="contain" accessibilityLabel="Starry Nights Holidays" /><Text style={[styles.title, { color: theme.colors.text }]}>Welcome to Starry Nights</Text><Text style={[styles.copy, { color: theme.colors.muted }]}>Use your Google account to securely access saved journeys, travel details and payments.</Text>{configured ? <GoogleSignInButton onError={setError} /> : <View style={[styles.config, { backgroundColor: theme.colors.accentSoft }]}><Text style={[styles.configTitle, { color: theme.colors.text }]}>Google sign-in needs configuration</Text><Text style={{ color: theme.colors.muted, lineHeight: 20 }}>Enable Google sign-in and set the public {missingClientLabel} OAuth client ID for this build. Configure the same audience in the existing Node API. No account or token is simulated by this app.</Text></View>}{error ? <Text accessibilityRole="alert" style={[styles.error, { color: theme.colors.accentStrong }]}>{error}</Text> : null}<Text style={[styles.footnote, { color: theme.colors.muted }]}>Your Google identity is verified by the Starry Nights API. The app stores only the issued session securely on your device.</Text></View></Screen>;
}

const styles = StyleSheet.create({ card: { marginTop: spacing.xxl, borderWidth: 1, borderRadius: radius.lg, padding: spacing.xl, gap: spacing.md, alignItems: "center" }, logo: { width: 116, height: 116 }, title: { fontSize: 26, fontWeight: "800", textAlign: "center" }, copy: { textAlign: "center", lineHeight: 21 }, config: { gap: spacing.xs, padding: spacing.md, borderRadius: radius.md, width: "100%" }, configTitle: { fontWeight: "800", fontSize: 16 }, error: { textAlign: "center", fontWeight: "600" }, footnote: { fontSize: 12, lineHeight: 17, textAlign: "center", marginTop: spacing.sm } });
