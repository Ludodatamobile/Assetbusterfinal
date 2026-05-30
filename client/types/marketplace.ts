export type ProfileType =
  | "SELL_BUSINESS"
  | "BUY_BUSINESS"
  | "FRANCHISE_BRAND"
  | "INVEST"
  | "RAISE_CAPITAL"
  | "FUNDING_SERVICE"
  | "STARTUP"
  | "ADVISOR";

export type ListingStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "ACTIVE"
  | "REJECTED"
  | "CLOSED";

export type DealType =
  | "FULL_SALE"
  | "PARTIAL_STAKE"
  | "BUSINESS_LOAN"
  | "INVESTMENT";

export type DealStatus =
  | "INQUIRY"
  | "NDA_SENT"
  | "NDA_SIGNED"
  | "NEGOTIATION"
  | "DUE_DILIGENCE"
  | "CLOSED"
  | "WITHDRAWN";

export type DocumentStatus = "PENDING" | "VERIFIED" | "REJECTED";

export type DocumentAccess = "PUBLIC_TEASER" | "DATA_ROOM" | "RESTRICTED";

export interface MarketplaceUser {
  id?: string;
  firstName: string;
  lastName: string;
  country?: string | null;
  profileImage?: string | null;
  verified?: boolean;
  role?: string;
}

export interface BusinessListing {
  id: string;
  userId?: string;
  title: string;
  slug: string;
  profileType: ProfileType;
  description: string;
  industry: string;
  country: string;
  city?: string | null;
  dealType: DealType;
  currency: string;
  askAmount: string | number;
  askPercent?: string | number | null;
  askRate?: string | number | null;
  runSales?: string | number | null;
  ebitda?: string | number | null;
  ebitdaMargin?: string | number | null;
  employees?: number | null;
  established?: number | null;
  outlets?: number | null;

  businessName?: string | null;
  legalEntityName?: string | null;
  website?: string | null;
  headline?: string | null;
  shortSummary?: string | null;

  grossRevenue?: string | number | null;
  netProfit?: string | number | null;
  monthlyRevenue?: string | number | null;
  monthlyProfit?: string | number | null;
  inventoryValue?: string | number | null;
  assetValue?: string | number | null;
  realEstateValue?: string | number | null;

  askingPriceReason?: string | null;
  valuationMethod?: string | null;
  businessModel?: string | null;
  productsServices?: string | null;
  customerBase?: string | null;
  keyClients?: string | null;
  growthOpportunities?: string | null;
  competitiveAdvantages?: string | null;
  facilities?: string | null;
  leaseTerms?: string | null;

  reasonForSelling?: string | null;
  assetsIncluded?: string | null;
  sellerFinancing?: boolean;
  transitionSupport?: string | null;
  trainingIncluded?: boolean;
  preferredBuyerType?: string | null;
  dealStructureNotes?: string | null;

  isConfidential?: boolean;
  ndaRequired?: boolean;
  teaserSummary?: string | null;
  financialsAvailable?: boolean;
  dataRoomReady?: boolean;

  fundingStage?: string | null;
  useOfFunds?: string | null;
  traction?: string | null;
  runway?: string | null;
  minInvestment?: string | number | null;
  targetInvestor?: string | null;
  previousFunding?: string | number | null;
  revenueModel?: string | null;
  keyMetrics?: string | null;
  investorHighlights?: string | null;
  exitStrategy?: string | null;
  pitchDeckReady?: boolean;

  fundingServiceType?: string | null;
  capitalProviderType?: string | null;
  capitalTypes?: string[];
  ticketMin?: string | number | null;
  ticketMax?: string | number | null;
  targetCompanyStage?: string | null;
  collateralRequired?: boolean;
  repaymentTerms?: string | null;
  processingTime?: string | null;
  regionsCovered?: string[];
  eligibilityCriteria?: string | null;
  requiredDocuments?: string | null;
  feesDescription?: string | null;
  regulatoryLicense?: string | null;
  fundingServiceHighlights?: string | null;

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

  status: ListingStatus;
  isPremium: boolean;
  isFeatured: boolean;
  isVerified: boolean;
  rating?: string | number | null;
  viewCount?: number;
  enquiryCount?: number;
  createdAt: string;
  updatedAt: string;
  user?: MarketplaceUser;
  _count?: {
    deals?: number;
    savedBy?: number;
    documents?: number;
  };
}

