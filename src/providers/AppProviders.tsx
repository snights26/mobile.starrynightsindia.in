import { PropsWithChildren, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "@/src/auth/AuthProvider";
import { ThemeProvider } from "@/src/theme/theme";

export function AppProviders({ children }: PropsWithChildren) {
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 60_000, retry: 1, refetchOnReconnect: true }, mutations: { retry: 0 } } }));
  return <SafeAreaProvider><ThemeProvider><QueryClientProvider client={queryClient}><AuthProvider>{children}</AuthProvider></QueryClientProvider></ThemeProvider></SafeAreaProvider>;
}
