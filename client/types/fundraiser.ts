import type { BusinessListing, DealType } from "@/types/marketplace";

export type FundraiserListing = Omit<BusinessListing, "profileType"> & {
  profileType: "RAISE_CAPITAL";
};

export interface FundraiserFilters {
  page?: number;
  limit?: number;
  search?: string;
  industry?: string;
  country?: string;
  currency?: string;
  fundingStage?: string;
  minAsk?: string | number;
  maxAsk?: string | number;
  sortBy?: "featured" | "newest" | "oldest" | "askAmount";
}

export interface CreateFundraiserPayload {
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
  askAmount: number;
  askPercent?: number;
  askRate?: number;

  runSales?: number;
  ebitda?: number;
  grossRevenue?: number;
  netProfit?: number;
  monthlyRevenue?: number;
  monthlyProfit?: number;
  employees?: number;
  established?: number;

  businessModel?: string;
  productsServices?: string;
  customerBase?: string;
  growthOpportunities?: string;
  competitiveAdvantages?: string;

  fundingStage?: string;
  useOfFunds?: string;
  traction?: string;
  runway?: string;
  minInvestment?: number;
  targetInvestor?: string;
  previousFunding?: number;
  revenueModel?: string;
  keyMetrics?: string;
  investorHighlights?: string;
  exitStrategy?: string;
  pitchDeckReady?: boolean;

  isConfidential?: boolean;
  ndaRequired?: boolean;
  financialsAvailable?: boolean;
  dataRoomReady?: boolean;
}