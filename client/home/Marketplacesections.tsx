"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MarketplaceService } from "@/services/marketplace.service";
import type {
  AdvisorProfile,
  BusinessListing,
  InvestorProfile,
} from "@/types/marketplace";

interface BusinessCard {
  id: string;
  title: string;
  location: string;
  description: string;
  rating: number;
  type: string;
  askAmount: string;
  askPercent?: string;
  askRate?: string;
  runSales: string;
  ebitda: string;
  industry: string;
  premium?: boolean;
  tag: string;
}

interface InvestorCard {
  id: string;
  name: string;
  location: string;
  type: string;
  investmentRange: string;
  industries: string[];
  avatar: string;
  verified: boolean;
}

interface BrandCard {
  id: string;
  name: string;
  category: string;
  investmentRange: string;
  outlets: number;
  founded: number;
  description: string;
  icon: string;
  color: string;
}

interface AdvisorCard {
  id: string;
  name: string;
  firm: string;
  location: string;
  specialties: string[];
  deals: number;
  avatar: string;
  rating: number;
}

const colors = [
  "#1A56DB",
  "#7C3AED",
  "#F5A623",
  "#10B981",
  "#F97316",
  "#0EA5E9",
];

const toNumber = (value: unknown) => Number(value ?? 0);

const formatMoney = (value: unknown, currency = "USD") => {
  const amount = toNumber(value);
  if (!amount) return "Not disclosed";

  const abs = Math.abs(amount);
  const suffix =
    abs >= 1_000_000_000
      ? "B"
      : abs >= 1_000_000
        ? "M"
        : abs >= 1_000
          ? "K"
          : "";
  const divisor =
    suffix === "B"
      ? 1_000_000_000
      : suffix === "M"
        ? 1_000_000
        : suffix === "K"
          ? 1_000
          : 1;
  const compact = amount / divisor;
  const display = Number.isInteger(compact)
    ? compact.toFixed(0)
    : compact.toFixed(1);

  return `${currency} ${display}${suffix}`;
};

const unwrapList = <T,>(response: any): T[] => {
  const data =
    response?.data?.listings ||
    response?.data?.businesses ||
    response?.data?.investors ||
    response?.data?.advisors ||
    response?.data?.items ||
    response?.data ||
    [];

  return Array.isArray(data) ? data : [];
};

const dealTypeLabel = (value?: string | null) => {
  if (!value) return "Not available";

  return value
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
};

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

const mapBusiness = (listing: BusinessListing): BusinessCard => ({
  id: listing.id,
  title: listing.title || "Untitled Business",
  location:
    [listing.city, listing.country].filter(Boolean).join(", ") ||
    listing.country ||
    "Location not disclosed",
  description:
    listing.shortSummary ||
    listing.teaserSummary ||
    listing.description ||
    "No description has been provided yet.",
  rating: toNumber((listing as any).rating) || 7.5,
  type: dealTypeLabel(listing.dealType),
  askAmount: formatMoney(listing.askAmount, listing.currency),
  askPercent: listing.askPercent ? `${listing.askPercent}%` : undefined,
  askRate: listing.askRate ? `${listing.askRate}%` : undefined,
  runSales: formatMoney(
    listing.runSales ?? listing.grossRevenue,
    listing.currency,
  ),
  ebitda: listing.ebitda
    ? formatMoney(listing.ebitda, listing.currency)
    : listing.ebitdaMargin
      ? `${listing.ebitdaMargin}%`
      : "Not disclosed",
  industry: listing.industry || "Business",
  premium: listing.isPremium,
  tag: listing.isFeatured ? "Featured" : listing.isPremium ? "Premium" : "New",
});

const mapInvestor = (profile: InvestorProfile): InvestorCard => {
  const name =
    profile.firmName ||
    [profile.user?.firstName, profile.user?.lastName]
      .filter(Boolean)
      .join(" ") ||
    profile.title;

  return {
    id: profile.id,
    name,
    location:
      profile.countries?.join(", ") || profile.user?.country || "Global",
    type: profile.investorType,
    investmentRange: `${formatMoney(profile.minTicket, profile.currency)} - ${formatMoney(profile.maxTicket, profile.currency)}`,
    industries: profile.industries || [],
    avatar: initials(name || "Investor"),
    verified: Boolean(profile.isVerified || profile.user?.verified),
  };
};

