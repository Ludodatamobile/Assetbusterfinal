// 
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
  Building2,
  Filter,
  HandCoins,
  Loader2,
  MapPin,
  Search,
  SlidersHorizontal,
  TrendingUp,
} from "lucide-react";
import { FundraiserService } from "@/services/fundraiser.service";
import type { FundraiserFilters, FundraiserListing } from "@/types/fundraiser";

const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Manufacturing",
  "Energy",
  "Real Estate",
  "Hospitality",
  "Logistics",
  "Financial Services",
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

function formatEnum(value?: string | null) {
  if (!value) return "Not available";
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatMoney(value?: string | number | null, currency = "USD") {
  const amount = Number(value || 0);
  if (!amount) return "TBD";
  return `${currency} ${amount.toLocaleString()}`;
}

function FundraiserCard({ item }: { item: FundraiserListing }) {
  const [open, setOpen] = useState(false);
  const location = [item.city, item.country].filter(Boolean).join(", ");
  const owner = item.user
    ? [item.user.firstName, item.user.lastName].filter(Boolean).join(" ")
    : "Confidential fundraiser";

  return (
    <article className="fr-card">
      <div className="fr-ribbon">Fund Raiser</div>
      <div className="fr-art">
        <HandCoins size={34} />
        <strong>{item.industry.slice(0, 2).toUpperCase()}</strong>
        <span>{formatEnum(item.dealType)}</span>
      </div>

      <div className="fr-card-body">
        <div className="fr-card-top">
          <span>
            {item.isVerified ? (
              <BadgeCheck size={13} />
            ) : (
              <Building2 size={13} />
            )}
            {item.isVerified ? "Verified" : "Fundraise"}
          </span>
          {item.isFeatured && <b>Featured</b>}
        </div>

        <h2>{item.title}</h2>

        <p className="fr-location">
          <MapPin size={14} />
          {location || item.country}
        </p>

        <p className="fr-sector">
          <Building2 size={14} />
          {item.industry}
        </p>

        <div className="fr-expectation">
          <span>Capital Required</span>
          <strong>{formatMoney(item.askAmount, item.currency)}</strong>
        </div>

        <div className="fr-metrics">
          <div>
            <span>Revenue</span>
            <strong>{formatMoney(item.runSales, item.currency)}</strong>
          </div>
          <div>
            <span>EBITDA</span>
            <strong>{formatMoney(item.ebitda, item.currency)}</strong>
          </div>
        </div>

        {open && (
          <div className="fr-detail">
            <p>{item.description}</p>
            <small>
              {owner} · {item.enquiryCount || item._count?.deals || 0} enquiries
              · {item.viewCount} views
            </small>
          </div>
        )}

        <a
          className="fr-view-btn"
          href={`/fund-raisers/${item.slug || item.id}`}
        >
          View Detail
        </a>
      </div>
    </article>
  );
}

export default function FundRaisersPage() {
  const [items, setItems] = useState<FundraiserListing[]>([]);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 1,
  });
  const [filters, setFilters] = useState<FundraiserFilters>({
    page: 1,
    limit: 12,
    sortBy: "featured",
  });
  const [draft, setDraft] = useState({
    search: "",
    industry: "",
    country: "",
    currency: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadFundraisers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await FundraiserService.getFundraisers(filters);
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
      setError(err?.message || "Fund raisers could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void loadFundraisers();
  }, [loadFundraisers]);

  const totalCapital = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.askAmount || 0), 0),
    [items],
  );

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFilters({
      page: 1,
      limit: 12,
      sortBy: "featured",
      search: draft.search || undefined,
      industry: draft.industry || undefined,
      country: draft.country || undefined,
      currency: draft.currency || undefined,
    });
  };

  const clearFilters = () => {
    setDraft({ search: "", industry: "", country: "", currency: "" });
    setFilters({ page: 1, limit: 12, sortBy: "featured" });
  };

  return (
    <>
      <style>{styles}</style>
      <main className="fr-page">
        <section className="fr-hero">
          <div>
            <p>Capital raise marketplace</p>
            <h1>Fund Raisers</h1>
            <span>
              Discover companies raising growth capital, strategic investment,
              debt funding, or joint venture capital across active M&A markets.
            </span>
          </div>
          <a href="/dashboard?tab=add-profile">Raise Capital</a>
        </section>

        <section className="fr-stats">
          <article>
            <HandCoins size={18} />
            <span>{meta.total}</span>
            <p>Fund raisers found</p>
          </article>
          <article>
            <TrendingUp size={18} />
            <span>{formatMoney(totalCapital, "USD")}</span>
            <p>Visible capital demand</p>
          </article>
          <article>
            <BadgeCheck size={18} />
            <span>{items.filter((item) => item.isVerified).length}</span>
            <p>Verified profiles</p>
          </article>
        </section>

        <section className="fr-layout">
          <aside className="fr-filters">
            <div className="fr-filter-head">
              <Filter size={16} />
              <strong>Filter Fund Raisers</strong>
            </div>

            <form onSubmit={submit}>
              <label>
                Search
                <div className="fr-input-icon">
                  <Search size={14} />
                  <input
                    value={draft.search}
                    onChange={(e) =>
                      setDraft({ ...draft, search: e.target.value })
                    }
                    placeholder="Company, sector, location"
                  />
                </div>
              </label>

              <label>
                Industry
                <select
                  value={draft.industry}
                  onChange={(e) =>
                    setDraft({ ...draft, industry: e.target.value })
                  }
                >
                  <option value="">All industries</option>
                  {INDUSTRIES.map((item) => (
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

              <label>
                Currency
                <select
                  value={draft.currency}
                  onChange={(e) =>
                    setDraft({ ...draft, currency: e.target.value })
                  }
                >
                  <option value="">Any currency</option>
                  <option value="USD">USD</option>
                  <option value="NGN">NGN</option>
                  <option value="GBP">GBP</option>
                  <option value="EUR">EUR</option>
                </select>
              </label>

              <button type="submit">
                <SlidersHorizontal size={14} />
                Apply Filters
              </button>
              <button type="button" className="fr-clear" onClick={clearFilters}>
                Clear
              </button>
            </form>
          </aside>

          <section className="fr-results">
            <div className="fr-results-head">
              <strong>{meta.total} results found.</strong>
              <select
                value={filters.sortBy || "featured"}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    page: 1,
                    sortBy: e.target.value as FundraiserFilters["sortBy"],
                  })
                }
              >
                <option value="featured">Featured first</option>
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="askAmount">Highest raise</option>
              </select>
            </div>

            {error && <div className="fr-alert">{error}</div>}

            {loading ? (
              <div className="fr-loading">
                <Loader2 className="spin" size={20} />
                Loading fund raisers
              </div>
            ) : items.length ? (
              <div className="fr-grid">
                {items.map((item) => (
                  <FundraiserCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="fr-empty">
                No fund raisers match your filters.
              </div>
            )}

            <div className="fr-pagination">
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
  .fr-page{min-height:100vh;background:#f4f6f9;color:#0f1e36;font-family:'Poppins','Inter',system-ui,sans-serif;padding:128px 24px 64px}
  .fr-hero{max-width:82rem;margin:0 auto 18px;background:#0a1628;color:#fff;padding:30px;display:flex;align-items:flex-start;justify-content:space-between;gap:18px;border-radius:4px}
  .fr-hero p{font-size:11px;font-weight:900;text-transform:uppercase;color:#f5a623;margin-bottom:8px}
  .fr-hero h1{font-size:34px;line-height:1.12;margin-bottom:10px}
  .fr-hero span{display:block;max-width:760px;color:rgba(255,255,255,.68);font-size:14px;line-height:1.7}
  .fr-hero a{height:40px;display:inline-flex;align-items:center;justify-content:center;background:#f5a623;color:#fff;text-decoration:none;font-size:13px;font-weight:900;padding:0 18px;border-radius:4px;white-space:nowrap}
  .fr-stats{max-width:82rem;margin:0 auto 18px;display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
  .fr-stats article{background:#fff;border:1px solid #e2e6ed;padding:16px;display:flex;align-items:center;gap:12px;border-radius:4px}
  .fr-stats svg{color:#1A56DB}.fr-stats span{display:block;font-size:20px;font-weight:900}.fr-stats p{font-size:12px;color:#8896a8;font-weight:800}
  .fr-layout{max-width:82rem;margin:0 auto;display:grid;grid-template-columns:300px minmax(0,1fr);gap:22px}
  .fr-filters,.fr-results-head,.fr-card,.fr-empty,.fr-loading,.fr-alert{background:#fff;border:1px solid #e2e6ed;border-radius:4px}
  .fr-filters{height:max-content;padding:18px;position:sticky;top:128px}
  .fr-filter-head{display:flex;align-items:center;gap:9px;margin-bottom:18px;color:#0f1e36}
  .fr-filters form{display:flex;flex-direction:column;gap:13px}
  .fr-filters label{display:flex;flex-direction:column;gap:6px;font-size:11px;font-weight:900;text-transform:uppercase;color:#4a5568}
  .fr-filters input,.fr-filters select{width:100%;height:40px;border:1px solid #e2e6ed;background:#fff;color:#0f1e36;padding:0 11px;font:600 13px 'Poppins','Inter',system-ui,sans-serif;outline:none;border-radius:3px}
  .fr-input-icon{position:relative}.fr-input-icon svg{position:absolute;left:10px;top:13px;color:#8896a8}.fr-input-icon input{padding-left:32px}
  .fr-filters button,.fr-view-btn,.fr-pagination button{height:38px;border:0;background:#f5a623;color:#fff;font:900 12px 'Poppins','Inter',system-ui,sans-serif;cursor:pointer;border-radius:3px;display:inline-flex;align-items:center;justify-content:center;gap:7px}
  .fr-filters .fr-clear{background:#fff;color:#4a5568;border:1px solid #e2e6ed}
  .fr-results{min-width:0}
  .fr-results-head{height:54px;display:flex;align-items:center;justify-content:space-between;padding:0 16px;margin-bottom:14px}
  .fr-results-head strong{font-size:15px}.fr-results-head select{height:34px;border:1px solid #e2e6ed;background:#fff;padding:0 10px;border-radius:3px}
  .fr-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}
  .fr-card{overflow:hidden}
  .fr-ribbon{height:30px;background:#2fb3ec;color:#fff;display:grid;place-items:center;font-size:13px;font-weight:900}
  .fr-art{height:150px;background:#eef3f8;display:grid;place-items:center;color:#1A56DB;text-align:center}
  .fr-art strong{font-size:26px;color:#0f1e36}.fr-art span{font-size:11px;font-weight:900;color:#4a5568}
  .fr-card-body{padding:18px}
  .fr-card-top{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:11px}
  .fr-card-top span{display:inline-flex;align-items:center;gap:5px;color:#10B981;font-size:11px;font-weight:900}.fr-card-top b{background:#fff7ed;color:#c97d10;padding:4px 7px;font-size:10px;border-radius:3px}
  .fr-card h2{font-size:20px;line-height:1.18;margin-bottom:10px;color:#0f1e36}
  .fr-location,.fr-sector{display:flex;align-items:flex-start;gap:6px;color:#6b7280;font-size:12px;line-height:1.45;margin-bottom:7px}
  .fr-location svg{color:#ff9d3b}.fr-sector svg{color:#f5a623}
  .fr-expectation{border-top:1px solid #edf0f5;border-bottom:1px solid #edf0f5;margin:16px 0 12px;padding:11px 0;display:flex;align-items:center;justify-content:space-between}
  .fr-expectation span,.fr-metrics span{font-size:11px;text-transform:uppercase;color:#6b7280;font-weight:800}
  .fr-expectation strong{font-size:22px;color:#ff9d3b}
  .fr-metrics{display:grid;grid-template-columns:1fr 1fr;margin-bottom:14px}
  .fr-metrics div{padding-right:12px}.fr-metrics div+div{border-left:1px solid #edf0f5;padding-left:12px}
  .fr-metrics strong{display:block;margin-top:4px;color:#6b7280;font-size:15px}
  .fr-detail{background:#f8fafc;border:1px solid #e2e6ed;padding:11px;margin-bottom:13px;border-radius:3px}
  .fr-detail p{font-size:12px;line-height:1.6;color:#4a5568}.fr-detail small{display:block;margin-top:8px;color:#8896a8;font-weight:800}
  .fr-view-btn{width:100%;background:#ff9d3b}
  .fr-loading,.fr-empty,.fr-alert{padding:34px;text-align:center;color:#4a5568;font-weight:900}
  .fr-alert{border-color:#fecaca;background:#fef2f2;color:#b91c1c;margin-bottom:14px}
  .spin{animation:spin .7s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}
  .fr-pagination{display:flex;align-items:center;justify-content:center;gap:12px;margin-top:22px}.fr-pagination button:disabled{opacity:.45;cursor:not-allowed}.fr-pagination span{font-size:12px;font-weight:900;color:#4a5568}
  @media(max-width:1180px){.fr-grid{grid-template-columns:repeat(2,1fr)}.fr-layout{grid-template-columns:1fr}.fr-filters{position:static}}
  @media(max-width:720px){.fr-page{padding:104px 14px 44px}.fr-hero{flex-direction:column;padding:22px}.fr-hero h1{font-size:28px}.fr-stats,.fr-grid{grid-template-columns:1fr}.fr-results-head{height:auto;align-items:flex-start;flex-direction:column;gap:10px;padding:14px}}
`;
