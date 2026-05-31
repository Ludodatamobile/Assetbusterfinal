"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Database,
  FileText,
  LockKeyhole,
  MapPin,
  MessageSquare,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { MarketplaceService } from "@/services/marketplace.service";
import type { BusinessListing } from "@/types/marketplace";

const toNumber = (value: unknown) => Number(value ?? 0);

const hasValue = (value: unknown) => {
  if (value === undefined || value === null || value === "") return false;
  const numeric = Number(value);
  if (Number.isFinite(numeric)) return numeric !== 0;
  return String(value).trim().length > 0;
};

const formatMoney = (value: unknown, currency = "USD") => {
  const amount = toNumber(value);
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

const unwrapBusiness = (response: any): BusinessListing | null => {
  return (
    response?.data?.listing ||
    response?.data?.business ||
    response?.data ||
    response?.listing ||
    response?.business ||
    null
  );
};

const getImages = (listing: BusinessListing) => {
  const raw = listing as any;
  const images = raw.images || raw.photos || raw.gallery || raw.media || [];

  if (Array.isArray(images)) {
    return images
      .map((item) => {
        if (typeof item === "string") return item;
        return item?.url || item?.src || item?.imageUrl || "";
      })
      .filter(Boolean);
  }

  if (typeof images === "string") return [images];
  if (raw.imageUrl) return [raw.imageUrl];
  if (raw.coverImage) return [raw.coverImage];

  return [];
};

function DetailRow({ label, value }: { label: string; value?: string | number | boolean | null }) {
  if (value === undefined || value === null || value === "") return null;

  return (
    <div className="bd-row">
      <span>{label}</span>
      <strong>{typeof value === "boolean" ? (value ? "Yes" : "No") : value}</strong>
    </div>
  );
}

function Section({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section className="bd-panel">
      <div className="bd-panel-head">
        <p>{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  );
}

function EnquiryModal({
  listing,
  message,
  saving,
  error,
  onMessage,
  onClose,
  onSubmit,
}: {
  listing: BusinessListing;
  message: string;
  saving: boolean;
  error: string;
  onMessage: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="bd-modal-backdrop" role="presentation" onClick={onClose}>
      <form
        className="bd-modal"
        onClick={(event) => event.stopPropagation()}
        onSubmit={(event: FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <div className="bd-modal-head">
          <div>
            <p>Secure enquiry</p>
            <h3>{listing.title}</h3>
          </div>
          <button type="button" onClick={onClose} aria-label="Close enquiry modal">
            x
          </button>
        </div>

        {error && <div className="bd-error">{error}</div>}

        <textarea
          rows={6}
          value={message}
          onChange={(event) => onMessage(event.target.value)}
          placeholder="Introduce yourself and explain your interest. Minimum 20 characters."
        />

        <div className="bd-modal-actions">
          <button type="button" className="bd-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="bd-primary" disabled={saving}>
            {saving ? "Sending..." : "Send Enquiry"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function BusinessDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { accessToken, isAuthenticated } = useAuth();

  const [listing, setListing] = useState<BusinessListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const id = params?.id;

  const load = useCallback(async () => {
    if (!id) {
      setLoading(false);
      setLoadError("Business ID is missing.");
      return;
    }

    setLoading(true);
    setLoadError("");

    try {
      const response = await MarketplaceService.getBusinessById(id);
      const business = unwrapBusiness(response);

      if (!business) {
        setListing(null);
        setLoadError("Business listing not found.");
        return;
      }

      setListing(business);
    } catch (err: any) {
      setListing(null);
      setLoadError(err?.message || "Business listing could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const location = useMemo(() => {
    if (!listing) return "";
    return [listing.city, listing.country].filter(Boolean).join(", ") || listing.country || "";
  }, [listing]);

  const openEnquiry = () => {
    if (!listing) return;

    if (!isAuthenticated) {
      router.push(`/login?redirect=/businesses-for-sale/${listing.id}`);
      return;
    }

    setMessage(`Hello, I am interested in ${listing.title} and would like to learn more about the business, financials, and deal process.`);
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
        <main className="bd-loading">Loading business profile...</main>
      </>
    );
  }

  if (!listing || loadError) {
    return (
      <>
        <style>{styles}</style>
        <main className="bd-loading">{loadError || "Business listing not found."}</main>
      </>
    );
  }

  const revenue = listing.runSales ?? listing.grossRevenue;
  const profit = listing.ebitda ?? listing.netProfit;
  const profitLabel = listing.ebitda ? "EBITDA" : "Net Profit";
  const images = getImages(listing);

  return (
    <>
      <style>{styles}</style>

      <main className="bd-page">
        <section className="bd-hero">
          <div className="bd-hero-inner">
            <nav className="bd-breadcrumb">
              <a href="/">Home</a>
              <span>/</span>
              <a href="/businesses-for-sale">Businesses for Sale</a>
              <span>/</span>
              <span>{listing.title}</span>
            </nav>

            <div className="bd-hero-grid">
              <div>
                <div className="bd-tag-row">
                  <span>{listing.industry || "Business"}</span>
                  <span>{formatEnum(listing.dealType)}</span>
                  {listing.isVerified && <span><BadgeCheck size={12} />Verified</span>}
                  {listing.isFeatured && <span>Featured</span>}
                </div>

                <h1>{listing.headline || listing.title}</h1>
                {listing.headline && <h2>{listing.title}</h2>}
                <p>{listing.shortSummary || listing.teaserSummary || listing.description || "No summary has been provided yet."}</p>

                <div className="bd-location">
                  <MapPin size={15} />
                  <span>{location || "Location not disclosed"}</span>
                </div>
              </div>

              <aside className="bd-ask-card">
                <span>Asking Amount</span>
                <strong>{formatMoney(listing.askAmount, listing.currency)}</strong>
                <p>
                  {listing.askPercent ? `${listing.askPercent}% equity offered` : ""}
                  {listing.askRate ? `${listing.askRate}% interest rate` : ""}
                  {!listing.askPercent && !listing.askRate ? formatEnum(listing.dealType) : ""}
                </p>
                <button type="button" onClick={openEnquiry}>
                  <MessageSquare size={15} />
                  Contact Seller
                </button>
              </aside>
            </div>
          </div>
        </section>

        <section className="bd-main">
          <div className="bd-left">
            {images.length > 0 && (
              <section className="bd-gallery">
                <img src={images[0]} alt={listing.title} className="bd-gallery-main" />
                {images.length > 1 && (
                  <div className="bd-gallery-grid">
                    {images.slice(1, 5).map((image) => (
                      <img key={image} src={image} alt={listing.title} />
                    ))}
                  </div>
                )}
              </section>
            )}

            <div className="bd-kpi-grid">
              <div><TrendingUp size={17} /><span>Revenue</span><strong>{formatMoney(revenue, listing.currency)}</strong></div>
              <div><BriefcaseBusiness size={17} /><span>{profitLabel}</span><strong>{hasValue(profit) ? formatMoney(profit, listing.currency) : listing.ebitdaMargin ? `${listing.ebitdaMargin}% margin` : "Not disclosed"}</strong></div>
              <div><Users size={17} /><span>Employees</span><strong>{listing.employees || "Not disclosed"}</strong></div>
              <div><Building2 size={17} /><span>Established</span><strong>{listing.established || "Not disclosed"}</strong></div>
            </div>

            <Section eyebrow="Overview" title="Business Summary">
              <div className="bd-rich-text">
                <p>{listing.description || "No business description has been provided yet."}</p>
              </div>
              <div className="bd-detail-grid">
                <DetailRow label="Business Name" value={listing.businessName} />
                <DetailRow label="Legal Entity" value={listing.legalEntityName} />
                <DetailRow label="Website" value={listing.website} />
                <DetailRow label="Outlets / Locations" value={listing.outlets} />
              </div>
            </Section>

            <Section eyebrow="Operations" title="Operating Model">
              <div className="bd-copy-grid">
                <DetailRow label="Business Model" value={listing.businessModel} />
                <DetailRow label="Products / Services" value={listing.productsServices} />
                <DetailRow label="Customer Base" value={listing.customerBase} />
                <DetailRow label="Key Clients" value={listing.keyClients} />
                <DetailRow label="Competitive Advantages" value={listing.competitiveAdvantages} />
                <DetailRow label="Growth Opportunities" value={listing.growthOpportunities} />
              </div>
            </Section>

            <Section eyebrow="Financials" title="Financial Snapshot">
              <div className="bd-detail-grid">
                <DetailRow label="Annual Revenue" value={formatMoney(listing.runSales ?? listing.grossRevenue, listing.currency)} />
                <DetailRow label="Gross Revenue" value={hasValue(listing.grossRevenue) ? formatMoney(listing.grossRevenue, listing.currency) : null} />
                <DetailRow label="Monthly Revenue" value={hasValue(listing.monthlyRevenue) ? formatMoney(listing.monthlyRevenue, listing.currency) : null} />
                <DetailRow label="EBITDA" value={hasValue(listing.ebitda) ? formatMoney(listing.ebitda, listing.currency) : null} />
                <DetailRow label="EBITDA Margin" value={listing.ebitdaMargin ? `${listing.ebitdaMargin}%` : null} />
                <DetailRow label="Net Profit" value={hasValue(listing.netProfit) ? formatMoney(listing.netProfit, listing.currency) : null} />
                <DetailRow label="Monthly Profit" value={hasValue(listing.monthlyProfit) ? formatMoney(listing.monthlyProfit, listing.currency) : null} />
                <DetailRow label="Inventory Value" value={hasValue(listing.inventoryValue) ? formatMoney(listing.inventoryValue, listing.currency) : null} />
                <DetailRow label="Asset Value" value={hasValue(listing.assetValue) ? formatMoney(listing.assetValue, listing.currency) : null} />
                <DetailRow label="Real Estate Value" value={hasValue(listing.realEstateValue) ? formatMoney(listing.realEstateValue, listing.currency) : null} />
              </div>
            </Section>

            <Section eyebrow="Deal terms" title="Transaction Details">
              <div className="bd-copy-grid">
                <DetailRow label="Deal Type" value={formatEnum(listing.dealType)} />
                <DetailRow label="Valuation Method" value={listing.valuationMethod} />
                <DetailRow label="Asking Price Reason" value={listing.askingPriceReason} />
                <DetailRow label="Reason For Selling" value={listing.reasonForSelling} />
                <DetailRow label="Assets Included" value={listing.assetsIncluded} />
                <DetailRow label="Seller Financing" value={listing.sellerFinancing} />
                <DetailRow label="Training Included" value={listing.trainingIncluded} />
                <DetailRow label="Transition Support" value={listing.transitionSupport} />
                <DetailRow label="Preferred Buyer Type" value={listing.preferredBuyerType} />
                <DetailRow label="Deal Structure Notes" value={listing.dealStructureNotes} />
              </div>
            </Section>

            {(listing.facilities || listing.leaseTerms) && (
              <Section eyebrow="Facilities" title="Property And Lease">
                <div className="bd-copy-grid">
                  <DetailRow label="Facilities" value={listing.facilities} />
                  <DetailRow label="Lease Terms" value={listing.leaseTerms} />
                </div>
              </Section>
            )}

            {listing.profileType === "RAISE_CAPITAL" && (
              <Section eyebrow="Fundraise" title="Investor Information">
                <div className="bd-copy-grid">
                  <DetailRow label="Funding Stage" value={listing.fundingStage} />
                  <DetailRow label="Use Of Funds" value={listing.useOfFunds} />
                  <DetailRow label="Traction" value={listing.traction} />
                  <DetailRow label="Runway" value={listing.runway} />
                  <DetailRow label="Minimum Investment" value={hasValue(listing.minInvestment) ? formatMoney(listing.minInvestment, listing.currency) : null} />
                  <DetailRow label="Target Investor" value={listing.targetInvestor} />
                  <DetailRow label="Previous Funding" value={hasValue(listing.previousFunding) ? formatMoney(listing.previousFunding, listing.currency) : null} />
                  <DetailRow label="Revenue Model" value={listing.revenueModel} />
                  <DetailRow label="Key Metrics" value={listing.keyMetrics} />
                  <DetailRow label="Investor Highlights" value={listing.investorHighlights} />
                  <DetailRow label="Exit Strategy" value={listing.exitStrategy} />
                  <DetailRow label="Pitch Deck Ready" value={listing.pitchDeckReady} />
                </div>
              </Section>
            )}
          </div>

          <aside className="bd-right">
            <section className="bd-side-card">
              <div className="bd-owner">
                <div>{listing.user?.firstName?.[0] || "A"}{listing.user?.lastName?.[0] || "B"}</div>
                <strong>{listing.user ? `${listing.user.firstName} ${listing.user.lastName}` : "Listing Owner"}</strong>
                <span>{listing.user?.country || listing.country}</span>
              </div>
              <button type="button" onClick={openEnquiry}>
                <MessageSquare size={15} />
                Send Enquiry
              </button>
            </section>

            <section className="bd-side-card">
              <h3>Trust And Diligence</h3>
              <div className="bd-trust-list">
                <span><LockKeyhole size={14} />{listing.isConfidential !== false ? "Confidential listing" : "Public listing"}</span>
                <span><ShieldCheck size={14} />{listing.ndaRequired !== false ? "NDA expected" : "NDA not required"}</span>
                <span><FileText size={14} />{listing.financialsAvailable ? "Financials available" : "Financials not marked available"}</span>
                <span><Database size={14} />{listing.dataRoomReady ? "Data room ready" : "Data room pending"}</span>
                <span><CheckCircle2 size={14} />{listing.isVerified ? "Verified owner/listing" : "Verification pending"}</span>
              </div>
            </section>
          </aside>
        </section>

        {modalOpen && (
          <EnquiryModal
            listing={listing}
            message={message}
            saving={saving}
            error={error}
            onMessage={setMessage}
            onClose={() => setModalOpen(false)}
            onSubmit={sendEnquiry}
          />
        )}
      </main>
    </>
  );
}

const styles = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--mw:82rem;--navy:#0f1e36;--t2:#4a5568;--t3:#8896a8;--bdr:#e2e6ed;--surf:#f4f6f9;--blue:#1A56DB;--green:#10B981;--amber:#F5A623;--red:#D42B2B;--font:'Poppins','Inter',system-ui,sans-serif}
body{font-family:var(--font);background:var(--surf);color:var(--navy)}
.bd-loading{min-height:70vh;display:grid;place-items:center;padding-top:100px;color:var(--t2);font-size:13px;font-weight:900}
.bd-page{min-height:100vh;padding-top:102px;background:var(--surf)}
.bd-hero{background:var(--navy);color:#fff;padding:30px 0}
.bd-hero-inner{max-width:var(--mw);margin:0 auto;padding:0 28px}
.bd-breadcrumb{display:flex;gap:7px;align-items:center;flex-wrap:wrap;font-size:11px;color:rgba(255,255,255,.38);margin-bottom:16px}
.bd-breadcrumb a{color:rgba(255,255,255,.68);text-decoration:none}
.bd-hero-grid{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:26px;align-items:start}
.bd-tag-row{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:12px}
.bd-tag-row span{display:inline-flex;align-items:center;gap:4px;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.08);color:rgba(255,255,255,.78);font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.55px;padding:4px 8px}
.bd-hero h1{font-size:clamp(28px,4vw,46px);line-height:1.08;font-weight:900;letter-spacing:-.8px;max-width:850px}
.bd-hero h2{font-size:14px;color:rgba(255,255,255,.48);margin-top:8px;font-weight:800}
.bd-hero p{font-size:14px;line-height:1.75;color:rgba(255,255,255,.62);max-width:780px;margin-top:14px}
.bd-location{display:flex;align-items:center;gap:7px;margin-top:14px;color:rgba(255,255,255,.72);font-size:12.5px;font-weight:800}
.bd-ask-card{background:#fff;color:var(--navy);border:1px solid rgba(255,255,255,.12);padding:18px}
.bd-ask-card>span{display:block;font-size:10px;font-weight:900;text-transform:uppercase;color:var(--t3);letter-spacing:.7px}
.bd-ask-card strong{display:block;font-size:25px;font-weight:900;margin-top:7px}
.bd-ask-card p{color:var(--t2);font-size:12px;margin:6px 0 14px;line-height:1.45}
.bd-ask-card button,.bd-side-card button,.bd-primary{height:38px;display:inline-flex;align-items:center;justify-content:center;gap:7px;background:var(--blue);border:1px solid var(--blue);color:#fff;font-family:var(--font);font-size:12px;font-weight:900;cursor:pointer;text-decoration:none;padding:0 14px;width:100%}
.bd-main{max-width:var(--mw);margin:0 auto;padding:24px 28px 70px;display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:24px;align-items:start}
.bd-left{display:flex;flex-direction:column;gap:18px}
.bd-right{display:flex;flex-direction:column;gap:16px;position:sticky;top:120px}
.bd-gallery{background:#fff;border:1px solid var(--bdr);padding:14px}
.bd-gallery-main{width:100%;height:360px;object-fit:cover;display:block;background:#eef3f8}
.bd-gallery-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:10px}
.bd-gallery-grid img{width:100%;height:120px;object-fit:cover;display:block;background:#eef3f8}
.bd-kpi-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
.bd-kpi-grid div{background:#fff;border:1px solid var(--bdr);padding:14px}
.bd-kpi-grid svg{color:var(--blue);margin-bottom:10px}
.bd-kpi-grid span{display:block;font-size:10px;color:var(--t3);font-weight:900;text-transform:uppercase;letter-spacing:.55px}
.bd-kpi-grid strong{display:block;font-size:15px;color:var(--navy);font-weight:900;margin-top:4px}
.bd-panel,.bd-side-card{background:#fff;border:1px solid var(--bdr);padding:18px}
.bd-panel-head{border-bottom:1px solid var(--bdr);padding-bottom:12px;margin-bottom:14px}
.bd-panel-head p{font-size:10px;color:var(--blue);font-weight:900;text-transform:uppercase;letter-spacing:.75px;margin-bottom:4px}
.bd-panel-head h2{font-size:18px;color:var(--navy);font-weight:900}
.bd-rich-text p{font-size:13px;line-height:1.8;color:var(--t2);white-space:pre-line}
.bd-detail-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.bd-copy-grid{display:flex;flex-direction:column;gap:10px}
.bd-row{background:var(--surf);border:1px solid var(--bdr);padding:11px 12px}
.bd-row span{display:block;font-size:10px;color:var(--t3);font-weight:900;text-transform:uppercase;letter-spacing:.55px;margin-bottom:4px}
.bd-row strong{display:block;font-size:12.5px;color:var(--navy);font-weight:800;line-height:1.6;white-space:pre-line}
.bd-owner{text-align:center;border-bottom:1px solid var(--bdr);padding-bottom:14px;margin-bottom:14px}
.bd-owner div{width:54px;height:54px;border-radius:50%;background:linear-gradient(135deg,var(--blue),var(--amber));color:#fff;display:grid;place-items:center;font-weight:900;margin:0 auto 9px}
.bd-owner strong{display:block;font-size:14px;font-weight:900}
.bd-owner span{display:block;font-size:11px;color:var(--t3);font-weight:800;margin-top:3px}
.bd-side-card h3{font-size:15px;font-weight:900;margin-bottom:12px}
.bd-trust-list{display:flex;flex-direction:column;gap:9px}
.bd-trust-list span{display:flex;align-items:flex-start;gap:8px;background:var(--surf);border:1px solid var(--bdr);padding:9px 10px;font-size:11.5px;color:var(--t2);font-weight:800;line-height:1.45}
.bd-trust-list svg{color:var(--blue);flex-shrink:0;margin-top:1px}
.bd-modal-backdrop{position:fixed;inset:0;background:rgba(10,22,40,.58);display:grid;place-items:center;z-index:100;padding:18px}
.bd-modal{width:min(560px,100%);background:#fff;border:1px solid var(--bdr);padding:18px;display:flex;flex-direction:column;gap:12px}
.bd-modal-head{display:flex;justify-content:space-between;gap:12px}
.bd-modal-head p{font-size:10px;color:var(--blue);font-weight:900;text-transform:uppercase}
.bd-modal-head h3{font-size:16px}
.bd-modal-head button{border:0;background:var(--surf);width:30px;height:30px;cursor:pointer}
.bd-modal textarea{width:100%;border:1px solid var(--bdr);padding:12px;font-family:var(--font);font-size:13px}
.bd-error{background:#fef2f2;color:#b91c1c;border:1px solid #fecaca;padding:9px 10px;font-size:12px;font-weight:800}
.bd-modal-actions{display:flex;justify-content:flex-end;gap:9px}
.bd-secondary{border:1px solid var(--bdr);background:#fff;color:var(--t2);padding:9px 14px;font-family:var(--font);font-weight:800;cursor:pointer}
.bd-primary{width:auto}
@media(max-width:1040px){.bd-hero-grid,.bd-main{grid-template-columns:1fr}.bd-right{position:static}.bd-kpi-grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:640px){.bd-page{padding-top:78px}.bd-hero-inner,.bd-main{padding-left:16px;padding-right:16px}.bd-detail-grid,.bd-kpi-grid,.bd-gallery-grid{grid-template-columns:1fr}.bd-gallery-main{height:240px}.bd-gallery-grid img{height:160px}.bd-ask-card button{width:100%}}
`;