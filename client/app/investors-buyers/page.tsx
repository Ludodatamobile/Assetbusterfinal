"use client";

import { useEffect, useMemo, useState } from "react";
import { MarketplaceService } from "@/services/marketplace.service";
import type { InvestorProfile } from "@/types/marketplace";

type InvestorType =
  | "Angel Investor"
  | "Private Equity"
  | "Venture Capital"
  | "Strategic Buyer"
  | "Family Office"
  | "Corporate Investor";

type DealType = "Partial Stake" | "Full Sale" | "Investment";

interface Investor {
  id: string;
  name: string;
  location: string;
  country: string;
  tagline: string;
  description: string;
  rating: number;
  type: InvestorType;
  investMin: string;
  investMax: string;
  portfolioSize?: number;
  industries: string[];
  dealTypes: DealType[];
  established?: number;
  premium?: boolean;
  featured?: boolean;
  verified?: boolean;
  dealsCount?: number;
  initials: string;
  avatarColor: string;
}

interface FilterState {
  type: string;
  country: string;
  deal: string;
  industry: string;
  verified: boolean;
  premium: boolean;
}

type SortId = "featured" | "rating" | "deals" | "portfolio";

const INVESTOR_TYPES = [
  "All",
  "Angel Investor",
  "Private Equity",
  "Venture Capital",
  "Strategic Buyer",
  "Family Office",
  "Corporate Investor",
];

const DEAL_TYPES = ["All", "Partial Stake", "Full Sale", "Investment"];

const DEFAULT_COUNTRIES = [
  "All",
  "Nigeria",
  "Kenya",
  "South Africa",
  "UAE",
  "India",
  "Ghana",
  "Senegal",
  "Guinea",
  "Singapore",
];

const DEFAULT_INDUSTRIES = [
  "All",
  "Fintech",
  "Healthcare",
  "FMCG",
  "Technology",
  "Logistics",
  "Agriculture",
  "SaaS",
  "Education",
  "Energy",
  "Real Estate",
  "Hospitality",
  "Manufacturing",
  "Retail",
  "E-Commerce",
  "Media",
];

const RESET_FILTERS: FilterState = {
  type: "All",
  country: "All",
  deal: "All",
  industry: "All",
  verified: false,
  premium: false,
};

const colors = ["#1A56DB", "#059669", "#F5A623", "#7C3AED", "#D42B2B", "#0891b2", "#ea580c", "#16a34a"];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function formatEnum(value?: string | null) {
  if (!value) return "";
  return value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

function compactMoney(value?: string | number | null, currency = "USD") {
  if (typeof value === "string" && value.trim()) return value;

  const amount = Number(value || 0);
  if (!amount) return "Not disclosed";

  if (amount >= 1_000_000_000) return `${currency} ${trimNumber(amount / 1_000_000_000)} Bn`;
  if (amount >= 1_000_000) return `${currency} ${trimNumber(amount / 1_000_000)} Mn`;
  if (amount >= 1_000) return `${currency} ${trimNumber(amount / 1_000)} K`;
  return `${currency} ${amount.toLocaleString()}`;
}

function trimNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, "");
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

function listFrom(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") return formatEnum(item);
        if (item && typeof item === "object") {
          const record = item as Record<string, unknown>;
          return String(record.name || record.title || record.label || "").trim();
        }
        return "";
      })
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/[,/]/)
      .map((item) => formatEnum(item.trim()))
      .filter(Boolean);
  }

  return [];
}

function dealTypeFrom(value: unknown): DealType[] {
  const items = listFrom(value);
  const mapped = items
    .map((item) => {
      const normalized = item.toUpperCase().replace(/\s+/g, "_");
      if (normalized === "FULL_SALE") return "Full Sale";
      if (normalized === "PARTIAL_STAKE") return "Partial Stake";
      if (normalized === "INVESTMENT") return "Investment";
      if (item === "Full Sale" || item === "Partial Stake" || item === "Investment") return item;
      return "";
    })
    .filter(Boolean) as DealType[];

  return mapped.length ? unique(mapped) as DealType[] : ["Investment"];
}

function investorTypeFrom(value: unknown, profileType?: unknown): InvestorType {
  const normalized = formatEnum(String(value || ""));

  if (INVESTOR_TYPES.includes(normalized)) return normalized as InvestorType;

  const profile = String(profileType || "").toUpperCase();
  if (profile === "BUY_BUSINESS") return "Strategic Buyer";
  if (profile === "INVEST") return "Angel Investor";

  return "Angel Investor";
}

