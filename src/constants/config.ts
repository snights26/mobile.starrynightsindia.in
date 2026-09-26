const apiBaseUrl = (process.env.EXPO_PUBLIC_API_BASE_URL ?? "").trim().replace(/\/+$/, "");
const developmentRuntime = typeof __DEV__ !== "undefined" && __DEV__;
export const API_BASE_URL = apiBaseUrl;
export const WEB_BASE_URL = (process.env.EXPO_PUBLIC_WEB_BASE_URL ?? "").trim().replace(/\/+$/, "");
export const GOOGLE_AUTH_ENABLED = process.env.EXPO_PUBLIC_GOOGLE_AUTH_ENABLED === "true";
export const GOOGLE_CLIENT_IDS = {
  expoClientId: process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID,
  androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
};

export const requireApiBaseUrl = (): string => {
  if (!API_BASE_URL) throw new Error("The app is missing EXPO_PUBLIC_API_BASE_URL. Copy .env.example to .env and configure the API URL.");
  let parsed: URL;
  try { parsed = new URL(API_BASE_URL); } catch { throw new Error("EXPO_PUBLIC_API_BASE_URL must be an absolute API URL ending in /api."); }
  if (!/^https?:$/.test(parsed.protocol) || parsed.username || parsed.password || !parsed.pathname.replace(/\/+$/, "").endsWith("/api")) {
    throw new Error("EXPO_PUBLIC_API_BASE_URL must be an absolute HTTP(S) URL ending in /api.");
  }
  if (!developmentRuntime && parsed.protocol !== "https:") {
    throw new Error("Release builds require an HTTPS EXPO_PUBLIC_API_BASE_URL.");
  }
  return API_BASE_URL;
};
