"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  BadgeCheck,
  Building2,
  Filter,
  Loader2,
  MapPin,
  Search,
  SlidersHorizontal,
  TrendingUp,
  Users,
} from "lucide-react";
import { MarketplaceService } from "@/services/marketplace.service";
import type { BusinessListing } from "@/types/marketplace";

type Filters = {
  page?: number;
  limit?: number;
  sortBy?: string;
  search?: string;
  industry?: string;
  country?: string;
  currency?: string;
};

const INDUSTRIES = ["Technology", "Healthcare", "Manufacturing", "Energy", "Real Estate", "Hospitality", "Logistics", "Financial Services"];
const COUNTRIES = ["Nigeria", "Ghana", "Kenya", "South Africa", "United States", "United Kingdom", "India", "United Arab Emirates"];

function formatEnum(value?: string | null) {
  if (!value) return "Not available";
  return value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatMoney(value?: string | number | null, currency = "USD") {
  const amount = Number(value || 0);
  if (!amount) return "Not disclosed";
  return `${currency} ${amount.toLocaleString()}`;
}

function getSummary(item: BusinessListing) {
  return item.shortSummary || item.teaserSummary || item.description || "No summary has been provided yet.";
}

function unwrapBusinesses(response: any): BusinessListing[] {
  const data = response?.data?.listings || response?.data?.businesses || response?.data?.items || response?.data || [];
  return Array.isArray(data) ? data : [];
}

function BusinessCard({ item }: { item: BusinessListing }) {
  const location = [item.city, item.country].filter(Boolean).join(", ");
  const href = `/businesses-for-sale/${item.id}`;
  const revenue = item.runSales ?? item.grossRevenue;
  const profit = item.ebitda ?? item.netProfit;

  return (
    <article className="bs-card">
      <div className="bs-card-art">
        <Building2 size={34} />
        <strong>{item.industry ? item.industry.slice(0, 2).toUpperCase() : "BS"}</strong>
        <span>{formatEnum(item.dealType)}</span>
      </div>

      <div className="bs-card-body">
        <div className="bs-card-top">
          <span>{item.isVerified ? <BadgeCheck size={13} /> : <Building2 size={13} />}{item.isVerified ? "Verified" : "Business"}</span>
          {item.isFeatured && <b>Featured</b>}
        </div>

        <h2>
          <a href={href}>{item.title}</a>
        </h2>

        <p className="bs-location">
          <MapPin size={14} />
          {location || item.country || "Location not disclosed"}
        </p>

        <p className="bs-summary">{getSummary(item)}</p>

        <div className="bs-ask">
          <span>Asking Amount</span>
          <strong>{formatMoney(item.askAmount, item.currency)}</strong>
        </div>

        <div className="bs-metrics">
          <div>
            <span>Revenue</span>
            <strong>{formatMoney(revenue, item.currency)}</strong>
          </div>
          <div>
            <span>Profit</span>
            <strong>{formatMoney(profit, item.currency)}</strong>
          </div>
        </div>

        <a className="bs-view-btn" href={href}>
          View Details
        </a>
      </div>
    </article>
  );
}

export default function BusinessesForSalePage() {
  const [items, setItems] = useState<BusinessListing[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 12, totalPages: 1 });
  const [filters, setFilters] = useState<Filters>({ page: 1, limit: 12, sortBy: "featured" });
  const [draft, setDraft] = useState({ search: "", industry: "", country: "", currency: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadBusinesses = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await MarketplaceService.getBusinesses(filters);
      const data = unwrapBusinesses(response);

      setItems(data);
      setMeta(
        response?.meta ||
          response?.data?.meta || {
            total: data.length,
            page: Number(filters.page || 1),
            limit: Number(filters.limit || 12),
            totalPages: Math.max(1, Math.ceil(data.length / Number(filters.limit || 12))),
          },
      );
    } catch (err: any) {
      setItems([]);
      setError(err?.message || "Businesses could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void loadBusinesses();
  }, [loadBusinesses]);

  const totalAsking = useMemo(
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
      <main className="bs-page">
        <section className="bs-hero">
          <div>
            <p>Business acquisition marketplace</p>
            <h1>Businesses for Sale</h1>
            <span>Explore active acquisition opportunities, profitable businesses, and strategic sale listings across major markets.</span>
          </div>
          <a href="/dashboard?tab=add-profile">Sell Your Business</a>
        </section>

        <section className="bs-stats">
          <article><Building2 size={18} /><span>{meta.total}</span><p>Businesses found</p></article>
          <article><TrendingUp size={18} /><span>{formatMoney(totalAsking, "USD")}</span><p>Visible asking value</p></article>
          <article><BadgeCheck size={18} /><span>{items.filter((item) => item.isVerified).length}</span><p>Verified listings</p></article>
        </section>

        <section className="bs-layout">
          <aside className="bs-filters">
            <div className="bs-filter-head">
              <Filter size={16} />
              <strong>Filter Businesses</strong>
            </div>

            <form onSubmit={submit}>
              <label>
                Search
                <div className="bs-input-icon">
                  <Search size={14} />
                  <input value={draft.search} onChange={(e) => setDraft({ ...draft, search: e.target.value })} placeholder="Business, sector, location" />
                </div>
              </label>

              <label>
                Industry
                <select value={draft.industry} onChange={(e) => setDraft({ ...draft, industry: e.target.value })}>
                  <option value="">All industries</option>
                  {INDUSTRIES.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>

              <label>
                Location
                <select value={draft.country} onChange={(e) => setDraft({ ...draft, country: e.target.value })}>
                  <option value="">All locations</option>
                  {COUNTRIES.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>

              <label>
                Currency
                <select value={draft.currency} onChange={(e) => setDraft({ ...draft, currency: e.target.value })}>
                  <option value="">Any currency</option>
                  <option value="USD">USD</option>
                  <option value="NGN">NGN</option>
                  <option value="GBP">GBP</option>
                  <option value="EUR">EUR</option>
                </select>
              </label>

              <button type="submit"><SlidersHorizontal size={14} />Apply Filters</button>
              <button type="button" className="bs-clear" onClick={clearFilters}>Clear</button>
            </form>
          </aside>

          <section className="bs-results">
            <div className="bs-results-head">
              <strong>{meta.total} results found.</strong>
              <select value={filters.sortBy || "featured"} onChange={(e) => setFilters({ ...filters, page: 1, sortBy: e.target.value })}>
                <option value="featured">Featured first</option>
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="askAmount">Highest ask</option>
              </select>
            </div>

            {error && <div className="bs-alert">{error}</div>}

            {loading ? (
              <div className="bs-loading"><Loader2 className="spin" size={20} />Loading businesses</div>
            ) : items.length ? (
              <div className="bs-grid">
                {items.map((item) => <BusinessCard key={item.id} item={item} />)}
              </div>
            ) : (
              <div className="bs-empty">No businesses match your filters.</div>
            )}

            <div className="bs-pagination">
              <button disabled={meta.page <= 1} onClick={() => setFilters({ ...filters, page: meta.page - 1 })}>Previous</button>
              <span>Page {meta.page} of {meta.totalPages}</span>
              <button disabled={meta.page >= meta.totalPages} onClick={() => setFilters({ ...filters, page: meta.page + 1 })}>Next</button>
            </div>
          </section>
        </section>
      </main>
    </>
  );
}

const styles = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
.bs-page{min-height:100vh;background:#f4f6f9;color:#0f1e36;font-family:'Poppins','Inter',system-ui,sans-serif;padding:128px 24px 64px}
.bs-hero{max-width:82rem;margin:0 auto 18px;background:#0a1628;color:#fff;padding:30px;display:flex;align-items:flex-start;justify-content:space-between;gap:18px;border-radius:4px}
.bs-hero p{font-size:11px;font-weight:900;text-transform:uppercase;color:#f5a623;margin-bottom:8px}
.bs-hero h1{font-size:34px;line-height:1.12;margin-bottom:10px}
.bs-hero span{display:block;max-width:760px;color:rgba(255,255,255,.68);font-size:14px;line-height:1.7}
.bs-hero a{height:40px;display:inline-flex;align-items:center;justify-content:center;background:#f5a623;color:#fff;text-decoration:none;font-size:13px;font-weight:900;padding:0 18px;border-radius:4px;white-space:nowrap}
.bs-stats{max-width:82rem;margin:0 auto 18px;display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.bs-stats article{background:#fff;border:1px solid #e2e6ed;padding:16px;display:flex;align-items:center;gap:12px;border-radius:4px}
.bs-stats svg{color:#1A56DB}.bs-stats span{display:block;font-size:20px;font-weight:900}.bs-stats p{font-size:12px;color:#8896a8;font-weight:800}
.bs-layout{max-width:82rem;margin:0 auto;display:grid;grid-template-columns:300px minmax(0,1fr);gap:22px}
.bs-filters,.bs-results-head,.bs-card,.bs-empty,.bs-loading,.bs-alert{background:#fff;border:1px solid #e2e6ed;border-radius:4px}
.bs-filters{height:max-content;padding:18px;position:sticky;top:128px}
.bs-filter-head{display:flex;align-items:center;gap:9px;margin-bottom:18px;color:#0f1e36}
.bs-filters form{display:flex;flex-direction:column;gap:13px}
.bs-filters label{display:flex;flex-direction:column;gap:6px;font-size:11px;font-weight:900;text-transform:uppercase;color:#4a5568}
.bs-filters input,.bs-filters select{width:100%;height:40px;border:1px solid #e2e6ed;background:#fff;color:#0f1e36;padding:0 11px;font:600 13px 'Poppins','Inter',system-ui,sans-serif;outline:none;border-radius:3px}
.bs-input-icon{position:relative}.bs-input-icon svg{position:absolute;left:10px;top:13px;color:#8896a8}.bs-input-icon input{padding-left:32px}
.bs-filters button,.bs-view-btn,.bs-pagination button{height:38px;border:0;background:#f5a623;color:#fff;font:900 12px 'Poppins','Inter',system-ui,sans-serif;cursor:pointer;border-radius:3px;display:inline-flex;align-items:center;justify-content:center;gap:7px;text-decoration:none}
.bs-filters .bs-clear{background:#fff;color:#4a5568;border:1px solid #e2e6ed}
.bs-results{min-width:0}
.bs-results-head{height:54px;display:flex;align-items:center;justify-content:space-between;padding:0 16px;margin-bottom:14px}
.bs-results-head strong{font-size:15px}.bs-results-head select{height:34px;border:1px solid #e2e6ed;background:#fff;padding:0 10px;border-radius:3px}
.bs-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}
.bs-card{overflow:hidden}
.bs-card-art{height:150px;background:#eef3f8;display:grid;place-items:center;color:#1A56DB;text-align:center}
.bs-card-art strong{font-size:26px;color:#0f1e36}.bs-card-art span{font-size:11px;font-weight:900;color:#4a5568}
.bs-card-body{padding:18px}
.bs-card-top{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:11px}
.bs-card-top span{display:inline-flex;align-items:center;gap:5px;color:#10B981;font-size:11px;font-weight:900}.bs-card-top b{background:#fff7ed;color:#c97d10;padding:4px 7px;font-size:10px;border-radius:3px}
.bs-card h2{font-size:20px;line-height:1.18;margin-bottom:10px;color:#0f1e36}.bs-card h2 a{color:inherit;text-decoration:none}
.bs-location{display:flex;align-items:flex-start;gap:6px;color:#6b7280;font-size:12px;line-height:1.45;margin-bottom:9px}.bs-location svg{color:#ff9d3b}
.bs-summary{font-size:12px;line-height:1.6;color:#4a5568;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.bs-ask{border-top:1px solid #edf0f5;border-bottom:1px solid #edf0f5;margin:16px 0 12px;padding:11px 0;display:flex;align-items:center;justify-content:space-between;gap:10px}
.bs-ask span,.bs-metrics span{font-size:11px;text-transform:uppercase;color:#6b7280;font-weight:800}
.bs-ask strong{font-size:20px;color:#ff9d3b;text-align:right}
.bs-metrics{display:grid;grid-template-columns:1fr 1fr;margin-bottom:14px}
.bs-metrics div{padding-right:12px}.bs-metrics div+div{border-left:1px solid #edf0f5;padding-left:12px}
.bs-metrics strong{display:block;margin-top:4px;color:#6b7280;font-size:15px}
.bs-view-btn{width:100%;background:#ff9d3b}
.bs-loading,.bs-empty,.bs-alert{padding:34px;text-align:center;color:#4a5568;font-weight:900}
.bs-alert{border-color:#fecaca;background:#fef2f2;color:#b91c1c;margin-bottom:14px}
.spin{animation:spin .7s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}
.bs-pagination{display:flex;align-items:center;justify-content:center;gap:12px;margin-top:22px}.bs-pagination button:disabled{opacity:.45;cursor:not-allowed}.bs-pagination span{font-size:12px;font-weight:900;color:#4a5568}
@media(max-width:1180px){.bs-grid{grid-template-columns:repeat(2,1fr)}.bs-layout{grid-template-columns:1fr}.bs-filters{position:static}}
@media(max-width:720px){.bs-page{padding:104px 14px 44px}.bs-hero{flex-direction:column;padding:22px}.bs-hero h1{font-size:28px}.bs-stats,.bs-grid{grid-template-columns:1fr}.bs-results-head{height:auto;align-items:flex-start;flex-direction:column;gap:10px;padding:14px}}
`;