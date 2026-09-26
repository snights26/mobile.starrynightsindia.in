import { AxiosError, create, type InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL, requireApiBaseUrl } from "@/src/constants/config";
import { clearSession, readSession, saveSession } from "@/src/auth/secureSession";
import type { ApiEnvelope, AuthTokens } from "@/src/types/api";

export class ApiError extends Error {
  readonly status?: number;
  readonly details?: unknown;
  constructor(message: string, status?: number, details?: unknown) { super(message); this.name = "ApiError"; this.status = status; this.details = details; }
}

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean; skipAuthRefresh?: boolean };
let activeRefresh: Promise<AuthTokens> | undefined;
let onSessionInvalid: (() => void) | undefined;

const safeServerMessage = (value: unknown, fallback: string): string => {
  if (typeof value !== "string") return fallback;
  const message = value.trim();
  if (!message || message.length > 240 || /\n|\bat\s+\w+\(|stack\s*trace|\berror:/i.test(message)) return fallback;
  return message;
};

const customerErrorMessage = (error: AxiosError<ApiEnvelope<unknown>>): string => {
  const status = error.response?.status;
  const serverMessage = error.response?.data?.message;
  if (status === 400) return safeServerMessage(serverMessage, "Please check the information and try again.");
  if (status === 401) return "Your session has ended. Please sign in again.";
  if (status === 403) return "You do not have permission to access this information.";
  if (status === 404) return "We could not find the requested information.";
  if (status === 408 || error.code === "ECONNABORTED") return "The request timed out. Please check your connection and try again.";
  if (status && status >= 500) return "Starry Nights is temporarily unavailable. Please try again shortly.";
  if (!error.response || error.message === "Network Error") return "We could not reach Starry Nights. Check your connection and try again.";
  return "The request could not be completed. Please try again.";
};

export const configureInvalidSessionHandler = (handler?: () => void): void => { onSessionInvalid = handler; };

export const api = create({ baseURL: API_BASE_URL || undefined, timeout: 20_000, headers: { Accept: "application/json", "Content-Type": "application/json" } });
const bareApi = create({ timeout: 20_000 });

api.interceptors.request.use(async (config) => {
  requireApiBaseUrl();
  const session = await readSession();
  if (session?.accessToken) config.headers.Authorization = `Bearer ${session.accessToken}`;
  return config;
});

const refreshTokens = async (): Promise<AuthTokens> => {
  if (activeRefresh) return activeRefresh;
  activeRefresh = (async () => {
    const session = await readSession();
    if (!session?.refreshToken || session.refreshExpiry <= Date.now()) throw new ApiError("Your session has ended. Please sign in again.", 401);
    const response = await bareApi.post<ApiEnvelope<AuthTokens>>(`${requireApiBaseUrl()}/auth/refresh`, { refreshToken: session.refreshToken });
    if (!response.data?.success || !response.data.data?.accessToken) throw new ApiError(response.data?.message || "Unable to refresh your session.", response.status);
    await saveSession(response.data.data);
    return response.data.data;
  })();
  try { return await activeRefresh; } finally { activeRefresh = undefined; }
};

/**
 * Shared bearer-aware fetch for the few API endpoints that deliberately do
 * not use the normal Starry Nights JSON envelope (for example, the Blob
 * presign protocol). It follows the same one-refresh-only policy as Axios.
 */
export const authenticatedFetch = async (input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> => {
  const requestWithSession = async (accessToken: string): Promise<Response> => {
    const headers = new Headers(init.headers);
    headers.set("Authorization", `Bearer ${accessToken}`);
    return fetch(input, { ...init, headers });
  };
  const session = await readSession();
  if (!session?.accessToken) throw new ApiError("Your session has ended. Please sign in again.", 401);
  let response = await requestWithSession(session.accessToken);
  const sessionRejection = response.status === 401 || response.status === 403;
  if (!sessionRejection) return response;
  try {
    const tokens = await refreshTokens();
    response = await requestWithSession(tokens.accessToken);
    return response;
  } catch {
    await clearSession();
    onSessionInvalid?.();
    throw new ApiError("Your session has ended. Please sign in again.", 401);
  }
};

api.interceptors.response.use(
  (response) => {
    const envelope = response.data as ApiEnvelope<unknown> | undefined;
    if (envelope && typeof envelope.success === "boolean") {
      if (!envelope.success) return Promise.reject(new ApiError(safeServerMessage(envelope.message, "The server could not complete that request."), response.status));
      response.data = envelope.data;
    }
    return response;
  },
  async (error: AxiosError<ApiEnvelope<unknown>>) => {
    const config = error.config as RetriableConfig | undefined;
    const isAuthRoute = config?.url?.startsWith("/auth/");
    const authorization = config?.headers?.Authorization;
    const carriedBearer = typeof authorization === "string" && /^Bearer\s+\S+/i.test(authorization);
    const sessionRejection = error.response?.status === 401 || (error.response?.status === 403 && carriedBearer);
    if (sessionRejection && config && !config._retried && !config.skipAuthRefresh && !isAuthRoute) {
      config._retried = true;
      try {
        const tokens = await refreshTokens();
        config.headers.Authorization = `Bearer ${tokens.accessToken}`;
        return api.request(config);
      } catch {
        await clearSession();
        onSessionInvalid?.();
      }
    }
    return Promise.reject(new ApiError(customerErrorMessage(error), error.response?.status, error.response?.data));
  },
);

export const get = async <T>(url: string, config?: Parameters<typeof api.get>[1]): Promise<T> => (await api.get<T>(url, config)).data;
export const post = async <T>(url: string, body?: unknown, config?: Parameters<typeof api.post>[2]): Promise<T> => (await api.post<T>(url, body, config)).data;
export const put = async <T>(url: string, body?: unknown): Promise<T> => (await api.put<T>(url, body)).data;
export const del = async <T>(url: string): Promise<T> => (await api.delete<T>(url)).data;
