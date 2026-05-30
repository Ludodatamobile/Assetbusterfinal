"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Activity,
  ArrowUpRight,
  BadgeCheck,
  Bell,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CirclePlus,
  Database,
  FileText,
  GitBranch,
  HandCoins,
  Home,
  LayoutDashboard,
  Loader2,
  Landmark,
  Menu,
  MessageSquare,
  RefreshCw,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Trash2,
  Upload,
  UserRound,
  Users,
  Rocket,
  X,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { MarketplaceService } from "@/services/marketplace.service";
import {
  DashboardService,
  type ProfileDraft,
} from "@/services/dashboard.service";
import { FundraiserService } from "@/services/fundraiser.service";
import type {
  CreateFundraiserPayload,
  FundraiserListing,
} from "@/types/fundraiser";
import { FundingServiceService } from "@/services/funding-service.service";
import type {
  CreateFundingServicePayload,
  FundingServiceListing,
} from "@/types/funding-service";
import { StartupService } from "@/services/startup.service";
import type { CreateStartupPayload, StartupListing } from "@/types/startup";
import type {
  BusinessListing,
  DashboardActivity,
  DashboardDeal,
  DashboardDocument,
  DashboardPayload,
  DashboardPosting,
  DashboardProfile,
  DealListItem,
  DealStatus,
  DealType,
  DocumentAccess,
  DocumentUploadPayload,
  MarketplaceConversation,
  MarketplaceMessage,
  PipelineStage,
  ProfileType,
} from "@/types/marketplace";
import { createUserSocket } from "@/lib/realtime";

type TabId =
  | "overview"
  | "add-profile"
  | "profiles"
  | "fundraisers"
  | "funding-services"
  | "startups"
  | "opportunities"
  | "pipeline"
  | "listings"
  | "enquiries"
  | "documents"
  | "activity"
  | "account"
  | "settings";

interface NavItem {
  id: TabId;
  label: string;
  icon: LucideIcon;
}

const NAV: NavItem[] = [
  { id: "overview", label: "Command Center", icon: LayoutDashboard },
  { id: "add-profile", label: "Add Profile", icon: CirclePlus },
  { id: "profiles", label: "My Profiles", icon: UserRound },
  { id: "fundraisers", label: "My Fundraisers", icon: HandCoins },
  { id: "funding-services", label: "Funding Services", icon: Landmark },
  { id: "opportunities", label: "Opportunities", icon: Search },
  { id: "pipeline", label: "Pipeline", icon: GitBranch },
  { id: "listings", label: "My Listings", icon: Building2 },
  { id: "enquiries", label: "Enquiries", icon: MessageSquare },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "activity", label: "Latest Activity", icon: Activity },
  { id: "account", label: "Account Info", icon: Users },
  { id: "startups", label: "My Startups", icon: Rocket },
  { id: "settings", label: "Settings", icon: Settings },
];

const PROFILE_TYPES: Array<{
  type: ProfileType;
  title: string;
  short: string;
  description: string;
  color: string;
}> = [
  {
    type: "SELL_BUSINESS",
    title: "Sell Your Business",
    short: "Seller mandate",
    description:
      "Create a confidential sell-side profile with valuation, financials, and buyer preferences.",
    color: "#1A56DB",
  },
  {
    type: "BUY_BUSINESS",
    title: "Buy a Business",
    short: "Buyer mandate",
    description:
      "Define your acquisition criteria by sector, country, ticket size, and target profile.",
    color: "#10B981",
  },
  {
    type: "FRANCHISE_BRAND",
    title: "Franchise Your Brand",
    short: "Franchise growth",
    description:
      "List franchise expansion opportunities and attract qualified operators or partners.",
    color: "#F5A623",
  },
  {
    type: "INVEST",
    title: "Invest in Businesses",
    short: "Investor profile",
    description:
      "Publish your capital mandate and receive curated opportunities matching your thesis.",
    color: "#7C3AED",
  },
  {
    type: "RAISE_CAPITAL",
    title: "Raise Capital",
    short: "Fundraise profile",
    description:
      "Showcase your company to strategic investors, PE funds, angels, and family offices.",
    color: "#D42B2B",
  },
  {
    type: "FUNDING_SERVICE",
    title: "Offer Funding Services",
    short: "Funding source",
    description:
      "List acquisition finance, private credit, grants, invoice finance, venture debt, or lender services.",
    color: "#0EA5E9",
  },
  {
    type: "STARTUP",
    title: "Post a Startup",
    short: "Startup",
    description:
      "Share an idea, MVP, project, or early-stage venture with investors, buyers, and strategic partners.",
    color: "#2563EB",
  },
  {
    type: "ADVISOR",
    title: "Offer Advisory Services",
    short: "Advisor profile",
    description:
      "Represent your M&A, legal, accounting, valuation, or transaction advisory services.",
    color: "#0F766E",
  },
];

const STARTUP_CATEGORIES = [
  "Technology",
  "Fintech",
  "Healthtech",
  "Edtech",
  "Climate",
  "Energy",
  "Agritech",
  "Logistics",
  "E-commerce",
  "SaaS",
  "Marketplace",
  "AI / Automation",
  "Real Estate",
  "Consumer Products",
  "Media",
  "Other",
];

const STARTUP_STAGES = [
  "Idea",
  "Prototype",
  "MVP",
  "Pre-Revenue",
  "Revenue",
  "Growth",
  "Scaling",
];

const STARTUP_COUNTRIES = [
  "Nigeria",
  "Ghana",
  "Kenya",
  "South Africa",
  "United States",
  "United Kingdom",
  "India",
  "United Arab Emirates",
];

const STARTUP_TYPES = [
  "Startup Idea",
  "MVP",
  "Operating Startup",
  "SaaS Product",
  "Marketplace",
  "Mobile App",
  "AI Product",
  "Hardware Product",
  "Social Enterprise",
  "Research / IP Project",
];

const DASHBOARD_SETTINGS_KEY = "assetbusters_dashboard_settings";

interface DashboardSettings {
  defaultCurrency: string;
  regionFocus: string;
  marketplaceFocus: string[];
  compactMode: boolean;
  autoRefreshWorkspace: boolean;
  notifications: {
    enquiries: boolean;
    messages: boolean;
    reviewUpdates: boolean;
    weeklyDigest: boolean;
  };
  privacy: {
    showContactEmail: boolean;
    allowDirectMessages: boolean;
    requireNdaByDefault: boolean;
    hideConfidentialNames: boolean;
  };
}

const DEFAULT_DASHBOARD_SETTINGS: DashboardSettings = {
  defaultCurrency: "USD",
  regionFocus: "Global",
  marketplaceFocus: [
    "Businesses for sale",
    "Fund raisers",
    "Funding services",
    "Startups",
  ],
  compactMode: false,
  autoRefreshWorkspace: false,
  notifications: {
    enquiries: true,
    messages: true,
    reviewUpdates: true,
    weeklyDigest: false,
  },
  privacy: {
    showContactEmail: false,
    allowDirectMessages: true,
    requireNdaByDefault: true,
    hideConfidentialNames: true,
  },
};

const MARKETPLACE_FOCUS_OPTIONS = [
  "Businesses for sale",
  "Fund raisers",
  "Funding services",
  "Startups",
  "Franchises",
  "Investors",
];

const SETTINGS_CURRENCIES = ["USD", "NGN", "GBP", "EUR", "AED", "ZAR", "GHS", "KES"];

function readDashboardSettings(): DashboardSettings {
  if (typeof window === "undefined") return DEFAULT_DASHBOARD_SETTINGS;

  try {
    const raw = window.localStorage.getItem(DASHBOARD_SETTINGS_KEY);
    if (!raw) return DEFAULT_DASHBOARD_SETTINGS;

    const saved = JSON.parse(raw) as Partial<DashboardSettings>;

    return {
      ...DEFAULT_DASHBOARD_SETTINGS,
      ...saved,
      notifications: {
        ...DEFAULT_DASHBOARD_SETTINGS.notifications,
        ...saved.notifications,
      },
      privacy: {
        ...DEFAULT_DASHBOARD_SETTINGS.privacy,
        ...saved.privacy,
      },
    };
  } catch {
    return DEFAULT_DASHBOARD_SETTINGS;
  }
}

const EMPTY_DASHBOARD: DashboardPayload = {
  stats: {
    profileViews: 0,
    activeListings: 0,
    enquiriesReceived: 0,
    savedBusinesses: 0,
    unreadNotifications: 0,
    totalProfiles: 0,
    documents: 0,
  },
  profiles: [],
  deals: [],
  pipeline: [
    { label: "Inquiry", count: 0, value: "USD 0", color: "#8896a8" },
    { label: "NDA Sent", count: 0, value: "USD 0", color: "#1A56DB" },
    { label: "NDA Signed", count: 0, value: "USD 0", color: "#10B981" },
    { label: "Negotiation", count: 0, value: "USD 0", color: "#F5A623" },
    { label: "Due Diligence", count: 0, value: "USD 0", color: "#7C3AED" },
    { label: "Closed", count: 0, value: "USD 0", color: "#059669" },
    { label: "Withdrawn", count: 0, value: "USD 0", color: "#D42B2B" },
  ],
  latestActivity: [],
  documents: [],
  marketPostings: [],
};

const NEXT_STATUSES: Record<DealStatus, DealStatus[]> = {
  INQUIRY: ["NDA_SENT", "WITHDRAWN"],
  NDA_SENT: ["NDA_SIGNED", "WITHDRAWN"],
  NDA_SIGNED: ["NEGOTIATION", "WITHDRAWN"],
  NEGOTIATION: ["DUE_DILIGENCE", "WITHDRAWN"],
  DUE_DILIGENCE: ["CLOSED", "WITHDRAWN"],
  CLOSED: [],
  WITHDRAWN: [],
};

function defaultDealTypeForProfile(type: ProfileType): DealType {
  if (
    type === "RAISE_CAPITAL" ||
    type === "FRANCHISE_BRAND" ||
    type === "STARTUP"
  )
    return "INVESTMENT";

  if (type === "FUNDING_SERVICE") return "BUSINESS_LOAN";

  return "FULL_SALE";
}

function initialProfileDraft(
  type: ProfileType = "SELL_BUSINESS",
): ProfileDraft {
  return {
    type,
    title: "",
    country: "",
    city: "",
    industry: "",
    investmentRange: "",
    description: "",
    dealType: defaultDealTypeForProfile(type),
    currency: "USD",
    askAmount: "",
    askPercent: "",
    askRate: "",
    runSales: "",
    ebitda: "",
    ebitdaMargin: "",
    employees: "",
    established: "",
    outlets: "",
    businessName: "",
    legalEntityName: "",
    website: "",
    headline: "",
    shortSummary: "",
    grossRevenue: "",
    netProfit: "",
    monthlyRevenue: "",
    monthlyProfit: "",
    inventoryValue: "",
    assetValue: "",
    realEstateValue: "",
    askingPriceReason: "",
    valuationMethod: "",
    businessModel: "",
    productsServices: "",
    customerBase: "",
    keyClients: "",
    growthOpportunities: "",
    competitiveAdvantages: "",
    facilities: "",
    leaseTerms: "",
    reasonForSelling: "",
    assetsIncluded: "",
    sellerFinancing: false,
    transitionSupport: "",
    trainingIncluded: false,
    preferredBuyerType: "",
    dealStructureNotes: "",
    isConfidential: true,
    ndaRequired: true,
    teaserSummary: "",
    financialsAvailable: false,
    dataRoomReady: false,
  };
}

function initialFundraiserDraft(): CreateFundraiserPayload {
  return {
    title: "",
    description: "",
    industry: "",
    country: "",
    city: "",
    businessName: "",
    website: "",
    headline: "",
    shortSummary: "",
    dealType: "INVESTMENT",
    currency: "USD",
    askAmount: 0,
    askPercent: undefined,
    askRate: undefined,
    runSales: undefined,
    ebitda: undefined,
    grossRevenue: undefined,
    netProfit: undefined,
    monthlyRevenue: undefined,
    monthlyProfit: undefined,
    employees: undefined,
    established: undefined,
    businessModel: "",
    productsServices: "",
    customerBase: "",
    growthOpportunities: "",
    competitiveAdvantages: "",
    fundingStage: "",
    useOfFunds: "",
    traction: "",
    runway: "",
    minInvestment: undefined,
    targetInvestor: "",
    previousFunding: undefined,
    revenueModel: "",
    keyMetrics: "",
    investorHighlights: "",
    exitStrategy: "",
    pitchDeckReady: false,
    isConfidential: true,
    ndaRequired: true,
    financialsAvailable: false,
    dataRoomReady: false,
  };
}

function initialFundingServiceDraft(): CreateFundingServicePayload {
  return {
    title: "",
    description: "",
    industry: "",
    country: "",
    city: "",
    businessName: "",
    website: "",
    headline: "",
    shortSummary: "",
    dealType: "BUSINESS_LOAN",
    currency: "USD",
    askAmount: 0,
    fundingServiceType: "",
    capitalProviderType: "",
    capitalTypes: [],
    ticketMin: undefined,
    ticketMax: undefined,
    targetCompanyStage: "",
    collateralRequired: false,
    repaymentTerms: "",
    processingTime: "",
    regionsCovered: [],
    eligibilityCriteria: "",
    requiredDocuments: "",
    feesDescription: "",
    regulatoryLicense: "",
    fundingServiceHighlights: "",
    isConfidential: false,
    ndaRequired: false,
  };
}

function initialStartupDraft(): CreateStartupPayload {
  return {
    title: "",
    description: "",
    industry: STARTUP_CATEGORIES[0],
    country: STARTUP_COUNTRIES[0],
    city: "",
    businessName: "",
    website: "",
    headline: "",
    shortSummary: "",
    dealType: "INVESTMENT",
    currency: "USD",
    askAmount: 0,
    startupType: STARTUP_TYPES[0],
    startupCategory: STARTUP_CATEGORIES[0],
    startupStage: STARTUP_STAGES[0],
    problemStatement: "",
    solutionStatement: "",
    targetMarket: "",
    marketSize: "",
    businessModel: "",
    revenueModel: "",
    productStatus: "",
    tractionSummary: "",
    teamSummary: "",
    technologyStack: "",
    goToMarketStrategy: "",
    competitors: "",
    startupHighlights: "",
    fundingNeeded: undefined,
    imageUrls: [],
    isConfidential: false,
    ndaRequired: false,
  };
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function formatEnum(value?: string | null) {
  if (!value) return "Not available";
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatRole(role?: string) {
  if (!role) return "Member";
  return formatEnum(role);
}

function formatMoney(value?: string | number | null, currency = "USD") {
  const amount = Number(value || 0);
  if (!amount) return "Not disclosed";
  return `${currency} ${amount.toLocaleString()}`;
}

function isFundraiserListing(
  listing: BusinessListing,
): listing is FundraiserListing {
  return listing.profileType === "RAISE_CAPITAL";
}

function isFundingServiceListing(
  listing: BusinessListing,
): listing is FundingServiceListing {
  return listing.profileType === "FUNDING_SERVICE";
}

function isStartupListing(listing: BusinessListing): listing is StartupListing {
  return listing.profileType === "STARTUP";
}

function csvToList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getProfileTypeMeta(type: ProfileType) {
  return PROFILE_TYPES.find((p) => p.type === type) || PROFILE_TYPES[0];
}

function isListingProfile(type: ProfileType) {
  return [
    "SELL_BUSINESS",
    "FRANCHISE_BRAND",
    "RAISE_CAPITAL",
    "FUNDING_SERVICE",
  ].includes(type);
}

function isTab(value: string | null): value is TabId {
  return Boolean(value && NAV.some((n) => n.id === value));
}

function currentNavLabel(active: TabId) {
  return NAV.find((n) => n.id === active)?.label || "Dashboard";
}

function personName(person?: { firstName?: string; lastName?: string } | null) {
  return (
    [person?.firstName, person?.lastName].filter(Boolean).join(" ") ||
    "Counterparty"
  );
}

function StatusBadge({ value }: { value: string }) {
  const key = value.toLowerCase().replaceAll("_", "-").replace(/\s+/g, "-");
  return (
    <span className={cn("db-status-badge", key)}>{formatEnum(value)}</span>
  );
}

function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <section className="db-page-header">
      <div>
        <p className="db-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {children && <div className="db-header-actions">{children}</div>}
    </section>
  );
}

function FormSection({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="db-form-section">
      <div className="db-form-section-head">
        <p>{eyebrow}</p>
        <h3>{title}</h3>
        <span>{description}</span>
      </div>
      {children}
    </section>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  detail,
  trend,
  tone = "blue",
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  detail: string;
  trend?: string;
  tone?: "blue" | "green" | "amber" | "red" | "purple";
  onClick?: () => void;
}) {
  const content = (
    <>
      <div className={cn("db-stat-icon", tone)}>
        <Icon size={18} />
      </div>
      <div className="db-stat-copy">
        <span>{label}</span>
        <strong>{value}</strong>
        <p>{detail}</p>
      </div>
      {trend && <em className={cn("db-stat-trend", tone)}>{trend}</em>}
    </>
  );

  if (onClick)
    return (
      <button
        type="button"
        className="db-stat-card clickable"
        onClick={onClick}
      >
        {content}
      </button>
    );
  return <article className="db-stat-card">{content}</article>;
}

function Sidebar({
  active,
  collapsed,
  mobileOpen,
  onSelect,
  onToggle,
  onCloseMobile,
  userName,
  initials,
  role,
  country,
  profileScore,
  profileCount,
  unreadNotifications,
  isVerified,
}: {
  active: TabId;
  collapsed: boolean;
  mobileOpen: boolean;
  onSelect: (tab: TabId) => void;
  onToggle: () => void;
  onCloseMobile: () => void;
  userName: string;
  initials: string;
  role: string;
  country: string;
  profileScore: number;
  profileCount: number;
  unreadNotifications: number;
  isVerified: boolean;
}) {
  return (
    <aside
      className={cn(
        "db-sidebar",
        collapsed && "collapsed",
        mobileOpen && "mobile-open",
      )}
    >
      <div className="db-user-card">
        <div className="db-user-avatar">{initials}</div>
        {!collapsed && (
          <div className="db-user-copy">
            <p>{userName}</p>
            <span>
              {role} - {country}
            </span>
            <strong>
              <BadgeCheck size={11} />
              {isVerified ? "Verified account" : "Verification pending"}
            </strong>
          </div>
        )}
      </div>

      {!collapsed && (
        <div className="db-score-card">
          <div>
            <span>Profile strength</span>
            <strong>{profileScore}%</strong>
          </div>
          <div className="db-score-track">
            <span style={{ width: `${profileScore}%` }} />
          </div>
          <p>
            {profileCount} active workspace profiles across sale, acquisition,
            franchise, capital raise, and advisory mandates.
          </p>
        </div>
      )}

      <p className="db-nav-section">{!collapsed ? "Workspace" : ""}</p>

      <nav className="db-nav" aria-label="Dashboard navigation">
        {NAV.map((item) => {
          const Icon = item.icon;
          const badge =
            item.id === "profiles"
              ? profileCount
              : item.id === "activity"
                ? unreadNotifications
                : undefined;

          return (
            <button
              key={item.id}
              type="button"
              className={cn("db-nav-item", active === item.id && "active")}
              onClick={() => onSelect(item.id)}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={16} />
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && Boolean(badge) && <b>{badge}</b>}
              {collapsed && Boolean(badge) && <i />}
              {!collapsed && active === item.id && <ChevronRight size={13} />}
            </button>
          );
        })}
      </nav>

      <div className="db-sidebar-footer">
        <a href="/" className="db-home-link">
          <Home size={15} />
          {!collapsed && <span>Back to Marketplace</span>}
        </a>
        <button type="button" className="db-collapse" onClick={onToggle}>
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
        {!collapsed && (
          <div className="db-protected">
            <ShieldCheck size={16} />
            <div>
              <strong>Protected workspace</strong>
              <span>Deal activity is tied to your authenticated account.</span>
            </div>
          </div>
        )}
      </div>

      <button
        type="button"
        className="db-mobile-close"
        onClick={onCloseMobile}
        aria-label="Close dashboard menu"
      >
        <X size={18} />
      </button>
    </aside>
  );
}

