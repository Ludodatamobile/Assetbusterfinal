"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import {
  BadgeCheck,
  Banknote,
  Building2,
  Filter,
  Landmark,
  Loader2,
  MapPin,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  TrendingUp,
} from "lucide-react";
import { FundingServiceService } from "@/services/funding-service.service";
import type { FundingServiceListing } from "@/types/funding-service";

const FUNDING_SOURCE_TYPES = [
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

const COUNTRIES = [
  "Nigeria",
  "Ghana",
  "Kenya",
  "South Africa",
  "United States",
  "United Kingdom",
  "India",
  "United Arab Emirates",
];

type FundingSourceFilters = {
  page?: number;
  limit?: number;
  search?: string;
  country?: string;
  fundingServiceType?: string;
  sortBy?: "featured" | "newest" | "oldest" | "ticketMax";
};

function formatMoney(value?: string | number | null, currency = "USD") {
  const amount = Number(value || 0);
  if (!amount) return "Not disclosed";
  return `${currency} ${amount.toLocaleString()}`;
}

function text(value?: string | null, fallback = "Not provided") {
  return value?.trim() || fallback;
}

function FundingSourceCard({ item }: { item: FundingServiceListing }) {
  const location = [item.city, item.country].filter(Boolean).join(", ");
  const ticket =
    item.ticketMin || item.ticketMax || item.askAmount
      ? `${formatMoney(item.ticketMin, item.currency)} - ${formatMoney(
          item.ticketMax || item.askAmount,
          item.currency,
        )}`
      : "Ticket size not disclosed";

  return (
    <a className="fs-card" href={`/funding-service/${item.slug}`}>
      <div className="fs-ribbon">
        <Landmark size={14} />
        Funding Source
      </div>

      <div className="fs-art">
        <Banknote size={34} />
        <strong>
          {(item.fundingServiceType || "FS").slice(0, 2).toUpperCase()}
        </strong>
        <span>{item.fundingServiceType || "Capital source"}</span>
      </div>

      <div className="fs-card-body">
        <div className="fs-card-top">
          <span>
            {item.isVerified ? <BadgeCheck size={13} /> : <ShieldCheck size={13} />}
            {item.isVerified ? "Verified" : text(item.capitalProviderType, "Provider")}
          </span>
          {item.isFeatured && <b>Featured</b>}
        </div>

        <h2>{item.title}</h2>

        <p className="fs-line">
          <MapPin size={14} />
          {location || item.country}
        </p>

        <p className="fs-line">
          <Building2 size={14} />
          {text(item.fundingServiceType || item.industry, "Funding source")}
        </p>

        <div className="fs-summary">
          <span>Terms</span>
          <p>
            {text(
              item.repaymentTerms ||
                item.eligibilityCriteria ||
                item.shortSummary ||
                item.description,
            )}
          </p>
        </div>

        <div className="fs-metrics">
          <div>
            <span>Ticket Size</span>
            <strong>{ticket}</strong>
          </div>
          <div>
            <span>Processing</span>
            <strong>{text(item.processingTime, "TBD")}</strong>
          </div>
        </div>

        <div className="fs-footer">
          <small>
            {item.enquiryCount || item._count?.deals || 0} enquiries ·{" "}
            {item.viewCount || 0} views
          </small>
          <em>View Details</em>
        </div>
      </div>
    </a>
  );
}

export default function FundingSourcesPage() {
  const [items, setItems] = useState<FundingServiceListing[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 1,
  });
  const [filters, setFilters] = useState<FundingSourceFilters>({
    page: 1,
    limit: 12,
    sortBy: "featured",
  });
  const [draft, setDraft] = useState({
    search: "",
    country: "",
    fundingServiceType: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadFundingSources = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await FundingServiceService.getFundingServices(
        filters as any,
      );

      setItems(response.data);
      setMeta(
        response.meta || {
          total: response.data.length,
          page: 1,
          limit: 12,
          totalPages: 1,
        },
      );
    } catch (err: any) {
      setError(err?.message || "Funding sources could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadSourceCounts = useCallback(async () => {
    const result: Record<string, number> = {};

    await Promise.all(
      FUNDING_SOURCE_TYPES.map(async (source) => {
        try {
          const response = await FundingServiceService.getFundingServices({
            page: 1,
            limit: 1,
            fundingServiceType: source,
          } as any);

          result[source] = Number(response.meta?.total || response.data.length || 0);
        } catch {
          result[source] = 0;
        }
      }),
    );

    setCounts(result);
  }, []);

  useEffect(() => {
    void loadFundingSources();
  }, [loadFundingSources]);

  useEffect(() => {
    void loadSourceCounts();
  }, [loadSourceCounts]);

  const visibleTicket = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum + Number(item.ticketMax || item.ticketMin || item.askAmount || 0),
        0,
      ),
    [items],
  );

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setFilters({
      page: 1,
      limit: 12,
      sortBy: filters.sortBy || "featured",
      search: draft.search || undefined,
      country: draft.country || undefined,
      fundingServiceType: draft.fundingServiceType || undefined,
    });
  };

  const clearFilters = () => {
    setDraft({ search: "", country: "", fundingServiceType: "" });
    setFilters({ page: 1, limit: 12, sortBy: "featured" });
  };

  const chooseSource = (source: string) => {
    setDraft((current) => ({ ...current, fundingServiceType: source }));
    setFilters({
      page: 1,
      limit: 12,
      sortBy: filters.sortBy || "featured",
      search: draft.search || undefined,
      country: draft.country || undefined,
      fundingServiceType: source,
    });
  };

  return (
    <>
      <style>{styles}</style>
      <main className="fs-page">
        <section className="fs-hero">
          <div>
            <p>Capital marketplace</p>
            <h1>Funding Sources</h1>
            <span>
              Explore loans, mortgages, private equity, venture capital, trade
              credit, receivables finance, leasing, credit enhancement, and
              structured capital providers.
            </span>
          </div>
          <a href="/dashboard?tab=funding-services">List Funding Source</a>
        </section>

        <section className="fs-stats">
          <article>
            <Landmark size={18} />
            <span>{meta.total}</span>
            <p>Funding sources found</p>
          </article>
          <article>
            <TrendingUp size={18} />
            <span>{formatMoney(visibleTicket, "USD")}</span>
            <p>Visible ticket capacity</p>
          </article>
          <article>
            <BadgeCheck size={18} />
            <span>{items.filter((item) => item.isVerified).length}</span>
            <p>Verified sources</p>
          </article>
        </section>

        <section className="fs-source-grid">
          {FUNDING_SOURCE_TYPES.map((source) => (
            <button
              key={source}
              type="button"
              className={draft.fundingServiceType === source ? "active" : ""}
              onClick={() => chooseSource(source)}
            >
              <strong>{source}</strong>
              <span>{counts[source] || 0} active listings.</span>
            </button>
          ))}
        </section>

        <section className="fs-layout">
          <aside className="fs-filters">
            <div className="fs-filter-head">
              <Filter size={16} />
              <strong>Filter Funding Sources</strong>
            </div>

            <form onSubmit={submit}>
              <label>
                Search
                <div className="fs-input-icon">
                  <Search size={14} />
                  <input
                    value={draft.search}
                    onChange={(e) =>
                      setDraft({ ...draft, search: e.target.value })
                    }
                    placeholder="Provider, source, terms"
                  />
                </div>
              </label>

              <label>
                Funding Source
                <select
                  value={draft.fundingServiceType}
                  onChange={(e) =>
                    setDraft({ ...draft, fundingServiceType: e.target.value })
                  }
                >
                  <option value="">All funding sources</option>
                  {FUNDING_SOURCE_TYPES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Location
                <select
                  value={draft.country}
                  onChange={(e) =>
                    setDraft({ ...draft, country: e.target.value })
                  }
                >
                  <option value="">All locations</option>
                  {COUNTRIES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <button type="submit">
                <SlidersHorizontal size={14} />
                Apply Filters
              </button>
              <button type="button" className="fs-clear" onClick={clearFilters}>
                Clear
              </button>
            </form>
          </aside>

          <section className="fs-results">
            <div className="fs-results-head">
              <strong>{meta.total} results found.</strong>
              <select
                value={filters.sortBy || "featured"}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    page: 1,
                    sortBy: e.target.value as FundingSourceFilters["sortBy"],
                  })
                }
              >
                <option value="featured">Featured first</option>
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="ticketMax">Highest ticket size</option>
              </select>
            </div>

            {error && <div className="fs-alert">{error}</div>}

            {loading ? (
              <div className="fs-loading">
                <Loader2 className="spin" size={20} />
                Loading funding sources
              </div>
            ) : items.length ? (
              <div className="fs-grid">
                {items.map((item) => (
                  <FundingSourceCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="fs-empty">
                No funding sources match your filters.
              </div>
            )}

            <div className="fs-pagination">
              <button
                disabled={meta.page <= 1}
                onClick={() => setFilters({ ...filters, page: meta.page - 1 })}
              >
                Previous
              </button>
              <span>
                Page {meta.page} of {meta.totalPages}
              </span>
              <button
                disabled={meta.page >= meta.totalPages}
                onClick={() => setFilters({ ...filters, page: meta.page + 1 })}
              >
                Next
              </button>
            </div>
          </section>
        </section>
      </main>
    </>
  );
}

const styles = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  .fs-page{min-height:100vh;background:#f4f6f9;color:#0f1e36;font-family:'Poppins','Inter',system-ui,sans-serif;padding:128px 24px 64px}
  .fs-hero{max-width:82rem;margin:0 auto 18px;background:#0a1628;color:#fff;padding:30px;display:flex;align-items:flex-start;justify-content:space-between;gap:18px;border-radius:4px}
  .fs-hero p{font-size:11px;font-weight:900;text-transform:uppercase;color:#f5a623;margin-bottom:8px}
  .fs-hero h1{font-size:34px;line-height:1.12;margin-bottom:10px}
  .fs-hero span{display:block;max-width:760px;color:rgba(255,255,255,.68);font-size:14px;line-height:1.7}
  .fs-hero a{height:40px;display:inline-flex;align-items:center;justify-content:center;background:#f5a623;color:#fff;text-decoration:none;font-size:13px;font-weight:900;padding:0 18px;border-radius:4px;white-space:nowrap}
  .fs-stats{max-width:82rem;margin:0 auto 18px;display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
  .fs-stats article{background:#fff;border:1px solid #e2e6ed;padding:16px;display:flex;align-items:center;gap:12px;border-radius:4px}
  .fs-stats svg{color:#1A56DB}.fs-stats span{display:block;font-size:20px;font-weight:900}.fs-stats p{font-size:12px;color:#8896a8;font-weight:800}
  .fs-source-grid{max-width:82rem;margin:0 auto 22px;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:18px}
  .fs-source-grid button{min-height:118px;text-align:left;background:#fff;border:1px solid #e2e6ed;border-radius:10px;padding:20px 24px;box-shadow:0 8px 20px rgba(15,30,54,.08);cursor:pointer;transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease}
  .fs-source-grid button:hover,.fs-source-grid button.active{transform:translateY(-2px);border-color:#1A56DB;box-shadow:0 14px 34px rgba(15,30,54,.11)}
  .fs-source-grid strong{display:block;font-size:16px;line-height:1.25;color:#020617;margin-bottom:16px}
  .fs-source-grid span{display:block;color:#00005f;font-size:15px;font-weight:500}
  .fs-layout{max-width:82rem;margin:0 auto;display:grid;grid-template-columns:300px minmax(0,1fr);gap:22px}
  .fs-filters,.fs-results-head,.fs-card,.fs-empty,.fs-loading,.fs-alert{background:#fff;border:1px solid #e2e6ed;border-radius:4px}
  .fs-filters{height:max-content;padding:18px;position:sticky;top:128px}
  .fs-filter-head{display:flex;align-items:center;gap:9px;margin-bottom:18px;color:#0f1e36}
  .fs-filters form{display:flex;flex-direction:column;gap:13px}
  .fs-filters label{display:flex;flex-direction:column;gap:6px;font-size:11px;font-weight:900;text-transform:uppercase;color:#4a5568}
  .fs-filters input,.fs-filters select{width:100%;height:40px;border:1px solid #e2e6ed;background:#fff;color:#0f1e36;padding:0 11px;font:600 13px 'Poppins','Inter',system-ui,sans-serif;outline:none;border-radius:3px}
  .fs-input-icon{position:relative}.fs-input-icon svg{position:absolute;left:10px;top:13px;color:#8896a8}.fs-input-icon input{padding-left:32px}
  .fs-filters button,.fs-pagination button{height:38px;border:0;background:#f5a623;color:#fff;font:900 12px 'Poppins','Inter',system-ui,sans-serif;cursor:pointer;border-radius:3px;display:inline-flex;align-items:center;justify-content:center;gap:7px}
  .fs-filters .fs-clear{background:#fff;color:#4a5568;border:1px solid #e2e6ed}
  .fs-results{min-width:0}
  .fs-results-head{height:54px;display:flex;align-items:center;justify-content:space-between;padding:0 16px;margin-bottom:14px}
  .fs-results-head strong{font-size:15px}.fs-results-head select{height:34px;border:1px solid #e2e6ed;background:#fff;padding:0 10px;border-radius:3px}
  .fs-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}
  .fs-card{display:block;text-decoration:none;color:inherit;overflow:hidden;transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease}
  .fs-card:hover{transform:translateY(-2px);box-shadow:0 12px 32px rgba(15,30,54,.08);border-color:#c8d0db}
  .fs-ribbon{height:30px;background:#0ea5e9;color:#fff;display:flex;align-items:center;justify-content:center;gap:7px;font-size:13px;font-weight:900}
  .fs-art{height:150px;background:#eef3f8;display:grid;place-items:center;color:#1A56DB;text-align:center}
  .fs-art strong{font-size:26px;color:#0f1e36}.fs-art span{font-size:11px;font-weight:900;color:#4a5568}
  .fs-card-body{padding:18px}
  .fs-card-top{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:11px}
  .fs-card-top span{display:inline-flex;align-items:center;gap:5px;color:#10B981;font-size:11px;font-weight:900}.fs-card-top b{background:#fff7ed;color:#c97d10;padding:4px 7px;font-size:10px;border-radius:3px}
  .fs-card h2{font-size:20px;line-height:1.18;margin-bottom:10px;color:#0f1e36}
  .fs-line{display:flex;align-items:flex-start;gap:6px;color:#6b7280;font-size:12px;line-height:1.45;margin-bottom:7px}
  .fs-line svg{color:#f5a623}
  .fs-summary{background:#f8fafc;border:1px solid #edf0f5;margin:14px 0;padding:11px;border-radius:3px}
  .fs-summary span,.fs-metrics span{font-size:11px;text-transform:uppercase;color:#6b7280;font-weight:800}
  .fs-summary p{font-size:12px;line-height:1.55;color:#4a5568;margin-top:4px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
  .fs-metrics{display:grid;grid-template-columns:1fr 1fr;margin-bottom:14px;border-top:1px solid #edf0f5;border-bottom:1px solid #edf0f5}
  .fs-metrics div{padding:11px 12px 11px 0}.fs-metrics div+div{border-left:1px solid #edf0f5;padding-left:12px}
  .fs-metrics strong{display:block;margin-top:4px;color:#0f1e36;font-size:14px}
  .fs-footer{display:flex;align-items:center;justify-content:space-between;gap:10px}
  .fs-footer small{color:#8896a8;font-weight:800;font-size:11px;line-height:1.4}.fs-footer em{font-style:normal;color:#1A56DB;font-weight:900;font-size:12px;white-space:nowrap}
  .fs-loading,.fs-empty,.fs-alert{padding:34px;text-align:center;color:#4a5568;font-weight:900}
  .fs-loading{display:flex;align-items:center;justify-content:center;gap:9px}
  .fs-alert{border-color:#fecaca;background:#fef2f2;color:#b91c1c;margin-bottom:14px}
  .spin{animation:spin .7s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}
  .fs-pagination{display:flex;align-items:center;justify-content:center;gap:12px;margin-top:22px}.fs-pagination button:disabled{opacity:.45;cursor:not-allowed}.fs-pagination span{font-size:12px;font-weight:900;color:#4a5568}
  @media(max-width:1180px){.fs-source-grid{grid-template-columns:repeat(2,1fr)}.fs-grid{grid-template-columns:repeat(2,1fr)}.fs-layout{grid-template-columns:1fr}.fs-filters{position:static}}
  @media(max-width:720px){.fs-page{padding:104px 14px 44px}.fs-hero{flex-direction:column;padding:22px}.fs-hero h1{font-size:28px}.fs-stats,.fs-source-grid,.fs-grid{grid-template-columns:1fr}.fs-results-head{height:auto;align-items:flex-start;flex-direction:column;gap:10px;padding:14px}}
`;