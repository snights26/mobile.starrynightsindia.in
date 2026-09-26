export const inr = (value?: number | string): string => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(number) : "Price on request";
};
export const readableDate = (value?: string): string => value ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value)) : "—";
export const listFromText = (value?: string): string[] => value?.split(/\r?\n|•/).map((item) => item.trim()).filter(Boolean) ?? [];
export const safeErrorMessage = (error: unknown, fallback = "Something went wrong. Please try again."): string => {
  if (typeof error === "object" && error && "message" in error && typeof error.message === "string") return error.message;
  return fallback;
};
