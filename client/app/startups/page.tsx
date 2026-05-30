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
  Lightbulb,
  Loader2,
  MapPin,
  Rocket,
  Search,
  SlidersHorizontal,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { StartupService } from "@/services/startup.service";
import type { StartupFilters, StartupListing } from "@/types/startup";

const CATEGORIES = [
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

const STAGES = [
  "Idea",
  "Prototype",
  "MVP",
  "Pre-Revenue",
  "Revenue",
  "Growth",
  "Scaling",
];

function formatMoney(value?: string | number | null, currency = "USD") {
  const amount = Number(value || 0);
  if (!amount) return "Not disclosed";
  return `${currency} ${amount.toLocaleString()}`;
}

function text(value?: string | null, fallback = "Not provided") {
  return value?.trim() || fallback;
}

function StartupCard({ item }: { item: StartupListing }) {
  const location = [item.city, item.country].filter(Boolean).join(", ");
  const owner = item.user
    ? [item.user.firstName, item.user.lastName].filter(Boolean).join(" ")
    : "Founder";
  const primaryImage = item.imageUrls?.[0];

  return (
    <a className="su-card" href={`/startups/${item.slug}`}>
      <div className="su-ribbon">
        <Rocket size={14} />
        Startup
      </div>

      {primaryImage ? (
        <div
          className="su-image"
          style={{ backgroundImage: `url(${primaryImage})` }}
        />
      ) : (
        <div className="su-art">
          <Rocket size={34} />
          <strong>
            {(item.startupCategory || item.industry || "ST")
              .slice(0, 2)
              .toUpperCase()}
          </strong>
          <span>{item.startupStage || "Startup"}</span>
        </div>
      )}

      <div className="su-card-body">
        <div className="su-card-top">
          <span>
            {item.isVerified ? <BadgeCheck size={13} /> : <Lightbulb size={13} />}
            {item.isVerified ? "Verified" : text(item.startupType, "Project")}
          </span>
          {item.isFeatured && <b>Featured</b>}
        </div>

        <h2>{item.title}</h2>

        <p className="su-line">
          <MapPin size={14} />
          {location || item.country}
        </p>
        <p className="su-line">
          <Building2 size={14} />
          {text(item.startupCategory || item.industry)}
        </p>

        <div className="su-problem">
          <span>Problem</span>
          <p>{text(item.problemStatement || item.shortSummary)}</p>
        </div>

        <div className="su-metrics">
          <div>
            <span>Stage</span>
            <strong>{text(item.startupStage || item.productStatus, "TBD")}</strong>
          </div>
          <div>
            <span>Funding</span>
            <strong>
              {formatMoney(item.fundingNeeded || item.askAmount, item.currency)}
            </strong>
          </div>
        </div>

        <div className="su-footer">
          <small>
            {owner || "Founder"} · {item.enquiryCount || item._count?.deals || 0}{" "}
            enquiries · {item.viewCount || 0} views
          </small>
          <em>View Details</em>
        </div>
      </div>
    </a>
  );
}

export default function StartupsPage() {
  const [items, setItems] = useState<StartupListing[]>([]);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 1,
  });
  const [filters, setFilters] = useState<StartupFilters>({
    page: 1,
    limit: 12,
    sortBy: "featured",
  });
  const [draft, setDraft] = useState({
    search: "",
    category: "",
    country: "",
    startupStage: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStartups = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await StartupService.getStartups(filters);
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
      setError(err?.message || "Startups could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void loadStartups();
  }, [loadStartups]);

  const visibleFunding = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum + Number(item.fundingNeeded || item.askAmount || 0),
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
      category: draft.category || undefined,
      country: draft.country || undefined,
      startupStage: draft.startupStage || undefined,
    });
  };

  const clearFilters = () => {
    setDraft({ search: "", category: "", country: "", startupStage: "" });
    setFilters({ page: 1, limit: 12, sortBy: "featured" });
  };

  return (
    <>
      <style>{styles}</style>
      <main className="su-page">
        <section className="su-hero">
          <div>
            <p>Startup marketplace</p>
            <h1>Startups</h1>
            <span>
              Discover early-stage ventures, project ideas, MVPs, and scalable
              startups seeking investors, buyers, operators, and strategic
              partners.
            </span>
          </div>
          <a href="/dashboard?tab=startups">Post Startup</a>
        </section>

        <section className="su-stats">
          <article>
            <Rocket size={18} />
            <span>{meta.total}</span>
            <p>Startups found</p>
          </article>
          <article>
            <TrendingUp size={18} />
            <span>{formatMoney(visibleFunding, "USD")}</span>
            <p>Visible funding need</p>
          </article>
          <article>
            <BadgeCheck size={18} />
            <span>{items.filter((item) => item.isVerified).length}</span>
            <p>Verified profiles</p>
          </article>
        </section>

        <section className="su-layout">
          <aside className="su-filters">
            <div className="su-filter-head">
              <Filter size={16} />
              <strong>Filter Startups</strong>
            </div>

            <form onSubmit={submit}>
              <label>
                Search
                <div className="su-input-icon">
                  <Search size={14} />
                  <input
                    value={draft.search}
                    onChange={(e) =>
                      setDraft({ ...draft, search: e.target.value })
                    }
                    placeholder="Startup, category, problem"
                  />
                </div>
              </label>

              <label>
                Category
                <select
                  value={draft.category}
                  onChange={(e) =>
                    setDraft({ ...draft, category: e.target.value })
                  }
                >
                  <option value="">All categories</option>
                  {CATEGORIES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Stage
                <select
                  value={draft.startupStage}
                  onChange={(e) =>
                    setDraft({ ...draft, startupStage: e.target.value })
                  }
                >
                  <option value="">All stages</option>
                  {STAGES.map((item) => (
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
              <button type="button" className="su-clear" onClick={clearFilters}>
                Clear
              </button>
            </form>
          </aside>

          <section className="su-results">
            <div className="su-results-head">
              <strong>{meta.total} results found.</strong>
              <select
                value={filters.sortBy || "featured"}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    page: 1,
                    sortBy: e.target.value as StartupFilters["sortBy"],
                  })
                }
              >
                <option value="featured">Featured first</option>
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="fundingNeeded">Highest funding need</option>
              </select>
            </div>

            {error && <div className="su-alert">{error}</div>}

            {loading ? (
              <div className="su-loading">
                <Loader2 className="spin" size={20} />
                Loading startups
              </div>
            ) : items.length ? (
              <div className="su-grid">
                {items.map((item) => (
                  <StartupCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="su-empty">No startups match your filters.</div>
            )}

            <div className="su-pagination">
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
  .su-page{min-height:100vh;background:#f4f6f9;color:#0f1e36;font-family:'Poppins','Inter',system-ui,sans-serif;padding:128px 24px 64px}
  .su-hero{max-width:82rem;margin:0 auto 18px;background:#0a1628;color:#fff;padding:30px;display:flex;align-items:flex-start;justify-content:space-between;gap:18px;border-radius:4px}
  .su-hero p{font-size:11px;font-weight:900;text-transform:uppercase;color:#f5a623;margin-bottom:8px}
  .su-hero h1{font-size:34px;line-height:1.12;margin-bottom:10px}
  .su-hero span{display:block;max-width:760px;color:rgba(255,255,255,.68);font-size:14px;line-height:1.7}
  .su-hero a{height:40px;display:inline-flex;align-items:center;justify-content:center;background:#f5a623;color:#fff;text-decoration:none;font-size:13px;font-weight:900;padding:0 18px;border-radius:4px;white-space:nowrap}
  .su-stats{max-width:82rem;margin:0 auto 18px;display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
  .su-stats article{background:#fff;border:1px solid #e2e6ed;padding:16px;display:flex;align-items:center;gap:12px;border-radius:4px}
  .su-stats svg{color:#1A56DB}.su-stats span{display:block;font-size:20px;font-weight:900}.su-stats p{font-size:12px;color:#8896a8;font-weight:800}
  .su-layout{max-width:82rem;margin:0 auto;display:grid;grid-template-columns:300px minmax(0,1fr);gap:22px}
  .su-filters,.su-results-head,.su-card,.su-empty,.su-loading,.su-alert{background:#fff;border:1px solid #e2e6ed;border-radius:4px}
  .su-filters{height:max-content;padding:18px;position:sticky;top:128px}
  .su-filter-head{display:flex;align-items:center;gap:9px;margin-bottom:18px;color:#0f1e36}
  .su-filters form{display:flex;flex-direction:column;gap:13px}
  .su-filters label{display:flex;flex-direction:column;gap:6px;font-size:11px;font-weight:900;text-transform:uppercase;color:#4a5568}
  .su-filters input,.su-filters select{width:100%;height:40px;border:1px solid #e2e6ed;background:#fff;color:#0f1e36;padding:0 11px;font:600 13px 'Poppins','Inter',system-ui,sans-serif;outline:none;border-radius:3px}
  .su-input-icon{position:relative}.su-input-icon svg{position:absolute;left:10px;top:13px;color:#8896a8}.su-input-icon input{padding-left:32px}
  .su-filters button,.su-pagination button{height:38px;border:0;background:#f5a623;color:#fff;font:900 12px 'Poppins','Inter',system-ui,sans-serif;cursor:pointer;border-radius:3px;display:inline-flex;align-items:center;justify-content:center;gap:7px}
  .su-filters .su-clear{background:#fff;color:#4a5568;border:1px solid #e2e6ed}
  .su-results{min-width:0}
  .su-results-head{height:54px;display:flex;align-items:center;justify-content:space-between;padding:0 16px;margin-bottom:14px}
  .su-results-head strong{font-size:15px}.su-results-head select{height:34px;border:1px solid #e2e6ed;background:#fff;padding:0 10px;border-radius:3px}
  .su-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}
  .su-card{display:block;text-decoration:none;color:inherit;overflow:hidden;transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease}
  .su-card:hover{transform:translateY(-2px);box-shadow:0 12px 32px rgba(15,30,54,.08);border-color:#c8d0db}
  .su-ribbon{height:30px;background:#2563eb;color:#fff;display:flex;align-items:center;justify-content:center;gap:7px;font-size:13px;font-weight:900}
  .su-art{height:150px;background:#eef3f8;display:grid;place-items:center;color:#1A56DB;text-align:center}
  .su-image{height:150px;background-size:cover;background-position:center;background-color:#eef3f8}
  .su-art strong{font-size:26px;color:#0f1e36}.su-art span{font-size:11px;font-weight:900;color:#4a5568}
  .su-card-body{padding:18px}
  .su-card-top{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:11px}
  .su-card-top span{display:inline-flex;align-items:center;gap:5px;color:#10B981;font-size:11px;font-weight:900}.su-card-top b{background:#fff7ed;color:#c97d10;padding:4px 7px;font-size:10px;border-radius:3px}
  .su-card h2{font-size:20px;line-height:1.18;margin-bottom:10px;color:#0f1e36}
  .su-line{display:flex;align-items:flex-start;gap:6px;color:#6b7280;font-size:12px;line-height:1.45;margin-bottom:7px}
  .su-line svg{color:#f5a623}
  .su-problem{background:#f8fafc;border:1px solid #edf0f5;margin:14px 0;padding:11px;border-radius:3px}
  .su-problem span,.su-metrics span{font-size:11px;text-transform:uppercase;color:#6b7280;font-weight:800}
  .su-problem p{font-size:12px;line-height:1.55;color:#4a5568;margin-top:4px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
  .su-metrics{display:grid;grid-template-columns:1fr 1fr;margin-bottom:14px;border-top:1px solid #edf0f5;border-bottom:1px solid #edf0f5}
  .su-metrics div{padding:11px 12px 11px 0}.su-metrics div+div{border-left:1px solid #edf0f5;padding-left:12px}
  .su-metrics strong{display:block;margin-top:4px;color:#0f1e36;font-size:14px}
  .su-footer{display:flex;align-items:center;justify-content:space-between;gap:10px}
  .su-footer small{color:#8896a8;font-weight:800;font-size:11px;line-height:1.4}.su-footer em{font-style:normal;color:#1A56DB;font-weight:900;font-size:12px;white-space:nowrap}
  .su-loading,.su-empty,.su-alert{padding:34px;text-align:center;color:#4a5568;font-weight:900}
  .su-loading{display:flex;align-items:center;justify-content:center;gap:9px}
  .su-alert{border-color:#fecaca;background:#fef2f2;color:#b91c1c;margin-bottom:14px}
  .spin{animation:spin .7s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}
  .su-pagination{display:flex;align-items:center;justify-content:center;gap:12px;margin-top:22px}.su-pagination button:disabled{opacity:.45;cursor:not-allowed}.su-pagination span{font-size:12px;font-weight:900;color:#4a5568}
  @media(max-width:1180px){.su-grid{grid-template-columns:repeat(2,1fr)}.su-layout{grid-template-columns:1fr}.su-filters{position:static}}
  @media(max-width:720px){.su-page{padding:104px 14px 44px}.su-hero{flex-direction:column;padding:22px}.su-hero h1{font-size:28px}.su-stats,.su-grid{grid-template-columns:1fr}.su-results-head{height:auto;align-items:flex-start;flex-direction:column;gap:10px;padding:14px}}
`;