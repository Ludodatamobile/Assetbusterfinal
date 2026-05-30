import type { BusinessListing, DealType } from "@/types/marketplace";

export type StartupSort = "featured" | "newest" | "oldest" | "fundingNeeded";

export interface StartupFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  country?: string;
  startupStage?: string;
  sortBy?: StartupSort;
}

export interface StartupListing extends BusinessListing {
  profileType: "STARTUP";
  startupType?: string | null;
  startupCategory?: string | null;
  startupStage?: string | null;
  problemStatement?: string | null;
  solutionStatement?: string | null;
  targetMarket?: string | null;
  marketSize?: string | null;
  productStatus?: string | null;
  tractionSummary?: string | null;
  teamSummary?: string | null;
  technologyStack?: string | null;
  goToMarketStrategy?: string | null;
  competitors?: string | null;
  startupHighlights?: string | null;
  fundingNeeded?: string | number | null;
  imageUrls?: string[];
}

export interface CreateStartupPayload {
  title: string;
  description: string;
  industry: string;
  country: string;
  city?: string;
  businessName?: string;
  website?: string;
  headline?: string;
  shortSummary?: string;
  dealType?: DealType;
  currency: string;
  askAmount?: number;
  startupType: string;
  startupCategory: string;
  startupStage?: string;
  problemStatement: string;
  solutionStatement: string;
  targetMarket?: string;
  marketSize?: string;
  businessModel?: string;
  revenueModel?: string;
  productStatus?: string;
  tractionSummary?: string;
  teamSummary?: string;
  technologyStack?: string;
  goToMarketStrategy?: string;
  competitors?: string;
  startupHighlights?: string;
  fundingNeeded?: number;
  imageUrls?: string[];
  isConfidential?: boolean;
  ndaRequired?: boolean;
}