function Topbar({
  active,
  userName,
  initials,
  notifications,
  onMenu,
  onHome,
  onActivity,
  onAddProfile,
}: {
  active: TabId;
  userName: string;
  initials: string;
  notifications: number;
  onMenu: () => void;
  onHome: () => void;
  onActivity: () => void;
  onAddProfile: () => void;
}) {
  return (
    <header className="db-topbar">
      <div className="db-top-left">
        <button
          type="button"
          className="db-menu-btn"
          onClick={onMenu}
          aria-label="Open dashboard menu"
        >
          <Menu size={18} />
        </button>
        <div>
          <p>Dashboard / {currentNavLabel(active)}</p>
          <h2>{currentNavLabel(active)}</h2>
        </div>
      </div>
      <div className="db-top-actions">
        <button type="button" className="db-home-btn" onClick={onHome}>
          <Home size={14} />
          Marketplace
        </button>
        <button
          type="button"
          className="db-icon-btn"
          onClick={onActivity}
          aria-label="Notifications"
        >
          <Bell size={16} />
          {notifications > 0 && <span />}
        </button>
        <button type="button" className="db-primary-btn" onClick={onAddProfile}>
          <CirclePlus size={15} />
          Add Profile
        </button>
        <div className="db-top-user">
          <span>{initials}</span>
          <strong>{userName}</strong>
        </div>
      </div>
    </header>
  );
}

function AccountSummary({
  account,
  onUpdateProfile,
}: {
  account: {
    fullName: string;
    email: string;
    role: string;
    country: string;
    joined: string;
    feedPreferences: string[];
  };
  onUpdateProfile: () => void;
}) {
  return (
    <section className="db-panel">
      <div className="db-panel-head">
        <div>
          <p className="db-eyebrow">Account Profile</p>
          <h2>{account.fullName}</h2>
          <p>{account.role} account configured for marketplace activity.</p>
        </div>
        <button
          type="button"
          className="db-secondary-btn"
          onClick={onUpdateProfile}
        >
          Update Profile
        </button>
      </div>
      <div className="db-account-grid">
        <div>
          <span>Email</span>
          <strong>{account.email || "Not available"}</strong>
        </div>
        <div>
          <span>Country</span>
          <strong>{account.country}</strong>
        </div>
        <div>
          <span>Date Joined</span>
          <strong>{account.joined}</strong>
        </div>
        <div>
          <span>Feed Preferences</span>
          <strong>{account.feedPreferences.join(", ")}</strong>
        </div>
      </div>
    </section>
  );
}

function OverviewContent({
  account,
  dashboard,
  onStartProfile,
  onOpenProfiles,
  onOpenActivity,
  onOpenAccount,
  onOpenPipeline,
}: {
  account: {
    firstName: string;
    fullName: string;
    email: string;
    role: string;
    country: string;
    joined: string;
    feedPreferences: string[];
  };
  dashboard: DashboardPayload;
  onStartProfile: (type: ProfileType) => void;
  onOpenProfiles: () => void;
  onOpenActivity: () => void;
  onOpenAccount: () => void;
  onOpenPipeline: () => void;
}) {
  const liveProfiles = dashboard.profiles.filter(
    (p) => p.status === "Live",
  ).length;

  return (
    <div className="db-content">
      <PageHeader
        eyebrow="M&A command center"
        title={`Welcome back, ${account.firstName}`}
        description="Manage sale profiles, acquisition mandates, franchise expansion, capital raises, enquiries, documents, and deal activity from one enterprise workspace."
      >
        <button
          type="button"
          className="db-secondary-btn dark"
          onClick={onOpenActivity}
        >
          Latest Activity
        </button>
        <button
          type="button"
          className="db-primary-btn amber"
          onClick={() => onStartProfile("SELL_BUSINESS")}
        >
          <CirclePlus size={15} />
          Add Profile
        </button>
      </PageHeader>

      <section className="db-stat-grid">
        <StatCard
          icon={UserRound}
          label="Created profiles"
          value={dashboard.profiles.length}
          detail={`${liveProfiles} live marketplace profiles`}
          trend="Portfolio"
          tone="blue"
          onClick={onOpenProfiles}
        />
        <StatCard
          icon={MessageSquare}
          label="Profile enquiries"
          value={dashboard.stats.enquiriesReceived}
          detail="Buyer and investor interest"
          trend="Active"
          tone="green"
        />
        <StatCard
          icon={Building2}
          label="Marketplace listings"
          value={dashboard.stats.activeListings}
          detail={`${dashboard.stats.profileViews} total profile views`}
          trend="Visible"
          tone="amber"
        />
        <StatCard
          icon={Database}
          label="Data room"
          value={dashboard.stats.documents}
          detail="Documents tracked across profiles"
          trend="Secure"
          tone="purple"
        />
      </section>

      <AccountSummary account={account} onUpdateProfile={onOpenAccount} />

      <section className="db-panel">
        <div className="db-panel-head">
          <div>
            <p className="db-eyebrow">Profile actions</p>
            <h2>What do you want to do?</h2>
            <p>
              Create multiple profiles for different business goals. Each
              profile can have its own listings, enquiries, data room, and
              activity history.
            </p>
          </div>
        </div>
        <div className="db-action-grid">
          {PROFILE_TYPES.map((item) => (
            <button
              key={item.type}
              type="button"
              className="db-action-card"
              style={{ borderTopColor: item.color }}
              onClick={() => onStartProfile(item.type)}
            >
              <span style={{ color: item.color }}>{item.short}</span>
              <strong>{item.title}</strong>
              <p>{item.description}</p>
              <ArrowUpRight size={15} />
            </button>
          ))}
        </div>
      </section>

      <section className="db-grid-2">
        <ProfilePanel
          profiles={dashboard.profiles.slice(0, 3)}
          onOpenProfiles={onOpenProfiles}
        />
        <ActivityPanel
          items={dashboard.latestActivity}
          onOpenActivity={onOpenActivity}
        />
      </section>

      <PostingsPanel postings={dashboard.marketPostings} />
      <PipelinePanel
        pipeline={dashboard.pipeline}
        onOpenPipeline={onOpenPipeline}
      />
      <DealsPanel deals={dashboard.deals} onOpenPipeline={onOpenPipeline} />
    </div>
  );
}

function ProfileCard({
  profile,
  compact = false,
}: {
  profile: DashboardProfile;
  compact?: boolean;
}) {
  const meta = getProfileTypeMeta(profile.type);

  return (
    <article className={cn("db-profile-card", compact && "compact")}>
      <div className="db-profile-card-top">
        <span
          className="db-profile-kind"
          style={{ background: `${meta.color}14`, color: meta.color }}
        >
          {meta.short}
        </span>
        <StatusBadge value={profile.status} />
      </div>
      <h3>{profile.title}</h3>
      <p>{profile.description}</p>
      <div className="db-profile-meta">
        <span>{profile.focus}</span>
        <span>{profile.country}</span>
      </div>
      <div className="db-profile-stats">
        <div>
          <strong>{profile.enquiries}</strong>
          <span>Enquiries</span>
        </div>
        <div>
          <strong>{profile.listings}</strong>
          <span>Listings</span>
        </div>
        <div>
          <strong>{profile.dealValue}</strong>
          <span>Value</span>
        </div>
      </div>
      <div className="db-progress-row">
        <div>
          <span>Completion</span>
          <strong>{profile.completion}%</strong>
        </div>
        <div>
          <span style={{ width: `${profile.completion}%` }} />
        </div>
      </div>
    </article>
  );
}

function ProfilePanel({
  profiles,
  onOpenProfiles,
}: {
  profiles: DashboardProfile[];
  onOpenProfiles: () => void;
}) {
  return (
    <section className="db-panel">
      <div className="db-panel-head">
        <div>
          <p className="db-eyebrow">Profile portfolio</p>
          <h2>Profiles created by you</h2>
          <p>Each profile works like a separate mandate.</p>
        </div>
        <button type="button" className="db-link-btn" onClick={onOpenProfiles}>
          Manage Profiles
        </button>
      </div>
      <div className="db-profile-list">
        {profiles.length ? (
          profiles.map((p) => <ProfileCard key={p.id} profile={p} compact />)
        ) : (
          <EmptyPanel label="No profiles created yet." />
        )}
      </div>
    </section>
  );
}

function ActivityPanel({
  items,
  onOpenActivity,
}: {
  items: DashboardActivity[];
  onOpenActivity: () => void;
}) {
  return (
    <section className="db-panel">
      <div className="db-panel-head">
        <div>
          <p className="db-eyebrow">Recent activity</p>
          <h2>Latest activity</h2>
          <p>Recent profile, enquiry, data room, and posting activity.</p>
        </div>
        <button type="button" className="db-link-btn" onClick={onOpenActivity}>
          View All
        </button>
      </div>
      <ActivityList items={items} />
    </section>
  );
}

function ProfilesContent({
  profiles,
  onStartProfile,
}: {
  profiles: DashboardProfile[];
  onStartProfile: (type: ProfileType) => void;
}) {
  return (
    <div className="db-content">
      <PageHeader
        eyebrow="Profile portfolio"
        title="My Profiles"
        description="Manage every profile you have created across sale, acquisition, franchise, investment, fundraise, and advisory workflows."
      >
        <button
          type="button"
          className="db-primary-btn amber"
          onClick={() => onStartProfile("SELL_BUSINESS")}
        >
          <CirclePlus size={15} />
          Add Another Profile
        </button>
      </PageHeader>
      <section className="db-profile-grid">
        {profiles.length ? (
          profiles.map((p) => <ProfileCard key={p.id} profile={p} />)
        ) : (
          <EmptyPanel label="Start by creating your first marketplace profile." />
        )}
      </section>
    </div>
  );
}

