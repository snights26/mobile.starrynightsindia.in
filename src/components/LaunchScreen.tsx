import { StyleSheet, View } from "react-native";
import { useAppTheme } from "@/src/theme/theme";

/** A deliberately blank, theme-aware bridge while the secure session is restored. */
export function LaunchScreen() {
  const theme = useAppTheme();
  return <View style={[styles.screen, { backgroundColor: theme.colors.background }]} />;
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
});
