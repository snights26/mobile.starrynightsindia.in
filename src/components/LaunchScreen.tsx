import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useAppTheme } from "@/src/theme/theme";

/** A minimal, theme-aware bridge while the persisted theme and secure session are restored. */
export function LaunchScreen() {
  const theme = useAppTheme();
  return <View style={[styles.screen, { backgroundColor: theme.colors.background }]}><ActivityIndicator size="small" color={theme.colors.accent} accessibilityLabel="Loading Starry Nights" /></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: "center", justifyContent: "center" },
});
