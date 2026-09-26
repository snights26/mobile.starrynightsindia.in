import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AppProviders } from "@/src/providers/AppProviders";

export default function RootLayout() {
  return <AppProviders><StatusBar style="auto" /><Stack screenOptions={{ headerBackTitle: "Back", headerShadowVisible: false, headerTitleStyle: { fontWeight: "700" } }}>
    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    <Stack.Screen name="package/[code]" options={{ title: "Package details" }} />
    <Stack.Screen name="category/[code]" options={{ title: "Packages" }} />
    <Stack.Screen name="search" options={{ title: "Search packages" }} />
    <Stack.Screen name="login" options={{ title: "Sign in", presentation: "modal" }} />
    <Stack.Screen name="profile-edit" options={{ title: "Your profile" }} />
    <Stack.Screen name="enquiry" options={{ title: "Plan your trip" }} />
    <Stack.Screen name="payments" options={{ title: "Payments" }} />
    <Stack.Screen name="trip/[tourId]" options={{ title: "Trip details" }} />
    <Stack.Screen name="invoice/[tourId]" options={{ title: "Invoice" }} />
    <Stack.Screen name="notifications" options={{ title: "Updates" }} />
    <Stack.Screen name="recently-viewed" options={{ title: "Recently viewed" }} />
    <Stack.Screen name="gallery" options={{ title: "Gallery" }} />
    <Stack.Screen name="my-photos" options={{ title: "My travel photos" }} />
    <Stack.Screen name="chatbot" options={{ title: "ATLAS" }} />
    <Stack.Screen name="contact" options={{ title: "Contact us" }} />
    <Stack.Screen name="about" options={{ title: "About Starry Nights" }} />
    <Stack.Screen name="settings" options={{ title: "Settings" }} />
  </Stack></AppProviders>;
}
