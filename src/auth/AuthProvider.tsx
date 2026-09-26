import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { configureInvalidSessionHandler, post } from "@/src/api/client";
import { customerApi } from "@/src/api/services";
import { clearSession, readSession, saveSession, type StoredSession } from "@/src/auth/secureSession";
import type { AuthTokens, PackageSummary, User } from "@/src/types/api";

type AuthContextValue = {
  user: User | null; isAuthenticated: boolean; isLoading: boolean; needsLogin: boolean;
  loginWithGoogle: (idToken: string) => Promise<User>; refreshSession: () => Promise<boolean>; logout: () => Promise<void>;
  reloadUser: () => Promise<User | null>; toggleBucket: (item: PackageSummary) => Promise<PackageSummary[]>; likedCodes: Set<string>;
};
const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const refreshLeadMs = 60_000;

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [liked, setLiked] = useState<PackageSummary[]>([]);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const bootstrapDone = useRef(false);

  const stopTimer = () => { if (refreshTimer.current) clearTimeout(refreshTimer.current); refreshTimer.current = undefined; };
  const applySession = useCallback(async (tokens: AuthTokens): Promise<StoredSession> => {
    const session = await saveSession(tokens); setUser(tokens.user); setNeedsLogin(false);
    stopTimer();
    const delay = Math.max(0, Math.min(session.refreshExpiry - Date.now(), session.accessExpiry - Date.now() - refreshLeadMs));
    refreshTimer.current = setTimeout(() => { void refreshSession(); }, delay);
    return session;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const endSession = useCallback(async (expired = false) => {
    stopTimer(); await clearSession(); setUser(null); setLiked([]); if (expired) setNeedsLogin(true);
  }, []);

  const refreshSession = useCallback(async (): Promise<boolean> => {
    const session = await readSession();
    if (!session?.refreshToken || session.refreshExpiry <= Date.now()) { await endSession(true); return false; }
    try {
      const tokens = await post<AuthTokens>("/auth/refresh", { refreshToken: session.refreshToken }, { skipAuthRefresh: true } as never);
      await applySession(tokens); return true;
    } catch { await endSession(true); return false; }
  }, [applySession, endSession]);

  const reloadUser = useCallback(async (): Promise<User | null> => {
    try { const next = await customerApi.me(); setUser(next); return next; } catch { return null; }
  }, []);

  const loadBucket = useCallback(async () => {
    try { setLiked(await customerApi.bucket()); } catch { setLiked([]); }
  }, []);

  useEffect(() => {
    configureInvalidSessionHandler(() => { void endSession(true); });
    return () => configureInvalidSessionHandler();
  }, [endSession]);

  useEffect(() => {
    void (async () => {
      const stored = await readSession();
      if (!stored) { setIsLoading(false); bootstrapDone.current = true; return; }
      if (stored.refreshExpiry <= Date.now()) { await endSession(true); setIsLoading(false); bootstrapDone.current = true; return; }
      if (stored.accessExpiry <= Date.now()) { await refreshSession(); }
      else { setUser(stored.user); await reloadUser(); stopTimer(); refreshTimer.current = setTimeout(() => { void refreshSession(); }, Math.max(0, stored.accessExpiry - Date.now() - refreshLeadMs)); }
      setIsLoading(false); bootstrapDone.current = true;
    })();
    return stopTimer;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { if (user?.id && bootstrapDone.current) void loadBucket(); }, [loadBucket, user?.id]);

  const loginWithGoogle = useCallback(async (idToken: string) => {
    const tokens = await post<AuthTokens>("/auth/google", { idToken }, { skipAuthRefresh: true } as never);
    await applySession(tokens); await loadBucket(); return tokens.user;
  }, [applySession, loadBucket]);

  const logout = useCallback(async () => {
    const session = await readSession();
    await endSession();
    if (session?.refreshToken) { void post<void>("/auth/logout", { refreshToken: session.refreshToken }, { skipAuthRefresh: true } as never).catch(() => undefined); }
  }, [endSession]);

  const toggleBucket = useCallback(async (item: PackageSummary) => {
    if (!user) throw new Error("Please sign in to save packages.");
    const code = item.packageCode || item.code;
    const before = liked;
    const exists = before.some((current) => (current.packageCode || current.code).toUpperCase() === code.toUpperCase());
    setLiked(exists ? before.filter((current) => (current.packageCode || current.code).toUpperCase() !== code.toUpperCase()) : [...before, item]);
    try { const next = await customerApi.toggleBucket(code); setLiked(next); return next; } catch (error) { setLiked(before); throw error; }
  }, [liked, user]);

  const value = useMemo<AuthContextValue>(() => ({ user, isAuthenticated: Boolean(user), isLoading, needsLogin, loginWithGoogle, refreshSession, logout, reloadUser, toggleBucket, likedCodes: new Set(liked.map((item) => (item.packageCode || item.code).toUpperCase())) }), [user, isLoading, needsLogin, loginWithGoogle, refreshSession, logout, reloadUser, toggleBucket, liked]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext); if (!context) throw new Error("useAuth must be used inside AuthProvider"); return context;
};
