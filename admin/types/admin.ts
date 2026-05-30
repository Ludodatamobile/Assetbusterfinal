export type Role =
  | "ADMIN"
  | "SUPER_ADMIN"
  | "BUSINESS_OWNER"
  | "INVESTOR"
  | "FRANCHISE_PARTNER"
  | "ADVISOR"
  | "BUYER";

export type UserStatus = "ACTIVE" | "SUSPENDED" | "DEACTIVATED" | "PENDING";
export type ListingStatus = "DRAFT" | "PENDING_REVIEW" | "ACTIVE" | "REJECTED" | "CLOSED";
export type DealStatus =
  | "INQUIRY"
  | "NDA_SENT"
  | "NDA_SIGNED"
  | "NEGOTIATION"
  | "DUE_DILIGENCE"
  | "CLOSED"
  | "WITHDRAWN";

export type DealType = "FULL_SALE" | "PARTIAL_STAKE" | "BUSINESS_LOAN" | "INVESTMENT";
export type ProfileType = "SELL_BUSINESS" | "BUY_BUSINESS" | "FRANCHISE_BRAND" | "INVEST" | "RAISE_CAPITAL" | "ADVISOR";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiEnvelope<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  meta?: PaginationMeta | Record<string, unknown>;
}

export interface AdminAccount {
  id: string;
  email: string;
  role: Extract<Role, "ADMIN" | "SUPER_ADMIN">;
  firstName: string;
  lastName: string;
  isActive?: boolean;
  isSuperAdmin?: boolean;
  lastLoginAt?: string | null;
  loginCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminLoginResult {
  admin: AdminAccount | null;
  accessToken: string;
  refreshToken?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  country?: string | null;
  role: Role;
  status: UserStatus;
  isEmailVerified?: boolean;
  verified?: boolean;
  verificationStatus?: string;
  profileImage?: string | null;
  profileScore?: number;
  lastLoginAt?: string | null;
  loginCount?: number;
  memberSince?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface BusinessListing {
  id: string;
  userId?: string;
  user?: Pick<AdminUser, "id" | "email" | "firstName" | "lastName" | "country">;
  profileType: ProfileType;
  title: string;
  slug: string;
  description?: string;
  industry: string;
  country: string;
  city?: string | null;
  dealType: DealType;
  currency: string;
  askAmount: string | number;
  askPercent?: string | number | null;
  runSales?: string | number | null;
  ebitda?: string | number | null;
  employees?: number | null;

  startupType?: string | null;
  startupCategory?: string | null;
  startupStage?: string | null;
  fundingNeeded?: number | string | null;
  problemStatement?: string | null;
  solutionStatement?: string | null;
  targetMarket?: string | null;
  productStatus?: string | null;
  imageUrls?: string[] | null;

  status: ListingStatus;
  isPremium: boolean;
  isVerified: boolean;
  isFeatured: boolean;
  rating?: string | number;
  viewCount?: number;
  enquiryCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface AdminDeal {
  id: string;
  businessId: string;
  business?: Pick<BusinessListing, "id" | "title" | "industry" | "country" | "currency" | "askAmount">;
  initiatorId: string;
  initiator?: Pick<AdminUser, "id" | "email" | "firstName" | "lastName">;
  receiverId: string;
  receiver?: Pick<AdminUser, "id" | "email" | "firstName" | "lastName">;
  status: DealStatus;
  ndaSigned: boolean;
  ndaSignedAt?: string | null;
  notes?: string | null;
  closedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface AuditLog {
  id: string;
  adminId: string;
  admin?: Pick<AdminAccount, "email" | "firstName" | "lastName" | "role">;
  action: string;
  entity: string;
  entityId: string;
  meta?: Record<string, unknown> | null;
  createdAt: string;
}

export interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description?: string;
  actor?: string;
  createdAt: string;
}

export type StatValue = number | string | null | undefined;
export type StatsRecord = Record<string, StatValue>;

export interface AnalyticsOverview {
  totals?: StatsRecord;
  growth?: StatsRecord;
  pending?: StatsRecord;
  funnel?: Array<{ label: string; value: number }>;
  recentActivity?: ActivityItem[];
  [key: string]: unknown;
}

export interface AdminListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  role?: string;
  industry?: string;
  country?: string;
  sort?: string;
}

export interface AdminBootstrapStatus {
  requiresBootstrap: boolean;
  hasActiveAdmin: boolean;
}

export interface AdminBootstrapPayload {
  setupSecret: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}