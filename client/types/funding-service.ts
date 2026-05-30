export type DealType =
  | "FULL_SALE"
  | "PARTIAL_STAKE"
  | "BUSINESS_LOAN"
  | "INVESTMENT";

export type ListingStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "ACTIVE"
  | "REJECTED"
  | "CLOSED";

export const FUNDING_SOURCE_TYPES = [
  "Loan / Mortgage",
  "Other",
  "Private Equity / Venture Capital",
  "Trade Credit / SBLC / POF",
  "Factoring / Receivables / Contracts",
  "Public Offering / IPO / SPAC",
  "Credit Enhancement",
  "Mezzanine Financing / Sub Debt",
  "Private Offering / Reg A+ / Reg CF",
  "Equipment Leasing",
  "Reverse Merger / RTO",
  "Credit Card",
  "Sale-Leaseback",
];

export interface FundingSourceUser {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  country?: string | null;
  profileImage?: string | null;
  verified?: boolean;
  role?: string;
}

export interface FundingSourceListing {
  id: string;
  userId?: string;
  user?: FundingSourceUser | null;
  profileType: "FUNDING_SERVICE";
  title: string;
  slug: string;
  description: string;
  industry: string;
  country: string;
  city?: string | null;
  businessName?: string | null;
  website?: string | null;
  headline?: string | null;
  shortSummary?: string | null;
  dealType: DealType;
  currency: string;
  askAmount?: number | string | null;
  fundingServiceType?: string | null;
  capitalProviderType?: string | null;
  capitalTypes?: string[] | null;
  ticketMin?: number | string | null;
  ticketMax?: number | string | null;
  targetCompanyStage?: string | null;
  collateralRequired?: boolean;
  repaymentTerms?: string | null;
  processingTime?: string | null;
  regionsCovered?: string[] | null;
  eligibilityCriteria?: string | null;
  requiredDocuments?: string | null;
  feesDescription?: string | null;
  regulatoryLicense?: string | null;
  fundingServiceHighlights?: string | null;
  isConfidential?: boolean;
  ndaRequired?: boolean;
  status: ListingStatus;
  isPremium?: boolean;
  isVerified?: boolean;
  isFeatured?: boolean;
  viewCount?: number;
  enquiryCount?: number;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    deals?: number;
    documents?: number;
    savedBy?: number;
  };
}

export interface CreateFundingSourcePayload {
  title: string;
  description: string;
  industry: string;
  country: string;
  city?: string;
  businessName?: string;
  website?: string;
  headline?: string;
  shortSummary?: string;
  dealType: DealType;
  currency: string;
  askAmount: number;
  fundingServiceType?: string;
  capitalProviderType?: string;
  capitalTypes?: string[];
  ticketMin?: number;
  ticketMax?: number;
  targetCompanyStage?: string;
  collateralRequired?: boolean;
  repaymentTerms?: string;
  processingTime?: string;
  regionsCovered?: string[];
  eligibilityCriteria?: string;
  requiredDocuments?: string;
  feesDescription?: string;
  regulatoryLicense?: string;
  fundingServiceHighlights?: string;
  isConfidential?: boolean;
  ndaRequired?: boolean;
}

export type UpdateFundingSourcePayload = Partial<CreateFundingSourcePayload>;

export interface FundingSourceFilters {
  page?: number;
  limit?: number;
  search?: string;
  industry?: string;
  country?: string;
  currency?: string;
  fundingServiceType?: string;
  minTicket?: number;
  maxTicket?: number;
  sortBy?: "featured" | "newest" | "oldest" | "ticketMax" | "askAmount";
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiSuccessResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: PaginationMeta;
}

/* Backwards-compatible names for existing dashboard code. */
export type FundingServiceListing = FundingSourceListing;
export type CreateFundingServicePayload = CreateFundingSourcePayload;
export type UpdateFundingServicePayload = UpdateFundingSourcePayload;
export type FundingServiceFilters = FundingSourceFilters;