export interface InvestorProfile {
  id: string;
  userId?: string;
  profileType: "BUY_BUSINESS" | "INVEST" | "STARTUP";
  title: string;
  firmName?: string | null;
  investorType: string;
  bio?: string | null;
  currency: string;
  minTicket: string | number;
  maxTicket: string | number;
  industries: string[];
  countries: string[];
  dealTypes: string[];
  isPremium: boolean;
  isVerified: boolean;
  dealsCount: number;
  createdAt?: string;
  updatedAt?: string;
  user?: MarketplaceUser;
}

export interface AdvisorProfile {
  id: string;
  userId?: string;
  profileType?: "ADVISOR";
  title: string;
  firmName?: string | null;
  specialties: string[];
  bio?: string | null;
  countries: string[];
  rating?: string | number | null;
  dealsCount: number;
  isVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
  user?: MarketplaceUser;
}

export interface DashboardProfile {
  id: string;
  type: ProfileType;
  title: string;
  focus: string;
  country: string;
  status: "Live" | "Draft" | "In Review";
  completion: number;
  enquiries: number;
  listings: number;
  dealValue: string;
  lastActivity: string;
  description: string;
}

export interface DashboardDeal {
  id: string;
  company: string;
  sector: string;
  location: string;
  revenue: string;
  ebitda: string;
  valuation: string;
  stage: string;
  owner: string;
  probability: number;
  status: "priority" | "active" | "watch";
  updated: string;
}

export interface DashboardActivity {
  time: string;
  title: string;
  detail: string;
  type: string;
}

export interface DashboardPosting {
  id: string;
  title: string;
  location: string;
  sector: string;
  value: string;
  tag: string;
  slug?: string;
}

export interface DashboardDocument {
  id: string;
  name: string;
  type: string;
  access: string;
  status: "Verified" | "Pending";
  url?: string;
  createdAt?: string;
}

export interface PipelineStage {
  label: string;
  count: number;
  value: string;
  color: string;
}

export interface DashboardPayload {
  stats: {
    profileViews: number;
    activeListings: number;
    enquiriesReceived: number;
    savedBusinesses: number;
    unreadNotifications: number;
    totalProfiles: number;
    documents: number;
  };
  profiles: DashboardProfile[];
  deals: DashboardDeal[];
  pipeline: PipelineStage[];
  latestActivity: DashboardActivity[];
  documents: DashboardDocument[];
  marketPostings: DashboardPosting[];
}

export interface DealListItem {
  id: string;
  businessId: string;
  initiatorId: string;
  receiverId: string;
  status: DealStatus;
  ndaSigned: boolean;
  ndaSignedAt?: string | null;
  notes?: string | null;
  closedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  business?: Pick<
    BusinessListing,
    | "id"
    | "title"
    | "slug"
    | "industry"
    | "country"
    | "city"
    | "currency"
    | "askAmount"
    | "runSales"
    | "ebitda"
    | "ebitdaMargin"
    | "grossRevenue"
    | "netProfit"
    | "headline"
    | "shortSummary"
  >;
  initiator?: MarketplaceUser;
  receiver?: MarketplaceUser;
  _count?: {
    messages?: number;
    documents?: number;
  };
}

export interface DealDetail extends DealListItem {
  business?: BusinessListing;
  messages: MarketplaceMessage[];
  documents: DocumentUploadPayload[];
}

export interface MarketplaceMessage {
  id: string;
  dealId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
  sender?: MarketplaceUser;
}

export interface MarketplaceConversation extends DealListItem {
  counterparty?: MarketplaceUser;
  lastMessage?: MarketplaceMessage | null;
  unreadCount: number;
  messages?: MarketplaceMessage[];
}

export interface DocumentUploadPayload {
  id: string;
  name: string;
  url: string;
  type: string;
  fileType?: string | null;
  fileSize?: number | null;
  access: DocumentAccess;
  status: DocumentStatus;
  isNda: boolean;
  userId?: string | null;
  businessId?: string | null;
  dealId?: string | null;
  createdAt: string;
  user?: MarketplaceUser;
}
