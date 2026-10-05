import { del, get, post, put } from "@/src/api/client";
import type { AppAnnouncement, Category, ChatResponse, DirectUploadAuthorization, EnquiryInput, FeaturedRow, GalleryImage, Hero, Invoice, Notification, PackageDetail, PackageSummary, Payment, RecentlyViewed, Statistic, Tour, User } from "@/src/types/api";

export const catalogApi = {
  packages: (params?: { category?: string; brand?: string; rowId?: string; regionCode?: string }) => get<PackageSummary[]>("/packages", { params }),
  package: (code: string) => get<PackageDetail>(`/packages/${encodeURIComponent(code)}`),
  categories: () => get<Category[]>("/categories"),
  categoryTree: () => get<Category[]>("/categories/tree"),
  categoryPackages: (code: string) => get<PackageSummary[]>(`/categories/${encodeURIComponent(code)}/packages`),
  heroes: () => get<Hero[]>("/hero-sliders/public"),
  featured: (visibleOn = "home") => get<FeaturedRow[]>("/featured-rows/public", { params: { visibleOn } }),
  statistics: () => get<Statistic[]>("/homepage-statistics/public"),
};
export const customerApi = {
  me: () => get<User>("/users/me"),
  updateProfile: (user: User, values: Partial<User>) => put<User>(`/users/${encodeURIComponent(user.id || user.userId)}`, values),
  completeProfile: (values: Partial<User>) => put<User>("/users/me/complete-profile", values),
  bucket: () => get<PackageSummary[]>("/users/me/bucket-list"),
  toggleBucket: (code: string) => post<PackageSummary[]>(`/users/me/bucket-list/${encodeURIComponent(code)}`),
  recent: () => get<RecentlyViewed[]>("/package-views/me"),
  recordView: (packageCode: string, sessionIdentifier?: string) => post<RecentlyViewed>("/package-views", { packageCode, ...(sessionIdentifier ? { sessionIdentifier } : {}) }),
  removeRecent: (code: string) => del<void>(`/package-views/me/${encodeURIComponent(code)}`),
  clearRecent: () => del<void>("/package-views/me"),
  tours: () => get<Tour[]>("/mytours"),
  tour: (tourId: string) => get<Tour>(`/tours/${encodeURIComponent(tourId)}`),
  payments: () => get<Payment[]>("/my-payments"),
  invoice: (tourId: string) => get<Invoice>(`/payments/invoice/${encodeURIComponent(tourId)}`),
  notifications: () => get<Notification[]>("/notifications/me"),
  photos: () => get<GalleryImage[]>("/get-photos"),
  authorizePhotoUpload: (input: { filename: string; contentType: string; size: number }) => post<DirectUploadAuthorization>("/upload-photo/authorize", input),
  finalizePhotoUpload: (input: { intent: string; url: string; title?: string }) => post<GalleryImage>("/upload-photo/finalize", input),
  deletePhoto: (id: string) => del<void>(`/delete-photo/${encodeURIComponent(id)}`),
};
export const publicApi = {
  gallery: () => get<GalleryImage[]>("/gallery/public"),
  notifications: () => get<Notification[]>("/notifications/public"),
  appAnnouncements: () => get<AppAnnouncement[]>("/app-announcements/active"),
  occasion: () => get<{ id: string; title: string; message?: string; imageUrl?: string } | null>("/occasion-popups/current"),
  enquire: (values: EnquiryInput) => post<unknown>("/enquiries", values),
  contact: (values: { name: string; email: string; phone?: string; message: string }) => post<unknown>("/contact", values),
  chat: (message: string, sessionId: string) => post<ChatResponse>("/chatbot/query", { message, sessionId }),
};
