export type ApiEnvelope<T> = { success: boolean; message: string; data: T };

export type Category = {
  id: string;
  code: string;
  categoryCode: string;
  name: string;
  title: string;
  isSub?: boolean;
  isSubcategory?: boolean;
  parent?: string;
  thumbnailUrl?: string;
  image?: string;
  children?: Category[];
};

export type PackageSummary = {
  id: string;
  packageCode: string;
  code: string;
  name: string;
  title: string;
  image?: string;
  thumbnailUrl?: string;
  days?: number;
  duration?: string;
  avgCost?: string;
  pickup?: string;
  location?: string;
  categoryCodes?: string[];
  parentCategoryCodes?: string[];
};

export type ItineraryItem = { day: number; dayNumber?: number; title: string; desc: string; description?: string };
export type PackageDetail = PackageSummary & {
  heroTitle?: string;
  shortTitle?: string;
  brandName?: string;
  category?: string;
  overview?: string;
  highlights?: string;
  bestTime?: string;
  climate?: string;
  suitable?: string;
  note?: string;
  images?: string[];
  itinerary?: ItineraryItem[];
  inclusions?: string[];
  exclusions?: string[];
  relatedPackages?: PackageSummary[];
};

export type Hero = { id: string; imageId: string; title: string; subtitle?: string; image?: string; link?: string; active?: boolean; sequence?: number };
export type FeaturedRow = { id: string; rowId: string; title: string; rowTitle?: string; type: "package" | "category" | "top10" | string; rowType?: string; visibleOn?: string; packageMode?: string; categoryMatchOperator?: string; items: (PackageSummary | Category)[]; sequence?: number };
export type Statistic = { id: string; title: string; value: string; sequence?: number };

export type User = {
  id: string;
  userId: string;
  name: string;
  email: string;
  contact: string;
  mobile?: string;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  profileImage?: string;
  photo?: string;
  profileCompleted: boolean;
  dob?: string;
  idType?: string;
  idNumber?: string;
  emergencyName?: string;
  emergencyContact?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  gender?: string;
  preferredDestinations?: string;
  preferredTravelStyle?: string;
  travelPreferences?: string;
  authProvider?: string;
  emailVerified?: boolean;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
  user: User;
};

export type Tour = {
  id: string;
  tourId: string;
  packageCode?: string;
  packageName?: string;
  pickupDate?: string;
  dropDate?: string;
  duration?: string;
  pickupLocation?: string;
  dropLocation?: string;
  status?: string;
  paymentStatus?: string;
  totalCost?: number;
  advanceAmount?: number;
  adults?: number;
  kids?: number;
  accommodation?: { city?: string; checkin?: string; checkout?: string; hotel?: string; room?: string; meal?: string; contact?: string }[];
};

export type Payment = {
  id: string;
  tourId: string;
  bookingId?: string;
  paymentDate?: string;
  amount: number;
  paidAmount?: number;
  totalAmount?: number;
  transactionId?: string;
  mode?: string;
  paymentMode?: string;
  status?: string;
  paymentStatus?: string;
  razorpayShortUrl?: string;
  paymentRequestExpiresAt?: string;
};

export type Invoice = { invoiceNo: string; billTo: string; tourType: string; pax: number; date: string; totalCost: number; paidAmount: number; dueAmount: number; payments: Payment[] };
export type Notification = { id: string; notificationId?: string; title: string; message?: string; type?: string; image?: string; imageUrl?: string; pdf?: string; pdfUrl?: string };
export type GalleryImage = { id: string; imageId?: string; title?: string; image?: string; url?: string; approved?: boolean; featured?: boolean };
export type DirectUploadAuthorization = {
  intent: string;
  pathname: string;
  access: "private" | "public";
  maximumSizeInBytes: number;
  allowedContentTypes: string[];
  multipartRecommended: boolean;
};
export type RecentlyViewed = { packageCode: string; packageName?: string; name?: string; image?: string; thumbnailUrl?: string; viewCount?: number; lastViewedAt?: string };
export type ChatResponse = { sessionId: string; answer: string; packages?: PackageSummary[]; quickReplies?: string[]; escalationRequired?: boolean };

export type EnquiryInput = {
  name: string; contact: string; email?: string; pickupCity?: string; purpose?: string; destination: string;
  startDate?: string; endDate?: string; persons?: number; adult?: number; child?: number; rooms?: number;
  mealplan?: string; hotel?: string; transport?: string; leadSource?: string; contactTime?: string; message?: string;
};
