import { Image, StyleSheet, View } from "react-native";

const launchAnimation = require("@/assets/launch/starry-nights-launch.gif");

/** White JS launch layer shown while the secure session is restored. */
export function LaunchScreen() {
  return <View style={styles.screen} accessibilityLabel="Loading Starry Nights">
    <Image source={launchAnimation} resizeMode="contain" style={styles.animation} accessibilityLabel="Starry Nights Tours and Treks" />
  </View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  animation: { width: "72%", aspectRatio: 1, maxWidth: 330, maxHeight: 330 },
});
