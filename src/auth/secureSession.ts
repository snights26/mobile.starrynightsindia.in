import * as SecureStore from "expo-secure-store";
import type { AuthTokens } from "@/src/types/api";

const SESSION_KEY = "starry-nights.session.v1";

export type StoredSession = AuthTokens & { accessExpiry: number; refreshExpiry: number };

export const toStoredSession = (tokens: AuthTokens): StoredSession => ({
  ...tokens,
  accessExpiry: new Date(tokens.accessTokenExpiresAt).getTime(),
  refreshExpiry: new Date(tokens.refreshTokenExpiresAt).getTime(),
});

export const readSession = async (): Promise<StoredSession | null> => {
  try {
    const raw = await SecureStore.getItemAsync(SESSION_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as StoredSession;
    if (!value.accessToken || !value.refreshToken || !Number.isFinite(value.refreshExpiry)) throw new Error("invalid session");
    return value;
  } catch {
    await SecureStore.deleteItemAsync(SESSION_KEY).catch(() => undefined);
    return null;
  }
};

export const saveSession = async (tokens: AuthTokens): Promise<StoredSession> => {
  const session = toStoredSession(tokens);
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session), { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY });
  return session;
};

export const clearSession = async (): Promise<void> => {
  await SecureStore.deleteItemAsync(SESSION_KEY).catch(() => undefined);
};
