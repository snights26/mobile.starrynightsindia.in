import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, createElement, PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";
import { useColorScheme } from "react-native";

const palette = {
  red: "#E50914", redDark: "#B20710", redSoft: "#FCE7E8", gold: "#D97706",
  white: "#FFFFFF", slate50: "#F8FAFC", slate100: "#F1F5F9", slate200: "#E2E8F0",
  slate500: "#64748B", slate700: "#334155", slate900: "#0F172A", black: "#050505",
  green: "#16A34A", amber: "#D97706", blue: "#0284C7",
};

export const lightTheme = {
  dark: false, colors: { background: palette.slate50, surface: palette.white, card: palette.white, soft: palette.slate100, text: palette.slate900, muted: palette.slate500, border: palette.slate200, accent: palette.red, accentStrong: palette.redDark, accentSoft: palette.redSoft, success: palette.green, warning: palette.amber, info: palette.blue, nav: "#0A0A0A" },
};
export const darkTheme = {
  dark: true, colors: { background: palette.black, surface: "#111111", card: "#181818", soft: "#222222", text: "#F8FAFC", muted: "#A3A3A3", border: "rgba(255,255,255,0.14)", accent: palette.red, accentStrong: "#FF2D2D", accentSoft: "rgba(229,9,20,0.18)", success: "#22C55E", warning: "#F59E0B", info: "#38BDF8", nav: "#0A0A0A" },
};
export type AppTheme = typeof lightTheme;
export type ThemePreference = "light" | "dark" | "system";
const THEME_PREFERENCE_KEY = "starry-nights.theme-preference.v1";
type ThemeContextValue = { preference: ThemePreference; setPreference: (preference: ThemePreference) => void; theme: AppTheme; isReady: boolean };
const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  const systemScheme = useColorScheme();
  const [preference, setStoredPreference] = useState<ThemePreference>("system");
  const [isReady, setReady] = useState(false);
  useEffect(() => {
    let active = true;
    void AsyncStorage.getItem(THEME_PREFERENCE_KEY).then((saved) => {
      if (!active) return;
      if (saved === "light" || saved === "dark" || saved === "system") setStoredPreference(saved);
      setReady(true);
    }).catch(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, []);
  const setPreference = (next: ThemePreference) => {
    setStoredPreference(next);
    void AsyncStorage.setItem(THEME_PREFERENCE_KEY, next).catch(() => undefined);
  };
  const theme = preference === "system" ? (systemScheme === "dark" ? darkTheme : lightTheme) : preference === "dark" ? darkTheme : lightTheme;
  const value = useMemo(() => ({ preference, setPreference, theme, isReady }), [preference, theme, isReady]);
  return createElement(ThemeContext.Provider, { value }, children);
}
export const spacing = { xxs: 4, xs: 8, sm: 12, md: 16, lg: 20, xl: 24, xxl: 32, xxxl: 40 };
export const radius = { sm: 10, md: 14, lg: 20, pill: 999 };
export const shadows = { card: { shadowColor: "#0F172A", shadowOpacity: 0.1, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 3 } };
export const useAppTheme = (): AppTheme => {
  const context = useContext(ThemeContext);
  const systemScheme = useColorScheme();
  return context?.theme ?? (systemScheme === "dark" ? darkTheme : lightTheme);
};
export const useThemePreference = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useThemePreference must be used inside ThemeProvider.");
  return context;
};