const mapBrand = (listing: BusinessListing, index: number): BrandCard => ({
  id: listing.id,
  name: listing.title,
  category: listing.industry,
  investmentRange: formatMoney(listing.askAmount, listing.currency),
  outlets: listing.outlets || 0,
  founded: listing.established || new Date(listing.createdAt).getFullYear(),
  description: listing.description,
  icon: initials(listing.industry || "FR"),
  color: colors[index % colors.length],
});

const mapAdvisor = (profile: AdvisorProfile, index: number): AdvisorCard => {
  const name =
    [profile.user?.firstName, profile.user?.lastName]
      .filter(Boolean)
      .join(" ") || profile.title;

  return {
    id: profile.id,
    name,
    firm: profile.firmName || profile.title,
    location:
      profile.countries?.join(", ") || profile.user?.country || "Global",
    specialties: profile.specialties || [],
    deals: profile.dealsCount || 0,
    avatar: initials(name || "Advisor"),
    rating: toNumber(profile.rating) || 4.7 + (index % 3) / 10,
  };
};

function usePageNav<T>(items: T[], perPage: number) {
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));

  const prev = useCallback(() => setPage((p) => Math.max(0, p - 1)), []);

  const next = useCallback(
    () => setPage((p) => Math.min(totalPages - 1, p + 1)),
    [totalPages],
  );

  const pageItems = items.slice(page * perPage, page * perPage + perPage);

  useEffect(() => {
    setPage(0);
  }, [items.length]);

  return {
    page,
    prev,
    next,
    pageItems,
    totalPages,
    canPrev: page > 0,
    canNext: page < totalPages - 1,
  };
}

function Arrow({
  onClick,
  disabled,
  dir,
}: {
  onClick: () => void;
  disabled: boolean;
  dir: "prev" | "next";
}) {
  return (
    <button
      className="ms-arrow"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "prev" ? "Previous" : "Next"}
    >
      {dir === "prev" ? "<" : ">"}
    </button>
  );
}

function Dots({ total, current }: { total: number; current: number }) {
  return (
    <div className="ms-dots">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`ms-dot ${i === current ? "ms-dot-active" : ""}`}
        />
      ))}
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return <div className="ms-empty">{label}</div>;
}

