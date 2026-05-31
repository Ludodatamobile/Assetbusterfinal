"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  BadgeCheck,
  Building2,
  CheckCircle2,
  Database,
  FileText,
  HandCoins,
  LockKeyhole,
  MapPin,
  MessageSquare,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { FundraiserService } from "@/services/fundraiser.service";
import { MarketplaceService } from "@/services/marketplace.service";
import type { FundraiserListing } from "@/types/fundraiser";

const hasValue = (value: unknown) => {
  if (value === undefined || value === null || value === "") return false;
  const numeric = Number(value);
  if (Number.isFinite(numeric)) return numeric !== 0;
  return String(value).trim().length > 0;
};

const formatMoney = (value: unknown, currency = "USD") => {
  const amount = Number(value ?? 0);
  if (!amount) return "Not disclosed";

  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
};

const formatEnum = (value?: string | null) => {
  if (!value) return "Not available";
  return value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
};

function DetailRow({ label, value }: { label: string; value?: string | number | boolean | null }) {
  if (value === undefined || value === null || value === "") return null;

  return (
    <div className="fd-row">
      <span>{label}</span>
      <strong>{typeof value === "boolean" ? (value ? "Yes" : "No") : value}</strong>
    </div>
  );
}

function Section({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section className="fd-panel">
      <div className="fd-panel-head">
        <p>{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  );
}

export default function FundRaiserDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { accessToken, isAuthenticated } = useAuth();

  const [listing, setListing] = useState<FundraiserListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [message, setMessage] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const slug = params?.slug;

  const load = useCallback(async () => {
    if (!slug) return;

    setLoading(true);
    setLoadError("");

    try {
      const response = await FundraiserService.getFundraiserBySlug(slug);
      setListing(response.data.listing || response.data);
    } catch (err: any) {
      setLoadError(err?.message || "Fund raiser listing could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    void load();
  }, [load]);

  const location = useMemo(() => {
    if (!listing) return "";
    return [listing.city, listing.country].filter(Boolean).join(", ") || listing.country;
  }, [listing]);

  const openEnquiry = () => {
    if (!listing) return;

    if (!isAuthenticated) {
      router.push(`/login?redirect=/fund-raisers/${slug}`);
      return;
    }

    setMessage(`Hello, I am interested in ${listing.title} and would like to learn more about the funding opportunity.`);
    setError("");
    setModalOpen(true);
  };

  const sendEnquiry = async () => {
    if (!listing || !accessToken) return;

    if (message.trim().length < 20) {
      setError("Please write at least 20 characters.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await MarketplaceService.enquire(accessToken, listing.id, message);
      setModalOpen(false);
      router.push("/dashboard?tab=enquiries");
    } catch (err: any) {
      setError(err?.message || "Could not send enquiry.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <main className="fd-loading">Loading fund raiser profile...</main>
      </>
    );
  }

  if (!listing || loadError) {
    return (
      <>
        <style>{styles}</style>
        <main className="fd-loading">{loadError || "Fund raiser listing not found."}</main>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>

      <main className="fd-page">
        <section className="fd-hero">
          <div className="fd-hero-inner">
            <nav className="fd-breadcrumb">
              <a href="/">Home</a>
              <span>/</span>
              <a href="/fund-raisers">Fund Raisers</a>
              <span>/</span>
              <span>{listing.title}</span>
            </nav>

            <div className="fd-hero-grid">
              <div>
                <div className="fd-tag-row">
                  <span>{listing.industry}</span>
                  <span>{formatEnum(listing.dealType)}</span>
                  {listing.isVerified && <span><BadgeCheck size={12} />Verified</span>}
                  {listing.isFeatured && <span>Featured</span>}
                </div>

                <h1>{listing.headline || listing.title}</h1>
                {listing.headline && <h2>{listing.title}</h2>}

                <p>{listing.shortSummary || listing.teaserSummary || listing.description}</p>

                <div className="fd-location">
                  <MapPin size={15} />
                  <span>{location}</span>
                </div>
              </div>

              <aside className="fd-ask-card">
                <span>Capital Required</span>
                <strong>{formatMoney(listing.askAmount, listing.currency)}</strong>
                <p>
                  {listing.askPercent ? `${listing.askPercent}% equity offered` : ""}
                  {listing.askRate ? `${listing.askRate}% interest rate` : ""}
                  {!listing.askPercent && !listing.askRate ? formatEnum(listing.dealType) : ""}
                </p>
                <button type="button" onClick={openEnquiry}>
                  <MessageSquare size={15} />
                  Contact Fund Raiser
                </button>
              </aside>
            </div>
          </div>
        </section>

        <section className="fd-main">
          <div className="fd-left">
            <div className="fd-kpi-grid">
              <div><HandCoins size={17} /><span>Capital Required</span><strong>{formatMoney(listing.askAmount, listing.currency)}</strong></div>
              <div><TrendingUp size={17} /><span>Revenue</span><strong>{formatMoney(listing.runSales, listing.currency)}</strong></div>
              <div><Building2 size={17} /><span>EBITDA</span><strong>{formatMoney(listing.ebitda, listing.currency)}</strong></div>
              <div><Users size={17} /><span>Views</span><strong>{listing.viewCount || 0}</strong></div>
            </div>

            <Section eyebrow="Overview" title="Fund Raiser Summary">
              <div className="fd-rich-text">
                <p>{listing.description}</p>
              </div>

              <div className="fd-detail-grid">
                <DetailRow label="Business Name" value={(listing as any).businessName} />
                <DetailRow label="Industry" value={listing.industry} />
                <DetailRow label="Country" value={listing.country} />
                <DetailRow label="City" value={listing.city} />
                <DetailRow label="Website" value={(listing as any).website} />
                <DetailRow label="Deal Type" value={formatEnum(listing.dealType)} />
              </div>
            </Section>

            <Section eyebrow="Raise Details" title="Investment Information">
              <div className="fd-copy-grid">
                <DetailRow label="Funding Stage" value={(listing as any).fundingStage} />
                <DetailRow label="Use Of Funds" value={(listing as any).useOfFunds} />
                <DetailRow label="Traction" value={(listing as any).traction} />
                <DetailRow label="Runway" value={(listing as any).runway} />
                <DetailRow label="Minimum Investment" value={hasValue((listing as any).minInvestment) ? formatMoney((listing as any).minInvestment, listing.currency) : null} />
                <DetailRow label="Target Investor" value={(listing as any).targetInvestor} />
                <DetailRow label="Previous Funding" value={hasValue((listing as any).previousFunding) ? formatMoney((listing as any).previousFunding, listing.currency) : null} />
                <DetailRow label="Revenue Model" value={(listing as any).revenueModel} />
                <DetailRow label="Key Metrics" value={(listing as any).keyMetrics} />
                <DetailRow label="Investor Highlights" value={(listing as any).investorHighlights} />
                <DetailRow label="Exit Strategy" value={(listing as any).exitStrategy} />
                <DetailRow label="Pitch Deck Ready" value={(listing as any).pitchDeckReady} />
              </div>
            </Section>

            <Section eyebrow="Financials" title="Financial Snapshot">
              <div className="fd-detail-grid">
                <DetailRow label="Annual Revenue" value={hasValue(listing.runSales) ? formatMoney(listing.runSales, listing.currency) : null} />
                <DetailRow label="EBITDA" value={hasValue(listing.ebitda) ? formatMoney(listing.ebitda, listing.currency) : null} />
                <DetailRow label="EBITDA Margin" value={(listing as any).ebitdaMargin ? `${(listing as any).ebitdaMargin}%` : null} />
                <DetailRow label="Net Profit" value={hasValue((listing as any).netProfit) ? formatMoney((listing as any).netProfit, listing.currency) : null} />
                <DetailRow label="Monthly Revenue" value={hasValue((listing as any).monthlyRevenue) ? formatMoney((listing as any).monthlyRevenue, listing.currency) : null} />
                <DetailRow label="Monthly Profit" value={hasValue((listing as any).monthlyProfit) ? formatMoney((listing as any).monthlyProfit, listing.currency) : null} />
              </div>
            </Section>
          </div>

          <aside className="fd-right">
            <section className="fd-side-card">
              <div className="fd-owner">
                <div>{listing.user?.firstName?.[0] || "F"}{listing.user?.lastName?.[0] || "R"}</div>
                <strong>{listing.user ? `${listing.user.firstName} ${listing.user.lastName}` : "Fund Raiser"}</strong>
                <span>{listing.user?.country || listing.country}</span>
              </div>
              <button type="button" onClick={openEnquiry}>
                <MessageSquare size={15} />
                Send Enquiry
              </button>
            </section>

            <section className="fd-side-card">
              <h3>Trust And Diligence</h3>
              <div className="fd-trust-list">
                <span><LockKeyhole size={14} />{(listing as any).isConfidential !== false ? "Confidential profile" : "Public profile"}</span>
                <span><ShieldCheck size={14} />{(listing as any).ndaRequired !== false ? "NDA expected" : "NDA not required"}</span>
                <span><FileText size={14} />{(listing as any).financialsAvailable ? "Financials available" : "Financials not marked available"}</span>
                <span><Database size={14} />{(listing as any).dataRoomReady ? "Data room ready" : "Data room pending"}</span>
                <span><CheckCircle2 size={14} />{listing.isVerified ? "Verified profile" : "Verification pending"}</span>
              </div>
            </section>
          </aside>
        </section>

        {modalOpen && (
          <div className="fd-modal-backdrop" role="presentation" onClick={() => setModalOpen(false)}>
            <form
              className="fd-modal"
              onClick={(event) => event.stopPropagation()}
              onSubmit={(event: FormEvent<HTMLFormElement>) => {
                event.preventDefault();
                void sendEnquiry();
              }}
            >
              <div className="fd-modal-head">
                <div>
                  <p>Secure enquiry</p>
                  <h3>{listing.title}</h3>
                </div>
                <button type="button" onClick={() => setModalOpen(false)} aria-label="Close enquiry modal">x</button>
              </div>

              {error && <div className="fd-error">{error}</div>}

              <textarea
                rows={6}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Introduce yourself and explain your interest. Minimum 20 characters."
              />

              <div className="fd-modal-actions">
                <button type="button" className="fd-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="fd-primary" disabled={saving}>
                  {saving ? "Sending..." : "Send Enquiry"}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </>
  );
}

const styles = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--mw:82rem;--navy:#0f1e36;--t2:#4a5568;--t3:#8896a8;--bdr:#e2e6ed;--surf:#f4f6f9;--blue:#1A56DB;--amber:#F5A623;--font:'Poppins','Inter',system-ui,sans-serif}
body{font-family:var(--font);background:var(--surf);color:var(--navy)}
.fd-loading{min-height:70vh;display:grid;place-items:center;padding-top:100px;color:var(--t2);font-size:13px;font-weight:900}
.fd-page{min-height:100vh;padding-top:102px;background:var(--surf)}
.fd-hero{background:#0a1628;color:#fff;padding:30px 0}
.fd-hero-inner{max-width:var(--mw);margin:0 auto;padding:0 28px}
.fd-breadcrumb{display:flex;gap:7px;align-items:center;flex-wrap:wrap;font-size:11px;color:rgba(255,255,255,.38);margin-bottom:16px}
.fd-breadcrumb a{color:rgba(255,255,255,.68);text-decoration:none}
.fd-hero-grid{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:26px;align-items:start}
.fd-tag-row{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:12px}
.fd-tag-row span{display:inline-flex;align-items:center;gap:4px;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.08);color:rgba(255,255,255,.78);font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.55px;padding:4px 8px}
.fd-hero h1{font-size:clamp(28px,4vw,46px);line-height:1.08;font-weight:900;max-width:850px}
.fd-hero h2{font-size:14px;color:rgba(255,255,255,.48);margin-top:8px;font-weight:800}
.fd-hero p{font-size:14px;line-height:1.75;color:rgba(255,255,255,.62);max-width:780px;margin-top:14px}
.fd-location{display:flex;align-items:center;gap:7px;margin-top:14px;color:rgba(255,255,255,.72);font-size:12.5px;font-weight:800}
.fd-ask-card{background:#fff;color:var(--navy);padding:18px}
.fd-ask-card>span{display:block;font-size:10px;font-weight:900;text-transform:uppercase;color:var(--t3);letter-spacing:.7px}
.fd-ask-card strong{display:block;font-size:25px;font-weight:900;margin-top:7px}
.fd-ask-card p{color:var(--t2);font-size:12px;margin:6px 0 14px;line-height:1.45}
.fd-ask-card button,.fd-side-card button,.fd-primary{height:38px;display:inline-flex;align-items:center;justify-content:center;gap:7px;background:var(--blue);border:1px solid var(--blue);color:#fff;font-family:var(--font);font-size:12px;font-weight:900;cursor:pointer;padding:0 14px;width:100%}
.fd-main{max-width:var(--mw);margin:0 auto;padding:24px 28px 70px;display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:24px;align-items:start}
.fd-left{display:flex;flex-direction:column;gap:18px}
.fd-right{display:flex;flex-direction:column;gap:16px;position:sticky;top:120px}
.fd-kpi-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
.fd-kpi-grid div,.fd-panel,.fd-side-card{background:#fff;border:1px solid var(--bdr);padding:18px}
.fd-kpi-grid svg{color:var(--blue);margin-bottom:10px}
.fd-kpi-grid span{display:block;font-size:10px;color:var(--t3);font-weight:900;text-transform:uppercase;letter-spacing:.55px}
.fd-kpi-grid strong{display:block;font-size:15px;color:var(--navy);font-weight:900;margin-top:4px}
.fd-panel-head{border-bottom:1px solid var(--bdr);padding-bottom:12px;margin-bottom:14px}
.fd-panel-head p{font-size:10px;color:var(--blue);font-weight:900;text-transform:uppercase;letter-spacing:.75px;margin-bottom:4px}
.fd-panel-head h2{font-size:18px;color:var(--navy);font-weight:900}
.fd-rich-text p{font-size:13px;line-height:1.8;color:var(--t2);white-space:pre-line}
.fd-detail-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.fd-copy-grid{display:flex;flex-direction:column;gap:10px}
.fd-row{background:var(--surf);border:1px solid var(--bdr);padding:11px 12px}
.fd-row span{display:block;font-size:10px;color:var(--t3);font-weight:900;text-transform:uppercase;letter-spacing:.55px;margin-bottom:4px}
.fd-row strong{display:block;font-size:12.5px;color:var(--navy);font-weight:800;line-height:1.6;white-space:pre-line}
.fd-owner{text-align:center;border-bottom:1px solid var(--bdr);padding-bottom:14px;margin-bottom:14px}
.fd-owner div{width:54px;height:54px;border-radius:50%;background:linear-gradient(135deg,var(--blue),var(--amber));color:#fff;display:grid;place-items:center;font-weight:900;margin:0 auto 9px}
.fd-owner strong{display:block;font-size:14px;font-weight:900}
.fd-owner span{display:block;font-size:11px;color:var(--t3);font-weight:800;margin-top:3px}
.fd-side-card h3{font-size:15px;font-weight:900;margin-bottom:12px}
.fd-trust-list{display:flex;flex-direction:column;gap:9px}
.fd-trust-list span{display:flex;align-items:flex-start;gap:8px;background:var(--surf);border:1px solid var(--bdr);padding:9px 10px;font-size:11.5px;color:var(--t2);font-weight:800;line-height:1.45}
.fd-modal-backdrop{position:fixed;inset:0;background:rgba(10,22,40,.58);display:grid;place-items:center;z-index:100;padding:18px}
.fd-modal{width:min(560px,100%);background:#fff;border:1px solid var(--bdr);padding:18px;display:flex;flex-direction:column;gap:12px}
.fd-modal-head{display:flex;justify-content:space-between;gap:12px}
.fd-modal-head p{font-size:10px;color:var(--blue);font-weight:900;text-transform:uppercase}
.fd-modal-head h3{font-size:16px}
.fd-modal-head button{border:0;background:var(--surf);width:30px;height:30px;cursor:pointer}
.fd-modal textarea{width:100%;border:1px solid var(--bdr);padding:12px;font-family:var(--font);font-size:13px}
.fd-error{background:#fef2f2;color:#b91c1c;border:1px solid #fecaca;padding:9px 10px;font-size:12px;font-weight:800}
.fd-modal-actions{display:flex;justify-content:flex-end;gap:9px}
.fd-secondary{border:1px solid var(--bdr);background:#fff;color:var(--t2);padding:9px 14px;font-family:var(--font);font-weight:800;cursor:pointer}
.fd-primary{width:auto}
@media(max-width:1040px){.fd-hero-grid,.fd-main{grid-template-columns:1fr}.fd-right{position:static}.fd-kpi-grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:640px){.fd-page{padding-top:78px}.fd-hero-inner,.fd-main{padding-left:16px;padding-right:16px}.fd-detail-grid,.fd-kpi-grid{grid-template-columns:1fr}}
`;