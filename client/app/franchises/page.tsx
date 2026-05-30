"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { MarketplaceService } from "@/services/marketplace.service";
import type { BusinessListing, DealType } from "@/types/marketplace";

type Filters = { industry: string; country: string; structure: string; verified: boolean; premium: boolean; search: string };

const INDUSTRIES = ["All","Food & Beverage","Education","Healthcare","Lifestyle Services","Real Estate","Automotive","Technology","Health & Fitness","Logistics","Energy"];
const COUNTRIES = ["All","Nigeria","Kenya","Ghana","South Africa","UAE","India","Uganda","Senegal","Tanzania"];
const STRUCTURES = ["All","Investment","Full Sale","Partial Stake"];

const apiDealType = (value: string): DealType | undefined => ({
  Investment: "INVESTMENT",
  "Full Sale": "FULL_SALE",
  "Partial Stake": "PARTIAL_STAKE",
}[value] as DealType | undefined);

const labelDealType = (value?: string) =>
  value ? value.split("_").map((word) => word.charAt(0) + word.slice(1).toLowerCase()).join(" ") : "Franchise";

const toNumber = (value: unknown) => Number(value ?? 0);

const formatMoney = (value: unknown, currency = "USD") => {
  const amount = toNumber(value);
  if (!amount) return "Not disclosed";
  const abs = Math.abs(amount);
  const suffix = abs >= 1_000_000_000 ? "B" : abs >= 1_000_000 ? "M" : abs >= 1_000 ? "K" : "";
  const divisor = suffix === "B" ? 1_000_000_000 : suffix === "M" ? 1_000_000 : suffix === "K" ? 1_000 : 1;
  const compact = amount / divisor;
  return `${currency} ${Number.isInteger(compact) ? compact.toFixed(0) : compact.toFixed(1)}${suffix}`;
};

