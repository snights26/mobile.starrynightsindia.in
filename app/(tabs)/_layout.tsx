import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/src/theme/theme";

export default function TabsLayout() {
  const theme = useAppTheme();
  return <Tabs screenOptions={({ route }) => ({ headerShown: false, tabBarActiveTintColor: theme.colors.accent, tabBarInactiveTintColor: theme.colors.muted, tabBarStyle: { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }, tabBarIcon: ({ color, size }) => {
    const icons: Record<string, keyof typeof Ionicons.glyphMap> = { index: "home-outline", trending: "flame-outline", explore: "compass-outline", bucket: "heart-outline", trips: "airplane-outline", profile: "person-outline" };
    return <Ionicons name={icons[route.name]} color={color} size={size} />;
  } })}>
    <Tabs.Screen name="index" options={{ title: "Home" }} />
    <Tabs.Screen name="trending" options={{ title: "Trending" }} />
    <Tabs.Screen name="explore" options={{ href: null }} />
    <Tabs.Screen name="bucket" options={{ title: "Bucket" }} />
    <Tabs.Screen name="trips" options={{ href: null }} />
    <Tabs.Screen name="profile" options={{ title: "Profile" }} />
  </Tabs>;
}