function initialsFrom(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "AB";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

function colorFrom(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) hash = value.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function userName(user: any) {
  return [user?.firstName, user?.lastName].filter(Boolean).join(" ");
}

function mapInvestorProfile(profile: InvestorProfile): Investor {
  const raw = profile as any;
  const industries = listFrom(raw.industries || raw.industryFocus || raw.industry);
  const countries = listFrom(raw.countries || raw.country);
  const name =
    raw.title ||
    raw.name ||
    raw.firmName ||
    userName(raw.user) ||
    "Investor Profile";
  const type = investorTypeFrom(raw.investorType || raw.type, raw.profileType);
  const country = raw.country || countries[0] || raw.user?.country || "Global";
  const location = raw.city || raw.location || country;
  const currency = raw.currency || "USD";

  return {
    id: String(raw.id),
    name,
    location,
    country,
    tagline:
      raw.tagline ||
      raw.shortDescription ||
      `${type} focused on ${industries.slice(0, 2).join(" and ") || "qualified marketplace opportunities"}`,
    description:
      raw.bio ||
      raw.description ||
      raw.investmentThesis ||
      "Investor profile accepting curated marketplace introductions from qualified business owners.",
    rating: Number(raw.rating || raw.score || raw.profileScore || 0),
    type,
    investMin: compactMoney(raw.investMin || raw.minTicket, currency),
    investMax: compactMoney(raw.investMax || raw.maxTicket, currency),
    portfolioSize: Number(raw.portfolioSize || raw.portfolioCompanies || raw._count?.portfolio || 0) || undefined,
    industries: industries.length ? industries : ["General"],
    dealTypes: dealTypeFrom(raw.dealTypes),
    established: raw.established || (raw.createdAt ? new Date(raw.createdAt).getFullYear() : undefined),
    premium: Boolean(raw.premium || raw.isPremium),
    featured: Boolean(raw.featured || raw.isFeatured),
    verified: Boolean(raw.verified || raw.isVerified || raw.user?.verified || raw.user?.isEmailVerified),
    dealsCount: Number(raw.dealsCount || raw.closedDeals || raw._count?.deals || 0) || undefined,
    initials: raw.initials || initialsFrom(name),
    avatarColor: raw.avatarColor || colorFrom(String(raw.id || name)),
  };
}

function FilterSidebar({
  filters,
  countries,
  industries,
  onChange,
}: {
  filters: FilterState;
  countries: string[];
  industries: string[];
  onChange: (filters: FilterState) => void;
}) {
  return (
    <aside className="ib-sidebar">
      <div className="ib-filter-header">
        <h3 className="ib-filter-title">Filters</h3>
        <button className="ib-filter-reset" onClick={() => onChange(RESET_FILTERS)}>
          Reset
        </button>
      </div>

      <div className="ib-filter-group">
        <p className="ib-filter-label">Investor Type</p>
        <div className="ib-filter-list">
          {INVESTOR_TYPES.map((type) => (
            <button
              key={type}
              className={cn("ib-filter-pill", filters.type === type && "active")}
              onClick={() => onChange({ ...filters, type })}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="ib-filter-group">
        <p className="ib-filter-label">Country</p>
        <div className="ib-filter-list">
          {countries.map((country) => (
            <button
              key={country}
              className={cn("ib-filter-pill", filters.country === country && "active")}
              onClick={() => onChange({ ...filters, country })}
            >
              {country}
            </button>
          ))}
        </div>
      </div>

      <div className="ib-filter-group">
        <p className="ib-filter-label">Deal Interest</p>
        <div className="ib-filter-list">
          {DEAL_TYPES.map((deal) => (
            <button
              key={deal}
              className={cn("ib-filter-pill", filters.deal === deal && "active")}
              onClick={() => onChange({ ...filters, deal })}
            >
              {deal}
            </button>
          ))}
        </div>
      </div>

      <div className="ib-filter-group">
        <p className="ib-filter-label">Industry Focus</p>
        <div className="ib-filter-list ib-filter-scroll">
          {industries.map((industry) => (
            <button
              key={industry}
              className={cn("ib-filter-pill", filters.industry === industry && "active")}
              onClick={() => onChange({ ...filters, industry })}
            >
              {industry}
            </button>
          ))}
        </div>
      </div>

      <div className="ib-filter-group">
        <p className="ib-filter-label">Quick Filters</p>
        <label className="ib-checkbox">
          <input
            type="checkbox"
            checked={filters.verified}
            onChange={(event) => onChange({ ...filters, verified: event.target.checked })}
          />
          <span className="ib-checkbox-label">Verified Only</span>
        </label>
        <label className="ib-checkbox">
          <input
            type="checkbox"
            checked={filters.premium}
            onChange={(event) => onChange({ ...filters, premium: event.target.checked })}
          />
          <span className="ib-checkbox-label">Premium Profiles</span>
        </label>
      </div>
    </aside>
  );
}

function InvestorCard({ inv }: { inv: Investor }) {
  const typeColors: Record<InvestorType, string> = {
    "Angel Investor": "#059669",
    "Private Equity": "#1A56DB",
    "Venture Capital": "#F5A623",
    "Strategic Buyer": "#7C3AED",
    "Family Office": "#D42B2B",
    "Corporate Investor": "#0891b2",
  };

  const color = typeColors[inv.type] || "#1A56DB";

  return (
    <article className="ib-card">
      {inv.premium && (
        <div className="ib-premium-tag"><span>PREMIUM</span></div>
      )}

      <div className="ib-card-top">
        <div className="ib-avatar" style={{ background: `${inv.avatarColor}20`, border: `2px solid ${inv.avatarColor}30` }}>
          <span className="ib-avatar-initials" style={{ color: inv.avatarColor }}>{inv.initials}</span>
        </div>
        <div className="ib-card-header">
          <div className="ib-card-meta-row">
            <span className="ib-type-tag" style={{ color, background: `${color}14`, borderColor: `${color}28` }}>
              {inv.type}
            </span>
            {inv.verified && <span className="ib-verified-badge">Verified</span>}
            {inv.featured && <span className="ib-featured-badge">Featured</span>}
          </div>
          <h3 className="ib-card-name">
            <a href={`/investors-buyers/${inv.id}`}>{inv.name}</a>
          </h3>
          <p className="ib-card-tagline">{inv.tagline}</p>
        </div>
      </div>

      <p className="ib-card-desc">{inv.description}</p>

      <div className="ib-card-info-row">
        {inv.rating > 0 && <span className="ib-info-item">{inv.rating.toFixed(1)} rating</span>}
        <span className="ib-info-item">{inv.location}, {inv.country}</span>
        {Boolean(inv.dealsCount) && <span className="ib-info-item">{inv.dealsCount} deals closed</span>}
      </div>

      <div className="ib-industries-row">
        {inv.industries.slice(0, 4).map((industry) => (
          <span key={industry} className="ib-ind-chip">{industry}</span>
        ))}
        {inv.industries.length > 4 && (
          <span className="ib-ind-chip ib-ind-more">+{inv.industries.length - 4}</span>
        )}
      </div>

      <div className="ib-stats-grid">
        <div className="ib-stat">
          <span className="ib-stat-label">Min Ticket</span>
          <span className="ib-stat-val">{inv.investMin}</span>
        </div>
        <div className="ib-stat">
          <span className="ib-stat-label">Max Ticket</span>
          <span className="ib-stat-val">{inv.investMax}</span>
        </div>
        {Boolean(inv.portfolioSize) && (
          <div className="ib-stat">
            <span className="ib-stat-label">Portfolio Co's</span>
            <span className="ib-stat-val">{inv.portfolioSize}</span>
          </div>
        )}
        {Boolean(inv.established) && (
          <div className="ib-stat">
            <span className="ib-stat-label">Active Since</span>
            <span className="ib-stat-val">{inv.established}</span>
          </div>
        )}
      </div>

      <div className="ib-deal-types-row">
        <span className="ib-dt-label">Accepts:</span>
        {inv.dealTypes.map((dealType) => (
          <span key={dealType} className="ib-dt-chip">{dealType}</span>
        ))}
      </div>

      <div className="ib-card-footer">
        <div className="ib-ticket-wrap">
          <span className="ib-ticket-label">Investment Range</span>
          <div className="ib-ticket-amount">
            <span className="ib-amount">{inv.investMin}</span>
            <span className="ib-for">- {inv.investMax}</span>
          </div>
        </div>
        <a href={`/investors-buyers/${(inv as any).slug || inv.id}`}>{inv.name}</a>
      </div>
    </article>
  );
}

function StatsBanner({ investors }: { investors: Investor[] }) {
  const countryCount = unique(investors.map((investor) => investor.country)).length;
  const verifiedCount = investors.filter((investor) => investor.verified).length;
  const industryCount = unique(investors.flatMap((investor) => investor.industries)).length;

  const stats = [
    { value: investors.length ? `${investors.length}+` : "0", label: "Active Investors" },
    { value: countryCount ? `${countryCount}+` : "0", label: "Countries Represented" },
    { value: verifiedCount ? `${verifiedCount}+` : "0", label: "Verified Profiles" },
    { value: industryCount ? `${industryCount}+` : "0", label: "Industry Focus Areas" },
  ];

  return (
    <div className="ib-stats-banner">
      {stats.map((stat) => (
        <div key={stat.label} className="ib-stats-banner-item">
          <span className="ib-stats-banner-val">{stat.value}</span>
          <span className="ib-stats-banner-label">{stat.label}</span>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="ib-empty">
      <div className="ib-empty-icon">Search</div>
      <p className="ib-empty-title">{title}</p>
      <p className="ib-empty-desc">{description}</p>
    </div>
  );
}

export default function InvestorsBuyersPage() {
  const [filters, setFilters] = useState<FilterState>(RESET_FILTERS);
  const [sortBy, setSortBy] = useState<SortId>("featured");
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadInvestors = async () => {
      setLoading(true);
      setLoadError("");

      try {
        const response = await MarketplaceService.getInvestors({ limit: 100 });
        if (!mounted) return;
        setInvestors(response.data.map(mapInvestorProfile));
      } catch (error: any) {
        if (!mounted) return;
        setLoadError(error?.message || "Investor profiles could not be loaded.");
        setInvestors([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void loadInvestors();

    return () => {
      mounted = false;
    };
  }, []);

  const countries = useMemo(() => {
    const dynamicCountries = unique(investors.map((investor) => investor.country));
    return ["All", ...(dynamicCountries.length ? dynamicCountries : DEFAULT_COUNTRIES.filter((item) => item !== "All"))];
  }, [investors]);

  const industries = useMemo(() => {
    const dynamicIndustries = unique(investors.flatMap((investor) => investor.industries));
    return ["All", ...(dynamicIndustries.length ? dynamicIndustries : DEFAULT_INDUSTRIES.filter((item) => item !== "All"))];
  }, [investors]);

  const filtered = useMemo(() => {
    return investors.filter((investor) => {
      if (filters.type !== "All" && investor.type !== filters.type) return false;
      if (filters.country !== "All" && investor.country !== filters.country) return false;
      if (filters.deal !== "All" && !investor.dealTypes.includes(filters.deal as DealType)) return false;
      if (filters.industry !== "All" && !investor.industries.includes(filters.industry)) return false;
      if (filters.verified && !investor.verified) return false;
      if (filters.premium && !investor.premium) return false;
      return true;
    });
  }, [filters, investors]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "deals") return (b.dealsCount || 0) - (a.dealsCount || 0);
      if (sortBy === "portfolio") return (b.portfolioSize || 0) - (a.portfolioSize || 0);

      return (
        Number(Boolean(b.featured)) - Number(Boolean(a.featured)) ||
        Number(Boolean(b.premium)) - Number(Boolean(a.premium)) ||
        Number(Boolean(b.verified)) - Number(Boolean(a.verified)) ||
        b.rating - a.rating
      );
    });
  }, [filtered, sortBy]);

  return (
    <>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{
          --mw:82rem;
          --navy:#0f1e36; --t2:#4a5568; --t3:#8896a8;
          --bdr:#e2e6ed; --surf:#f4f6f9; --bg:#fff;
          --blue:#1A56DB; --green:#059669; --purple:#7C3AED;
          --amber:#F5A623; --red:#D42B2B; --teal:#0891b2;
          --font:'Poppins','Inter',system-ui,sans-serif;
          --t:180ms cubic-bezier(.4,0,.2,1);
        }

        body{font-family:var(--font);background:var(--surf);color:var(--navy)}
        .ib-page{min-height:100vh;padding-top:102px;background:var(--surf)}
        .ib-hero{background:var(--navy);padding:36px 0 0;position:relative;overflow:hidden;border-bottom:1px solid rgba(255,255,255,.06)}
        .ib-hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 55% 70% at 80% 40%,rgba(26,86,219,.14) 0%,transparent 70%),radial-gradient(ellipse 40% 60% at 15% 60%,rgba(245,166,35,.08) 0%,transparent 70%);pointer-events:none}
        .ib-hero-inner{max-width:var(--mw);margin:0 auto;padding:0 28px;position:relative}
        .ib-hero-breadcrumb{display:flex;align-items:center;gap:6px;margin-bottom:14px;font-size:11px;color:rgba(255,255,255,.38)}
        .ib-hero-breadcrumb a{color:rgba(255,255,255,.55);text-decoration:none;transition:color var(--t)}
        .ib-hero-breadcrumb a:hover{color:#fff}
        .ib-hero-eyebrow{display:inline-flex;align-items:center;gap:7px;background:rgba(26,86,219,.2);border:1px solid rgba(26,86,219,.35);color:#7aabff;font-size:10px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;padding:4px 10px;margin-bottom:12px}
        .ib-hero-eyebrow-dot{width:6px;height:6px;border-radius:50%;background:#1A56DB;animation:ibpulse 1.6s infinite}
        @keyframes ibpulse{0%,100%{opacity:1}50%{opacity:.35}}
        .ib-hero-heading{font-size:clamp(24px,3.2vw,40px);font-weight:800;color:#fff;letter-spacing:-.8px;margin-bottom:10px;line-height:1.1}
        .ib-hero-heading span{color:#F5A623}
        .ib-hero-desc{font-size:13.5px;color:rgba(255,255,255,.52);line-height:1.75;max-width:580px;margin-bottom:20px}
        .ib-hero-cta-row{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:28px}
        .ib-cta-btn{display:inline-flex;align-items:center;gap:7px;font-size:12.5px;font-weight:700;padding:9px 18px;cursor:pointer;border:none;text-decoration:none;font-family:var(--font);transition:all var(--t);letter-spacing:.2px}
        .ib-cta-primary{background:var(--blue);color:#fff}
        .ib-cta-primary:hover{background:#1444B8}
        .ib-cta-outline{background:rgba(255,255,255,.07);color:rgba(255,255,255,.82);border:1px solid rgba(255,255,255,.18)!important}
        .ib-cta-outline:hover{background:rgba(255,255,255,.13);color:#fff}

        .ib-stats-banner{display:flex;align-items:stretch;border-top:1px solid rgba(255,255,255,.08);margin-top:4px}
        .ib-stats-banner-item{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:14px 10px;border-right:1px solid rgba(255,255,255,.07);gap:2px}
        .ib-stats-banner-item:last-child{border-right:none}
        .ib-stats-banner-val{font-size:18px;font-weight:800;color:#fff;letter-spacing:-.4px}
        .ib-stats-banner-label{font-size:10px;color:rgba(255,255,255,.38);font-weight:500;text-transform:uppercase;letter-spacing:.7px}

        .ib-main{max-width:var(--mw);margin:0 auto;padding:24px 28px 64px;display:grid;grid-template-columns:260px 1fr;gap:28px;align-items:start}
        .ib-sidebar{position:sticky;top:120px;background:var(--bg);border:1px solid var(--bdr);display:flex;flex-direction:column}
        .ib-filter-header{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid var(--bdr)}
        .ib-filter-title{font-size:13px;font-weight:700;color:var(--navy);letter-spacing:-.2px}
        .ib-filter-reset{background:none;border:none;color:var(--blue);font-size:11px;font-weight:600;cursor:pointer;font-family:var(--font);transition:color var(--t)}
        .ib-filter-reset:hover{text-decoration:underline}
        .ib-filter-group{padding:14px 16px;border-bottom:1px solid var(--bdr)}
        .ib-filter-group:last-child{border-bottom:none}
        .ib-filter-label{font-size:10px;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:.9px;margin-bottom:8px}
        .ib-filter-list{display:flex;flex-direction:column;gap:4px}
        .ib-filter-scroll{max-height:200px;overflow-y:auto}
        .ib-filter-scroll::-webkit-scrollbar{width:3px}
        .ib-filter-scroll::-webkit-scrollbar-thumb{background:var(--bdr)}
        .ib-filter-pill{background:var(--surf);border:1px solid var(--bdr);color:var(--t2);font-size:12px;font-weight:500;padding:6px 10px;text-align:left;cursor:pointer;font-family:var(--font);transition:all var(--t)}
        .ib-filter-pill:hover{background:#e9ecf0;color:var(--navy)}
        .ib-filter-pill.active{background:var(--blue);color:#fff;border-color:var(--blue)}
        .ib-checkbox{display:flex;align-items:center;gap:8px;margin-bottom:6px;cursor:pointer}
        .ib-checkbox input[type="checkbox"]{width:15px;height:15px;cursor:pointer}
        .ib-checkbox-label{font-size:12px;color:var(--t2);font-weight:500}

        .ib-content{display:flex;flex-direction:column;gap:18px}
        .ib-info-strip{display:flex;align-items:center;gap:8px;background:linear-gradient(90deg,rgba(26,86,219,.06),transparent);border:1px solid rgba(26,86,219,.15);border-left:3px solid var(--blue);padding:10px 14px}
        .ib-info-strip.error{background:linear-gradient(90deg,rgba(212,43,43,.07),transparent);border-color:rgba(212,43,43,.18);border-left-color:var(--red)}
        .ib-info-strip-text{font-size:11.5px;color:var(--t2);line-height:1.5}
        .ib-info-strip-text strong{color:var(--navy)}
        .ib-toolbar{display:flex;align-items:center;justify-content:space-between;background:var(--bg);border:1px solid var(--bdr);padding:12px 16px}
        .ib-results-count{font-size:12.5px;color:var(--t2);font-weight:500}
        .ib-sort-row{display:flex;align-items:center;gap:8px}
        .ib-sort-label{font-size:11px;color:var(--t3);font-weight:600;text-transform:uppercase;letter-spacing:.6px}
        .ib-sort-select{background:var(--surf);border:1px solid var(--bdr);color:var(--navy);font-size:12px;font-weight:500;padding:5px 10px;cursor:pointer;font-family:var(--font)}

        .ib-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:16px}
        .ib-card{background:var(--bg);border:1px solid var(--bdr);padding:18px;display:flex;flex-direction:column;gap:11px;position:relative;overflow:hidden;transition:transform var(--t),box-shadow var(--t),border-color var(--t)}
        .ib-card:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(0,0,0,.1);border-color:#c4d0e8}
        .ib-premium-tag{position:absolute;top:10px;right:-26px;background:linear-gradient(135deg,#1A56DB,#0d3fa3);color:#fff;font-size:8px;font-weight:800;letter-spacing:.8px;text-transform:uppercase;padding:3px 32px;transform:rotate(45deg)}
        .ib-card-top{display:flex;align-items:flex-start;gap:14px}
        .ib-avatar{width:52px;height:52px;flex-shrink:0;display:flex;align-items:center;justify-content:center;border-radius:4px}
        .ib-avatar-initials{font-size:14px;font-weight:800;letter-spacing:.5px}
        .ib-card-header{flex:1;min-width:0}
        .ib-card-meta-row{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:5px}
        .ib-type-tag{font-size:9.5px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;border:1px solid;padding:3px 8px;flex-shrink:0}
        .ib-verified-badge{font-size:9px;font-weight:700;color:#059669;background:#ecfdf5;border:1px solid #a7f3d0;padding:3px 7px}
        .ib-featured-badge{font-size:9px;font-weight:700;color:#F5A623;background:#fffbeb;border:1px solid #fde68a;padding:3px 7px}
        .ib-card-name{font-size:14px;font-weight:700;line-height:1.3;margin-bottom:2px}
        .ib-card-name a{color:var(--blue);text-decoration:none;transition:color var(--t)}
        .ib-card-name a:hover{color:#0d47a1}
        .ib-card-tagline{font-size:11.5px;color:var(--t3);font-weight:500;line-height:1.4}
        .ib-card-desc{font-size:12px;color:var(--t2);line-height:1.65;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
        .ib-card-info-row{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
        .ib-info-item{font-size:11px;color:var(--t3);font-weight:500}
        .ib-industries-row{display:flex;gap:5px;flex-wrap:wrap}
        .ib-ind-chip{font-size:10px;font-weight:600;color:var(--t2);background:var(--surf);border:1px solid var(--bdr);padding:3px 8px;letter-spacing:.2px}
        .ib-ind-more{color:var(--blue);border-color:#c4d5f9;background:#eef3fd}
        .ib-stats-grid{background:var(--surf);border:1px solid var(--bdr);padding:10px 12px;display:grid;grid-template-columns:1fr 1fr;gap:8px}
        .ib-stat{display:flex;flex-direction:column;gap:2px}
        .ib-stat-label{font-size:9.5px;color:var(--t3);font-weight:600;text-transform:uppercase;letter-spacing:.4px}
        .ib-stat-val{font-size:12px;font-weight:700;color:var(--navy)}
        .ib-deal-types-row{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
        .ib-dt-label{font-size:10px;color:var(--t3);font-weight:600;text-transform:uppercase;letter-spacing:.5px}
        .ib-dt-chip{font-size:10px;font-weight:600;color:var(--blue);background:#eef3fd;border:1px solid #c4d5f9;padding:3px 8px}
        .ib-card-footer{display:flex;align-items:flex-end;justify-content:space-between;gap:10px;margin-top:auto;padding-top:4px;border-top:1px solid var(--bdr)}
        .ib-ticket-wrap{display:flex;flex-direction:column;gap:2px}
        .ib-ticket-label{font-size:9px;color:var(--t3);text-transform:uppercase;letter-spacing:.5px;font-weight:600}
        .ib-ticket-amount{display:flex;align-items:baseline;gap:5px;flex-wrap:wrap}
        .ib-amount{font-size:14px;font-weight:800;color:var(--navy);letter-spacing:-.3px}
        .ib-for{font-size:11px;color:var(--t3);font-weight:500}
        .ib-contact-btn{border:none;color:#fff;font-size:11.5px;font-weight:700;padding:9px 16px;cursor:pointer;font-family:var(--font);transition:opacity var(--t);flex-shrink:0;letter-spacing:.2px;text-decoration:none}
        .ib-contact-btn:hover{opacity:.87}

        .ib-why{background:var(--bg);border:1px solid var(--bdr);padding:22px 24px}
        .ib-why-title{font-size:13px;font-weight:700;color:var(--navy);margin-bottom:18px;letter-spacing:-.2px;display:flex;align-items:center;gap:8px}
        .ib-why-title::after{content:'';flex:1;height:1px;background:var(--bdr)}
        .ib-why-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
        .ib-why-item{display:flex;flex-direction:column;gap:7px}
        .ib-why-kicker{font-size:10px;font-weight:800;color:var(--blue);text-transform:uppercase;letter-spacing:.6px}
        .ib-why-item-title{font-size:12px;font-weight:700;color:var(--navy)}
        .ib-why-item-desc{font-size:11px;color:var(--t3);line-height:1.55}

        .ib-pagination{display:flex;align-items:center;justify-content:center;gap:8px;padding:24px 0}
        .ib-page-btn{background:var(--bg);border:1px solid var(--bdr);color:var(--t2);font-size:12px;font-weight:600;padding:8px 14px;cursor:pointer;font-family:var(--font);transition:all var(--t)}
        .ib-page-btn:hover{background:var(--blue);color:#fff;border-color:var(--blue)}
        .ib-page-btn.active{background:var(--blue);color:#fff;border-color:var(--blue)}
        .ib-page-btn:disabled{opacity:.4;cursor:not-allowed}
        .ib-page-btn:disabled:hover{background:var(--bg);color:var(--t2);border-color:var(--bdr)}
        .ib-empty{grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--t3);background:#fff;border:1px dashed var(--bdr)}
        .ib-empty-icon{font-size:11px;text-transform:uppercase;letter-spacing:.8px;font-weight:800;color:var(--blue);margin-bottom:12px}
        .ib-empty-title{font-size:14px;font-weight:600;color:var(--t2);margin-bottom:6px}
        .ib-empty-desc{font-size:12px}

        @media(max-width:1024px){
          .ib-main{grid-template-columns:1fr;gap:20px}
          .ib-sidebar{position:static}
          .ib-grid{grid-template-columns:repeat(auto-fill,minmax(290px,1fr))}
          .ib-why-grid{grid-template-columns:repeat(2,1fr)}
        }
        @media(max-width:640px){
          .ib-main{padding:20px 16px 48px}
          .ib-hero{padding:24px 0 0}
          .ib-hero-inner{padding:0 16px}
          .ib-grid{grid-template-columns:1fr}
          .ib-toolbar{flex-direction:column;align-items:flex-start;gap:10px}
          .ib-stats-banner{flex-wrap:wrap}
          .ib-stats-banner-item{min-width:50%;border-bottom:1px solid rgba(255,255,255,.07)}
          .ib-why-grid{grid-template-columns:1fr}
        }
      `}</style>

      <div className="ib-page">
        <section className="ib-hero">
          <div className="ib-hero-inner">
            <nav className="ib-hero-breadcrumb" aria-label="Breadcrumb">
              <a href="/">Home</a>
              <span>/</span>
              <span>Investors &amp; Buyers</span>
            </nav>

            <div className="ib-hero-eyebrow">
              <span className="ib-hero-eyebrow-dot" />
              Actively Deploying Capital
            </div>
            <h1 className="ib-hero-heading">
              Find Verified Investors<br />
              <span>&amp; Strategic Buyers</span>
            </h1>
            <p className="ib-hero-desc">
              Connect with active investors, private equity firms, family offices and strategic
              acquirers. Browse by ticket size, industry focus, and deal type to find the right
              capital partner for your business.
            </p>
            <div className="ib-hero-cta-row">
              <a href="/register" className="ib-cta-btn ib-cta-primary">
                Register as Investor
              </a>
              <a href="/businesses-for-sale" className="ib-cta-btn ib-cta-outline">
                List Your Business
              </a>
            </div>
          </div>
          <StatsBanner investors={investors} />
        </section>

        <main className="ib-main">
          <FilterSidebar
            filters={filters}
            countries={countries}
            industries={industries}
            onChange={setFilters}
          />

          <div className="ib-content">
            {loadError ? (
              <div className="ib-info-strip error">
                <p className="ib-info-strip-text">
                  <strong>Could not load investors:</strong> {loadError}
                </p>
              </div>
            ) : (
              <div className="ib-info-strip">
                <p className="ib-info-strip-text">
                  <strong>Tip:</strong> Use Deal Interest and Industry Focus filters together to
                  find investors matched to your business and transaction structure.
                </p>
              </div>
            )}

            <div className="ib-toolbar">
              <span className="ib-results-count">
                <strong>{sorted.length}</strong> {sorted.length === 1 ? "investor" : "investors"} found
              </span>
              <div className="ib-sort-row">
                <span className="ib-sort-label">Sort by</span>
                <select className="ib-sort-select" value={sortBy} onChange={(event) => setSortBy(event.target.value as SortId)}>
                  <option value="featured">Featured</option>
                  <option value="rating">Highest Rated</option>
                  <option value="deals">Most Deals Closed</option>
                  <option value="portfolio">Largest Portfolio</option>
                </select>
              </div>
            </div>

            <div className="ib-grid">
              {loading && <EmptyState title="Loading investor profiles" description="Fetching verified marketplace investors from the backend." />}
              {!loading && !loadError && sorted.map((investor) => <InvestorCard key={investor.id} inv={investor} />)}
              {!loading && !loadError && sorted.length === 0 && (
                <EmptyState title="No investors match your filters" description="Try adjusting or resetting your filters." />
              )}
              {!loading && loadError && (
                <EmptyState title="Investor feed unavailable" description="Please check the API server and try again." />
              )}
            </div>

            <div className="ib-why">
              <h3 className="ib-why-title">Why Register as an Investor on Asset Busters</h3>
              <div className="ib-why-grid">
                {[
                  { kicker: "Matched", title: "Curated Deal Flow", desc: "Receive matched business opportunities based on your sector, ticket size and geography preferences." },
                  { kicker: "Verified", title: "Screened Businesses", desc: "Listings are structured before entering your deal feed, reducing wasted diligence time." },
                  { kicker: "Regional", title: "Cross-Border Reach", desc: "Access marketplace opportunities across Africa, the Middle East and Asia from one workspace." },
                  { kicker: "Financial", title: "Clear Deal Signals", desc: "Review revenue, EBITDA, valuation range and deal type before starting a conversation." },
                  { kicker: "Direct", title: "Warm Introductions", desc: "Connect directly with business owners and keep conversations inside your deal pipeline." },
                  { kicker: "Priority", title: "Premium Visibility", desc: "Premium investors can stand out to founders and sellers seeking serious capital partners." },
                ].map((item) => (
                  <div key={item.title} className="ib-why-item">
                    <span className="ib-why-kicker">{item.kicker}</span>
                    <p className="ib-why-item-title">{item.title}</p>
                    <p className="ib-why-item-desc">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="ib-pagination">
              <button className="ib-page-btn" disabled>{"< Previous"}</button>
              <button className="ib-page-btn active">1</button>
              <button className="ib-page-btn" disabled>Next {">"}</button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}