function FilterSidebar({ filters, onChange }: { filters: Filters; onChange: (f: Filters) => void }) {
  return (
    <aside className="fp-sidebar">
      <div className="fp-filter-header">
        <h3 className="fp-filter-title">Filters</h3>
        <button className="fp-filter-reset" onClick={() => onChange({ industry:"All", country:"All", structure:"All", verified:false, premium:false, search:"" })}>Reset</button>
      </div>

      <div className="fp-filter-group">
        <p className="fp-filter-label">Search</p>
        <input className="fp-search" value={filters.search} onChange={(e) => onChange({ ...filters, search: e.target.value })} placeholder="Search franchises..." />
      </div>

      {[
        ["Industry", "industry", INDUSTRIES],
        ["Country", "country", COUNTRIES],
        ["Deal Structure", "structure", STRUCTURES],
      ].map(([label, key, values]) => (
        <div className="fp-filter-group" key={String(key)}>
          <p className="fp-filter-label">{label as string}</p>
          <div className="fp-filter-list">
            {(values as string[]).map((value) => (
              <button key={value} className={`fp-filter-pill ${filters[key as keyof Filters] === value ? "active" : ""}`} onClick={() => onChange({ ...filters, [key as string]: value })}>
                {value}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="fp-filter-group">
        <p className="fp-filter-label">Quick Filters</p>
        <label className="fp-checkbox"><input type="checkbox" checked={filters.verified} onChange={(e) => onChange({ ...filters, verified:e.target.checked })}/><span>Verified Only</span></label>
        <label className="fp-checkbox"><input type="checkbox" checked={filters.premium} onChange={(e) => onChange({ ...filters, premium:e.target.checked })}/><span>Premium Listings</span></label>
      </div>
    </aside>
  );
}

function StatsBanner({ total }: { total: number }) {
  return (
    <div className="fp-stats-banner">
      {[
        { value: `${total}+`, label: "Active Franchises" },
        { value: "45+", label: "Countries Covered" },
        { value: "900+", label: "Industries Listed" },
        { value: "₦0", label: "Free to Browse" },
      ].map((s) => (
        <div key={s.label} className="fp-stats-banner-item">
          <span className="fp-stats-banner-val">{s.value}</span>
          <span className="fp-stats-banner-label">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

function FranchiseCard({ item, onEnquire }: { item: BusinessListing; onEnquire: (item: BusinessListing) => void }) {
  const color = item.isPremium ? "#D42B2B" : item.isFeatured ? "#F5A623" : "#1A56DB";
  const location = [item.city, item.country].filter(Boolean).join(", ") || item.country;

  return (
    <article className="fp-card">
      {item.isPremium && <div className="fp-premium-tag"><span>PREMIUM</span></div>}
      <div className="fp-card-meta-row">
        <span className="fp-industry-tag" style={{ color, background: color + "14", borderColor: color + "28" }}>{item.industry}</span>
        {item.isVerified && <span className="fp-verified-badge">Verified</span>}
        {item.isFeatured && <span className="fp-featured-badge">Featured</span>}
      </div>

      <h3 className="fp-card-title"><a href={`/franchises/${item.slug}`}>{item.title}</a></h3>
      <p className="fp-card-desc">{item.description}</p>

      <div className="fp-card-info-row">
        <span>{Number(item.rating || 0).toFixed(1)} rating</span>
        <span>{location}</span>
        {item.outlets ? <span>{item.outlets} outlets</span> : null}
      </div>

      <div className="fp-stats-grid">
        <div><span>Investment</span><strong>{formatMoney(item.askAmount, item.currency)}</strong></div>
        <div><span>Structure</span><strong>{labelDealType(item.dealType)}</strong></div>
        <div><span>Established</span><strong>{item.established || "Not disclosed"}</strong></div>
        <div><span>Enquiries</span><strong>{item.enquiryCount ?? item._count?.deals ?? 0}</strong></div>
      </div>

      <div className="fp-card-footer">
        <div>
          <span className="fp-ask-type">Franchise Opportunity</span>
          <div className="fp-ask-amount"><span className="fp-amount">{formatMoney(item.askAmount, item.currency)}</span></div>
        </div>
        <button className="fp-contact-btn" style={{ background: color }} onClick={() => onEnquire(item)}>Enquire</button>
      </div>
    </article>
  );
}

function EnquiryModal({ listing, message, saving, error, onMessage, onClose, onSubmit }: {
  listing: BusinessListing | null;
  message: string;
  saving: boolean;
  error: string;
  onMessage: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  if (!listing) return null;

  return (
    <div className="fp-modal-backdrop" onClick={onClose}>
      <form className="fp-modal" onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
        <div className="fp-modal-head">
          <div><p>Franchise enquiry</p><h3>{listing.title}</h3></div>
          <button type="button" onClick={onClose}>x</button>
        </div>
        {error && <div className="fp-error">{error}</div>}
        <textarea value={message} onChange={(e) => onMessage(e.target.value)} rows={5} placeholder="Introduce yourself and explain your franchise interest." />
        <div className="fp-modal-actions">
          <button type="button" className="fp-secondary" onClick={onClose}>Cancel</button>
          <button className="fp-primary" disabled={saving}>{saving ? "Sending..." : "Send Enquiry"}</button>
        </div>
      </form>
    </div>
  );
}

export default function FranchisesPage() {
  const router = useRouter();
  const { accessToken, isAuthenticated } = useAuth();
  const [filters, setFilters] = useState<Filters>({ industry:"All", country:"All", structure:"All", verified:false, premium:false, search:"" });
  const [sortBy, setSortBy] = useState("featured");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<BusinessListing[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<BusinessListing | null>(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const query = useMemo(() => ({
    page,
    limit: 12,
    sortBy,
    search: filters.search || undefined,
    industry: filters.industry !== "All" ? filters.industry : undefined,
    country: filters.country !== "All" ? filters.country : undefined,
    dealType: filters.structure !== "All" ? apiDealType(filters.structure) : undefined,
    verified: filters.verified || undefined,
    premium: filters.premium || undefined,
  }), [filters, page, sortBy]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await MarketplaceService.getFranchises(query);
      setItems(response.data);
      setTotal(response.meta?.total ?? response.data.length);
      setTotalPages(response.meta?.totalPages ?? 1);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => { setPage(1); }, [filters, sortBy]);

  const openEnquiry = (listing: BusinessListing) => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/franchises");
      return;
    }
    setSelected(listing);
    setMessage(`Hello, I am interested in this franchise opportunity and would like to learn more about the investment, support, and onboarding process.`);
    setError("");
  };

  const sendEnquiry = async () => {
    if (!selected || !accessToken) return;
    if (message.trim().length < 20) {
      setError("Please write at least 20 characters.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await MarketplaceService.enquire(accessToken, selected.id, message);
      setSelected(null);
      router.push("/dashboard?tab=enquiries");
    } catch (err: any) {
      setError(err?.message || "Could not send enquiry.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="fp-page">
        <section className="fp-hero">
          <div className="fp-hero-inner">
            <nav className="fp-hero-breadcrumb"><a href="/">Home</a><span>/</span><span>Franchises</span></nav>
            <div className="fp-hero-eyebrow"><span /> New Listings Added Weekly</div>
            <h1>Franchise Opportunities<br/><b>Across Africa & Beyond</b></h1>
            <p>Browse live, admin-approved franchise and brand expansion opportunities. Send enquiries directly into your secure deal workspace.</p>
            <div className="fp-hero-cta-row">
              <a href="/register" className="fp-cta-primary">List Your Franchise</a>
              <a href="/how-to/buy-a-franchise" className="fp-cta-outline">How It Works</a>
            </div>
          </div>
          <StatsBanner total={total} />
        </section>

        <main className="fp-main">
          <FilterSidebar filters={filters} onChange={setFilters}/>
          <div className="fp-content">
            <div className="fp-info-strip"><p><strong>Pro tip:</strong> Verified franchise profiles have passed admin review before marketplace visibility.</p></div>
            <div className="fp-toolbar">
              <span><strong>{total}</strong> {total === 1 ? "franchise" : "franchises"} found</span>
              <div><span>Sort by </span><select value={sortBy} onChange={(e) => setSortBy(e.target.value)}><option value="featured">Featured</option><option value="rating">Highest Rated</option><option value="newest">Newest</option><option value="askAmount">Investment Amount</option></select></div>
            </div>

            <div className="fp-grid">
              {loading ? <div className="fp-empty">Loading franchises...</div> : items.length ? items.map((item) => <FranchiseCard key={item.id} item={item} onEnquire={openEnquiry}/>) : <div className="fp-empty">No franchises match your filters.</div>}
            </div>

            <div className="fp-how">
              <h3>How to Get Started</h3>
              <div className="fp-how-steps">
                {["Browse approved opportunities","Review investment details","Send secure enquiry","Continue in deal room"].map((title, index) => (
                  <div key={title}><b>{index + 1}</b><strong>{title}</strong><p>Your enquiry, messages, NDA and deal activity stay tied to the backend pipeline.</p></div>
                ))}
              </div>
            </div>

            <div className="fp-pagination">
              <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</button>
              <span>Page {page} of {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</button>
            </div>
          </div>
        </main>

        <EnquiryModal listing={selected} message={message} saving={saving} error={error} onMessage={setMessage} onClose={() => setSelected(null)} onSubmit={sendEnquiry}/>
      </div>
    </>
  );
}

const styles = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}:root{--mw:82rem;--navy:#0a1628;--red:#D42B2B;--blue:#1A56DB;--green:#059669;--t2:#4a5568;--t3:#8896a8;--bdr:#e2e6ed;--surf:#f4f6f9;--bg:#fff;--font:'Poppins','Inter',system-ui,sans-serif}body{font-family:var(--font);background:var(--surf);color:var(--navy)}.fp-page{min-height:100vh;padding-top:102px;background:var(--surf)}.fp-hero{background:var(--navy);padding:36px 0 0;color:#fff}.fp-hero-inner{max-width:var(--mw);margin:0 auto;padding:0 28px}.fp-hero-breadcrumb{display:flex;gap:6px;margin-bottom:14px;font-size:11px;color:rgba(255,255,255,.45)}.fp-hero-breadcrumb a{color:rgba(255,255,255,.7);text-decoration:none}.fp-hero-eyebrow{display:inline-flex;gap:7px;background:rgba(212,43,43,.18);border:1px solid rgba(212,43,43,.3);color:#ff7070;font-size:10px;font-weight:800;letter-spacing:1px;text-transform:uppercase;padding:4px 10px;margin-bottom:12px}.fp-hero-eyebrow span{width:6px;height:6px;border-radius:50%;background:var(--red);margin-top:4px}.fp-hero h1{font-size:clamp(24px,3.2vw,40px);font-weight:900;line-height:1.1;margin-bottom:10px}.fp-hero h1 b{color:#ff7070}.fp-hero p{font-size:13.5px;color:rgba(255,255,255,.58);line-height:1.75;max-width:620px;margin-bottom:20px}.fp-hero-cta-row{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:28px}.fp-cta-primary,.fp-cta-outline{display:inline-flex;text-decoration:none;font-size:12.5px;font-weight:900;padding:9px 18px}.fp-cta-primary{background:var(--red);color:#fff}.fp-cta-outline{background:rgba(255,255,255,.07);color:#fff;border:1px solid rgba(255,255,255,.18)}.fp-stats-banner{display:flex;border-top:1px solid rgba(255,255,255,.08)}.fp-stats-banner-item{flex:1;text-align:center;padding:14px 10px;border-right:1px solid rgba(255,255,255,.07)}.fp-stats-banner-val{display:block;font-size:18px;font-weight:900}.fp-stats-banner-label{font-size:10px;color:rgba(255,255,255,.42);font-weight:800;text-transform:uppercase}
.fp-main{max-width:var(--mw);margin:0 auto;padding:24px 28px 64px;display:grid;grid-template-columns:260px 1fr;gap:28px}.fp-sidebar{position:sticky;top:120px;background:#fff;border:1px solid var(--bdr)}.fp-filter-header{display:flex;justify-content:space-between;padding:14px 16px;border-bottom:1px solid var(--bdr)}.fp-filter-title{font-size:13px;font-weight:800}.fp-filter-reset{border:0;background:none;color:var(--red);font-size:11px;font-weight:800;cursor:pointer}.fp-filter-group{padding:14px 16px;border-bottom:1px solid var(--bdr)}.fp-filter-label{font-size:10px;font-weight:900;color:var(--t3);text-transform:uppercase;letter-spacing:.9px;margin-bottom:8px}.fp-filter-list{display:flex;flex-direction:column;gap:4px}.fp-filter-pill{background:var(--surf);border:1px solid var(--bdr);color:var(--t2);font-size:12px;font-weight:700;padding:6px 10px;text-align:left;cursor:pointer}.fp-filter-pill.active{background:var(--red);color:#fff;border-color:var(--red)}.fp-checkbox{display:flex;gap:8px;margin-bottom:6px;font-size:12px;color:var(--t2);font-weight:700}.fp-search{width:100%;border:1px solid var(--bdr);background:var(--surf);padding:8px 10px;font-family:var(--font);font-size:12px}
.fp-content{display:flex;flex-direction:column;gap:18px}.fp-info-strip{border:1px solid rgba(212,43,43,.15);border-left:3px solid var(--red);background:#fff;padding:10px 14px;font-size:11.5px;color:var(--t2)}.fp-toolbar{display:flex;justify-content:space-between;background:#fff;border:1px solid var(--bdr);padding:12px 16px;font-size:12.5px;color:var(--t2)}.fp-toolbar select{background:var(--surf);border:1px solid var(--bdr);padding:5px 10px}.fp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px}.fp-card{background:#fff;border:1px solid var(--bdr);padding:16px;display:flex;flex-direction:column;gap:10px;position:relative;overflow:hidden}.fp-card:hover{box-shadow:0 8px 28px rgba(0,0,0,.1);transform:translateY(-2px)}.fp-premium-tag{position:absolute;top:10px;right:-26px;background:var(--red);color:#fff;font-size:8px;font-weight:900;padding:3px 32px;transform:rotate(45deg)}.fp-card-meta-row{display:flex;gap:6px;flex-wrap:wrap}.fp-industry-tag,.fp-verified-badge,.fp-featured-badge{font-size:9px;font-weight:900;text-transform:uppercase;border:1px solid;padding:3px 7px}.fp-verified-badge{color:#059669;background:#ecfdf5;border-color:#a7f3d0}.fp-featured-badge{color:#F5A623;background:#fffbeb;border-color:#fde68a}.fp-card-title{font-size:14px;font-weight:900;line-height:1.35}.fp-card-title a{color:var(--blue);text-decoration:none}.fp-card-desc{font-size:12px;color:var(--t2);line-height:1.6;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}.fp-card-info-row{display:flex;gap:10px;flex-wrap:wrap;font-size:11px;color:var(--t3);font-weight:700}.fp-stats-grid{background:var(--surf);border:1px solid var(--bdr);padding:10px 12px;display:grid;grid-template-columns:1fr 1fr;gap:8px}.fp-stats-grid span{display:block;font-size:9px;color:var(--t3);font-weight:900;text-transform:uppercase}.fp-stats-grid strong{font-size:12px;color:var(--navy)}.fp-card-footer{display:flex;justify-content:space-between;align-items:flex-end;gap:10px;margin-top:auto}.fp-ask-type{font-size:9px;color:var(--t3);font-weight:900;text-transform:uppercase}.fp-amount{font-size:14px;font-weight:900}.fp-contact-btn{border:0;color:#fff;font-size:11.5px;font-weight:900;padding:8px 14px;cursor:pointer}
.fp-how{background:#fff;border:1px solid var(--bdr);padding:22px}.fp-how h3{font-size:13px;margin-bottom:16px}.fp-how-steps{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}.fp-how-steps div{text-align:center}.fp-how-steps b{width:32px;height:32px;border-radius:50%;background:var(--navy);color:#fff;display:grid;place-items:center;margin:0 auto 8px}.fp-how-steps strong{display:block;font-size:12px}.fp-how-steps p{font-size:11px;color:var(--t3);line-height:1.5;margin-top:5px}.fp-empty{grid-column:1/-1;text-align:center;background:#fff;border:1px dashed var(--bdr);padding:48px;color:var(--t3);font-weight:800}.fp-pagination{display:flex;justify-content:center;gap:10px;align-items:center;padding:24px 0}.fp-pagination button{background:#fff;border:1px solid var(--bdr);padding:8px 14px;font-weight:800;cursor:pointer}.fp-pagination button:disabled{opacity:.45}.fp-modal-backdrop{position:fixed;inset:0;background:rgba(10,22,40,.58);z-index:100;display:grid;place-items:center;padding:18px}.fp-modal{width:min(560px,100%);background:#fff;border:1px solid var(--bdr);padding:18px;display:flex;flex-direction:column;gap:12px}.fp-modal-head{display:flex;justify-content:space-between}.fp-modal-head p{font-size:10px;color:var(--red);font-weight:900;text-transform:uppercase}.fp-modal-head h3{font-size:16px}.fp-modal-head button{border:0;background:var(--surf);width:30px;height:30px}.fp-modal textarea{border:async var(--bdr);padding:12px;font-family:var(--font)}.fp-error{background:#fef2f2;color:#b91c1c;border:async #fecaca;padding:9px;font-size:12px;font-weight:800}.fp-modal-actions{display:flex;justify-content:flex-end;gap:9px}.fp-primary,.fp-secondary{border:async var(--bdr);padding:9px 14px;font-weight:900}.fp-primary{background:async var(--red);color:#fff;border-color:async var(--red)}.fp-secondary{background:async #fff;color:async var(--t2)}
@media(max-width:1024px){.fp-main{grid-template-columns:async fr}.fp-sidebar{position:async}.fp-how-steps{grid-template-columns:async repeat(2,1fr)}}@media(max-width:async 640px){.fp-main,.fp-hero-inner{padding-left:async 16px;padding-right:async 16px}.fp-grid{grid-template-columns:async 1fr}.fp-toolbar{flex-direction:async column;gap:async 10px}.fp-stats-banner{flex-wrap:async wrap}.fp-stats-banner-item{min-width:async 50%}.fp-how-steps{grid-template-columns:async 1fr}}
`;