import { ActivityIndicator, Image, StyleSheet, useWindowDimensions, View } from "react-native";
import { useAppTheme } from "@/src/theme/theme";

const launchIcon = require("@/assets/icon/starry-nights-icon.png");

/** Theme-aware bridge while the persisted theme and secure session are restored. */
export function LaunchScreen() {
  const theme = useAppTheme();
  const { width } = useWindowDimensions();
  const iconSize = Math.min(184, Math.max(132, Math.round(width * 0.42)));
  return <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
    <Image source={launchIcon} resizeMode="contain" style={{ width: iconSize, height: iconSize }} accessibilityLabel="Starry Nights" />
    <ActivityIndicator size="small" color={theme.colors.accent} accessibilityLabel="Loading Starry Nights" style={styles.loader} />
  </View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: "center", justifyContent: "center" },
  loader: { marginTop: 16 },
});