function AddProfileContent({
  draft,
  setDraft,
  onCreate,
  onSelectProfileType,
  saving,
  error,
}: {
  draft: ProfileDraft;
  setDraft: (d: ProfileDraft) => void;
  onCreate: (d: ProfileDraft) => void;
  onSelectProfileType: (type: ProfileType) => void;
  saving: boolean;
  error: string;
}) {
  const selectedMeta = getProfileTypeMeta(draft.type);
  const listingProfile = isListingProfile(draft.type);
  const update = <K extends keyof ProfileDraft>(
    key: K,
    value: ProfileDraft[K],
  ) => setDraft({ ...draft, [key]: value });
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onCreate(draft);
  };

  return (
    <div className="db-content">
      <PageHeader
        eyebrow="Add profile"
        title="Create a new business profile"
        description="Capture the right information upfront so buyers, investors, and advisors see a credible M&A profile."
      />
      <section className="db-add-layout">
        <section className="db-panel">
          <div className="db-panel-head">
            <div>
              <p className="db-eyebrow">Profile type</p>
              <h2>Select Profile Type</h2>
              <p>Choose the focus of this profile. You can add more later.</p>
            </div>
          </div>
          <div className="db-type-list">
            {PROFILE_TYPES.map((item) => (
              <button
                key={item.type}
                type="button"
                className={cn(
                  "db-type-option",
                  draft.type === item.type && "active",
                )}
                style={
                  draft.type === item.type ? { borderColor: item.color } : {}
                }
                onClick={() => {
                  if (
                    item.type === "FUNDING_SERVICE" ||
                    item.type === "STARTUP"
                  ) {
                    onSelectProfileType(item.type);
                    return;
                  }

                  setDraft({
                    ...initialProfileDraft(item.type),
                    title: draft.title,
                    country: draft.country,
                    industry: draft.industry,
                  });
                }}
              >
                <span
                  style={{ background: `${item.color}14`, color: item.color }}
                >
                  {item.short}
                </span>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="db-panel">
          <div className="db-panel-head">
            <div>
              <p className="db-eyebrow">Mandate details</p>
              <h2>{selectedMeta.title}</h2>
              <p>
                {listingProfile
                  ? "Complete a proper M&A intake with operations, financials, deal terms, and confidentiality."
                  : "Complete the mandate details for matching and marketplace visibility."}
              </p>
            </div>
          </div>

          {error && <p className="db-error">{error}</p>}

          <form className="db-profile-form" onSubmit={submit}>
            <FormSection
              eyebrow="Core profile"
              title="Business identity"
              description="These fields create the public profile headline and matching signals."
            >
              <label>
                Profile Title
                <input
                  value={draft.title}
                  onChange={(e) => update("title", e.target.value)}
                  placeholder="Example: Lagos fintech business for sale"
                  required
                />
              </label>
              <label>
                Business / Brand Name
                <input
                  value={draft.businessName || ""}
                  onChange={(e) => update("businessName", e.target.value)}
                  placeholder="Example: Payflow Africa"
                />
              </label>
              <label>
                Country / Region Focus
                <input
                  value={draft.country}
                  onChange={(e) => update("country", e.target.value)}
                  placeholder="Example: Nigeria, Ghana, Kenya"
                  required
                />
              </label>
              <label>
                City
                <input
                  value={draft.city || ""}
                  onChange={(e) => update("city", e.target.value)}
                  placeholder="Example: Lagos"
                />
              </label>
              <label>
                Industry / Sector
                <input
                  value={draft.industry}
                  onChange={(e) => update("industry", e.target.value)}
                  placeholder="Example: Fintech, logistics, healthcare"
                  required
                />
              </label>
              <label>
                Website
                <input
                  value={draft.website || ""}
                  onChange={(e) => update("website", e.target.value)}
                  placeholder="https://example.com"
                />
              </label>
              <label className="full">
                Headline
                <input
                  value={draft.headline || ""}
                  onChange={(e) => update("headline", e.target.value)}
                  placeholder="Example: Profitable B2B payments company with enterprise clients"
                />
              </label>
              <label className="full">
                Short Summary
                <textarea
                  value={draft.shortSummary || ""}
                  onChange={(e) => update("shortSummary", e.target.value)}
                  placeholder="A concise teaser summary for qualified buyers and investors."
                  rows={3}
                />
              </label>
              <label className="full">
                Full Description
                <textarea
                  value={draft.description}
                  onChange={(e) => update("description", e.target.value)}
                  placeholder="Describe what this profile is for and who should contact you."
                  rows={5}
                  required
                />
              </label>
            </FormSection>

            {listingProfile && (
              <>
                <FormSection
                  eyebrow="Deal structure"
                  title="Transaction terms"
                  description="Capture the ask, deal type, valuation logic, and preferred counterparty."
                >
                  <label>
                    Deal Type
                    <select
                      className="db-select"
                      value={
                        draft.dealType || defaultDealTypeForProfile(draft.type)
                      }
                      onChange={(e) =>
                        update("dealType", e.target.value as DealType)
                      }
                    >
                      <option value="FULL_SALE">Full Sale</option>
                      <option value="PARTIAL_STAKE">Partial Stake</option>
                      <option value="BUSINESS_LOAN">Business Loan</option>
                      <option value="INVESTMENT">Investment</option>
                    </select>
                  </label>
                  <label>
                    Currency
                    <input
                      value={draft.currency || "USD"}
                      onChange={(e) =>
                        update("currency", e.target.value.toUpperCase())
                      }
                      placeholder="USD"
                      maxLength={5}
                    />
                  </label>
                  <label>
                    Deal Size / Investment Range
                    <input
                      value={draft.investmentRange}
                      onChange={(e) =>
                        update("investmentRange", e.target.value)
                      }
                      placeholder="Example: USD 500K - 5M"
                      required
                    />
                  </label>
                  <label>
                    Asking Price / Capital Required
                    <input
                      type="number"
                      value={draft.askAmount ?? ""}
                      onChange={(e) => update("askAmount", e.target.value)}
                      placeholder="1500000"
                    />
                  </label>
                  <label>
                    Equity Offered %
                    <input
                      type="number"
                      value={draft.askPercent ?? ""}
                      onChange={(e) => update("askPercent", e.target.value)}
                      placeholder="Optional"
                    />
                  </label>
                  <label>
                    Interest Rate %
                    <input
                      type="number"
                      value={draft.askRate ?? ""}
                      onChange={(e) => update("askRate", e.target.value)}
                      placeholder="Optional for debt"
                    />
                  </label>
                  <label>
                    Valuation Method
                    <input
                      value={draft.valuationMethod || ""}
                      onChange={(e) =>
                        update("valuationMethod", e.target.value)
                      }
                      placeholder="Example: 3.5x EBITDA, DCF, asset-based"
                    />
                  </label>
                  <label>
                    Preferred Buyer Type
                    <input
                      value={draft.preferredBuyerType || ""}
                      onChange={(e) =>
                        update("preferredBuyerType", e.target.value)
                      }
                      placeholder="Strategic buyer, PE fund, operator, family office"
                    />
                  </label>
                  <label className="full">
                    Asking Price Reason
                    <textarea
                      value={draft.askingPriceReason || ""}
                      onChange={(e) =>
                        update("askingPriceReason", e.target.value)
                      }
                      placeholder="Explain how the asking price was derived."
                      rows={3}
                    />
                  </label>
                  <label className="full">
                    Deal Structure Notes
                    <textarea
                      value={draft.dealStructureNotes || ""}
                      onChange={(e) =>
                        update("dealStructureNotes", e.target.value)
                      }
                      placeholder="Preferred structure, payment terms, earn-out, minority stake terms, or debt expectations."
                      rows={3}
                    />
                  </label>
                </FormSection>

                <FormSection
                  eyebrow="Financial snapshot"
                  title="Revenue, profit, and assets"
                  description="These numbers help buyers understand scale before due diligence."
                >
                  <label>
                    Annual Revenue
                    <input
                      type="number"
                      value={draft.runSales ?? ""}
                      onChange={(e) => update("runSales", e.target.value)}
                      placeholder="Example: 2500000"
                    />
                  </label>
                  <label>
                    Gross Revenue
                    <input
                      type="number"
                      value={draft.grossRevenue ?? ""}
                      onChange={(e) => update("grossRevenue", e.target.value)}
                      placeholder="Optional"
                    />
                  </label>
                  <label>
                    EBITDA
                    <input
                      type="number"
                      value={draft.ebitda ?? ""}
                      onChange={(e) => update("ebitda", e.target.value)}
                      placeholder="Optional"
                    />
                  </label>
                  <label>
                    EBITDA Margin %
                    <input
                      type="number"
                      value={draft.ebitdaMargin ?? ""}
                      onChange={(e) => update("ebitdaMargin", e.target.value)}
                      placeholder="Optional"
                    />
                  </label>
                  <label>
                    Net Profit
                    <input
                      type="number"
                      value={draft.netProfit ?? ""}
                      onChange={(e) => update("netProfit", e.target.value)}
                      placeholder="Optional"
                    />
                  </label>
                  <label>
                    Monthly Profit
                    <input
                      type="number"
                      value={draft.monthlyProfit ?? ""}
                      onChange={(e) => update("monthlyProfit", e.target.value)}
                      placeholder="Optional"
                    />
                  </label>
                  <label>
                    Monthly Revenue
                    <input
                      type="number"
                      value={draft.monthlyRevenue ?? ""}
                      onChange={(e) => update("monthlyRevenue", e.target.value)}
                      placeholder="Optional"
                    />
                  </label>
                  <label>
                    Inventory Value
                    <input
                      type="number"
                      value={draft.inventoryValue ?? ""}
                      onChange={(e) => update("inventoryValue", e.target.value)}
                      placeholder="Optional"
                    />
                  </label>
                  <label>
                    Asset Value
                    <input
                      type="number"
                      value={draft.assetValue ?? ""}
                      onChange={(e) => update("assetValue", e.target.value)}
                      placeholder="Optional"
                    />
                  </label>
                  <label>
                    Real Estate Value
                    <input
                      type="number"
                      value={draft.realEstateValue ?? ""}
                      onChange={(e) =>
                        update("realEstateValue", e.target.value)
                      }
                      placeholder="Optional"
                    />
                  </label>
                </FormSection>

                <FormSection
                  eyebrow="Operations"
                  title="How the business works"
                  description="Describe the operating model, team, customers, and growth levers."
                >
                  <label>
                    Established Year
                    <input
                      type="number"
                      value={draft.established ?? ""}
                      onChange={(e) => update("established", e.target.value)}
                      placeholder="Example: 2018"
                    />
                  </label>
                  <label>
                    Employees
                    <input
                      type="number"
                      value={draft.employees ?? ""}
                      onChange={(e) => update("employees", e.target.value)}
                      placeholder="Example: 24"
                    />
                  </label>
                  <label>
                    Outlets / Locations
                    <input
                      type="number"
                      value={draft.outlets ?? ""}
                      onChange={(e) => update("outlets", e.target.value)}
                      placeholder="Optional"
                    />
                  </label>
                  <label>
                    Legal Entity Name
                    <input
                      value={draft.legalEntityName || ""}
                      onChange={(e) =>
                        update("legalEntityName", e.target.value)
                      }
                      placeholder="Optional"
                    />
                  </label>
                  <label className="full">
                    Business Model
                    <textarea
                      value={draft.businessModel || ""}
                      onChange={(e) => update("businessModel", e.target.value)}
                      placeholder="How does the business make money?"
                      rows={3}
                    />
                  </label>
                  <label className="full">
                    Products / Services
                    <textarea
                      value={draft.productsServices || ""}
                      onChange={(e) =>
                        update("productsServices", e.target.value)
                      }
                      placeholder="Main products, services, SKUs, or revenue lines."
                      rows={3}
                    />
                  </label>
                  <label className="full">
                    Customer Base
                    <textarea
                      value={draft.customerBase || ""}
                      onChange={(e) => update("customerBase", e.target.value)}
                      placeholder="Customer segments, concentration, recurring revenue, geographies."
                      rows={3}
                    />
                  </label>
                  <label className="full">
                    Key Clients
                    <textarea
                      value={draft.keyClients || ""}
                      onChange={(e) => update("keyClients", e.target.value)}
                      placeholder="Mention named clients only if you can disclose them."
                      rows={3}
                    />
                  </label>
                  <label className="full">
                    Competitive Advantages
                    <textarea
                      value={draft.competitiveAdvantages || ""}
                      onChange={(e) =>
                        update("competitiveAdvantages", e.target.value)
                      }
                      placeholder="Moat, licenses, contracts, IP, distribution, team, brand."
                      rows={3}
                    />
                  </label>
                  <label className="full">
                    Growth Opportunities
                    <textarea
                      value={draft.growthOpportunities || ""}
                      onChange={(e) =>
                        update("growthOpportunities", e.target.value)
                      }
                      placeholder="Expansion opportunities a buyer or investor can unlock."
                      rows={3}
                    />
                  </label>
                  <label className="full">
                    Facilities
                    <textarea
                      value={draft.facilities || ""}
                      onChange={(e) => update("facilities", e.target.value)}
                      placeholder="Office, warehouse, factory, branches, equipment, property."
                      rows={3}
                    />
                  </label>
                  <label className="full">
                    Lease Terms
                    <textarea
                      value={draft.leaseTerms || ""}
                      onChange={(e) => update("leaseTerms", e.target.value)}
                      placeholder="Lease duration, renewals, rent obligations, owned property details."
                      rows={3}
                    />
                  </label>
                </FormSection>

                <FormSection
                  eyebrow="Sale readiness"
                  title="Transition and diligence"
                  description="Explain what is included and how ready the transaction is."
                >
                  <label className="full">
                    Reason For Selling
                    <textarea
                      value={draft.reasonForSelling || ""}
                      onChange={(e) =>
                        update("reasonForSelling", e.target.value)
                      }
                      placeholder="Retirement, strategic partner, growth capital, relocation, portfolio exit."
                      rows={3}
                    />
                  </label>
                  <label className="full">
                    Assets Included
                    <textarea
                      value={draft.assetsIncluded || ""}
                      onChange={(e) => update("assetsIncluded", e.target.value)}
                      placeholder="Assets, inventory, IP, contracts, equipment, licenses, domains, property."
                      rows={3}
                    />
                  </label>
                  <label className="full">
                    Transition Support
                    <textarea
                      value={draft.transitionSupport || ""}
                      onChange={(e) =>
                        update("transitionSupport", e.target.value)
                      }
                      placeholder="Founder handover period, training, consulting support, management retention."
                      rows={3}
                    />
                  </label>
                  <label className="db-check">
                    <input
                      type="checkbox"
                      checked={Boolean(draft.sellerFinancing)}
                      onChange={(e) =>
                        update("sellerFinancing", e.target.checked)
                      }
                    />
                    <span>Seller financing available</span>
                  </label>
                  <label className="db-check">
                    <input
                      type="checkbox"
                      checked={Boolean(draft.trainingIncluded)}
                      onChange={(e) =>
                        update("trainingIncluded", e.target.checked)
                      }
                    />
                    <span>Training included</span>
                  </label>
                </FormSection>

                <FormSection
                  eyebrow="Confidentiality"
                  title="Data room controls"
                  description="Set the trust and disclosure posture before the listing goes live."
                >
                  <label className="full">
                    Public Teaser Summary
                    <textarea
                      value={draft.teaserSummary || ""}
                      onChange={(e) => update("teaserSummary", e.target.value)}
                      placeholder="Short non-confidential teaser shown before NDA or full diligence."
                      rows={3}
                    />
                  </label>
                  <label className="db-check">
                    <input
                      type="checkbox"
                      checked={draft.isConfidential !== false}
                      onChange={(e) =>
                        update("isConfidential", e.target.checked)
                      }
                    />
                    <span>Keep listing confidential</span>
                  </label>
                  <label className="db-check">
                    <input
                      type="checkbox"
                      checked={draft.ndaRequired !== false}
                      onChange={(e) => update("ndaRequired", e.target.checked)}
                    />
                    <span>NDA required before detailed diligence</span>
                  </label>
                  <label className="db-check">
                    <input
                      type="checkbox"
                      checked={Boolean(draft.financialsAvailable)}
                      onChange={(e) =>
                        update("financialsAvailable", e.target.checked)
                      }
                    />
                    <span>Financial documents are available</span>
                  </label>
                  <label className="db-check">
                    <input
                      type="checkbox"
                      checked={Boolean(draft.dataRoomReady)}
                      onChange={(e) =>
                        update("dataRoomReady", e.target.checked)
                      }
                    />
                    <span>Data room is ready</span>
                  </label>
                </FormSection>
              </>
            )}

            <div className="db-form-actions">
              <button
                type="submit"
                className="db-primary-btn"
                disabled={saving}
              >
                {saving ? "Saving..." : "Create Profile"}
              </button>
            </div>
          </form>
        </section>
      </section>
    </div>
  );
}

function ActivityList({ items }: { items: DashboardActivity[] }) {
  if (!items.length) return <EmptyPanel label="No activity yet." />;

  return (
    <div className="db-activity-list">
      {items.map((item) => (
        <article key={`${item.title}-${item.time}`} className="db-activity">
          <span className="db-activity-dot" />
          <div>
            <strong>{item.title}</strong>
            <p>{item.detail}</p>
            <em>{item.type}</em>
          </div>
          <time>{item.time}</time>
        </article>
      ))}
    </div>
  );
}

function PostingsPanel({ postings }: { postings: DashboardPosting[] }) {
  return (
    <section className="db-panel">
      <div className="db-panel-head">
        <div>
          <p className="db-eyebrow">Marketplace feed</p>
          <h2>Latest Business Postings</h2>
          <p>
            Marketplace feed based on your profile preferences and country
            focus.
          </p>
        </div>
        <a className="db-link-btn" href="/businesses-for-sale">
          Open Marketplace Feed
        </a>
      </div>
      <div className="db-posting-grid">
        {postings.length ? (
          postings.map((p) => (
            <article key={p.id} className="db-posting">
              <span>{p.tag}</span>
              <h3>{p.title}</h3>
              <p>
                {p.sector} - {p.location}
              </p>
              <strong>{p.value}</strong>
              <a
                href={
                  p.slug
                    ? `/businesses-for-sale/${p.slug}`
                    : "/businesses-for-sale"
                }
              >
                View Posting
              </a>
            </article>
          ))
        ) : (
          <EmptyPanel label="No active marketplace postings yet." />
        )}
      </div>
    </section>
  );
}

function PipelinePanel({
  pipeline,
  onOpenPipeline,
}: {
  pipeline: PipelineStage[];
  onOpenPipeline?: () => void;
}) {
  const max = Math.max(1, ...pipeline.map((s) => s.count));

  return (
    <section className="db-panel">
      <div className="db-panel-head">
        <div>
          <p className="db-eyebrow">Deal flow</p>
          <h2>Deal Pipeline</h2>
          <p>
            Stage distribution across active mandates and acquisition
            conversations.
          </p>
        </div>
        {onOpenPipeline && (
          <button
            type="button"
            className="db-link-btn"
            onClick={onOpenPipeline}
          >
            View Pipeline
          </button>
        )}
      </div>
      <div className="db-pipeline">
        {pipeline.map((stage) => (
          <div key={stage.label} className="db-stage">
            <div className="db-stage-head">
              <span style={{ background: stage.color }} />
              <p>{stage.label}</p>
            </div>
            <strong style={{ color: stage.color }}>{stage.count}</strong>
            <small>{stage.value}</small>
            <div className="db-stage-track">
              <div
                style={{
                  width: `${(stage.count / max) * 100}%`,
                  background: stage.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function DealsPanel({
  deals,
  onOpenPipeline,
}: {
  deals: DashboardDeal[];
  onOpenPipeline?: () => void;
}) {
  return (
    <section className="db-panel">
      <div className="db-panel-head">
        <div>
          <p className="db-eyebrow">Priority deals</p>
          <h2>Active Opportunities</h2>
          <p>Most active opportunities requiring attention from your team.</p>
        </div>
        {onOpenPipeline && (
          <button
            type="button"
            className="db-link-btn"
            onClick={onOpenPipeline}
          >
            View All Deals
          </button>
        )}
      </div>
      <DealTable deals={deals} />
    </section>
  );
}

function ActivityContent({
  activity,
  postings,
}: {
  activity: DashboardActivity[];
  postings: DashboardPosting[];
}) {
  return (
    <div className="db-content">
      <PageHeader
        eyebrow="Activity feed"
        title="Latest activity and business postings"
        description="Track new enquiries, profile changes, data room events, and marketplace opportunities."
      />
      <section className="db-grid-2">
        <ActivityPanel items={activity} onOpenActivity={() => undefined} />
        <PostingsPanel postings={postings} />
      </section>
    </div>
  );
}

function AccountContent({
  account,
  onSave,
  saving,
}: {
  account: {
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    role: string;
    country: string;
    joined: string;
    feedPreferences: string[];
  };
  onSave: (payload: {
    firstName: string;
    lastName: string;
    country: string;
  }) => void;
  saving: boolean;
}) {
  const [firstName, setFirstName] = useState(account.firstName);
  const [lastName, setLastName] = useState(account.lastName);
  const [country, setCountry] = useState(account.country);

  useEffect(() => {
    setFirstName(account.firstName);
    setLastName(account.lastName);
    setCountry(account.country);
  }, [account.firstName, account.lastName, account.country]);

  return (
    <div className="db-content">
      <PageHeader
        eyebrow="Account info"
        title="User information and feed preferences"
        description="Update country, contact details, and marketplace visibility signals."
      />
      <AccountSummary account={account} onUpdateProfile={() => undefined} />
      <section className="db-panel">
        <div className="db-panel-head">
          <div>
            <p className="db-eyebrow">Profile details</p>
            <h2>Update Profile</h2>
            <p>Changes are saved to the authenticated user API.</p>
          </div>
        </div>
        <form
          className="db-profile-form"
          onSubmit={(e) => {
            e.preventDefault();
            onSave({ firstName, lastName, country });
          }}
        >
          <label>
            First Name
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </label>
          <label>
            Last Name
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </label>
          <label>
            Email
            <input value={account.email} disabled />
          </label>
          <label>
            Country
            <input
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
          </label>
          <div className="db-form-actions">
            <button type="submit" className="db-primary-btn" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function DealTable({ deals }: { deals: DashboardDeal[] }) {
  if (!deals.length) return <EmptyPanel label="No active deals yet." />;

  return (
    <div className="db-table-wrap">
      <table className="db-table">
        <thead>
          <tr>
            <th>Deal</th>
            <th>Company</th>
            <th>Sector</th>
            <th>Revenue</th>
            <th>EBITDA</th>
            <th>Valuation</th>
            <th>Stage</th>
            <th>Owner</th>
            <th>Probability</th>
            <th>Updated</th>
          </tr>
        </thead>
        <tbody>
          {deals.map((deal) => (
            <tr key={deal.id} className={deal.status}>
              <td>
                <strong className="db-id">{deal.id.slice(0, 8)}</strong>
              </td>
              <td>
                <div className="db-company">
                  <strong>{deal.company}</strong>
                  <span>{deal.location}</span>
                </div>
              </td>
              <td>
                <span className="db-sector">{deal.sector}</span>
              </td>
              <td>{deal.revenue}</td>
              <td>{deal.ebitda}</td>
              <td>
                <strong className="db-money">{deal.valuation}</strong>
              </td>
              <td>
                <span className="db-stage-badge">{deal.stage}</span>
              </td>
              <td>{deal.owner}</td>
              <td>
                <div className="db-prob">
                  <div>
                    <span style={{ width: `${deal.probability}%` }} />
                  </div>
                  <b>{deal.probability}%</b>
                </div>
              </td>
              <td>{deal.updated}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ListingsContent({
  listings,
  loading,
  onSubmit,
  onDelete,
}: {
  listings: BusinessListing[];
  loading: boolean;
  onSubmit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="db-content">
      <PageHeader
        eyebrow="Listing operations"
        title="My Listings"
        description="Manage business sale, franchise, and capital raise listings created from your profiles."
      />
      <section className="db-panel">
        <div className="db-panel-head">
          <div>
            <p className="db-eyebrow">Owned supply</p>
            <h2>Listings you control</h2>
            <p>
              Submit drafts for review, track status, and manage marketplace
              visibility.
            </p>
          </div>
        </div>

        {loading ? (
          <EmptyPanel label="Loading listings..." />
        ) : listings.length ? (
          <div className="db-table-wrap">
            <table className="db-table">
              <thead>
                <tr>
                  <th>Listing</th>
                  <th>Type</th>
                  <th>Industry</th>
                  <th>Location</th>
                  <th>Ask</th>
                  <th>Revenue</th>
                  <th>Team</th>
                  <th>Status</th>
                  <th>Enquiries</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((listing) => (
                  <tr key={listing.id}>
                    <td>
                      <div className="db-company">
                        <strong>{listing.title}</strong>
                        <span>{listing.slug}</span>
                      </div>
                    </td>
                    <td>
                      <span className="db-sector">
                        {formatEnum(listing.profileType)}
                      </span>
                    </td>
                    <td>{listing.industry}</td>
                    <td>
                      {[listing.city, listing.country]
                        .filter(Boolean)
                        .join(", ")}
                    </td>
                    <td>
                      <strong className="db-money">
                        {formatMoney(listing.askAmount, listing.currency)}
                      </strong>
                    </td>
                    <td>
                      {formatMoney(
                        listing.runSales ?? listing.grossRevenue,
                        listing.currency,
                      )}
                    </td>
                    <td>
                      {listing.employees
                        ? `${listing.employees} employees`
                        : "Not disclosed"}
                    </td>
                    <td>
                      <StatusBadge value={listing.status} />
                    </td>
                    <td>
                      {listing.enquiryCount ?? listing._count?.deals ?? 0}
                    </td>
                    <td>
                      <div className="db-table-actions">
                        {["DRAFT", "REJECTED"].includes(listing.status) && (
                          <button
                            className="db-small-btn"
                            type="button"
                            onClick={() => onSubmit(listing.id)}
                          >
                            Submit
                          </button>
                        )}
                        <a
                          className="db-small-btn ghost"
                          href={`/businesses-for-sale/${listing.slug}`}
                        >
                          View
                        </a>
                        <button
                          className="db-small-btn danger"
                          type="button"
                          onClick={() => onDelete(listing.id)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyPanel label="No listings yet. Create a sell-side, franchise, or capital raise profile first." />
        )}
      </section>
    </div>
  );
}

function OpportunitiesContent({
  opportunities,
  selectedId,
  message,
  saving,
  onSelect,
  onMessageChange,
  onSend,
}: {
  opportunities: BusinessListing[];
  selectedId: string;
  message: string;
  saving: boolean;
  onSelect: (id: string) => void;
  onMessageChange: (value: string) => void;
  onSend: (businessId: string) => void;
}) {
  return (
    <div className="db-content">
      <PageHeader
        eyebrow="Marketplace opportunities"
        title="Opportunities"
        description="Browse active marketplace postings and send structured enquiries directly into your deal pipeline."
      />
      <section className="db-panel">
        <div className="db-posting-grid">
          {opportunities.length ? (
            opportunities.map((item) => (
              <article key={item.id} className="db-posting">
                <span>{formatEnum(item.profileType)}</span>
                <h3>{item.title}</h3>
                <p>
                  {item.industry} -{" "}
                  {[item.city, item.country].filter(Boolean).join(", ")}
                </p>
                <strong>{formatMoney(item.askAmount, item.currency)}</strong>
                <button
                  className="db-link-btn"
                  type="button"
                  onClick={() => onSelect(item.id)}
                >
                  Send Enquiry
                </button>
                {selectedId === item.id && (
                  <form
                    className="db-inline-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      onSend(item.id);
                    }}
                  >
                    <textarea
                      className="db-textarea"
                      value={message}
                      onChange={(e) => onMessageChange(e.target.value)}
                      placeholder="Introduce yourself and explain your interest. Minimum 20 characters."
                      rows={4}
                    />
                    <button
                      className="db-primary-btn"
                      type="submit"
                      disabled={saving}
                    >
                      <Send size={14} />
                      {saving ? "Sending..." : "Send Enquiry"}
                    </button>
                  </form>
                )}
              </article>
            ))
          ) : (
            <EmptyPanel label="No marketplace opportunities returned yet." />
          )}
        </div>
      </section>
    </div>
  );
}

function EnquiriesContent({
  conversations,
  selectedDealId,
  messages,
  messageDraft,
  loadingMessages,
  sending,
  currentUserId,
  onSelectConversation,
  onMessageChange,
  onSendMessage,
  onRefresh,
}: {
  conversations: MarketplaceConversation[];
  selectedDealId: string;
  messages: MarketplaceMessage[];
  messageDraft: string;
  loadingMessages: boolean;
  sending: boolean;
  currentUserId: string;
  onSelectConversation: (dealId: string) => void;
  onMessageChange: (value: string) => void;
  onSendMessage: () => void;
  onRefresh: () => void;
}) {
  const active = conversations.find((item) => item.id === selectedDealId);

  return (
    <div className="db-content">
      <PageHeader
        eyebrow="Deal conversations"
        title="Enquiries & Messages"
        description="View enquiries, continue buyer/seller conversations, and keep deal communication tied to the pipeline."
      >
        <button
          className="db-secondary-btn dark"
          type="button"
          onClick={onRefresh}
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </PageHeader>

      <section className="db-split-grid">
        <div className="db-panel">
          <div className="db-panel-head">
            <div>
              <p className="db-eyebrow">Inbox</p>
              <h2>Conversations</h2>
              <p>{conversations.length} active enquiry threads.</p>
            </div>
          </div>
          <div className="db-conversation-list">
            {conversations.length ? (
              conversations.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={cn(
                    "db-conversation",
                    selectedDealId === item.id && "active",
                  )}
                  onClick={() => onSelectConversation(item.id)}
                >
                  <div>
                    <strong>
                      {item.business?.title || "Confidential deal"}
                    </strong>
                    <span>
                      {personName(item.counterparty)} -{" "}
                      {formatEnum(item.status)}
                    </span>
                  </div>
                  {item.unreadCount > 0 && <b>{item.unreadCount}</b>}
                </button>
              ))
            ) : (
              <EmptyPanel label="No enquiries yet." />
            )}
          </div>
        </div>

        <div className="db-panel db-chat-panel">
          <div className="db-panel-head">
            <div>
              <p className="db-eyebrow">Message thread</p>
              <h2>{active?.business?.title || "Select a conversation"}</h2>
              <p>
                {active
                  ? `${personName(active.counterparty)} - ${formatEnum(active.status)}`
                  : "Choose a conversation to open messages."}
              </p>
            </div>
          </div>
          <div className="db-chat-window">
            {loadingMessages ? (
              <EmptyPanel label="Loading messages..." />
            ) : messages.length ? (
              messages.map((message) => {
                const sender = message.sender as
                  | { id?: string; firstName?: string; lastName?: string }
                  | undefined;
                const senderId =
                  (message as { senderId?: string }).senderId || sender?.id;
                const isMine = Boolean(
                  currentUserId && senderId === currentUserId,
                );

                return (
                  <article
                    key={message.id}
                    className={cn("db-chat-message", isMine && "mine")}
                  >
                    <strong>{isMine ? "You" : personName(sender)}</strong>
                    <p>{message.content}</p>
                    <time>{new Date(message.createdAt).toLocaleString()}</time>
                  </article>
                );
              })
            ) : (
              <EmptyPanel
                label={
                  selectedDealId
                    ? "No messages in this thread yet."
                    : "Select a conversation."
                }
              />
            )}
          </div>
          <form
            className="db-chat-form"
            onSubmit={(e) => {
              e.preventDefault();
              onSendMessage();
            }}
          >
            <textarea
              className="db-textarea"
              value={messageDraft}
              onChange={(e) => onMessageChange(e.target.value)}
              placeholder="Write a message..."
              rows={3}
              disabled={!selectedDealId}
            />
            <button
              className="db-primary-btn"
              type="submit"
              disabled={!selectedDealId || sending}
            >
              <Send size={14} />
              {sending ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

function PipelineContent({
  pipeline,
  dashboardDeals,
  deals,
  onAdvance,
  onSignNda,
  onWithdraw,
}: {
  pipeline: PipelineStage[];
  dashboardDeals: DashboardDeal[];
  deals: DealListItem[];
  onAdvance: (dealId: string, status: DealStatus) => void;
  onSignNda: (dealId: string) => void;
  onWithdraw: (dealId: string) => void;
}) {
  return (
    <div className="db-content">
      <PipelinePanel pipeline={pipeline} />
      <DealsPanel deals={dashboardDeals} />
      <section className="db-panel">
        <div className="db-panel-head">
          <div>
            <p className="db-eyebrow">Deal actions</p>
            <h2>Manage active deal stages</h2>
            <p>
              Advance deal status, sign NDA, or withdraw inactive opportunities.
            </p>
          </div>
        </div>
        {deals.length ? (
          <div className="db-table-wrap">
            <table className="db-table">
              <thead>
                <tr>
                  <th>Business</th>
                  <th>Counterparty</th>
                  <th>Status</th>
                  <th>Messages</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {deals.map((deal) => (
                  <tr key={deal.id}>
                    <td>
                      <strong>
                        {deal.business?.title || "Confidential business"}
                      </strong>
                    </td>
                    <td>{personName(deal.initiator)}</td>
                    <td>
                      <StatusBadge value={deal.status} />
                    </td>
                    <td>{deal._count?.messages ?? 0}</td>
                    <td>
                      <div className="db-table-actions">
                        {deal.status === "NDA_SENT" && (
                          <button
                            className="db-small-btn"
                            type="button"
                            onClick={() => onSignNda(deal.id)}
                          >
                            <CheckCircle2 size={13} />
                            Sign NDA
                          </button>
                        )}
                        {NEXT_STATUSES[deal.status]
                          .filter(
                            (s) => s !== "WITHDRAWN" && s !== "NDA_SIGNED",
                          )
                          .map((status) => (
                            <button
                              key={status}
                              className="db-small-btn"
                              type="button"
                              onClick={() => onAdvance(deal.id, status)}
                            >
                              Move to {formatEnum(status)}
                            </button>
                          ))}
                        {!["CLOSED", "WITHDRAWN"].includes(deal.status) && (
                          <button
                            className="db-small-btn danger"
                            type="button"
                            onClick={() => onWithdraw(deal.id)}
                          >
                            Withdraw
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyPanel label="No active deal records yet." />
        )}
      </section>
    </div>
  );
}

function DocumentsContent({
  documents,
  saving,
  onUpload,
  onDelete,
}: {
  documents: Array<DocumentUploadPayload | DashboardDocument>;
  saving: boolean;
  onUpload: (payload: {
    file: File;
    type: string;
    access: DocumentAccess;
  }) => void;
  onDelete: (id: string) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState("General");
  const [access, setAccess] = useState<DocumentAccess>("DATA_ROOM");

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) return;
    onUpload({ file, type, access });
    setFile(null);
  };

  return (
    <div className="db-content">
      <PageHeader
        eyebrow="Data room"
        title="Documents"
        description="Upload and manage documents attached to your profiles, listings, and deal rooms."
      />

      <section className="db-panel">
        <div className="db-panel-head">
          <div>
            <p className="db-eyebrow">Upload</p>
            <h2>Add document</h2>
            <p>Upload teaser, financial, legal, valuation, or NDA files.</p>
          </div>
        </div>
        <form className="db-profile-form" onSubmit={submit}>
          <label>
            Document Type
            <input
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="Financials, Teaser, NDA..."
            />
          </label>
          <label>
            Access
            <select
              className="db-select"
              value={access}
              onChange={(e) => setAccess(e.target.value as DocumentAccess)}
            >
              <option value="DATA_ROOM">Data Room</option>
              <option value="PUBLIC_TEASER">Public Teaser</option>
              <option value="RESTRICTED">Restricted</option>
            </select>
          </label>
          <label className="full">
            File
            <input
              type="file"
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setFile(e.target.files?.[0] || null)
              }
            />
          </label>
          <div className="db-form-actions">
            <button
              className="db-primary-btn"
              type="submit"
              disabled={saving || !file}
            >
              <Upload size={14} />
              {saving ? "Uploading..." : "Upload Document"}
            </button>
          </div>
        </form>
      </section>

      <section className="db-panel">
        <div className="db-doc-list">
          {documents.length ? (
            documents.map((doc) => {
              const status = "status" in doc ? doc.status : "Pending";
              const isRaw = "access" in doc && String(doc.access).includes("_");

              return (
                <div key={doc.id} className="db-doc">
                  <div className="db-doc-icon">
                    {doc.type.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3>{doc.name}</h3>
                    <p>
                      {doc.type} -{" "}
                      {isRaw
                        ? formatEnum(String(doc.access))
                        : String(doc.access)}
                    </p>
                  </div>
                  <span
                    className={
                      String(status).toUpperCase() === "VERIFIED" ||
                      status === "Verified"
                        ? "ok"
                        : "pending"
                    }
                  >
                    {formatEnum(String(status))}
                  </span>
                  {"url" in doc && doc.url && (
                    <a
                      className="db-small-btn ghost"
                      href={doc.url}
                      target="_blank"
                    >
                      Open
                    </a>
                  )}
                  <button
                    className="db-small-btn danger"
                    type="button"
                    onClick={() => onDelete(doc.id)}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })
          ) : (
            <EmptyPanel label="No documents uploaded yet." />
          )}
        </div>
      </section>
    </div>
  );
}

function StartupsContent({
  startups,
  draft,
  setDraft,
  saving,
  error,
  onCreate,
  onSubmit,
  onDelete,
}: {
  startups: StartupListing[];
  draft: CreateStartupPayload;
  setDraft: (draft: CreateStartupPayload) => void;
  saving: boolean;
  error: string;
  onCreate: (payload: CreateStartupPayload) => void;
  onSubmit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const update = <K extends keyof CreateStartupPayload>(
    key: K,
    value: CreateStartupPayload[K],
  ) => setDraft({ ...draft, [key]: value });

  const optionalNumber = (value: string) =>
    value === "" ? undefined : Number(value);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    onCreate({
      ...draft,
      industry: draft.startupCategory || draft.industry,
      currency: draft.currency.toUpperCase(),
      askAmount: Number(draft.fundingNeeded || draft.askAmount || 0),
      fundingNeeded: draft.fundingNeeded
        ? Number(draft.fundingNeeded)
        : undefined,
      imageUrls: draft.imageUrls || [],
      dealType: draft.dealType || "INVESTMENT",
    });
  };

  return (
    <div className="db-content">
      <PageHeader
        eyebrow="Startup marketplace"
        title="My Startups"
        description="Create, manage, and submit startup ideas, MVPs, early-stage ventures, and project opportunities for marketplace review."
      >
        <a className="db-secondary-btn dark" href="/startups">
          View Public Page
        </a>
      </PageHeader>

      <section className="db-panel">
        <div className="db-panel-head">
          <div>
            <p className="db-eyebrow">Create startup</p>
            <h2>Post a Startup Idea</h2>
            <p>
              Use the same category, stage, and location values that visitors
              use to filter the public Startups page.
            </p>
          </div>
        </div>

        {error && <p className="db-error">{error}</p>}

        <form className="db-profile-form" onSubmit={submit}>
          <label>
            Startup Title
            <input
              value={draft.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="Example: AI bookkeeping assistant for SMEs"
              required
            />
          </label>

          <label>
            Startup / Project Type
            <select
              className="db-select"
              value={draft.startupType}
              onChange={(e) => update("startupType", e.target.value)}
              required
            >
              {STARTUP_TYPES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label>
            Category
            <select
              className="db-select"
              value={draft.startupCategory}
              onChange={(e) => {
                update("startupCategory", e.target.value);
                update("industry", e.target.value);
              }}
              required
            >
              {STARTUP_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label>
            Stage
            <select
              className="db-select"
              value={draft.startupStage || ""}
              onChange={(e) => update("startupStage", e.target.value)}
              required
            >
              {STARTUP_STAGES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label>
            Country
            <select
              className="db-select"
              value={draft.country}
              onChange={(e) => update("country", e.target.value)}
              required
            >
              {STARTUP_COUNTRIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label>
            City
            <input
              value={draft.city || ""}
              onChange={(e) => update("city", e.target.value)}
              placeholder="Example: Lagos"
            />
          </label>

          <label>
            Brand / Project Name
            <input
              value={draft.businessName || ""}
              onChange={(e) => update("businessName", e.target.value)}
              placeholder="Example: LedgerPilot"
            />
          </label>

          <label>
            Website
            <input
              value={draft.website || ""}
              onChange={(e) => update("website", e.target.value)}
              placeholder="https://example.com"
            />
          </label>

          <label className="full">
            Headline
            <input
              value={draft.headline || ""}
              onChange={(e) => update("headline", e.target.value)}
              placeholder="Example: AI-powered finance workflow for small businesses"
            />
          </label>

          <label className="full">
            Short Summary
            <textarea
              value={draft.shortSummary || ""}
              onChange={(e) => update("shortSummary", e.target.value)}
              rows={3}
              placeholder="Short public teaser shown on startup cards."
            />
          </label>

          <label className="full">
            Problem You Are Solving
            <textarea
              value={draft.problemStatement}
              onChange={(e) => update("problemStatement", e.target.value)}
              rows={4}
              placeholder="Describe the pain point, who has it, and why it matters."
              required
            />
          </label>

          <label className="full">
            Your Solution
            <textarea
              value={draft.solutionStatement}
              onChange={(e) => update("solutionStatement", e.target.value)}
              rows={4}
              placeholder="Explain your product, platform, service, technology, or proposed solution."
              required
            />
          </label>

          <label className="full">
            Target Market
            <textarea
              value={draft.targetMarket || ""}
              onChange={(e) => update("targetMarket", e.target.value)}
              rows={3}
              placeholder="Who are your users/customers and where are they?"
            />
          </label>

          <label className="full">
            Market Size
            <textarea
              value={draft.marketSize || ""}
              onChange={(e) => update("marketSize", e.target.value)}
              rows={3}
              placeholder="Market opportunity, TAM/SAM/SOM, geography, or demand signals."
            />
          </label>

          <label className="full">
            Business Model
            <textarea
              value={draft.businessModel || ""}
              onChange={(e) => update("businessModel", e.target.value)}
              rows={3}
              placeholder="How will the startup make money?"
            />
          </label>

          <label className="full">
            Revenue Model
            <textarea
              value={draft.revenueModel || ""}
              onChange={(e) => update("revenueModel", e.target.value)}
              rows={3}
              placeholder="Subscription, transaction fee, marketplace take-rate, licensing, ads, services..."
            />
          </label>

          <label>
            Currency
            <input
              value={draft.currency}
              onChange={(e) => update("currency", e.target.value.toUpperCase())}
              placeholder="USD"
              maxLength={5}
              required
            />
          </label>

          <label>
            Funding Needed
            <input
              type="number"
              value={draft.fundingNeeded ?? ""}
              onChange={(e) =>
                update("fundingNeeded", optionalNumber(e.target.value))
              }
              placeholder="150000"
            />
          </label>

          <label>
            Product Status
            <input
              value={draft.productStatus || ""}
              onChange={(e) => update("productStatus", e.target.value)}
              placeholder="Wireframe, MVP live, beta, launched..."
            />
          </label>

          <label>
            Deal Type
            <select
              className="db-select"
              value={draft.dealType || "INVESTMENT"}
              onChange={(e) =>
                update(
                  "dealType",
                  e.target.value as CreateStartupPayload["dealType"],
                )
              }
            >
              <option value="INVESTMENT">Investment</option>
              <option value="PARTIAL_STAKE">Partial Stake</option>
              <option value="BUSINESS_LOAN">Business Loan</option>
              <option value="FULL_SALE">Full Sale</option>
            </select>
          </label>

          <label className="full">
            Traction
            <textarea
              value={draft.tractionSummary || ""}
              onChange={(e) => update("tractionSummary", e.target.value)}
              rows={4}
              placeholder="Users, pilots, revenue, waitlist, partnerships, LOIs, product progress."
            />
          </label>

          <label className="full">
            Team Summary
            <textarea
              value={draft.teamSummary || ""}
              onChange={(e) => update("teamSummary", e.target.value)}
              rows={3}
              placeholder="Founder/team background, skills, advisors, hiring needs."
            />
          </label>

          <label className="full">
            Technology Stack
            <textarea
              value={draft.technologyStack || ""}
              onChange={(e) => update("technologyStack", e.target.value)}
              rows={3}
              placeholder="Tech stack, proprietary IP, data, platform architecture, tools."
            />
          </label>

          <label className="full">
            Go-To-Market Strategy
            <textarea
              value={draft.goToMarketStrategy || ""}
              onChange={(e) => update("goToMarketStrategy", e.target.value)}
              rows={3}
              placeholder="How you plan to acquire customers and scale distribution."
            />
          </label>

          <label className="full">
            Competitors
            <textarea
              value={draft.competitors || ""}
              onChange={(e) => update("competitors", e.target.value)}
              rows={3}
              placeholder="Existing alternatives, direct competitors, indirect substitutes."
            />
          </label>

          <label className="full">
            Startup Highlights
            <textarea
              value={draft.startupHighlights || ""}
              onChange={(e) => update("startupHighlights", e.target.value)}
              rows={4}
              placeholder="Why this opportunity is compelling for investors, buyers, or partners."
            />
          </label>

          <label className="full">
            Image URLs
            <textarea
              value={(draft.imageUrls || []).join(", ")}
              onChange={(e) => update("imageUrls", csvToList(e.target.value))}
              rows={3}
              placeholder="Paste image URLs separated by commas. These will show on the public detail page."
            />
          </label>

          <label className="full">
            Full Description
            <textarea
              value={draft.description}
              onChange={(e) => update("description", e.target.value)}
              rows={6}
              placeholder="Describe the startup, idea, market, product, current stage, and what kind of support you want."
              required
            />
          </label>

          <label className="db-check">
            <input
              type="checkbox"
              checked={Boolean(draft.isConfidential)}
              onChange={(e) => update("isConfidential", e.target.checked)}
            />
            <span>Keep founder/startup confidential</span>
          </label>

          <label className="db-check">
            <input
              type="checkbox"
              checked={Boolean(draft.ndaRequired)}
              onChange={(e) => update("ndaRequired", e.target.checked)}
            />
            <span>NDA required before detailed discussion</span>
          </label>

          <div className="db-form-actions">
            <button type="submit" className="db-primary-btn" disabled={saving}>
              {saving ? "Saving..." : "Create Startup"}
            </button>
          </div>
        </form>
      </section>

      <section className="db-panel">
        <div className="db-panel-head">
          <div>
            <p className="db-eyebrow">My startups</p>
            <h2>Startup Listings</h2>
            <p>Submit drafts for review before they become visible publicly.</p>
          </div>
        </div>

        {startups.length ? (
          <div className="db-table-wrap">
            <table className="db-table">
              <thead>
                <tr>
                  <th>Startup</th>
                  <th>Category</th>
                  <th>Stage</th>
                  <th>Location</th>
                  <th>Funding</th>
                  <th>Status</th>
                  <th>Enquiries</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {startups.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="db-company">
                        <strong>{item.title}</strong>
                        <span>{item.slug}</span>
                      </div>
                    </td>
                    <td>{item.startupCategory || item.industry}</td>
                    <td>{item.startupStage || "Not disclosed"}</td>
                    <td>
                      {[item.city, item.country].filter(Boolean).join(", ")}
                    </td>
                    <td>
                      <strong className="db-money">
                        {formatMoney(
                          item.fundingNeeded || item.askAmount,
                          item.currency,
                        )}
                      </strong>
                    </td>
                    <td>
                      <StatusBadge value={item.status} />
                    </td>
                    <td>{item.enquiryCount ?? item._count?.deals ?? 0}</td>
                    <td>
                      <div className="db-table-actions">
                        {["DRAFT", "REJECTED"].includes(item.status) && (
                          <button
                            className="db-small-btn"
                            type="button"
                            onClick={() => onSubmit(item.id)}
                          >
                            Submit
                          </button>
                        )}
                        <a
                          className="db-small-btn ghost"
                          href={`/startups/${item.slug}`}
                        >
                          View
                        </a>
                        {["DRAFT", "REJECTED"].includes(item.status) && (
                          <button
                            className="db-small-btn danger"
                            type="button"
                            onClick={() => onDelete(item.id)}
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyPanel label="No startups yet. Create your first startup idea." />
        )}
      </section>
    </div>
  );
}

function FundingServicesContent({
  fundingServices,
  draft,
  setDraft,
  saving,
  error,
  onCreate,
  onSubmit,
  onDelete,
}: {
  fundingServices: FundingServiceListing[];
  draft: CreateFundingServicePayload;
  setDraft: (draft: CreateFundingServicePayload) => void;
  saving: boolean;
  error: string;
  onCreate: (payload: CreateFundingServicePayload) => void;
  onSubmit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const update = <K extends keyof CreateFundingServicePayload>(
    key: K,
    value: CreateFundingServicePayload[K],
  ) => setDraft({ ...draft, [key]: value });

  const optionalNumber = (value: string) =>
    value === "" ? undefined : Number(value);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    onCreate({
      ...draft,
      currency: draft.currency.toUpperCase(),
      askAmount: Number(
        draft.askAmount || draft.ticketMax || draft.ticketMin || 0,
      ),
      dealType: draft.dealType || "BUSINESS_LOAN",
      capitalTypes: draft.capitalTypes || [],
      regionsCovered: draft.regionsCovered || [],
    });
  };

  return (
    <div className="db-content">
      <PageHeader
        eyebrow="Funding source"
        title="Funding Services"
        description="Create, manage, and submit lender, private credit, grant, invoice finance, acquisition finance, and structured capital service listings."
      >
        <a className="db-secondary-btn dark" href="/funding-service">
          View Public Page
        </a>
      </PageHeader>

      <section className="db-panel">
        <div className="db-panel-head">
          <div>
            <p className="db-eyebrow">Create funding service</p>
            <h2>List a Funding Source</h2>
            <p>
              Publish capital solutions for buyers, sellers, operators, and fund
              raisers.
            </p>
          </div>
        </div>

        {error && <p className="db-error">{error}</p>}

        <form className="db-profile-form" onSubmit={submit}>
          <label>
            Service Title
            <input
              value={draft.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="Example: Acquisition finance for profitable SMEs"
              required
            />
          </label>
          <label>
            Provider / Firm Name
            <input
              value={draft.businessName || ""}
              onChange={(e) => update("businessName", e.target.value)}
              placeholder="Example: Atlas Credit Partners"
            />
          </label>
          <label>
            Funding Service Type
            <input
              value={draft.fundingServiceType || ""}
              onChange={(e) => update("fundingServiceType", e.target.value)}
              placeholder="Acquisition finance, private credit, grant advisory"
            />
          </label>
          <label>
            Capital Provider Type
            <input
              value={draft.capitalProviderType || ""}
              onChange={(e) => update("capitalProviderType", e.target.value)}
              placeholder="Bank, private lender, fund, grant advisor"
            />
          </label>
          <label>
            Industry Focus
            <input
              value={draft.industry}
              onChange={(e) => update("industry", e.target.value)}
              placeholder="Sector focus"
              required
            />
          </label>
          <label>
            Country
            <input
              value={draft.country}
              onChange={(e) => update("country", e.target.value)}
              placeholder="Nigeria, UK, US..."
              required
            />
          </label>
          <label>
            City
            <input
              value={draft.city || ""}
              onChange={(e) => update("city", e.target.value)}
              placeholder="Optional"
            />
          </label>
          <label>
            Website
            <input
              value={draft.website || ""}
              onChange={(e) => update("website", e.target.value)}
              placeholder="https://example.com"
            />
          </label>
          <label className="full">
            Headline
            <input
              value={draft.headline || ""}
              onChange={(e) => update("headline", e.target.value)}
              placeholder="Example: Fast debt capital for profitable acquisition targets"
            />
          </label>
          <label className="full">
            Short Summary
            <textarea
              value={draft.shortSummary || ""}
              onChange={(e) => update("shortSummary", e.target.value)}
              rows={3}
              placeholder="Short public summary."
            />
          </label>

          <label>
            Deal Type
            <select
              className="db-select"
              value={draft.dealType || "BUSINESS_LOAN"}
              onChange={(e) =>
                update(
                  "dealType",
                  e.target.value as CreateFundingServicePayload["dealType"],
                )
              }
            >
              <option value="BUSINESS_LOAN">Business Loan</option>
              <option value="INVESTMENT">Investment</option>
              <option value="PARTIAL_STAKE">Partial Stake</option>
              <option value="FULL_SALE">Full Sale</option>
            </select>
          </label>
          <label>
            Currency
            <input
              value={draft.currency}
              onChange={(e) => update("currency", e.target.value.toUpperCase())}
              placeholder="USD"
              maxLength={5}
              required
            />
          </label>
          <label>
            Minimum Ticket
            <input
              type="number"
              value={draft.ticketMin ?? ""}
              onChange={(e) =>
                update("ticketMin", optionalNumber(e.target.value))
              }
              placeholder="50000"
            />
          </label>
          <label>
            Maximum Ticket
            <input
              type="number"
              value={draft.ticketMax ?? ""}
              onChange={(e) =>
                update("ticketMax", optionalNumber(e.target.value))
              }
              placeholder="5000000"
            />
          </label>
          <label>
            Capital Types
            <input
              value={(draft.capitalTypes || []).join(", ")}
              onChange={(e) =>
                update("capitalTypes", csvToList(e.target.value))
              }
              placeholder="Debt, venture debt, grants, invoice finance"
            />
          </label>
          <label>
            Regions Covered
            <input
              value={(draft.regionsCovered || []).join(", ")}
              onChange={(e) =>
                update("regionsCovered", csvToList(e.target.value))
              }
              placeholder="Nigeria, Ghana, Kenya"
            />
          </label>
          <label>
            Target Company Stage
            <input
              value={draft.targetCompanyStage || ""}
              onChange={(e) => update("targetCompanyStage", e.target.value)}
              placeholder="Profitable SME, startup, growth stage"
            />
          </label>
          <label>
            Processing Time
            <input
              value={draft.processingTime || ""}
              onChange={(e) => update("processingTime", e.target.value)}
              placeholder="Example: 7-21 business days"
            />
          </label>

          <label className="full">
            Repayment / Funding Terms
            <textarea
              value={draft.repaymentTerms || ""}
              onChange={(e) => update("repaymentTerms", e.target.value)}
              rows={3}
              placeholder="Rates, tenor, repayment structure, security expectations."
            />
          </label>
          <label className="full">
            Eligibility Criteria
            <textarea
              value={draft.eligibilityCriteria || ""}
              onChange={(e) => update("eligibilityCriteria", e.target.value)}
              rows={3}
              placeholder="Revenue, profitability, geography, sector, documentation, credit requirements."
            />
          </label>
          <label className="full">
            Required Documents
            <textarea
              value={draft.requiredDocuments || ""}
              onChange={(e) => update("requiredDocuments", e.target.value)}
              rows={3}
              placeholder="Financial statements, bank statements, pitch deck, incorporation docs, tax records."
            />
          </label>
          <label className="full">
            Fees Description
            <textarea
              value={draft.feesDescription || ""}
              onChange={(e) => update("feesDescription", e.target.value)}
              rows={3}
              placeholder="Origination fees, advisory fees, success fees, arrangement fees."
            />
          </label>
          <label className="full">
            Regulatory License
            <input
              value={draft.regulatoryLicense || ""}
              onChange={(e) => update("regulatoryLicense", e.target.value)}
              placeholder="License number or regulatory status if applicable"
            />
          </label>
          <label className="full">
            Funding Service Highlights
            <textarea
              value={draft.fundingServiceHighlights || ""}
              onChange={(e) =>
                update("fundingServiceHighlights", e.target.value)
              }
              rows={4}
              placeholder="Why borrowers or deal sponsors should choose this funding source."
            />
          </label>
          <label className="full">
            Full Description
            <textarea
              value={draft.description}
              onChange={(e) => update("description", e.target.value)}
              rows={6}
              placeholder="Describe the funding service, ideal borrower, terms, process, and next steps."
              required
            />
          </label>

          <label className="db-check">
            <input
              type="checkbox"
              checked={Boolean(draft.collateralRequired)}
              onChange={(e) => update("collateralRequired", e.target.checked)}
            />
            <span>Collateral may be required</span>
          </label>
          <label className="db-check">
            <input
              type="checkbox"
              checked={Boolean(draft.isConfidential)}
              onChange={(e) => update("isConfidential", e.target.checked)}
            />
            <span>Keep provider confidential</span>
          </label>
          <label className="db-check">
            <input
              type="checkbox"
              checked={Boolean(draft.ndaRequired)}
              onChange={(e) => update("ndaRequired", e.target.checked)}
            />
            <span>NDA required before detailed terms</span>
          </label>

          <div className="db-form-actions">
            <button type="submit" className="db-primary-btn" disabled={saving}>
              {saving ? "Saving..." : "Create Funding Service"}
            </button>
          </div>
        </form>
      </section>

      <section className="db-panel">
        <div className="db-panel-head">
          <div>
            <p className="db-eyebrow">My funding services</p>
            <h2>Funding Source Listings</h2>
            <p>
              Submit drafts for admin review before they become visible
              publicly.
            </p>
          </div>
        </div>

        {fundingServices.length ? (
          <div className="db-table-wrap">
            <table className="db-table">
              <thead>
                <tr>
                  <th>Funding Service</th>
                  <th>Type</th>
                  <th>Location</th>
                  <th>Ticket Size</th>
                  <th>Status</th>
                  <th>Enquiries</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {fundingServices.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="db-company">
                        <strong>{item.title}</strong>
                        <span>{item.slug}</span>
                      </div>
                    </td>
                    <td>
                      {item.fundingServiceType || formatEnum(item.profileType)}
                    </td>
                    <td>
                      {[item.city, item.country].filter(Boolean).join(", ")}
                    </td>
                    <td>
                      <strong className="db-money">
                        {formatMoney(item.ticketMin, item.currency)} -{" "}
                        {formatMoney(
                          item.ticketMax || item.askAmount,
                          item.currency,
                        )}
                      </strong>
                    </td>
                    <td>
                      <StatusBadge value={item.status} />
                    </td>
                    <td>{item.enquiryCount ?? item._count?.deals ?? 0}</td>
                    <td>
                      <div className="db-table-actions">
                        {["DRAFT", "REJECTED"].includes(item.status) && (
                          <button
                            className="db-small-btn"
                            type="button"
                            onClick={() => onSubmit(item.id)}
                          >
                            Submit
                          </button>
                        )}
                        <a
                          className="db-small-btn ghost"
                          href={`/funding-service/${item.slug}`}
                        >
                          View
                        </a>
                        {["DRAFT", "REJECTED"].includes(item.status) && (
                          <button
                            className="db-small-btn danger"
                            type="button"
                            onClick={() => onDelete(item.id)}
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyPanel label="No funding services yet. Create your first funding source listing." />
        )}
      </section>
    </div>
  );
}

function FundraisersContent({
  fundraisers,
  draft,
  setDraft,
  saving,
  error,
  onCreate,
  onSubmit,
  onDelete,
}: {
  fundraisers: FundraiserListing[];
  draft: CreateFundraiserPayload;
  setDraft: (draft: CreateFundraiserPayload) => void;
  saving: boolean;
  error: string;
  onCreate: (payload: CreateFundraiserPayload) => void;
  onSubmit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const update = <K extends keyof CreateFundraiserPayload>(
    key: K,
    value: CreateFundraiserPayload[K],
  ) => setDraft({ ...draft, [key]: value });

  const optionalNumber = (value: string) =>
    value === "" ? undefined : Number(value);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    onCreate({
      ...draft,
      currency: draft.currency.toUpperCase(),
      askAmount: Number(draft.askAmount || 0),
      dealType: draft.dealType || "INVESTMENT",
    });
  };

  return (
    <div className="db-content">
      <PageHeader
        eyebrow="Capital raise"
        title="Fund Raisers"
        description="Create, manage, and submit capital raise posts for investor review. Approved posts appear on the public Fund Raisers marketplace."
      >
        <a className="db-secondary-btn dark" href="/fund-raisers">
          View Public Page
        </a>
      </PageHeader>

      <section className="db-panel">
        <div className="db-panel-head">
          <div>
            <p className="db-eyebrow">Create fund raiser</p>
            <h2>Post a Capital Raise</h2>
            <p>
              Create equity, debt, strategic investment, or JV fundraising
              opportunities.
            </p>
          </div>
        </div>

        {error && <p className="db-error">{error}</p>}

        <form className="db-profile-form" onSubmit={submit}>
          <label>
            Fund Raise Title
            <input
              value={draft.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="Example: Lagos fintech raising USD 1.5M growth capital"
              required
            />
          </label>
          <label>
            Company / Brand Name
            <input
              value={draft.businessName || ""}
              onChange={(e) => update("businessName", e.target.value)}
              placeholder="Example: Payflow Africa"
            />
          </label>
          <label>
            Industry / Sector
            <input
              value={draft.industry}
              onChange={(e) => update("industry", e.target.value)}
              placeholder="Example: Fintech, energy, healthcare"
              required
            />
          </label>
          <label>
            Country
            <input
              value={draft.country}
              onChange={(e) => update("country", e.target.value)}
              placeholder="Example: Nigeria"
              required
            />
          </label>
          <label>
            City
            <input
              value={draft.city || ""}
              onChange={(e) => update("city", e.target.value)}
              placeholder="Example: Lagos"
            />
          </label>
          <label>
            Website
            <input
              value={draft.website || ""}
              onChange={(e) => update("website", e.target.value)}
              placeholder="https://example.com"
            />
          </label>
          <label className="full">
            Headline
            <input
              value={draft.headline || ""}
              onChange={(e) => update("headline", e.target.value)}
              placeholder="Example: Profitable B2B SaaS startup raising growth capital"
            />
          </label>
          <label className="full">
            Short Teaser
            <textarea
              value={draft.shortSummary || ""}
              onChange={(e) => update("shortSummary", e.target.value)}
              rows={3}
              placeholder="A concise non-confidential investor teaser."
            />
          </label>

          <label>
            Funding Stage
            <input
              value={draft.fundingStage || ""}
              onChange={(e) => update("fundingStage", e.target.value)}
              placeholder="Seed, Series A, Growth, Bridge..."
            />
          </label>
          <label>
            Deal Type
            <select
              className="db-select"
              value={draft.dealType || "INVESTMENT"}
              onChange={(e) =>
                update(
                  "dealType",
                  e.target.value as CreateFundraiserPayload["dealType"],
                )
              }
            >
              <option value="INVESTMENT">Investment</option>
              <option value="PARTIAL_STAKE">Partial Stake</option>
              <option value="BUSINESS_LOAN">Business Loan</option>
              <option value="FULL_SALE">Full Sale</option>
            </select>
          </label>
          <label>
            Currency
            <input
              value={draft.currency}
              onChange={(e) => update("currency", e.target.value.toUpperCase())}
              placeholder="USD"
              maxLength={5}
              required
            />
          </label>
          <label>
            Capital Required
            <input
              type="number"
              value={draft.askAmount || ""}
              onChange={(e) => update("askAmount", Number(e.target.value))}
              placeholder="1500000"
              required
            />
          </label>
          <label>
            Minimum Investment
            <input
              type="number"
              value={draft.minInvestment ?? ""}
              onChange={(e) =>
                update("minInvestment", optionalNumber(e.target.value))
              }
              placeholder="Optional"
            />
          </label>
          <label>
            Equity Offered %
            <input
              type="number"
              value={draft.askPercent ?? ""}
              onChange={(e) =>
                update("askPercent", optionalNumber(e.target.value))
              }
              placeholder="15"
            />
          </label>
          <label>
            Interest Rate %
            <input
              type="number"
              value={draft.askRate ?? ""}
              onChange={(e) =>
                update("askRate", optionalNumber(e.target.value))
              }
              placeholder="Optional for debt"
            />
          </label>
          <label>
            Previous Funding
            <input
              type="number"
              value={draft.previousFunding ?? ""}
              onChange={(e) =>
                update("previousFunding", optionalNumber(e.target.value))
              }
              placeholder="Optional"
            />
          </label>
          <label>
            Runway
            <input
              value={draft.runway || ""}
              onChange={(e) => update("runway", e.target.value)}
              placeholder="Example: 18 months after raise"
            />
          </label>

          <label>
            Annual Revenue
            <input
              type="number"
              value={draft.runSales ?? ""}
              onChange={(e) =>
                update("runSales", optionalNumber(e.target.value))
              }
              placeholder="Optional"
            />
          </label>
          <label>
            Gross Revenue
            <input
              type="number"
              value={draft.grossRevenue ?? ""}
              onChange={(e) =>
                update("grossRevenue", optionalNumber(e.target.value))
              }
              placeholder="Optional"
            />
          </label>
          <label>
            Monthly Revenue
            <input
              type="number"
              value={draft.monthlyRevenue ?? ""}
              onChange={(e) =>
                update("monthlyRevenue", optionalNumber(e.target.value))
              }
              placeholder="Optional"
            />
          </label>
          <label>
            EBITDA
            <input
              type="number"
              value={draft.ebitda ?? ""}
              onChange={(e) => update("ebitda", optionalNumber(e.target.value))}
              placeholder="Optional"
            />
          </label>
          <label>
            Net Profit
            <input
              type="number"
              value={draft.netProfit ?? ""}
              onChange={(e) =>
                update("netProfit", optionalNumber(e.target.value))
              }
              placeholder="Optional"
            />
          </label>
          <label>
            Monthly Profit
            <input
              type="number"
              value={draft.monthlyProfit ?? ""}
              onChange={(e) =>
                update("monthlyProfit", optionalNumber(e.target.value))
              }
              placeholder="Optional"
            />
          </label>
          <label>
            Employees
            <input
              type="number"
              value={draft.employees ?? ""}
              onChange={(e) =>
                update("employees", optionalNumber(e.target.value))
              }
              placeholder="Optional"
            />
          </label>
          <label>
            Established Year
            <input
              type="number"
              value={draft.established ?? ""}
              onChange={(e) =>
                update("established", optionalNumber(e.target.value))
              }
              placeholder="Example: 2020"
            />
          </label>

          <label className="full">
            Use Of Funds
            <textarea
              value={draft.useOfFunds || ""}
              onChange={(e) => update("useOfFunds", e.target.value)}
              rows={4}
              placeholder="Hiring, inventory, product, expansion, marketing, debt refinancing..."
            />
          </label>
          <label className="full">
            Traction
            <textarea
              value={draft.traction || ""}
              onChange={(e) => update("traction", e.target.value)}
              rows={4}
              placeholder="Revenue growth, users, clients, pilots, contracts, retention, pipeline."
            />
          </label>
          <label className="full">
            Business Model
            <textarea
              value={draft.businessModel || ""}
              onChange={(e) => update("businessModel", e.target.value)}
              rows={3}
              placeholder="How the company makes money."
            />
          </label>
          <label className="full">
            Products / Services
            <textarea
              value={draft.productsServices || ""}
              onChange={(e) => update("productsServices", e.target.value)}
              rows={3}
              placeholder="Core products, services, or platform features."
            />
          </label>
          <label className="full">
            Customer Base
            <textarea
              value={draft.customerBase || ""}
              onChange={(e) => update("customerBase", e.target.value)}
              rows={3}
              placeholder="Customer segments, geographies, concentration, enterprise/client mix."
            />
          </label>
          <label className="full">
            Revenue Model
            <textarea
              value={draft.revenueModel || ""}
              onChange={(e) => update("revenueModel", e.target.value)}
              rows={3}
              placeholder="Subscription, transaction fees, marketplace take-rate, services, margins."
            />
          </label>
          <label className="full">
            Key Metrics
            <textarea
              value={draft.keyMetrics || ""}
              onChange={(e) => update("keyMetrics", e.target.value)}
              rows={3}
              placeholder="MRR, ARR, GMV, CAC, retention, margins, order volume, active users."
            />
          </label>
          <label className="full">
            Growth Opportunities
            <textarea
              value={draft.growthOpportunities || ""}
              onChange={(e) => update("growthOpportunities", e.target.value)}
              rows={3}
              placeholder="What the capital unlocks."
            />
          </label>
          <label className="full">
            Competitive Advantages
            <textarea
              value={draft.competitiveAdvantages || ""}
              onChange={(e) => update("competitiveAdvantages", e.target.value)}
              rows={3}
              placeholder="Moat, technology, licenses, contracts, data, partnerships."
            />
          </label>
          <label className="full">
            Investor Highlights
            <textarea
              value={draft.investorHighlights || ""}
              onChange={(e) => update("investorHighlights", e.target.value)}
              rows={4}
              placeholder="Why this is attractive to investors."
            />
          </label>
          <label className="full">
            Target Investor
            <textarea
              value={draft.targetInvestor || ""}
              onChange={(e) => update("targetInvestor", e.target.value)}
              rows={3}
              placeholder="Angel, VC, PE, strategic investor, family office, lender."
            />
          </label>
          <label className="full">
            Exit Strategy
            <textarea
              value={draft.exitStrategy || ""}
              onChange={(e) => update("exitStrategy", e.target.value)}
              rows={3}
              placeholder="Strategic acquisition, dividend yield, buyback, IPO, PE roll-up."
            />
          </label>
          <label className="full">
            Fund Raise Description
            <textarea
              value={draft.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Describe the company, funding need, traction, investor fit, and preferred deal structure."
              rows={6}
              required
            />
          </label>

          <label className="db-check">
            <input
              type="checkbox"
              checked={Boolean(draft.pitchDeckReady)}
              onChange={(e) => update("pitchDeckReady", e.target.checked)}
            />
            <span>Pitch deck ready</span>
          </label>
          <label className="db-check">
            <input
              type="checkbox"
              checked={draft.isConfidential !== false}
              onChange={(e) => update("isConfidential", e.target.checked)}
            />
            <span>Keep fundraise confidential</span>
          </label>
          <label className="db-check">
            <input
              type="checkbox"
              checked={draft.ndaRequired !== false}
              onChange={(e) => update("ndaRequired", e.target.checked)}
            />
            <span>NDA required</span>
          </label>
          <label className="db-check">
            <input
              type="checkbox"
              checked={Boolean(draft.financialsAvailable)}
              onChange={(e) => update("financialsAvailable", e.target.checked)}
            />
            <span>Financials available</span>
          </label>
          <label className="db-check">
            <input
              type="checkbox"
              checked={Boolean(draft.dataRoomReady)}
              onChange={(e) => update("dataRoomReady", e.target.checked)}
            />
            <span>Data room ready</span>
          </label>

          <div className="db-form-actions">
            <button type="submit" className="db-primary-btn" disabled={saving}>
              {saving ? "Saving..." : "Create Fund Raiser"}
            </button>
          </div>
        </form>
      </section>

      <section className="db-panel">
        <div className="db-panel-head">
          <div>
            <p className="db-eyebrow">My fund raisers</p>
            <h2>Capital Raise Posts</h2>
            <p>Submit drafts for review before they become visible publicly.</p>
          </div>
        </div>

        {fundraisers.length ? (
          <div className="db-table-wrap">
            <table className="db-table">
              <thead>
                <tr>
                  <th>Fund Raiser</th>
                  <th>Industry</th>
                  <th>Location</th>
                  <th>Capital</th>
                  <th>Status</th>
                  <th>Enquiries</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {fundraisers.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="db-company">
                        <strong>{item.title}</strong>
                        <span>{item.slug}</span>
                      </div>
                    </td>
                    <td>{item.industry}</td>
                    <td>
                      {[item.city, item.country].filter(Boolean).join(", ")}
                    </td>
                    <td>
                      <strong className="db-money">
                        {formatMoney(item.askAmount, item.currency)}
                      </strong>
                    </td>
                    <td>
                      <StatusBadge value={item.status} />
                    </td>
                    <td>{item.enquiryCount ?? item._count?.deals ?? 0}</td>
                    <td>
                      <div className="db-table-actions">
                        {["DRAFT", "REJECTED"].includes(item.status) && (
                          <button
                            className="db-small-btn"
                            type="button"
                            onClick={() => onSubmit(item.id)}
                          >
                            Submit
                          </button>
                        )}
                        <a
                          className="db-small-btn ghost"
                          href={`/fund-raisers/${item.slug}`}
                        >
                          View
                        </a>
                        {["DRAFT", "REJECTED"].includes(item.status) && (
                          <button
                            className="db-small-btn danger"
                            type="button"
                            onClick={() => onDelete(item.id)}
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyPanel label="No fund raisers yet. Create your first capital raise post." />
        )}
      </section>
    </div>
  );
}

function SettingsContent({
  settings,
  onSave,
  onReset,
  savedMessage,
}: {
  settings: DashboardSettings;
  onSave: (settings: DashboardSettings) => void;
  onReset: () => void;
  savedMessage: string;
}) {
  const [draft, setDraft] = useState<DashboardSettings>(settings);

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  const update = <K extends keyof DashboardSettings>(
    key: K,
    value: DashboardSettings[K],
  ) => setDraft((current) => ({ ...current, [key]: value }));

  const updateNotification = <
    K extends keyof DashboardSettings["notifications"],
  >(
    key: K,
    value: boolean,
  ) =>
    setDraft((current) => ({
      ...current,
      notifications: { ...current.notifications, [key]: value },
    }));

  const updatePrivacy = <K extends keyof DashboardSettings["privacy"]>(
    key: K,
    value: boolean,
  ) =>
    setDraft((current) => ({
      ...current,
      privacy: { ...current.privacy, [key]: value },
    }));

  const toggleFocus = (value: string) => {
    setDraft((current) => {
      const exists = current.marketplaceFocus.includes(value);
      return {
        ...current,
        marketplaceFocus: exists
          ? current.marketplaceFocus.filter((item) => item !== value)
          : [...current.marketplaceFocus, value],
      };
    });
  };

  const reset = () => {
    setDraft(DEFAULT_DASHBOARD_SETTINGS);
    onReset();
  };

  return (
    <div className="db-content">
      <PageHeader
        eyebrow="Workspace settings"
        title="Settings"
        description="Control dashboard behavior, notification preferences, marketplace focus, and privacy defaults for this workspace."
      >
        <button type="button" className="db-secondary-btn dark" onClick={reset}>
          <RefreshCw size={14} />
          Reset Defaults
        </button>
      </PageHeader>

      {savedMessage && <div className="db-success">{savedMessage}</div>}

      <form
        className="db-settings-form"
        onSubmit={(event) => {
          event.preventDefault();
          onSave(draft);
        }}
      >
        <section className="db-settings-card">
          <div className="db-settings-card-head">
            <Settings size={18} />
            <div>
              <p className="db-eyebrow">Workspace</p>
              <h2>Dashboard Preferences</h2>
            </div>
          </div>

          <div className="db-settings-grid-inner">
            <label>
              Default Currency
              <select
                className="db-select"
                value={draft.defaultCurrency}
                onChange={(e) => update("defaultCurrency", e.target.value)}
              >
                {SETTINGS_CURRENCIES.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Region Focus
              <select
                className="db-select"
                value={draft.regionFocus}
                onChange={(e) => update("regionFocus", e.target.value)}
              >
                <option value="Global">Global</option>
                {STARTUP_COUNTRIES.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </label>

            <label className="db-check">
              <input
                type="checkbox"
                checked={draft.compactMode}
                onChange={(e) => update("compactMode", e.target.checked)}
              />
              <span>Use compact dashboard spacing</span>
            </label>

            <label className="db-check">
              <input
                type="checkbox"
                checked={draft.autoRefreshWorkspace}
                onChange={(e) =>
                  update("autoRefreshWorkspace", e.target.checked)
                }
              />
              <span>Auto-refresh workspace data every 60 seconds</span>
            </label>
          </div>
        </section>

        <section className="db-settings-card">
          <div className="db-settings-card-head">
            <Search size={18} />
            <div>
              <p className="db-eyebrow">Marketplace</p>
              <h2>Feed Preferences</h2>
            </div>
          </div>

          <div className="db-settings-options">
            {MARKETPLACE_FOCUS_OPTIONS.map((item) => (
              <label key={item} className="db-check">
                <input
                  type="checkbox"
                  checked={draft.marketplaceFocus.includes(item)}
                  onChange={() => toggleFocus(item)}
                />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </section>

        <section className="db-settings-card">
          <div className="db-settings-card-head">
            <Bell size={18} />
            <div>
              <p className="db-eyebrow">Notifications</p>
              <h2>Alert Preferences</h2>
            </div>
          </div>

          <div className="db-settings-options">
            <label className="db-check">
              <input
                type="checkbox"
                checked={draft.notifications.enquiries}
                onChange={(e) =>
                  updateNotification("enquiries", e.target.checked)
                }
              />
              <span>Enquiry alerts</span>
            </label>

            <label className="db-check">
              <input
                type="checkbox"
                checked={draft.notifications.messages}
                onChange={(e) =>
                  updateNotification("messages", e.target.checked)
                }
              />
              <span>Message alerts</span>
            </label>

            <label className="db-check">
              <input
                type="checkbox"
                checked={draft.notifications.reviewUpdates}
                onChange={(e) =>
                  updateNotification("reviewUpdates", e.target.checked)
                }
              />
              <span>Review status updates</span>
            </label>

            <label className="db-check">
              <input
                type="checkbox"
                checked={draft.notifications.weeklyDigest}
                onChange={(e) =>
                  updateNotification("weeklyDigest", e.target.checked)
                }
              />
              <span>Weekly marketplace digest</span>
            </label>
          </div>
        </section>

        <section className="db-settings-card">
          <div className="db-settings-card-head">
            <ShieldCheck size={18} />
            <div>
              <p className="db-eyebrow">Privacy</p>
              <h2>Trust Defaults</h2>
            </div>
          </div>

          <div className="db-settings-options">
            <label className="db-check">
              <input
                type="checkbox"
                checked={draft.privacy.showContactEmail}
                onChange={(e) =>
                  updatePrivacy("showContactEmail", e.target.checked)
                }
              />
              <span>Show contact email on eligible profiles</span>
            </label>

            <label className="db-check">
              <input
                type="checkbox"
                checked={draft.privacy.allowDirectMessages}
                onChange={(e) =>
                  updatePrivacy("allowDirectMessages", e.target.checked)
                }
              />
              <span>Allow direct deal messages</span>
            </label>

            <label className="db-check">
              <input
                type="checkbox"
                checked={draft.privacy.requireNdaByDefault}
                onChange={(e) =>
                  updatePrivacy("requireNdaByDefault", e.target.checked)
                }
              />
              <span>Require NDA by default</span>
            </label>

            <label className="db-check">
              <input
                type="checkbox"
                checked={draft.privacy.hideConfidentialNames}
                onChange={(e) =>
                  updatePrivacy("hideConfidentialNames", e.target.checked)
                }
              />
              <span>Hide confidential business names</span>
            </label>
          </div>
        </section>

        <div className="db-settings-actions">
          <button type="button" className="db-secondary-btn" onClick={reset}>
            Reset
          </button>
          <button type="submit" className="db-primary-btn">
            <CheckCircle2 size={14} />
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}

function PlaceholderContent({ tab }: { tab: TabId }) {
  const item = NAV.find((n) => n.id === tab);
  const Icon = item?.icon || LayoutDashboard;

  return (
    <div className="db-content">
      <section className="db-placeholder">
        <Icon size={28} />
        <p className="db-eyebrow">{item?.label}</p>
        <h1>{item?.label}</h1>
        <p>This workspace is ready for backend data integration.</p>
      </section>
    </div>
  );
}

function EmptyPanel({ label }: { label: string }) {
  return <div className="db-empty">{label}</div>;
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dashboard, setDashboard] = useState<DashboardPayload>(EMPTY_DASHBOARD);
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [draft, setDraft] = useState<ProfileDraft>(initialProfileDraft());
  const [listings, setListings] = useState<BusinessListing[]>([]);
  const [fundingServices, setFundingServices] = useState<
    FundingServiceListing[]
  >([]);
  const [fundingServiceDraft, setFundingServiceDraft] =
    useState<CreateFundingServicePayload>(initialFundingServiceDraft());
  const [startups, setStartups] = useState<StartupListing[]>([]);
  const [startupDraft, setStartupDraft] = useState<CreateStartupPayload>(
    initialStartupDraft(),
  );
  const [fundraisers, setFundraisers] = useState<FundraiserListing[]>([]);
  const [fundraiserDraft, setFundraiserDraft] =
    useState<CreateFundraiserPayload>(initialFundraiserDraft());
  const [opportunities, setOpportunities] = useState<BusinessListing[]>([]);
  const [deals, setDeals] = useState<DealListItem[]>([]);
  const [conversations, setConversations] = useState<MarketplaceConversation[]>(
    [],
  );
  const [dashboardSettings, setDashboardSettings] =
  useState<DashboardSettings>(DEFAULT_DASHBOARD_SETTINGS);
  const [settingsSaved, setSettingsSaved] = useState("");
  const [documents, setDocuments] = useState<DocumentUploadPayload[]>([]);
  const [selectedDealId, setSelectedDealId] = useState("");
  const [messages, setMessages] = useState<MarketplaceMessage[]>([]);
  const [messageDraft, setMessageDraft] = useState("");
  const [selectedOpportunityId, setSelectedOpportunityId] = useState("");
  const [enquiryMessage, setEnquiryMessage] = useState("");
  const [loadingWorkspace, setLoadingWorkspace] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);

  const socketRef = useRef<ReturnType<typeof createUserSocket> | null>(null);
  const activeDealRef = useRef("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, accessToken, initialized, isAuthenticated, fetchCurrentUser } =
    useAuth();

  const appendMessage = useCallback((message: MarketplaceMessage) => {
    setMessages((current) => {
      if (current.some((item) => item.id === message.id)) return current;
      return [...current, message];
    });
  }, []);

  useEffect(() => {
    if (!initialized) void fetchCurrentUser();
  }, [initialized, fetchCurrentUser]);
  useEffect(() => {
    if (initialized && !isAuthenticated) router.replace("/login");
  }, [initialized, isAuthenticated, router]);
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (isTab(tab)) setActiveTab(tab);
  }, [searchParams]);
  useEffect(() => {
  setDashboardSettings(readDashboardSettings());
  }, []);
  useEffect(() => {
    activeDealRef.current = selectedDealId;
  }, [selectedDealId]);

  const loadDashboard = useCallback(async () => {
    if (!accessToken) return;
    setLoadingDashboard(true);
    setLoadError("");

    try {
      const response = await DashboardService.getDashboard(accessToken);
      setDashboard(response.data);
    } catch (error: any) {
      setLoadError(error?.message || "Dashboard data could not be loaded.");
    } finally {
      setLoadingDashboard(false);
    }
  }, [accessToken]);

  const loadWorkspace = useCallback(async () => {
    if (!accessToken) return;
    setLoadingWorkspace(true);

    const [mine, dealList, inbox, docs, opps] = await Promise.allSettled([
      DashboardService.getMyListings(accessToken),
      DashboardService.getMyDeals(accessToken),
      DashboardService.getConversations(accessToken),
      DashboardService.getMyDocuments(accessToken),
      MarketplaceService.getBusinesses({ limit: 8, sortBy: "featured" }),
    ]);

    if (mine.status === "fulfilled") {
      const ownedListings = mine.value.data;

      setListings(
        ownedListings.filter(
          (item) =>
            item.profileType !== "RAISE_CAPITAL" &&
            item.profileType !== "FUNDING_SERVICE" &&
            item.profileType !== "STARTUP",
        ),
      );

      setFundraisers(ownedListings.filter(isFundraiserListing));
      setFundingServices(ownedListings.filter(isFundingServiceListing));
      setStartups(ownedListings.filter(isStartupListing));
    }
    if (dealList.status === "fulfilled") setDeals(dealList.value.data);
    if (inbox.status === "fulfilled") setConversations(inbox.value.data);
    if (docs.status === "fulfilled") setDocuments(docs.value.data);
    if (opps.status === "fulfilled") setOpportunities(opps.value.data);

    setLoadingWorkspace(false);
  }, [accessToken]);

 useEffect(() => {
  if (
    !dashboardSettings.autoRefreshWorkspace ||
    !initialized ||
    !isAuthenticated
  )
    return;

  const interval = window.setInterval(() => {
    void loadDashboard();
    void loadWorkspace();
  }, 60_000);

  return () => window.clearInterval(interval);
}, [
  dashboardSettings.autoRefreshWorkspace,
  initialized,
  isAuthenticated,
  loadDashboard,
  loadWorkspace,
]); 

  useEffect(() => {
    if (initialized && isAuthenticated) {
      void loadDashboard();
      void loadWorkspace();
    }
  }, [initialized, isAuthenticated, loadDashboard, loadWorkspace]);

  useEffect(() => {
    if (!accessToken || !isAuthenticated) return;

    const socket = createUserSocket(accessToken);
    socketRef.current = socket;

    const refreshWorkspace = () => {
      void loadWorkspace();
      void loadDashboard();
    };

    const handleNewMessage = (message: MarketplaceMessage) => {
      const dealId = (message as { dealId?: string }).dealId;

      if (dealId && dealId === activeDealRef.current) {
        appendMessage(message);
        void DashboardService.markMessagesRead(accessToken, dealId).catch(
          () => undefined,
        );
        socket.emit("message:read", { dealId });
      }

      refreshWorkspace();
    };

    socket.on("message:new", handleNewMessage);
    socket.on("notification:new", refreshWorkspace);
    socket.on("deal:updated", refreshWorkspace);
    socket.on("connect_error", () => undefined);

    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("notification:new", refreshWorkspace);
      socket.off("deal:updated", refreshWorkspace);
      socket.disconnect();
      if (socketRef.current === socket) socketRef.current = null;
    };
  }, [
    accessToken,
    isAuthenticated,
    appendMessage,
    loadDashboard,
    loadWorkspace,
  ]);

  const account = useMemo(() => {
    const u = user as any;
    const firstName = u?.firstName || "Member";
    const lastName = u?.lastName || "";
    const fullName =
      [firstName, lastName].filter(Boolean).join(" ") || u?.email || "Member";
    const initials =
      `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() ||
      u?.email?.slice(0, 2).toUpperCase() ||
      "AB";
    const joined = u?.createdAt
      ? new Date(u.createdAt).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : "Not available";

    return {
      firstName,
      lastName,
      fullName,
      initials,
      role: formatRole(u?.role),
      country: u?.country || "Global",
      email: u?.email || "",
      joined,
      profileScore: u?.profileScore || 0,
      isVerified: Boolean(u?.verified || u?.isEmailVerified),
      feedPreferences: dashboardSettings.marketplaceFocus.length
  ? dashboardSettings.marketplaceFocus
  : DEFAULT_DASHBOARD_SETTINGS.marketplaceFocus,
    };
  }, [user, dashboardSettings.marketplaceFocus]);

  const selectTab = (tab: TabId) => {
    setActiveTab(tab);
    setMobileOpen(false);
  };
  const startProfile = (type: ProfileType) => {
    if (type === "FUNDING_SERVICE") {
      setFormError("");
      selectTab("funding-services");
      return;
    }

    if (type === "STARTUP") {
      setFormError("");
      selectTab("startups");
      return;
    }

    setDraft(initialProfileDraft(type));
    setFormError("");
    selectTab("add-profile");
  };
  const refreshAll = async () => {
    await Promise.all([loadDashboard(), loadWorkspace()]);
  };

  const createProfile = async (profileDraft: ProfileDraft) => {
    setSaving(true);
    setFormError("");

    try {
      await DashboardService.createProfile(accessToken, profileDraft);
      setDraft(initialProfileDraft(profileDraft.type));
      await refreshAll();
      selectTab("profiles");
    } catch (error: any) {
      setFormError(error?.message || "Could not create profile.");
    } finally {
      setSaving(false);
    }
  };

  const saveAccount = async (payload: {
    firstName: string;
    lastName: string;
    country: string;
  }) => {
    setSaving(true);
    try {
      await DashboardService.updateAccount(accessToken, payload);
      await fetchCurrentUser();
    } finally {
      setSaving(false);
    }
  };

  const submitListing = async (listingId: string) => {
    await DashboardService.submitListingForReview(accessToken, listingId);
    await refreshAll();
  };

  const deleteListing = async (listingId: string) => {
    if (!window.confirm("Delete this listing?")) return;
    await DashboardService.deleteListing(accessToken, listingId);
    await refreshAll();
  };

  const createFundraiser = async (payload: CreateFundraiserPayload) => {
    setSaving(true);
    setFormError("");
    try {
      await FundraiserService.createFundraiser(accessToken, payload);
      setFundraiserDraft(initialFundraiserDraft());
      await refreshAll();
      selectTab("fundraisers");
    } catch (error: any) {
      setFormError(error?.message || "Could not create fund raiser.");
    } finally {
      setSaving(false);
    }
  };

  const submitFundraiser = async (id: string) => {
    await FundraiserService.submitFundraiser(accessToken, id);
    await refreshAll();
  };

  const deleteFundraiser = async (id: string) => {
    if (!window.confirm("Delete this fund raiser?")) return;
    await FundraiserService.deleteFundraiser(accessToken, id);
    await refreshAll();
  };

  const createFundingService = async (payload: CreateFundingServicePayload) => {
    setSaving(true);
    setFormError("");

    try {
      await FundingServiceService.createFundingService(accessToken, payload);
      setFundingServiceDraft(initialFundingServiceDraft());
      await refreshAll();
      selectTab("funding-services");
    } catch (error: any) {
      setFormError(error?.message || "Could not create funding service.");
    } finally {
      setSaving(false);
    }
  };

  const submitFundingService = async (id: string) => {
    await FundingServiceService.submitFundingService(accessToken, id);
    await refreshAll();
  };

  const deleteFundingService = async (id: string) => {
    if (!window.confirm("Delete this funding service?")) return;
    await FundingServiceService.deleteFundingService(accessToken, id);
    await refreshAll();
  };

  const createStartup = async (payload: CreateStartupPayload) => {
    setSaving(true);
    setFormError("");

    try {
      await StartupService.createStartup(accessToken, payload);
      setStartupDraft(initialStartupDraft());
      await refreshAll();
      selectTab("startups");
    } catch (error: any) {
      setFormError(error?.message || "Could not create startup.");
    } finally {
      setSaving(false);
    }
  };

  const submitStartup = async (id: string) => {
    await StartupService.submitStartup(accessToken, id);
    await refreshAll();
  };

  const deleteStartup = async (id: string) => {
    if (!window.confirm("Delete this startup?")) return;
    await StartupService.deleteStartup(accessToken, id);
    await refreshAll();
  };

  const sendEnquiry = async (businessId: string) => {
    setSending(true);
    try {
      await DashboardService.createDeal(accessToken, {
        businessId,
        message: enquiryMessage,
      });
      setSelectedOpportunityId("");
      setEnquiryMessage("");
      await refreshAll();
      selectTab("enquiries");
    } finally {
      setSending(false);
    }
  };

  const openConversation = async (dealId: string) => {
    if (!accessToken) return;

    const previousDealId = activeDealRef.current;
    if (previousDealId && previousDealId !== dealId) {
      socketRef.current?.emit("deal:leave", { dealId: previousDealId });
    }

    activeDealRef.current = dealId;
    setSelectedDealId(dealId);
    setLoadingMessages(true);
    socketRef.current?.emit("deal:join", { dealId });

    try {
      const response = await DashboardService.getDealMessages(
        accessToken,
        dealId,
      );
      setMessages(response.data);
      await DashboardService.markMessagesRead(accessToken, dealId).catch(
        () => undefined,
      );
      socketRef.current?.emit("message:read", { dealId });
      await Promise.all([loadWorkspace(), loadDashboard()]);
    } finally {
      setLoadingMessages(false);
    }
  };

  const sendMessage = async () => {
    const content = messageDraft.trim();
    if (!accessToken || !selectedDealId || !content) return;
    setSending(true);

    const sendViaSocket = () =>
      new Promise<MarketplaceMessage | null>((resolve, reject) => {
        const socket = socketRef.current;
        if (!socket?.connected) {
          resolve(null);
          return;
        }

        let settled = false;
        const timeout = window.setTimeout(() => {
          if (settled) return;
          settled = true;
          resolve(null);
        }, 3500);

        socket.emit(
          "message:send",
          { dealId: selectedDealId, content },
          (response?: { message?: MarketplaceMessage; error?: string }) => {
            if (settled) return;
            settled = true;
            window.clearTimeout(timeout);

            if (response?.error) {
              reject(new Error(response.error));
              return;
            }

            resolve(response?.message || null);
          },
        );
      });

    try {
      const socketMessage = await sendViaSocket();

      if (socketMessage) {
        appendMessage(socketMessage);
      } else {
        const response = await DashboardService.sendMessage(
          accessToken,
          selectedDealId,
          content,
        );
        appendMessage(response.data.message);
      }

      setMessageDraft("");
      await Promise.all([loadWorkspace(), loadDashboard()]);
    } catch (error: any) {
      setLoadError(error?.message || "Could not send message.");
    } finally {
      setSending(false);
    }
  };

  const advanceDeal = async (dealId: string, status: DealStatus) => {
    await DashboardService.updateDealStatus(accessToken, dealId, { status });
    await refreshAll();
  };

  const signNda = async (dealId: string) => {
    await DashboardService.signNda(accessToken, dealId);
    await refreshAll();
  };

  const withdrawDeal = async (dealId: string) => {
    await DashboardService.withdrawDeal(accessToken, dealId);
    await refreshAll();
  };

  const uploadDocument = async (payload: {
    file: File;
    type: string;
    access: DocumentAccess;
  }) => {
    setUploading(true);

    try {
      await DashboardService.uploadDocument(accessToken, payload);
      await refreshAll();
    } finally {
      setUploading(false);
    }
  };

  const deleteDocument = async (documentId: string) => {
    if (!window.confirm("Delete this document?")) return;
    await DashboardService.deleteDocument(accessToken, documentId);
    await refreshAll();
  };

  const saveDashboardSettings = (settings: DashboardSettings) => {
  setDashboardSettings(settings);
  window.localStorage.setItem(DASHBOARD_SETTINGS_KEY, JSON.stringify(settings));
  setSettingsSaved("Settings saved successfully.");

  window.setTimeout(() => {
    setSettingsSaved("");
  }, 2500);
};

const resetDashboardSettings = () => {
  setDashboardSettings(DEFAULT_DASHBOARD_SETTINGS);
  window.localStorage.setItem(
    DASHBOARD_SETTINGS_KEY,
    JSON.stringify(DEFAULT_DASHBOARD_SETTINGS),
  );
  setSettingsSaved("Settings reset to defaults.");

  window.setTimeout(() => {
    setSettingsSaved("");
  }, 2500);
};

  if (
    !initialized ||
    (initialized &&
      isAuthenticated &&
      loadingDashboard &&
      dashboard === EMPTY_DASHBOARD)
  ) {
    return (
      <>
        <style>{styles}</style>
        <div className="db-loading">
          <Loader2 className="spin" size={20} />
          <span>Loading member workspace</span>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div
  className={cn(
    "db-page",
    collapsed && "sidebar-collapsed",
    dashboardSettings.compactMode && "compact-density",
  )}
>
        {mobileOpen && (
          <button
            type="button"
            className="db-backdrop"
            onClick={() => setMobileOpen(false)}
            aria-label="Close dashboard menu"
          />
        )}

        <div className="db-shell">
          <Sidebar
            active={activeTab}
            collapsed={collapsed}
            mobileOpen={mobileOpen}
            onSelect={selectTab}
            onToggle={() => setCollapsed((v) => !v)}
            onCloseMobile={() => setMobileOpen(false)}
            userName={account.fullName}
            initials={account.initials}
            role={account.role}
            country={account.country}
            profileScore={account.profileScore}
            profileCount={dashboard.profiles.length}
            unreadNotifications={dashboard.stats.unreadNotifications}
            isVerified={account.isVerified}
          />

          <section className="db-main">
            <Topbar
              active={activeTab}
              userName={account.fullName}
              initials={account.initials}
              notifications={dashboard.stats.unreadNotifications}
              onMenu={() => setMobileOpen(true)}
              onHome={() => router.push("/")}
              onActivity={() => selectTab("activity")}
              onAddProfile={() => startProfile("SELL_BUSINESS")}
            />

            {loadError && <div className="db-alert">{loadError}</div>}

            {activeTab === "overview" && (
              <OverviewContent
                account={account}
                dashboard={dashboard}
                onStartProfile={startProfile}
                onOpenProfiles={() => selectTab("profiles")}
                onOpenActivity={() => selectTab("activity")}
                onOpenAccount={() => selectTab("account")}
                onOpenPipeline={() => selectTab("pipeline")}
              />
            )}
            {activeTab === "add-profile" && (
              <AddProfileContent
                draft={draft}
                setDraft={setDraft}
                onCreate={createProfile}
                onSelectProfileType={startProfile}
                saving={saving}
                error={formError}
              />
            )}
            {activeTab === "profiles" && (
              <ProfilesContent
                profiles={dashboard.profiles}
                onStartProfile={startProfile}
              />
            )}
            {activeTab === "fundraisers" && (
              <FundraisersContent
                fundraisers={fundraisers}
                draft={fundraiserDraft}
                setDraft={setFundraiserDraft}
                saving={saving}
                error={formError}
                onCreate={createFundraiser}
                onSubmit={submitFundraiser}
                onDelete={deleteFundraiser}
              />
            )}

            {activeTab === "funding-services" && (
              <FundingServicesContent
                fundingServices={fundingServices}
                draft={fundingServiceDraft}
                setDraft={setFundingServiceDraft}
                saving={saving}
                error={formError}
                onCreate={createFundingService}
                onSubmit={submitFundingService}
                onDelete={deleteFundingService}
              />
            )}

            {activeTab === "startups" && (
              <StartupsContent
                startups={startups}
                draft={startupDraft}
                setDraft={setStartupDraft}
                saving={saving}
                error={formError}
                onCreate={createStartup}
                onSubmit={submitStartup}
                onDelete={deleteStartup}
              />
            )}

            {activeTab === "opportunities" && (
              <OpportunitiesContent
                opportunities={opportunities}
                selectedId={selectedOpportunityId}
                message={enquiryMessage}
                saving={sending}
                onSelect={(id) => {
                  setSelectedOpportunityId(id);
                  setEnquiryMessage(
                    "Hello, I am interested in this opportunity and would like to learn more about the business, financials, and deal process.",
                  );
                }}
                onMessageChange={setEnquiryMessage}
                onSend={sendEnquiry}
              />
            )}
            {activeTab === "listings" && (
              <ListingsContent
                listings={listings}
                loading={loadingWorkspace}
                onSubmit={submitListing}
                onDelete={deleteListing}
              />
            )}
            {activeTab === "enquiries" && (
              <EnquiriesContent
                conversations={conversations}
                selectedDealId={selectedDealId}
                messages={messages}
                messageDraft={messageDraft}
                loadingMessages={loadingMessages}
                sending={sending}
                currentUserId={(user as any)?.id || ""}
                onSelectConversation={openConversation}
                onMessageChange={setMessageDraft}
                onSendMessage={sendMessage}
                onRefresh={loadWorkspace}
              />
            )}
            {activeTab === "activity" && (
              <ActivityContent
                activity={dashboard.latestActivity}
                postings={dashboard.marketPostings}
              />
            )}
            {activeTab === "account" && (
              <AccountContent
                account={account}
                onSave={saveAccount}
                saving={saving}
              />
            )}
            {activeTab === "documents" && (
              <DocumentsContent
                documents={documents.length ? documents : dashboard.documents}
                saving={uploading}
                onUpload={uploadDocument}
                onDelete={deleteDocument}
              />
            )}
            {activeTab === "pipeline" && (
              <PipelineContent
                pipeline={dashboard.pipeline}
                dashboardDeals={dashboard.deals}
                deals={deals}
                onAdvance={advanceDeal}
                onSignNda={signNda}
                onWithdraw={withdrawDeal}
              />
            )}
            {activeTab === "settings" && (
  <SettingsContent
    settings={dashboardSettings}
    onSave={saveDashboardSettings}
    onReset={resetDashboardSettings}
    savedMessage={settingsSaved}
  />
)}
          </section>
        </div>
      </div>
    </>
  );
}

const styles = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{--navy:#0a1628;--navy2:#0d1e35;--blue:#1A56DB;--blue-d:#1444B8;--amber:#F5A623;--green:#10B981;--purple:#7C3AED;--red:#D42B2B;--text:#0f1e36;--t2:#4a5568;--t3:#8896a8;--bdr:#e2e6ed;--surf:#f4f6f9;--bg:#fff;--font:'Poppins','Inter',system-ui,sans-serif;--sidebar:268px;--sidebar-collapsed:68px;--t:180ms cubic-bezier(.4,0,.2,1)}
  body{font-family:var(--font);background:var(--surf);color:var(--text);line-height:1.5}
  .spin{animation:spin .7s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}
  .db-loading{min-height:100vh;display:flex;align-items:center;justify-content:center;gap:10px;background:linear-gradient(180deg,#f0f4fa,var(--surf));color:var(--text);font-size:13px;font-weight:900}
  .db-page{min-height:100vh;background:linear-gradient(180deg,#f0f4fa,var(--surf))}
  .db-shell{min-height:100vh;display:grid;grid-template-columns:var(--sidebar) minmax(0,1fr)}
  .db-page.sidebar-collapsed .db-shell{grid-template-columns:var(--sidebar-collapsed) minmax(0,1fr)}
  .db-sidebar{position:sticky;top:0;height:100vh;overflow-y:auto;overflow-x:hidden;background:var(--navy2);border-right:1px solid rgba(255,255,255,.06);color:#fff;display:flex;flex-direction:column;transition:width var(--t)}
  .db-user-card{display:flex;align-items:center;gap:12px;padding:20px 16px 16px;border-bottom:1px solid rgba(255,255,255,.07);min-height:88px;background:rgba(255,255,255,.03)}
  .db-user-avatar{width:42px;height:42px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,var(--blue),var(--amber));color:#fff;font-size:13px;font-weight:900;flex-shrink:0;box-shadow:0 0 0 3px rgba(26,86,219,.25)}
  .db-user-copy{min-width:0}.db-user-copy p{font-size:13px;font-weight:900;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.db-user-copy span{display:block;font-size:10px;font-weight:700;color:rgba(255,255,255,.36);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px}.db-user-copy strong{display:inline-flex;align-items:center;gap:5px;margin-top:7px;background:rgba(16,185,129,.14);color:#6ee7b7;font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:.45px;padding:4px 8px;border-radius:2px}
  .db-score-card{margin:14px 12px 8px;padding:13px;border:1px solid rgba(255,255,255,.07);background:rgba(255,255,255,.03);border-radius:2px}.db-score-card>div:first-child{display:flex;align-items:center;justify-content:space-between;color:rgba(255,255,255,.38);font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.6px}.db-score-card strong{color:#6ee7b7;font-size:12px}.db-score-track{height:4px;background:rgba(255,255,255,.08);margin:9px 0 8px;overflow:hidden;border-radius:2px}.db-score-track span{display:block;height:100%;background:linear-gradient(90deg,var(--green),var(--blue));border-radius:2px}.db-score-card p{font-size:10.5px;line-height:1.55;color:rgba(255,255,255,.32)}
  .db-nav-section{height:26px;padding:9px 16px 0;color:rgba(255,255,255,.24);font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.9px}.db-nav{display:flex;flex-direction:column;gap:1px;padding:6px 10px;flex:1}.db-nav-item{position:relative;width:100%;height:38px;display:flex;align-items:center;gap:10px;border:1px solid transparent;background:none;color:rgba(255,255,255,.48);font-family:var(--font);font-size:12.5px;font-weight:800;text-align:left;padding:0 10px;cursor:pointer;transition:all var(--t);border-radius:2px}.db-nav-item:hover{background:rgba(255,255,255,.06);color:rgba(255,255,255,.88)}.db-nav-item.active{background:rgba(255,255,255,.08);color:#fff;border-color:rgba(255,255,255,.09);box-shadow:inset 3px 0 0 var(--amber)}.db-nav-item span{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.db-nav-item b{min-width:20px;padding:2px 6px;background:var(--blue);color:#fff;font-size:9px;font-weight:900;text-align:center;border-radius:2px}.db-nav-item i{position:absolute;top:8px;right:8px;width:6px;height:6px;border-radius:50%;background:var(--blue)}
  .db-sidebar.collapsed .db-user-card{justify-content:center;padding-left:0;padding-right:0}.db-sidebar.collapsed .db-nav{padding-left:8px;padding-right:8px}.db-sidebar.collapsed .db-nav-item{justify-content:center;padding:0}.db-sidebar.collapsed .db-sidebar-footer{align-items:center}
  .db-sidebar-footer{padding:10px 12px 14px;display:flex;flex-direction:column;gap:8px;border-top:1px solid rgba(255,255,255,.07)}.db-home-link{height:36px;display:flex;align-items:center;justify-content:center;gap:8px;text-decoration:none;background:linear-gradient(135deg,rgba(245,166,35,.22),rgba(245,166,35,.12));border:1px solid rgba(245,166,35,.32);color:#fbbf24;font-family:var(--font);font-size:12px;font-weight:900;cursor:pointer;transition:all var(--t);letter-spacing:.2px}.db-home-link:hover{background:linear-gradient(135deg,rgba(245,166,35,.32),rgba(245,166,35,.2));border-color:rgba(245,166,35,.48);color:#fcd34d;box-shadow:0 0 18px rgba(245,166,35,.18)}
  .db-collapse{height:36px;display:flex;align-items:center;justify-content:center;gap:8px;text-decoration:none;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);color:rgba(255,255,255,.5);font-family:var(--font);font-size:12px;font-weight:900;cursor:pointer;transition:all var(--t)}.db-collapse:hover{background:rgba(255,255,255,.08);color:#fff}
  .db-protected{display:flex;gap:10px;padding:12px;border:1px solid rgba(255,255,255,.07);background:rgba(255,255,255,.03);margin-top:2px}.db-protected>svg{color:var(--green);flex-shrink:0;margin-top:2px}.db-protected strong{display:block;font-size:11.5px;color:rgba(255,255,255,.72);font-weight:900}.db-protected span{display:block;font-size:10.5px;color:rgba(255,255,255,.3);line-height:1.5;margin-top:2px}
  .db-mobile-close{display:none;position:absolute;top:16px;right:16px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);border-radius:4px;color:rgba(255,255,255,.8);padding:7px;cursor:pointer;place-items:center}
  .db-main{min-width:0;display:flex;flex-direction:column}.db-topbar{position:sticky;top:0;z-index:40;height:68px;background:rgba(255,255,255,.96);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-bottom:1px solid var(--bdr);display:flex;align-items:center;justify-content:space-between;gap:18px;padding:0 28px}.db-top-left{display:flex;align-items:center;gap:12px;min-width:0}.db-top-left p{font-size:10px;color:var(--t3);font-weight:900;text-transform:uppercase;letter-spacing:.65px}.db-top-left h2{font-size:16px;font-weight:900;color:var(--text);letter-spacing:-.2px;margin-top:1px}.db-menu-btn{display:none;width:38px;height:38px;border:1px solid var(--bdr);background:#fff;color:var(--text);cursor:pointer;align-items:center;justify-content:center}.db-top-actions{display:flex;align-items:center;gap:8px}
  .db-home-btn,.db-icon-btn,.db-primary-btn,.db-secondary-btn{height:36px;display:inline-flex;align-items:center;justify-content:center;gap:7px;border:1px solid transparent;font-family:var(--font);font-size:12.5px;font-weight:900;cursor:pointer;text-decoration:none;transition:all var(--t);white-space:nowrap;border-radius:3px}.db-home-btn{background:#fff;border-color:var(--bdr);color:var(--t2);padding:0 12px;font-size:12px}.db-home-btn:hover{background:var(--surf);color:var(--text)}.db-secondary-btn{background:#fff;border-color:var(--bdr);color:var(--t2);padding:0 13px}.db-secondary-btn:hover{background:var(--surf);color:var(--text)}.db-secondary-btn.dark{background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.18);color:#fff}.db-primary-btn{background:var(--blue);color:#fff;padding:0 14px;box-shadow:0 2px 8px rgba(26,86,219,.24)}.db-primary-btn:hover{background:var(--blue-d);box-shadow:0 4px 16px rgba(26,86,219,.34)}.db-primary-btn.amber{background:var(--amber);box-shadow:0 2px 8px rgba(245,166,35,.28)}.db-primary-btn.amber:hover{background:#e09310;box-shadow:0 4px 16px rgba(245,166,35,.38)}.db-primary-btn:disabled{opacity:.6;cursor:not-allowed;box-shadow:none}.db-icon-btn{position:relative;width:36px;background:#fff;border-color:var(--bdr);color:var(--text)}.db-icon-btn span{position:absolute;top:8px;right:8px;width:7px;height:7px;border-radius:50%;background:var(--red);border:2px solid #fff}.db-link-btn{border:0;background:none;color:var(--blue);font-family:var(--font);font-size:12px;font-weight:900;cursor:pointer;text-decoration:none;white-space:nowrap;transition:color var(--t)}.db-link-btn:hover{text-decoration:underline}
  .db-top-user{height:36px;display:flex;align-items:center;gap:8px;border-left:1px solid var(--bdr);padding-left:12px}.db-top-user span{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,var(--blue),var(--amber));color:#fff;font-size:11px;font-weight:900}.db-top-user strong{max-width:140px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:12.5px;color:var(--text);font-weight:900}
  .db-alert{margin:18px 28px 0;border:1px solid #fde68a;border-left:3px solid var(--amber);background:#fffbeb;color:#92400e;padding:12px 14px;font-size:12.5px;font-weight:900;border-radius:2px}.db-content{padding:24px 28px 56px;display:flex;flex-direction:column;gap:20px;max-width:1440px;width:100%}
  .db-page-header{position:relative;overflow:hidden;background:var(--navy);color:#fff;display:flex;align-items:flex-start;justify-content:space-between;gap:20px;padding:28px}.db-page-header::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 60% 70% at 85% 10%,rgba(26,86,219,.28),transparent 60%),radial-gradient(ellipse 50% 65% at 5% 95%,rgba(245,166,35,.14),transparent 58%);pointer-events:none}.db-page-header>*{position:relative;z-index:1}.db-eyebrow{font-size:10px;color:var(--blue);font-weight:900;text-transform:uppercase;letter-spacing:.9px;margin-bottom:6px}.db-page-header .db-eyebrow{color:#fbbf24}.db-page-header h1{font-size:26px;line-height:1.14;font-weight:900;letter-spacing:-.6px;margin-bottom:9px}.db-page-header p:not(.db-eyebrow){font-size:13px;line-height:1.7;color:rgba(255,255,255,.6);max-width:760px}.db-header-actions{display:flex;align-items:center;gap:9px;flex-shrink:0}
  .db-stat-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}.db-stat-card{position:relative;text-align:left;min-height:150px;background:#fff;border:1px solid var(--bdr);padding:18px;display:flex;flex-direction:column;align-items:flex-start;font-family:var(--font);transition:all var(--t)}button.db-stat-card{cursor:pointer}.db-stat-card.clickable:hover{border-color:#c8d0db;box-shadow:0 8px 28px rgba(15,30,54,.07);transform:translateY(-1px)}.db-stat-icon{width:36px;height:36px;display:grid;place-items:center;margin-bottom:16px;border-radius:2px}.db-stat-icon.blue{background:rgba(26,86,219,.1);color:var(--blue)}.db-stat-icon.green{background:rgba(16,185,129,.11);color:var(--green)}.db-stat-icon.amber{background:rgba(245,166,35,.13);color:#c97d10}.db-stat-icon.purple{background:rgba(124,58,237,.1);color:var(--purple)}.db-stat-icon.red{background:rgba(212,43,43,.1);color:var(--red)}.db-stat-copy span{display:block;color:var(--t3);font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.65px}.db-stat-copy strong{display:block;color:var(--text);font-size:29px;font-weight:900;line-height:1;margin:8px 0 7px;letter-spacing:-.8px}.db-stat-copy p{color:var(--t2);font-size:11.5px;font-weight:700;line-height:1.5}.db-stat-trend{position:absolute;top:16px;right:16px;font-style:normal;font-size:9.5px;font-weight:900;text-transform:uppercase;letter-spacing:.45px;padding:4px 7px;border-radius:2px}.db-stat-trend.blue{background:rgba(26,86,219,.1);color:var(--blue)}.db-stat-trend.green{background:rgba(16,185,129,.11);color:var(--green)}.db-stat-trend.amber{background:rgba(245,166,35,.13);color:#c97d10}.db-stat-trend.purple{background:rgba(124,58,237,.1);color:var(--purple)}
  .db-panel,.db-profile-card,.db-posting{background:#fff;border:1px solid var(--bdr)}.db-panel{padding:22px}.db-panel-head{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;margin-bottom:18px}.db-panel-head h2{font-size:17px;font-weight:900;color:var(--text);letter-spacing:-.25px}.db-panel-head p:not(.db-eyebrow){font-size:12px;color:var(--t3);margin-top:3px;line-height:1.6}
  .db-account-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.db-account-grid div{background:var(--surf);border:1px solid var(--bdr);padding:13px}.db-account-grid span{display:block;font-size:10px;color:var(--t3);font-weight:900;text-transform:uppercase;letter-spacing:.55px;margin-bottom:5px}.db-account-grid strong{display:block;font-size:12.5px;color:var(--text);font-weight:800;word-break:break-word}
  .db-action-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.db-action-card{position:relative;text-align:left;background:#fff;border:1px solid var(--bdr);border-top:3px solid var(--blue);padding:16px 42px 16px 16px;cursor:pointer;font-family:var(--font);transition:all var(--t)}.db-action-card:hover{background:#f8fafc;border-color:#c8d0db;box-shadow:0 4px 16px rgba(15,30,54,.06)}.db-action-card span{font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.55px}.db-action-card strong{display:block;font-size:13.5px;color:var(--text);font-weight:900;margin:7px 0 5px}.db-action-card p{font-size:11.5px;color:var(--t2);line-height:1.55}.db-action-card svg{position:absolute;top:16px;right:16px;color:var(--t3)}
  .db-grid-2{display:grid;grid-template-columns:minmax(0,1fr) 420px;gap:20px}.db-profile-list{display:flex;flex-direction:column;gap:12px}.db-profile-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.db-profile-card{padding:16px}.db-profile-card.compact{padding:13px}.db-profile-card-top{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:11px}.db-profile-kind,.db-status-badge{font-size:9.5px;font-weight:900;text-transform:uppercase;letter-spacing:.45px;padding:4px 7px;border-radius:2px}.db-status-badge.live,.db-status-badge.active{background:rgba(16,185,129,.1);color:var(--green)}.db-status-badge.draft{background:rgba(136,150,168,.12);color:var(--t2)}.db-status-badge.in-review,.db-status-badge.pending{background:rgba(245,166,35,.12);color:#c97d10}.db-status-badge.rejected,.db-status-badge.closed{background:rgba(212,43,43,.1);color:var(--red)}.db-profile-card h3{font-size:14px;color:var(--text);font-weight:900;margin-bottom:6px}.db-profile-card>p{font-size:11.8px;color:var(--t2);line-height:1.6;margin-bottom:12px}.db-profile-meta{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}.db-profile-meta span{background:var(--surf);border:1px solid var(--bdr);color:var(--t2);font-size:10.5px;font-weight:800;padding:4px 8px;border-radius:2px}.db-profile-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px}.db-profile-stats div{background:var(--surf);padding:9px}.db-profile-stats strong{display:block;font-size:13px;color:var(--text);font-weight:900}.db-profile-stats span{font-size:9.5px;color:var(--t3);font-weight:900;text-transform:uppercase}.db-progress-row>div:first-child{display:flex;justify-content:space-between;font-size:10px;color:var(--t3);font-weight:900;text-transform:uppercase;margin-bottom:6px}.db-progress-row>div:last-child{height:4px;background:var(--surf);overflow:hidden;border-radius:2px}.db-progress-row>div:last-child span{display:block;height:100%;background:var(--blue);border-radius:2px}
  .db-add-layout{display:grid;grid-template-columns:360px minmax(0,1fr);gap:20px}.db-type-list{display:flex;flex-direction:column;gap:9px}.db-type-option{text-align:left;background:#fff;border:1px solid var(--bdr);padding:12px;font-family:var(--font);cursor:pointer;transition:all var(--t);border-radius:2px}.db-type-option:hover,.db-type-option.active{background:var(--surf)}.db-type-option.active{box-shadow:0 0 0 2px rgba(26,86,219,.12)}.db-type-option span{display:inline-flex;font-size:9.5px;font-weight:900;text-transform:uppercase;letter-spacing:.45px;padding:4px 7px;margin-bottom:7px;border-radius:2px}.db-type-option strong{display:block;font-size:12.5px;color:var(--text);font-weight:900}.db-type-option p{font-size:11px;color:var(--t2);line-height:1.5;margin-top:4px}
  .db-error{background:#fef2f2;color:#b91c1c;border:1px solid #fecaca;border-left:3px solid var(--red);padding:10px 12px;font-size:12px;font-weight:900;margin-bottom:14px}.db-profile-form{display:grid;grid-template-columns:1fr 1fr;gap:14px}.db-profile-form label{display:flex;flex-direction:column;gap:6px;font-size:10.5px;font-weight:900;color:var(--text);text-transform:uppercase;letter-spacing:.45px}.db-profile-form label.full{grid-column:1/-1}.db-profile-form input,.db-profile-form textarea{width:100%;border:1.5px solid var(--bdr);background:#fff;color:var(--text);font-family:var(--font);font-size:13px;padding:10px 12px;outline:none;text-transform:none;letter-spacing:0;font-weight:600;transition:border-color var(--t);border-radius:2px}.db-profile-form input:focus,.db-profile-form textarea:focus{border-color:var(--blue);box-shadow:0 0 0 3px rgba(26,86,219,.1)}.db-profile-form input:disabled{background:var(--surf);color:var(--t3)}.db-form-actions{grid-column:1/-1;display:flex;justify-content:flex-end;gap:10px;margin-top:4px}
  .db-form-section{grid-column:1/-1;display:grid;grid-template-columns:1fr 1fr;gap:14px;border-top:1px solid var(--bdr);padding-top:18px;margin-top:6px}.db-form-section:first-child{border-top:0;padding-top:0;margin-top:0}.db-form-section-head{grid-column:1/-1}.db-form-section-head p{font-size:10px;color:var(--blue);font-weight:900;text-transform:uppercase;letter-spacing:.75px;margin-bottom:4px}.db-form-section-head h3{font-size:15px;color:var(--text);font-weight:900;letter-spacing:-.15px}.db-form-section-head span{display:block;font-size:11.5px;color:var(--t3);font-weight:700;line-height:1.55;margin-top:3px}.db-check{min-height:42px;display:flex!important;flex-direction:row!important;align-items:center;gap:9px;background:var(--surf);border:1px solid var(--bdr);padding:10px 12px;text-transform:none!important;letter-spacing:0!important}.db-check input{width:15px!important;height:15px;flex-shrink:0}.db-check span{font-size:12px;color:var(--t2);font-weight:900}
  .db-activity-list{display:flex;flex-direction:column}.db-activity{display:flex;align-items:flex-start;gap:12px;border-bottom:1px solid var(--bdr);padding:13px 0}.db-activity:first-child{padding-top:0}.db-activity:last-child{border-bottom:0;padding-bottom:0}.db-activity-dot{width:6px;height:6px;border-radius:50%;background:var(--blue);margin-top:8px;flex-shrink:0}.db-activity div{min-width:0;flex:1}.db-activity strong{display:block;font-size:12.5px;color:var(--text);font-weight:900}.db-activity p{font-size:11.5px;color:var(--t2);line-height:1.5;margin-top:3px}.db-activity em{display:block;font-style:normal;font-size:9.5px;font-weight:900;text-transform:uppercase;color:var(--blue);letter-spacing:.5px;margin-top:5px}.db-activity time{font-size:10.5px;color:var(--t3);font-weight:800;white-space:nowrap}
  .db-posting-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}.db-posting{padding:15px}.db-posting span{font-size:9.5px;color:var(--blue);font-weight:900;text-transform:uppercase;letter-spacing:.5px}.db-posting h3{font-size:13px;color:var(--text);font-weight:900;line-height:1.35;margin:8px 0 6px}.db-posting p{font-size:11px;color:var(--t3);line-height:1.5;margin-bottom:10px}.db-posting strong{display:block;font-size:13px;color:var(--green);font-weight:900;margin-bottom:12px}.db-posting a{font-size:11px;color:var(--blue);font-weight:900;text-decoration:none}.db-posting a:hover{text-decoration:underline}
  .db-pipeline{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:12px}.db-stage{background:var(--surf);border:1px solid var(--bdr);padding:13px}.db-stage-head{display:flex;align-items:center;gap:7px;margin-bottom:10px}.db-stage-head span{width:8px;height:8px;border-radius:50%;flex-shrink:0}.db-stage-head p{font-size:10.5px;color:var(--t2);font-weight:900}.db-stage strong{display:block;font-size:24px;font-weight:900;line-height:1}.db-stage small{display:block;color:var(--t3);font-size:10.5px;font-weight:800;margin-top:5px}.db-stage-track{height:3px;background:var(--bdr);margin-top:11px;overflow:hidden;border-radius:2px}.db-stage-track div{height:100%;border-radius:2px}
  .db-table-wrap{overflow-x:auto;margin:0 -22px;padding:0 22px}.db-table{width:100%;border-collapse:collapse;min-width:1080px}.db-table th{background:var(--surf);color:var(--t3);text-align:left;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.5px;padding:12px 14px;border-bottom:1px solid var(--bdr);white-space:nowrap}.db-table td{padding:13px 14px;border-bottom:1px solid var(--bdr);color:var(--t2);font-size:12.3px;vertical-align:middle;white-space:nowrap}.db-table tr.priority td{background:#fff7ed}.db-id{font-family:monospace;color:var(--text);font-size:11px}.db-company{display:flex;flex-direction:column;gap:2px}.db-company strong{color:var(--text);font-size:12.5px;font-weight:900}.db-company span{color:var(--t3);font-size:10.5px}.db-sector{display:inline-flex;background:rgba(26,86,219,.09);color:var(--blue);padding:3px 8px;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.35px;border-radius:2px}.db-money{color:var(--green);font-weight:900}.db-stage-badge{display:inline-flex;background:rgba(15,30,54,.07);color:var(--text);padding:4px 9px;font-size:10px;font-weight:900;border-radius:2px}.db-prob{display:flex;align-items:center;gap:8px}.db-prob div{width:60px;height:5px;background:var(--surf);overflow:hidden;border-radius:2px}.db-prob span{display:block;height:100%;background:var(--green)}.db-prob b{font-size:11px;color:var(--text);font-weight:900}
  .db-doc-list{display:flex;flex-direction:column;gap:10px}.db-doc{display:flex;align-items:center;gap:11px;background:var(--surf);border:1px solid var(--bdr);padding:11px}.db-doc-icon{width:36px;height:36px;background:#fff;border:1px solid var(--bdr);display:grid;place-items:center;color:var(--blue);font-size:10px;font-weight:900;flex-shrink:0}.db-doc div:nth-child(2){min-width:0;flex:1}.db-doc h3{font-size:12px;color:var(--text);font-weight:900;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.db-doc p{font-size:10.5px;color:var(--t3);margin-top:2px}.db-doc span{font-size:10px;font-weight:900;padding:4px 7px;flex-shrink:0;border-radius:2px}.db-doc span.ok{background:rgba(16,185,129,.1);color:var(--green)}.db-doc span.pending{background:rgba(245,166,35,.12);color:#c97d10}
  .db-placeholder,.db-empty{display:grid;place-items:center;text-align:center;background:#fff;border:1px dashed var(--bdr);padding:34px;color:var(--t3);font-size:13px;font-weight:900}.db-empty{min-height:120px}.db-placeholder{min-height:520px;border-style:solid}.db-placeholder svg{color:var(--blue);margin-bottom:12px}.db-placeholder h1{font-size:24px;font-weight:900;color:var(--text);letter-spacing:-.5px;margin-bottom:8px}.db-placeholder p:not(.db-eyebrow){font-size:13.5px;color:var(--t2)}
  .db-table-actions{display:flex;align-items:center;gap:7px;flex-wrap:wrap}.db-small-btn{min-height:28px;display:inline-flex;align-items:center;justify-content:center;gap:5px;border:1px solid var(--bdr);background:#fff;color:var(--text);padding:0 9px;font-family:var(--font);font-size:11px;font-weight:900;text-decoration:none;cursor:pointer;border-radius:2px}.db-small-btn:hover{background:var(--surf)}.db-small-btn.ghost{color:var(--blue)}.db-small-btn.danger{color:var(--red);border-color:#fecaca;background:#fef2f2}.db-inline-form{display:flex;flex-direction:column;gap:9px;margin-top:12px}.db-textarea,.db-select{width:100%;border:1.5px solid var(--bdr);background:#fff;color:var(--text);font-family:var(--font);font-size:13px;padding:10px 12px;outline:none;font-weight:600;border-radius:2px}.db-textarea:focus,.db-select:focus{border-color:var(--blue);box-shadow:0 0 0 3px rgba(26,86,219,.1)}.db-split-grid{display:grid;grid-template-columns:360px minmax(0,1fr);gap:20px}.db-conversation-list{display:flex;flex-direction:column;gap:8px}.db-conversation{width:100%;display:flex;align-items:center;justify-content:space-between;gap:10px;border:1px solid var(--bdr);background:#fff;text-align:left;padding:12px;font-family:var(--font);cursor:pointer}.db-conversation.active,.db-conversation:hover{background:var(--surf);border-color:#c8d0db}.db-conversation strong{display:block;font-size:12.5px;color:var(--text);font-weight:900}.db-conversation span{display:block;font-size:11px;color:var(--t3);margin-top:3px}.db-conversation b{min-width:22px;height:22px;display:grid;place-items:center;background:var(--blue);color:#fff;font-size:10px;border-radius:50%}.db-chat-panel{min-height:620px;display:flex;flex-direction:column}.db-chat-window{flex:1;min-height:330px;display:flex;flex-direction:column;gap:10px;overflow:auto;border:1px solid var(--bdr);background:var(--surf);padding:12px;margin-bottom:12px}.db-chat-window .db-empty{align-self:stretch}.db-chat-message{max-width:82%;align-self:flex-start;background:#fff;border:1px solid var(--bdr);padding:11px 12px}.db-chat-message.mine{align-self:flex-end;background:#eef3fd;border-color:#c4d5f9}.db-chat-message strong{display:block;font-size:12px;color:var(--text);font-weight:900}.db-chat-message p{font-size:12.5px;color:var(--t2);line-height:1.55;margin-top:4px}.db-chat-message time{display:block;font-size:10px;color:var(--t3);font-weight:800;margin-top:7px}.db-chat-form{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:end}.db-status-badge.pending-review,.db-status-badge.nda-sent,.db-status-badge.nda-signed{background:rgba(245,166,35,.12);color:#c97d10}.db-status-badge.inquiry,.db-status-badge.negotiation,.db-status-badge.due-diligence{background:rgba(26,86,219,.09);color:var(--blue)}.db-status-badge.withdrawn,.db-status-badge.rejected{background:rgba(212,43,43,.1);color:var(--red)}
  .db-backdrop{position:fixed;inset:0;z-index:80;border:0;background:rgba(10,18,36,.5);cursor:pointer;backdrop-filter:blur(2px)}
  .db-success{border:1px solid #bbf7d0;border-left:3px solid var(--green);background:#f0fdf4;color:#166534;padding:12px 14px;font-size:12.5px;font-weight:900;border-radius:2px}
  .db-settings-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}
  .db-settings-card{background:#fff;border:1px solid var(--bdr);padding:20px}
  .db-settings-card-head{display:flex;align-items:flex-start;gap:11px;margin-bottom:16px}
  .db-settings-card-head>svg{color:var(--blue);margin-top:2px;flex-shrink:0}
  .db-settings-card-head h2{font-size:16px;font-weight:900;color:var(--text);letter-spacing:-.2px}
  .db-settings-grid-inner{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .db-settings-grid-inner label:not(.db-check),.db-settings-card label:not(.db-check){display:flex;flex-direction:column;gap:6px;font-size:10.5px;font-weight:900;color:var(--text);text-transform:uppercase;letter-spacing:.45px}
  .db-settings-options{display:flex;flex-direction:column;gap:9px}
  .db-settings-actions{grid-column:1/-1;display:flex;justify-content:flex-end;gap:10px}
  .db-page.compact-density .db-content{gap:14px;padding-top:18px}
  .db-page.compact-density .db-panel,.db-page.compact-density .db-settings-card{padding:16px}
  .db-page.compact-density .db-page-header{padding:22px}
  @media(max-width:1280px){.db-stat-grid{grid-template-columns:repeat(2,1fr)}.db-pipeline{grid-template-columns:repeat(4,1fr)}.db-grid-2{grid-template-columns:1fr}.db-posting-grid{grid-template-columns:repeat(2,1fr)}.db-action-grid{grid-template-columns:repeat(2,1fr)}.db-add-layout{grid-template-columns:1fr}.db-account-grid{grid-template-columns:repeat(2,1fr)}}
  @media(max-width:980px){.db-shell,.db-page.sidebar-collapsed .db-shell{grid-template-columns:1fr}.db-sidebar{position:fixed;z-index:90;left:0;top:0;width:268px;height:100vh;transform:translateX(-100%);transition:transform var(--t)}.db-sidebar.collapsed{width:268px}.db-sidebar.mobile-open{transform:translateX(0)}.db-mobile-close{display:grid}.db-menu-btn{display:inline-flex}.db-topbar{height:auto;min-height:64px;padding:12px 16px}.db-top-user{display:none}.db-home-btn{display:none}.db-content{padding:18px 16px 44px}.db-page-header{flex-direction:column}.db-header-actions{width:100%;justify-content:flex-start}.db-profile-grid{grid-template-columns:1fr}.db-split-grid{grid-template-columns:1fr}.db-chat-form{grid-template-columns:1fr}.db-chat-message{max-width:100%}}
  @media(max-width:680px){.db-topbar{align-items:flex-start;flex-direction:column}.db-top-actions{width:100%;justify-content:space-between}.db-icon-btn{margin-left:auto}.db-page-header{padding:20px}.db-page-header h1{font-size:22px}.db-stat-grid,.db-pipeline,.db-posting-grid,.db-action-grid,.db-account-grid,.db-form-section,.db-settings-form,.db-settings-grid-inner{grid-template-columns:1fr}.db-panel{padding:16px}.db-table-wrap{margin:0 -16px;padding:0 16px}.db-profile-form{grid-template-columns:1fr}.db-form-actions,.db-settings-actions{justify-content:stretch;flex-direction:column}.db-primary-btn,.db-secondary-btn{width:100%}}
`;
