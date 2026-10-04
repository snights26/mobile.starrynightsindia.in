import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { configureInvalidSessionHandler, post } from "@/src/api/client";
import { customerApi } from "@/src/api/services";
import { clearSession, readSession, saveSession, type StoredSession } from "@/src/auth/secureSession";
import type { AuthTokens, PackageSummary, User } from "@/src/types/api";

type AuthContextValue = {
  user: User | null; isAuthenticated: boolean; isLoading: boolean; needsLogin: boolean;
  loginWithGoogle: (idToken: string) => Promise<User>; refreshSession: () => Promise<boolean>; logout: () => Promise<void>;
  reloadUser: () => Promise<User | null>; toggleBucket: (item: PackageSummary) => Promise<PackageSummary[]>; likedCodes: Set<string>;
  bucketItems: PackageSummary[]; bucketLoading: boolean; bucketError: string | null; reloadBucket: (options?: { force?: boolean }) => Promise<void>;
};
const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const refreshLeadMs = 60_000;
const bucketStaleMs = 60_000;

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [liked, setLiked] = useState<PackageSummary[]>([]);
  const [bucketLoading, setBucketLoading] = useState(false);
  const [bucketStatus, setBucketStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [bucketError, setBucketError] = useState<string | null>(null);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const bucketOwner = useRef<string | null>(null);
  const bucketAutoLoadedFor = useRef<string | null>(null);
  const bucketFetchedAt = useRef(0);
  const bucketRequestId = useRef(0);
  const bucketInFlight = useRef<Promise<void> | null>(null);

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
    stopTimer(); await clearSession();
    bucketRequestId.current += 1;
    bucketInFlight.current = null;
    bucketOwner.current = null;
    bucketAutoLoadedFor.current = null;
    bucketFetchedAt.current = 0;
    setUser(null); setLiked([]); setBucketLoading(false); setBucketStatus("idle"); setBucketError(null);
    if (expired) setNeedsLogin(true);
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

  /**
   * The authenticated bucket has one owner: this provider.  Profile, View All,
   * and package-card mutations all read the same snapshot so an unfinished
   * initial request cannot be mistaken for an empty list.
   */
  const reloadBucket = useCallback(async ({ force = false }: { force?: boolean } = {}): Promise<void> => {
    const ownerId = user?.id;
    if (!ownerId) return;
    if (bucketOwner.current !== ownerId) {
      bucketRequestId.current += 1;
      bucketInFlight.current = null;
      bucketOwner.current = ownerId;
      bucketFetchedAt.current = 0;
      setLiked([]);
      setBucketStatus("idle");
      setBucketError(null);
    }
    if (!force && bucketStatus === "ready" && Date.now() - bucketFetchedAt.current < bucketStaleMs) return;
    if (bucketInFlight.current) return bucketInFlight.current;

    const requestId = ++bucketRequestId.current;
    setBucketLoading(true);
    setBucketStatus("loading");
    setBucketError(null);
    const request = customerApi.bucket()
      .then((items) => {
        if (bucketRequestId.current !== requestId || bucketOwner.current !== ownerId) return;
        setLiked(items);
        bucketFetchedAt.current = Date.now();
        setBucketStatus("ready");
      })
      .catch(() => {
        if (bucketRequestId.current !== requestId || bucketOwner.current !== ownerId) return;
        // A transport failure is not evidence of an empty bucket.
        setBucketStatus("error");
        setBucketError("Your saved packages could not be loaded.");
      })
      .finally(() => {
        if (bucketRequestId.current === requestId && bucketOwner.current === ownerId) setBucketLoading(false);
        if (bucketInFlight.current === request) bucketInFlight.current = null;
      });
    bucketInFlight.current = request;
    return request;
  }, [bucketStatus, user?.id]);

  useEffect(() => {
    configureInvalidSessionHandler(() => { void endSession(true); });
    return () => configureInvalidSessionHandler();
  }, [endSession]);

  useEffect(() => {
    void (async () => {
      const stored = await readSession();
      if (!stored) { setIsLoading(false); return; }
      if (stored.refreshExpiry <= Date.now()) { await endSession(true); setIsLoading(false); return; }
      if (stored.accessExpiry <= Date.now()) { await refreshSession(); }
      else { setUser(stored.user); await reloadUser(); stopTimer(); refreshTimer.current = setTimeout(() => { void refreshSession(); }, Math.max(0, stored.accessExpiry - Date.now() - refreshLeadMs)); }
      setIsLoading(false);
    })();
    return stopTimer;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Wait for session bootstrap to resolve the identity, then hydrate the one
  // canonical bucket snapshot. This cannot miss the bootstrap transition.
  useEffect(() => {
    if (!isLoading && user?.id && bucketAutoLoadedFor.current !== user.id) {
      bucketAutoLoadedFor.current = user.id;
      void reloadBucket({ force: true });
    }
  }, [isLoading, reloadBucket, user?.id]);

  const loginWithGoogle = useCallback(async (idToken: string) => {
    const tokens = await post<AuthTokens>("/auth/google", { idToken }, { skipAuthRefresh: true } as never);
    await applySession(tokens);
    return tokens.user;
  }, [applySession]);

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
    setBucketStatus("ready"); setBucketError(null); bucketFetchedAt.current = Date.now();
    try { const next = await customerApi.toggleBucket(code); setLiked(next); bucketFetchedAt.current = Date.now(); return next; } catch (error) { setLiked(before); throw error; }
  }, [liked, user]);

  const bucketIsPending = Boolean(user) && (bucketStatus === "idle" || bucketStatus === "loading");
  const value = useMemo<AuthContextValue>(() => ({ user, isAuthenticated: Boolean(user), isLoading, needsLogin, loginWithGoogle, refreshSession, logout, reloadUser, toggleBucket, likedCodes: new Set(liked.map((item) => (item.packageCode || item.code).toUpperCase())), bucketItems: liked, bucketLoading: bucketLoading || bucketIsPending, bucketError, reloadBucket }), [user, isLoading, needsLogin, loginWithGoogle, refreshSession, logout, reloadUser, toggleBucket, liked, bucketLoading, bucketIsPending, bucketError, reloadBucket]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext); if (!context) throw new Error("useAuth must be used inside AuthProvider"); return context;
};
