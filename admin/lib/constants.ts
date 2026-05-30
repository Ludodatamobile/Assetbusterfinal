export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:5000/api/v1";

export const ADMIN_ACCESS_TOKEN_KEY = "asset_busters_admin_access_token";
export const ADMIN_REFRESH_TOKEN_KEY = "asset_busters_admin_refresh_token";
export const ADMIN_COOKIE_NAME = "ab_admin_token";

export const ADMIN_NAV_ITEMS = [
  { label: "Overview", href: "/admin", icon: "LayoutDashboard" },
  { label: "Users", href: "/admin/users", icon: "Users" },
  { label: "Listings", href: "/admin/listings", icon: "Building2" },
  { label: "Fund Raisers", href: "/admin/fundraisers", icon: "HandCoins" },
  { label: "Deals", href: "/admin/deals", icon: "Handshake" },
  { label: "Startups", href: "/admin/startups", icon: "Rocket" },
  { label: "Analytics", href: "/admin/analytics", icon: "LineChart" },
  { label: "Content", href: "/admin/content", icon: "PanelTop" },
] as const;

export const DEAL_STATUSES = [
  "INQUIRY",
  "NDA_SENT",
  "NDA_SIGNED",
  "NEGOTIATION",
  "DUE_DILIGENCE",
  "CLOSED",
  "WITHDRAWN",
] as const;

export const LISTING_STATUSES = ["DRAFT", "PENDING_REVIEW", "ACTIVE", "REJECTED", "CLOSED"] as const;

export const USER_STATUSES = ["PENDING", "ACTIVE", "SUSPENDED", "DEACTIVATED"] as const;