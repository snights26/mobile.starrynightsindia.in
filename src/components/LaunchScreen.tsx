import { ActivityIndicator, Image, StyleSheet, View } from "react-native";
import { useAppTheme } from "@/src/theme/theme";

const launchImage = require("@/assets/launch/launcher.png");

/** Theme-aware JS launch layer shown while the secure session is restored. */
export function LaunchScreen() {
  const theme = useAppTheme();
  return <View style={[styles.screen, { backgroundColor: theme.colors.background }]} accessibilityLabel="Loading Starry Nights">
    <Image source={launchImage} resizeMode="contain" style={styles.image} accessibilityLabel="Starry Nights travellers" />
    <ActivityIndicator size="small" color="#E50914" style={styles.loader} />
  </View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  image: { width: "74%", maxWidth: 280, aspectRatio: 1 },
  loader: { marginTop: 10 },
});