function WhyAssetBusters() {
  const features = [
    {
      title: "Pre-approved",
      color: "#1A56DB",
      desc: "Business, investor, buyer, and advisor profiles are screened before marketplace visibility.",
    },
    {
      title: "Confidential",
      color: "#7C3AED",
      desc: "Sensitive company identity and deal documents stay controlled until parties are qualified.",
    },
    {
      title: "Fair Valuation",
      color: "#F5A623",
      desc: "Owners and buyers can compare listings, valuation signals, and financial benchmarks.",
    },
    {
      title: "Global Network",
      color: "#10B981",
      desc: "Connect with businesses, investors, franchises, buyers, and advisors across markets.",
    },
  ];

  return (
    <section className="why-section">
      <div className="why-inner">
        <div className="why-left">
          <span className="ms-eyebrow">Why Choose Us</span>
          <h2 className="ms-heading">
            Why <span>ASSET BUSTERS?</span>
          </h2>
          <p className="why-stat-block">
            <strong>67,000+</strong>
            <span>pre-screened businesses and investors</span>
          </p>
          <div className="why-meta-row">
            <div>
              <strong>900+</strong>
              <span>Industries</span>
            </div>
            <div>
              <strong>170+</strong>
              <span>Countries</span>
            </div>
            <div>
              <strong>20M - 70B</strong>
              <span>Investment Size</span>
            </div>
          </div>
          <a href="/register" className="ms-cta-primary">
            Get Started Free
          </a>
        </div>

        <div className="why-cards">
          {features.map((feature) => (
            <article className="why-card" key={feature.title}>
              <span style={{ background: feature.color }} />
              <h3 style={{ color: feature.color }}>{feature.title}</h3>
              <p>{feature.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function BizCard({ b }: { b: BusinessCard }) {
  const tagColors: Record<string, string> = {
    Premium: "#7C3AED",
    New: "#1A56DB",
    Featured: "#10B981",
  };

  return (
    <article className="biz-card">
      {b.premium && (
        <div className="biz-premium-ribbon">
          <span>PREMIUM</span>
        </div>
      )}
      <div className="biz-card-head">
        <span className="biz-industry">{b.industry}</span>
        <span
          className="biz-tag"
          style={{
            background: `${tagColors[b.tag] || "#1A56DB"}16`,
            color: tagColors[b.tag] || "#1A56DB",
          }}
        >
          {b.tag}
        </span>
      </div>
      <h4 className="biz-title">{b.title}</h4>
      <p className="biz-desc">{b.description}</p>
      <div className="biz-meta">
        <span>{b.rating.toFixed(1)} rating</span>
        <span>{b.location}</span>
      </div>
      <div className="biz-stats">
        <div>
          <span>Run Rate Sales</span>
          <strong>{b.runSales}</strong>
        </div>
        <div>
          <span>EBITDA</span>
          <strong>{b.ebitda}</strong>
        </div>
      </div>
      <div className="biz-footer">
        <div>
          <span className="biz-ask-type">{b.type}</span>
          <strong>{b.askAmount}</strong>
        </div>
        <a className="biz-contact-btn" href={`/businesses-for-sale/${b.id}`}>
          View Details
        </a>
      </div>
    </article>
  );
}

function BusinessesSection({ businesses }: { businesses: BusinessCard[] }) {
  const { page, prev, next, pageItems, totalPages, canPrev, canNext } =
    usePageNav(businesses, 2);

  return (
    <section className="ms-section bg-surface">
      <div className="ms-inner ms-split">
        <div className="ms-card-col">
          <div className="ms-card-nav">
            <Arrow onClick={prev} disabled={!canPrev} dir="prev" />
            <Arrow onClick={next} disabled={!canNext} dir="next" />
          </div>
          <div className="ms-float-grid ms-grid-1col" key={page}>
            {pageItems.length ? (
              pageItems.map((business) => (
                <BizCard key={business.id} b={business} />
              ))
            ) : (
              <EmptyState label="No active business listings yet." />
            )}
          </div>
          <Dots total={totalPages} current={page} />
        </div>

        <div className="ms-info-side">
          <span className="ms-eyebrow">Marketplace</span>
          <h2 className="ms-heading">
            Businesses for Sale
            <br />
            <span>on ASSET BUSTERS</span>
          </h2>
          <p className="ms-body">
            Explore pre-screened businesses for sale, partial stake
            opportunities, business loans, and capital raises.
          </p>
          <div className="ms-inline-stats">
            <div>
              <strong>{businesses.length}+</strong>
              <span>Listed</span>
            </div>
            <div>
              <strong>900+</strong>
              <span>Industries</span>
            </div>
            <div>
              <strong>100+</strong>
              <span>Countries</span>
            </div>
          </div>
          <div className="ms-cta-row">
            <a href="/businesses-for-sale" className="ms-cta-primary">
              View All
            </a>
            <a href="/add-profile?as=investor" className="ms-cta-ghost">
              Register as Investor
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function InvestorCardView({
  inv,
  index,
}: {
  inv: InvestorCard;
  index: number;
}) {
  const color = colors[index % colors.length];

  return (
    <article className="inv-card">
      <div className="inv-card-top">
        <div
          className="avatar"
          style={{ background: `${color}16`, color, borderColor: `${color}28` }}
        >
          {inv.avatar}
        </div>
        {inv.verified && <span className="verified">Verified</span>}
      </div>
      <h4>{inv.name}</h4>
      <span className="pill" style={{ color, background: `${color}10` }}>
        {inv.type}
      </span>
      <p>{inv.location}</p>
      <div className="range">
        <span>Investment Range</span>
        <strong>{inv.investmentRange}</strong>
      </div>
      <div className="chips">
        {inv.industries.slice(0, 3).map((industry) => (
          <span key={industry}>{industry}</span>
        ))}
      </div>
      <button style={{ borderColor: `${color}44`, color }}>Connect</button>
    </article>
  );
}

function InvestorsSection({ investors }: { investors: InvestorCard[] }) {
  const { page, prev, next, pageItems, totalPages, canPrev, canNext } =
    usePageNav(investors, 3);

  return (
    <section className="ms-section bg-white">
      <div className="ms-inner">
        <SectionHeader
          eyebrow="Investor Network"
          title="Investors & Business Buyers"
          desc="Active investors, strategic buyers, lenders, and family offices looking for their next opportunity."
          prev={prev}
          next={next}
          canPrev={canPrev}
          canNext={canNext}
        />
        <div className="ms-float-grid ms-grid-3col" key={page}>
          {pageItems.length ? (
            pageItems.map((investor, index) => (
              <InvestorCardView
                key={investor.id}
                inv={investor}
                index={index}
              />
            ))
          ) : (
            <EmptyState label="No investor profiles yet." />
          )}
        </div>
        <SectionFooter
          total={totalPages}
          current={page}
          primaryHref="/investors-buyers"
          primaryLabel="View All Investors"
          secondaryHref="/add-profile?as=investor"
          secondaryLabel="Register as Investor/Buyer"
        />
      </div>
    </section>
  );
}

function BrandCardView({ brand }: { brand: BrandCard }) {
  return (
    <article className="brand-card">
      <div
        className="brand-card-top"
        style={{
          background: `${brand.color}10`,
          borderColor: `${brand.color}18`,
        }}
      >
        <span
          className="brand-icon"
          style={{ background: `${brand.color}18`, color: brand.color }}
        >
          {brand.icon}
        </span>
        <span>{brand.category}</span>
      </div>
      <div className="brand-card-body">
        <h4>{brand.name}</h4>
        <p>{brand.description}</p>
        <div className="brand-meta">
          <div>
            <strong style={{ color: brand.color }}>{brand.outlets}</strong>
            <span>Outlets</span>
          </div>
          <div>
            <strong style={{ color: brand.color }}>{brand.founded}</strong>
            <span>Founded</span>
          </div>
        </div>
        <div className="range">
          <span>Franchise Investment</span>
          <strong>{brand.investmentRange}</strong>
        </div>
        <button style={{ background: brand.color }}>Enquire Now</button>
      </div>
    </article>
  );
}

function BrandsSection({ brands }: { brands: BrandCard[] }) {
  const { page, prev, next, pageItems, totalPages, canPrev, canNext } =
    usePageNav(brands, 3);

  return (
    <section className="ms-section bg-surface">
      <div className="ms-inner">
        <SectionHeader
          eyebrow="Franchise Marketplace"
          title="Brands on ASSET BUSTERS"
          desc="Discover established franchise brands actively seeking new partners and expansion."
          prev={prev}
          next={next}
          canPrev={canPrev}
          canNext={canNext}
        />
        <div className="ms-float-grid ms-grid-3col" key={page}>
          {pageItems.length ? (
            pageItems.map((brand) => (
              <BrandCardView key={brand.id} brand={brand} />
            ))
          ) : (
            <EmptyState label="No franchise brands yet." />
          )}
        </div>
        <SectionFooter
          total={totalPages}
          current={page}
          primaryHref="/franchises"
          primaryLabel="View All Brands"
          secondaryHref="/add-profile?as=franchise"
          secondaryLabel="List Your Brand"
        />
      </div>
    </section>
  );
}

function AdvisorCardView({ adv, index }: { adv: AdvisorCard; index: number }) {
  const color = colors[index % colors.length];

  return (
    <article className="adv-card">
      <div className="adv-card-top">
        <div className="avatar solid" style={{ background: color }}>
          {adv.avatar}
        </div>
        <div>
          <h4>{adv.name}</h4>
          <span>{adv.firm}</span>
        </div>
      </div>
      <div className="adv-rating-row">
        <span>{adv.rating.toFixed(1)} rating</span>
        <span>{adv.deals} deals</span>
      </div>
      <p>{adv.location}</p>
      <div className="chips">
        {adv.specialties.slice(0, 3).map((specialty) => (
          <span key={specialty}>{specialty}</span>
        ))}
      </div>
      <button style={{ borderColor: `${color}38`, color }}>
        Request Consultation
      </button>
    </article>
  );
}

function AdvisorsSection({ advisors }: { advisors: AdvisorCard[] }) {
  const { page, prev, next, pageItems, totalPages, canPrev, canNext } =
    usePageNav(advisors, 3);

  return (
    <section className="ms-section bg-white">
      <div className="ms-inner">
        <SectionHeader
          eyebrow="Expert Network"
          title="Financial Advisors"
          desc="Work with vetted M&A advisors, business brokers, and consultants who specialize in SME transactions."
          prev={prev}
          next={next}
          canPrev={canPrev}
          canNext={canNext}
        />
        <div className="ms-float-grid ms-grid-3col" key={page}>
          {pageItems.length ? (
            pageItems.map((advisor, index) => (
              <AdvisorCardView key={advisor.id} adv={advisor} index={index} />
            ))
          ) : (
            <EmptyState label="No advisor profiles yet." />
          )}
        </div>
        <SectionFooter
          total={totalPages}
          current={page}
          primaryHref="/advisors"
          primaryLabel="View All Advisors"
          secondaryHref="/add-profile?as=advisor"
          secondaryLabel="Join as Advisor"
        />
      </div>
    </section>
  );
}

function SectionHeader({
  eyebrow,
  title,
  desc,
  prev,
  next,
  canPrev,
  canNext,
}: {
  eyebrow: string;
  title: string;
  desc: string;
  prev: () => void;
  next: () => void;
  canPrev: boolean;
  canNext: boolean;
}) {
  return (
    <div className="ms-section-header">
      <div>
        <span className="ms-eyebrow">{eyebrow}</span>
        <h2 className="ms-heading">
          {title}
          <br />
          <span>on ASSET BUSTERS</span>
        </h2>
      </div>
      <div className="ms-header-right">
        <p>{desc}</p>
        <div className="ms-nav-btns">
          <Arrow onClick={prev} disabled={!canPrev} dir="prev" />
          <Arrow onClick={next} disabled={!canNext} dir="next" />
        </div>
      </div>
    </div>
  );
}

function SectionFooter({
  total,
  current,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: {
  total: number;
  current: number;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
}) {
  return (
    <div className="ms-section-footer">
      <Dots total={total} current={current} />
      <div className="ms-cta-row">
        <a href={primaryHref} className="ms-cta-primary">
          {primaryLabel}
        </a>
        <a href={secondaryHref} className="ms-cta-ghost">
          {secondaryLabel}
        </a>
      </div>
    </div>
  );
}

export default function MarketplaceSections() {
  const [businesses, setBusinesses] = useState<BusinessCard[]>([]);
  const [investors, setInvestors] = useState<InvestorCard[]>([]);
  const [brands, setBrands] = useState<BrandCard[]>([]);
  const [advisors, setAdvisors] = useState<AdvisorCard[]>([]);

  useEffect(() => {
    let mounted = true;

    Promise.allSettled([
      MarketplaceService.getBusinesses(),
      MarketplaceService.getInvestors(),
      MarketplaceService.getFranchises(),
      MarketplaceService.getAdvisors(),
    ]).then(([businessResult, investorResult, brandResult, advisorResult]) => {
      if (!mounted) return;

      if (businessResult.status === "fulfilled") {
        setBusinesses(
          unwrapList<BusinessListing>(businessResult.value).map(mapBusiness),
        );
      }

      if (investorResult.status === "fulfilled") {
        setInvestors(
          unwrapList<InvestorProfile>(investorResult.value).map(mapInvestor),
        );
      }

      if (brandResult.status === "fulfilled") {
        setBrands(unwrapList<BusinessListing>(brandResult.value).map(mapBrand));
      }

      if (advisorResult.status === "fulfilled") {
        setAdvisors(
          unwrapList<AdvisorProfile>(advisorResult.value).map(mapAdvisor),
        );
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  const sortedBusinesses = useMemo(() => businesses, [businesses]);

  return (
    <>
      <style>{styles}</style>
      <WhyAssetBusters />
      <BusinessesSection businesses={sortedBusinesses} />
      <InvestorsSection investors={investors} />
      <BrandsSection brands={brands} />
      <AdvisorsSection advisors={advisors} />
    </>
  );
}

const styles = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{--max-w:82rem;--blue:#1A56DB;--blue-d:#1444B8;--accent:#F5A623;--accent-d:#D4891A;--green:#10B981;--text:#0f1e36;--text-2:#4a5568;--text-3:#8896a8;--border:#e2e6ed;--surface:#f4f6f9;--bg:#fff;--font-sans:'Inter',system-ui,sans-serif;--font-display:'Poppins','Inter',sans-serif;--r4:4px;--r6:6px;--shadow-card:0 1px 2px rgba(0,0,0,.06),0 2px 8px rgba(0,0,0,.04);--shadow-hover:0 5px 22px rgba(0,0,0,.10),0 1px 5px rgba(0,0,0,.05);--t:180ms cubic-bezier(.4,0,.2,1)}
  .bg-surface{background:var(--surface)}.bg-white{background:var(--bg)}
  .why-section,.ms-section{padding:52px 0;border-top:1px solid var(--border);font-family:var(--font-sans)}
  .why-section{background:#fff;border-bottom:1px solid var(--border)}
  .why-inner,.ms-inner{max-width:var(--max-w);margin:0 auto;padding:0 24px}
  .why-inner{display:grid;grid-template-columns:1fr 1fr;gap:52px;align-items:center}
  .ms-eyebrow{display:inline-block;font-size:10px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;color:var(--blue);background:#eef3fd;border-radius:999px;padding:3px 10px;margin-bottom:10px}
  .ms-heading{font-family:var(--font-display);font-size:clamp(21px,2.4vw,32px);font-weight:900;line-height:1.12;color:var(--text);letter-spacing:-.5px}
  .ms-heading span{color:var(--blue)}
  .ms-body,.ms-header-right p{font-size:13px;color:var(--text-2);line-height:1.65;margin:12px 0 16px}
  .why-stat-block{display:flex;flex-direction:column;gap:4px;margin:24px 0}.why-stat-block strong{font-size:42px;line-height:1;color:var(--text)}.why-stat-block span{font-size:13px;color:var(--text-2)}
  .why-meta-row{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;background:var(--surface);border:1px solid var(--border);padding:14px;margin-bottom:24px}.why-meta-row div{display:flex;flex-direction:column}.why-meta-row strong{font-size:16px;color:var(--text)}.why-meta-row span{font-size:10px;color:var(--text-3);text-transform:uppercase;font-weight:800}
  .why-cards{display:grid;grid-template-columns:1fr 1fr;gap:12px}.why-card{background:#fff;border:1px solid var(--border);padding:18px;box-shadow:var(--shadow-card)}.why-card span{display:block;width:34px;height:3px;margin-bottom:13px}.why-card h3{font-size:14px;margin-bottom:8px}.why-card p{font-size:12px;color:var(--text-2);line-height:1.6}
  .ms-split{display:grid;grid-template-columns:1fr 360px;gap:44px;align-items:start}.ms-card-col{display:flex;flex-direction:column;gap:12px}.ms-card-nav,.ms-nav-btns{display:flex;gap:7px;justify-content:flex-end}
  .ms-section-header{display:flex;align-items:flex-start;justify-content:space-between;gap:28px;margin-bottom:20px}.ms-header-right{max-width:390px;display:flex;flex-direction:column;align-items:flex-end;text-align:right}
  .ms-float-grid{display:grid;gap:12px}.ms-grid-1col{grid-template-columns:1fr}.ms-grid-3col{grid-template-columns:repeat(3,1fr)}
  .ms-arrow{width:30px;height:30px;border-radius:var(--r4);background:#fff;border:1px solid var(--border);color:var(--text-2);cursor:pointer;font-weight:900}.ms-arrow:hover:not(:disabled){background:var(--blue);color:#fff;border-color:var(--blue)}.ms-arrow:disabled{opacity:.35;cursor:not-allowed}
  .ms-dots{display:flex;gap:5px;align-items:center}.ms-dot{width:6px;height:6px;border-radius:50%;background:var(--border)}.ms-dot-active{background:var(--blue);transform:scale(1.2)}
  .ms-section-footer{display:flex;align-items:center;justify-content:space-between;margin-top:20px;padding-top:16px;border-top:1px solid var(--border)}
  .ms-inline-stats{display:flex;gap:20px;margin-bottom:18px}.ms-inline-stats div{display:flex;flex-direction:column}.ms-inline-stats strong{color:var(--blue);font-size:19px}.ms-inline-stats span{font-size:10px;color:var(--text-3);font-weight:800;text-transform:uppercase}
  .ms-cta-row{display:flex;gap:10px;align-items:center;flex-wrap:wrap}.ms-cta-primary{display:inline-flex;align-items:center;text-decoration:none;background:var(--green);color:#fff;font-size:12.5px;font-weight:800;padding:9px 16px;border-radius:var(--r6)}.ms-cta-primary:hover{background:#059669}.ms-cta-ghost{color:var(--blue);font-size:12.5px;font-weight:800;text-decoration:none}.ms-cta-ghost:hover{text-decoration:underline}
  .biz-card,.inv-card,.brand-card,.adv-card{background:#fff;border:1px solid var(--border);box-shadow:var(--shadow-card);transition:transform var(--t),box-shadow var(--t),border-color var(--t)}.biz-card:hover,.inv-card:hover,.brand-card:hover,.adv-card:hover{transform:translateY(-2px);box-shadow:var(--shadow-hover);border-color:#c4d0e8}
  .biz-contact-btn,.brand-card button{border:0;background:var(--accent);color:#fff;font-size:12px;font-weight:800;padding:8px 13px;border-radius:var(--r4);cursor:pointer;text-decoration:none;}
  .biz-card{padding:16px;display:flex;flex-direction:column;gap:10px;position:relative;overflow:hidden}.biz-premium-ribbon{position:absolute;top:10px;right:-26px;background:linear-gradient(135deg,#10B981,#059669);color:#fff;font-size:8px;font-weight:900;letter-spacing:.7px;padding:3px 32px;transform:rotate(45deg)}
  .biz-card-head{display:flex;align-items:center;justify-content:space-between;gap:7px}.biz-industry,.biz-tag,.pill,.verified{font-size:9.5px;font-weight:900;text-transform:uppercase;border-radius:999px;padding:3px 9px}.biz-industry{color:var(--blue);background:#eef3fd}.biz-title{font-size:14px;color:var(--blue);line-height:1.35}.biz-desc{font-size:12px;color:var(--text-2);line-height:1.6;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.biz-meta{display:flex;gap:10px;font-size:11.5px;color:var(--text-3)}.biz-stats,.range{background:var(--surface);padding:9px 11px;display:flex;flex-direction:column;gap:5px}.biz-stats div{display:flex;justify-content:space-between}.biz-stats span,.range span{font-size:10px;color:var(--text-3);font-weight:800;text-transform:uppercase}.biz-stats strong,.range strong{font-size:12px;color:var(--text)}
  .adv-rating-row{display:flex;justify-content:space-between;font-size:11px;color:var(--text-3);font-weight:800}
  .ms-empty{grid-column:1/-1;border:1px dashed var(--border);background:#fff;padding:26px;text-align:center;color:var(--text-3);font-size:13px;font-weight:800}
  @media(max-width:1024px){.ms-split,.why-inner{grid-template-columns:1fr}.ms-info-side{order:-1}.ms-grid-3col{grid-template-columns:repeat(2,1fr)}}
  @media(max-width:640px){.why-inner,.ms-inner{padding:0 16px}.ms-section-header{flex-direction:column;gap:14px}.ms-header-right{align-items:flex-start;text-align:left}.ms-section-footer{flex-direction:column;gap:14px;align-items:flex-start}.ms-grid-3col,.why-cards,.why-meta-row{grid-template-columns:1fr}.ms-section,.why-section{padding:38px 0}}
`;
