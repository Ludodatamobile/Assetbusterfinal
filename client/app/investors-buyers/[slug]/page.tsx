"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  DollarSign,
  Globe2,
  Handshake,
  Mail,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Star,
  Target,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { MarketplaceService } from "@/services/marketplace.service";
import type { InvestorProfile } from "@/types/marketplace";

const formatEnum = (value?: string | null) => {
  if (!value) return "Not available";
  return value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const compactMoney = (value?: string | number | null, currency = "USD") => {
  if (typeof value === "string" && value.trim() && Number.isNaN(Number(value))) return value;

  const amount = Number(value || 0);
  if (!amount) return "Not disclosed";

  if (amount >= 1_000_000_000) return `${currency} ${(amount / 1_000_000_000).toFixed(1).replace(".0", "")} Bn`;
  if (amount >= 1_000_000) return `${currency} ${(amount / 1_000_000).toFixed(1).replace(".0", "")} Mn`;
  if (amount >= 1_000) return `${currency} ${(amount / 1_000).toFixed(1).replace(".0", "")} K`;

  return `${currency} ${amount.toLocaleString()}`;
};

const listFrom = (value: unknown): string[] => {
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
};

function DetailRow({ label, value }: { label: string; value?: string | number | boolean | null }) {
  if (value === undefined || value === null || value === "") return null;

  return (
    <div className="id-row">
      <span>{label}</span>
      <strong>{typeof value === "boolean" ? (value ? "Yes" : "No") : value}</strong>
    </div>
  );
}

function Section({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section className="id-panel">
      <div className="id-panel-head">
        <p>{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  );
}

export default function InvestorBuyerDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { accessToken, isAuthenticated } = useAuth();

  const [profile, setProfile] = useState<InvestorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const slug = params?.slug;

  const load = useCallback(async () => {
    if (!slug) return;

    setLoading(true);
    setLoadError("");

    try {
      const response = await MarketplaceService.getInvestorBySlug(slug);
      setProfile(response.data.profile || response.data.investor || response.data);
    } catch (err: any) {
      setLoadError(err?.message || "Investor profile could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    void load();
  }, [load]);

  const raw = profile as any;

  const name = useMemo(() => {
    if (!profile) return "";
    return raw.title || raw.name || raw.firmName || [raw.user?.firstName, raw.user?.lastName].filter(Boolean).join(" ") || "Investor Profile";
  }, [profile, raw]);

  const industries = listFrom(raw?.industries || raw?.industryFocus || raw?.industry);
  const dealTypes = listFrom(raw?.dealTypes || raw?.dealType);
  const countries = listFrom(raw?.countries || raw?.country);
  const country = raw?.country || countries[0] || raw?.user?.country || "Global";
  const location = [raw?.city || raw?.location, country].filter(Boolean).join(", ");
  const currency = raw?.currency || "USD";
  const type = formatEnum(raw?.investorType || raw?.type || raw?.profileType || "Investor");

  const openEnquiry = () => {
    if (!profile) return;

    if (!isAuthenticated) {
      router.push(`/login?redirect=/investors-buyers/${slug}`);
      return;
    }

    setMessage(`Hello, I would like to connect with ${name} regarding investment or acquisition opportunities.`);
    setError("");
    setModalOpen(true);
  };

  const sendEnquiry = async () => {
    if (!profile || !accessToken) return;

    if (message.trim().length < 20) {
      setError("Please write at least 20 characters.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await MarketplaceService.enquireInvestor(accessToken, raw.id, message);
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
        <main className="id-loading">Loading investor profile...</main>
      </>
    );
  }

  if (!profile || loadError) {
    return (
      <>
        <style>{styles}</style>
        <main className="id-loading">{loadError || "Investor profile not found."}</main>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>

      <main className="id-page">
        <section className="id-hero">
          <div className="id-hero-inner">
            <nav className="id-breadcrumb">
              <a href="/">Home</a>
              <span>/</span>
              <a href="/investors-buyers">Investors &amp; Buyers</a>
              <span>/</span>
              <span>{name}</span>
            </nav>

            <div className="id-hero-grid">
              <div>
                <div className="id-tag-row">
                  <span>{type}</span>
                  {raw.verified || raw.isVerified ? <span><BadgeCheck size={12} />Verified</span> : null}
                  {raw.featured || raw.isFeatured ? <span>Featured</span> : null}
                  {raw.premium || raw.isPremium ? <span>Premium</span> : null}
                </div>

                <h1>{name}</h1>
                <p>{raw.tagline || raw.shortDescription || raw.description || raw.investmentThesis || "Investor profile accepting qualified marketplace introductions."}</p>

                <div className="id-location">
                  <MapPin size={15} />
                  <span>{location}</span>
                </div>
              </div>

              <aside className="id-ask-card">
                <span>Investment Range</span>
                <strong>{compactMoney(raw.investMin || raw.minTicket, currency)} - {compactMoney(raw.investMax || raw.maxTicket, currency)}</strong>
                <p>{industries.slice(0, 3).join(", ") || "General investment opportunities"}</p>
                <button type="button" onClick={openEnquiry}>
                  <MessageSquare size={15} />
                  Connect
                </button>
              </aside>
            </div>
          </div>
        </section>

        <section className="id-main">
          <div className="id-left">
            <div className="id-kpi-grid">
              <div><DollarSign size={17} /><span>Min Ticket</span><strong>{compactMoney(raw.investMin || raw.minTicket, currency)}</strong></div>
              <div><Target size={17} /><span>Max Ticket</span><strong>{compactMoney(raw.investMax || raw.maxTicket, currency)}</strong></div>
              <div><BriefcaseBusiness size={17} /><span>Portfolio</span><strong>{raw.portfolioSize || raw.portfolioCompanies || 0}</strong></div>
              <div><Star size={17} /><span>Rating</span><strong>{raw.rating || raw.score || "Not rated"}</strong></div>
            </div>

            <Section eyebrow="Overview" title="Investor Summary">
              <div className="id-rich-text">
                <p>{raw.bio || raw.description || raw.investmentThesis || "No detailed description has been provided yet."}</p>
              </div>

              <div className="id-detail-grid">
                <DetailRow label="Firm Name" value={raw.firmName} />
                <DetailRow label="Investor Type" value={type} />
                <DetailRow label="Country" value={country} />
                <DetailRow label="Location" value={location} />
                <DetailRow label="Website" value={raw.website} />
                <DetailRow label="Active Since" value={raw.established || (raw.createdAt ? new Date(raw.createdAt).getFullYear() : null)} />
              </div>
            </Section>

            <Section eyebrow="Focus" title="Investment Focus">
              <div className="id-chip-list">
                {industries.length ? industries.map((item) => <span key={item}>{item}</span>) : <span>General</span>}
              </div>

              <div className="id-copy-grid">
                <DetailRow label="Preferred Countries" value={countries.join(", ")} />
                <DetailRow label="Deal Types" value={dealTypes.join(", ")} />
                <DetailRow label="Investment Thesis" value={raw.investmentThesis} />
                <DetailRow label="Target Businesses" value={raw.targetBusinesses || raw.targetBusiness} />
                <DetailRow label="Preferred Stage" value={raw.preferredStage || raw.stage} />
                <DetailRow label="Sector Notes" value={raw.sectorNotes} />
              </div>
            </Section>

            <Section eyebrow="Track Record" title="Experience And Criteria">
              <div className="id-copy-grid">
                <DetailRow label="Deals Closed" value={raw.dealsCount || raw.closedDeals} />
                <DetailRow label="Portfolio Companies" value={raw.portfolioSize || raw.portfolioCompanies} />
                <DetailRow label="Average Ticket" value={compactMoney(raw.averageTicket, currency)} />
                <DetailRow label="Investment Criteria" value={raw.investmentCriteria} />
                <DetailRow label="Value Add" value={raw.valueAdd} />
                <DetailRow label="Decision Timeline" value={raw.decisionTimeline} />
              </div>
            </Section>
          </div>

          <aside className="id-right">
            <section className="id-side-card">
              <div className="id-owner">
                <div>{String(name).slice(0, 2).toUpperCase()}</div>
                <strong>{name}</strong>
                <span>{country}</span>
              </div>

              <button type="button" onClick={openEnquiry}>
                <MessageSquare size={15} />
                Send Message
              </button>
            </section>

            <section className="id-side-card">
              <h3>Profile Signals</h3>
              <div className="id-trust-list">
                <span><ShieldCheck size={14} />{raw.verified || raw.isVerified ? "Verified investor" : "Verification pending"}</span>
                <span><Handshake size={14} />{dealTypes.length ? dealTypes.join(", ") : "Open to introductions"}</span>
                <span><Globe2 size={14} />{countries.length ? countries.join(", ") : country}</span>
                <span><Building2 size={14} />{industries.length ? industries.slice(0, 3).join(", ") : "General sector focus"}</span>
                <span><CheckCircle2 size={14} />{raw.featured || raw.isFeatured ? "Featured profile" : "Standard profile"}</span>
              </div>
            </section>
          </aside>
        </section>

        {modalOpen && (
          <div className="id-modal-backdrop" role="presentation" onClick={() => setModalOpen(false)}>
            <form
              className="id-modal"
              onClick={(event) => event.stopPropagation()}
              onSubmit={(event: FormEvent<HTMLFormElement>) => {
                event.preventDefault();
                void sendEnquiry();
              }}
            >
              <div className="id-modal-head">
                <div>
                  <p>Secure message</p>
                  <h3>{name}</h3>
                </div>
                <button type="button" onClick={() => setModalOpen(false)} aria-label="Close message modal">x</button>
              </div>

              {error && <div className="id-error">{error}</div>}

              <textarea
                rows={6}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Introduce yourself and explain why you want to connect. Minimum 20 characters."
              />

              <div className="id-modal-actions">
                <button type="button" className="id-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="id-primary" disabled={saving}>
                  {saving ? "Sending..." : "Send Message"}
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
:root{--mw:82rem;--navy:#0f1e36;--t2:#4a5568;--t3:#8896a8;--bdr:#e2e6ed;--surf:#f4f6f9;--blue:#1A56DB;--green:#059669;--amber:#F5A623;--font:'Poppins','Inter',system-ui,sans-serif}
body{font-family:var(--font);background:var(--surf);color:var(--navy)}
.id-loading{min-height:70vh;display:grid;place-items:center;padding-top:100px;color:var(--t2);font-size:13px;font-weight:900}
.id-page{min-height:100vh;padding-top:102px;background:var(--surf)}
.id-hero{background:var(--navy);color:#fff;padding:30px 0}
.id-hero-inner{max-width:var(--mw);margin:0 auto;padding:0 28px}
.id-breadcrumb{display:flex;gap:7px;align-items:center;flex-wrap:wrap;font-size:11px;color:rgba(255,255,255,.38);margin-bottom:16px}
.id-breadcrumb a{color:rgba(255,255,255,.68);text-decoration:none}
.id-hero-grid{display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:26px;align-items:start}
.id-tag-row{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:12px}
.id-tag-row span{display:inline-flex;align-items:center;gap:4px;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.08);color:rgba(255,255,255,.78);font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.55px;padding:4px 8px}
.id-hero h1{font-size:clamp(28px,4vw,46px);line-height:1.08;font-weight:900;max-width:850px}
.id-hero p{font-size:14px;line-height:1.75;color:rgba(255,255,255,.62);max-width:780px;margin-top:14px}
.id-location{display:flex;align-items:center;gap:7px;margin-top:14px;color:rgba(255,255,255,.72);font-size:12.5px;font-weight:800}
.id-ask-card{background:#fff;color:var(--navy);padding:18px}
.id-ask-card>span{display:block;font-size:10px;font-weight:900;text-transform:uppercase;color:var(--t3);letter-spacing:.7px}
.id-ask-card strong{display:block;font-size:22px;font-weight:900;margin-top:7px;line-height:1.25}
.id-ask-card p{color:var(--t2);font-size:12px;margin:6px 0 14px;line-height:1.45}
.id-ask-card button,.id-side-card button,.id-primary{height:38px;display:inline-flex;align-items:center;justify-content:center;gap:7px;background:var(--blue);border:1px solid var(--blue);color:#fff;font-family:var(--font);font-size:12px;font-weight:900;cursor:pointer;padding:0 14px;width:100%}
.id-main{max-width:var(--mw);margin:0 auto;padding:24px 28px 70px;display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:24px;align-items:start}
.id-left{display:flex;flex-direction:column;gap:18px}
.id-right{display:flex;flex-direction:column;gap:16px;position:sticky;top:120px}
.id-kpi-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
.id-kpi-grid div,.id-panel,.id-side-card{background:#fff;border:1px solid var(--bdr);padding:18px}
.id-kpi-grid svg{color:var(--blue);margin-bottom:10px}
.id-kpi-grid span{display:block;font-size:10px;color:var(--t3);font-weight:900;text-transform:uppercase;letter-spacing:.55px}
.id-kpi-grid strong{display:block;font-size:15px;color:var(--navy);font-weight:900;margin-top:4px}
.id-panel-head{border-bottom:1px solid var(--bdr);padding-bottom:12px;margin-bottom:14px}
.id-panel-head p{font-size:10px;color:var(--blue);font-weight:900;text-transform:uppercase;letter-spacing:.75px;margin-bottom:4px}
.id-panel-head h2{font-size:18px;color:var(--navy);font-weight:900}
.id-rich-text p{font-size:13px;line-height:1.8;color:var(--t2);white-space:pre-line}
.id-detail-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.id-copy-grid{display:flex;flex-direction:column;gap:10px;margin-top:12px}
.id-row{background:var(--surf);border:1px solid var(--bdr);padding:11px 12px}
.id-row span{display:block;font-size:10px;color:var(--t3);font-weight:900;text-transform:uppercase;letter-spacing:.55px;margin-bottom:4px}
.id-row strong{display:block;font-size:12.5px;color:var(--navy);font-weight:800;line-height:1.6;white-space:pre-line}
.id-chip-list{display:flex;flex-wrap:wrap;gap:7px}
.id-chip-list span{background:#eef3fd;border:1px solid #c4d5f9;color:var(--blue);font-size:11px;font-weight:900;padding:6px 9px}
.id-owner{text-align:center;border-bottom:1px solid var(--bdr);padding-bottom:14px;margin-bottom:14px}
.id-owner div{width:54px;height:54px;border-radius:50%;background:linear-gradient(135deg,var(--blue),var(--green));color:#fff;display:grid;place-items:center;font-weight:900;margin:0 auto 9px}
.id-owner strong{display:block;font-size:14px;font-weight:900}
.id-owner span{display:block;font-size:11px;color:var(--t3);font-weight:800;margin-top:3px}
.id-side-card h3{font-size:15px;font-weight:900;margin-bottom:12px}
.id-trust-list{display:flex;flex-direction:column;gap:9px}
.id-trust-list span{display:flex;align-items:flex-start;gap:8px;background:var(--surf);border:1px solid var(--bdr);padding:9px 10px;font-size:11.5px;color:var(--t2);font-weight:800;line-height:1.45}
.id-modal-backdrop{position:fixed;inset:0;background:rgba(10,22,40,.58);display:grid;place-items:center;z-index:100;padding:18px}
.id-modal{width:min(560px,100%);background:#fff;border:1px solid var(--bdr);padding:18px;display:flex;flex-direction:column;gap:12px}
.id-modal-head{display:flex;justify-content:space-between;gap:12px}
.id-modal-head p{font-size:10px;color:var(--blue);font-weight:900;text-transform:uppercase}
.id-modal-head h3{font-size:16px}
.id-modal-head button{border:0;background:var(--surf);width:30px;height:30px;cursor:pointer}
.id-modal textarea{width:100%;border:1px solid var(--bdr);padding:12px;font-family:var(--font);font-size:13px}
.id-error{background:#fef2f2;color:#b91c1c;border:1px solid #fecaca;padding:9px 10px;font-size:12px;font-weight:800}
.id-modal-actions{display:flex;justify-content:flex-end;gap:9px}
.id-secondary{border:1px solid var(--bdr);background:#fff;color:var(--t2);padding:9px 14px;font-family:var(--font);font-weight:800;cursor:pointer}
.id-primary{width:auto}
@media(max-width:1040px){.id-hero-grid,.id-main{grid-template-columns:1fr}.id-right{position:static}.id-kpi-grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:640px){.id-page{padding-top:78px}.id-hero-inner,.id-main{padding-left:16px;padding-right:16px}.id-detail-grid,.id-kpi-grid{grid-template-columns:1fr}}
`;