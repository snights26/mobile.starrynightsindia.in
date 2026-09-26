import { API_BASE_URL } from "@/src/constants/config";

export const resolveAssetUrl = (url?: string | null): string | undefined => {
  const value = url?.trim();
  if (!value) return undefined;
  if (/^https?:\/\//i.test(value) || value.startsWith("data:")) return value;
  const apiOrigin = API_BASE_URL.replace(/\/api$/, "");
  if (value.startsWith("/api/")) return `${apiOrigin}${value}`;
  if (value.startsWith("/uploads/")) return `${API_BASE_URL}${value}`;
  return undefined;
};

export const publicPackageUrl = (code: string): string | undefined => {
  const web = (process.env.EXPO_PUBLIC_WEB_BASE_URL ?? "").trim().replace(/\/$/, "");
  return web && code ? `${web}/package/${encodeURIComponent(code)}` : undefined;
};
