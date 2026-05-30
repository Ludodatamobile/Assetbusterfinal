"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Banknote,
  Building2,
  CheckCircle2,
  Clock,
  FileText,
  Globe,
  Landmark,
  Loader2,
  MapPin,
  ShieldCheck,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import { FundingSourcesService } from "@/services/funding-sources.service";
import type { FundingSourceListing } from "@/types/funding-service";

function formatMoney(value?: string | number | null, currency = "USD") {
  if (value === null || value === undefined || value === "") return "Not disclosed";
  const amount = Number(value);
  if (Number.isNaN(amount) || amount === 0) return "Not disclosed";
  return `${currency} ${amount.toLocaleString()}`;
}

function text(value?: string | null, fallback = "Not provided") {
  return value?.trim() || fallback;
}

function listText(value?: string[] | null, fallback = "Not provided") {
  if (!value?.length) return fallback;
  return value.join(", ");
}

function DetailBlock({
  title,
  children,
  icon: Icon,
}: {
  title: string;
  children?: string | null;
  icon: LucideIcon;
}) {
  const content = text(children);
  if (content === "Not provided") return null;

  return (
    <article className="fd-block">
      <div className="fd-block-head">
        <Icon size={16} />
        <h2>{title}</h2>
      </div>
      <p>{content}</p>
    </article>
  );
}

export default function FundingSourceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const slug = String(params?.slug || "");
  const [item, setItem] = useState<FundingSourceListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadFundingSource = useCallback(async () => {
    if (!slug) return;

    setLoading(true);
    setError("");

    try {
      const response = await FundingSourcesService.getFundingSourceBySlug(slug);
      setItem(response.data);
    } catch (err: any) {
      setError(err?.message || "Funding source could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    void loadFundingSource();
  }, [loadFundingSource]);

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <main className="fd-page">
          <div className="fd-loading">
            <Loader2 className="spin" size={20} />
            Loading funding source
          </div>
        </main>
      </>
    );
  }

  if (error || !item) {
    return (
      <>
        <style>{styles}</style>
        <main className="fd-page">
          <div className="fd-error">
            <h1>Funding source not found</h1>
            <p>{error || "This funding source is no longer available."}</p>
            <button type="button" onClick={() => router.push("/funding-sources")}>
              Back to Funding Sources
            </button>
          </div>
        </main>
      </>
    );
  }

  const location = [item.city, item.country].filter(Boolean).join(", ");
  const owner = item.user
    ? [item.user.firstName, item.user.lastName].filter(Boolean).join(" ")
    : "Provider";

  const ticket =
    item.ticketMin || item.ticketMax || item.askAmount
      ? `${formatMoney(item.ticketMin, item.currency)} - ${formatMoney(
          item.ticketMax || item.askAmount,
          item.currency,
        )}`
      : "Not disclosed";

  return (
    <>
      <style>{styles}</style>
      <main className="fd-page">
        <button type="button" className="fd-back" onClick={() => router.back()}>
          <ArrowLeft size={15} />
          Back
        </button>

        <section className="fd-hero">
          <div className="fd-hero-copy">
            <p>Funding source profile</p>
            <h1>{item.title}</h1>
            <span>
              {text(
                item.headline ||
                  item.shortSummary ||
                  item.fundingServiceHighlights ||
                  item.description,
              )}
            </span>

            <div className="fd-tags">
              <b>{text(item.fundingServiceType, "Funding source")}</b>
              <b>{text(item.capitalProviderType, "Provider")}</b>
              <b>{text(item.targetCompanyStage, "Any stage")}</b>
            </div>
          </div>

          <aside className="fd-summary">
            <div>
              <span>Ticket Size</span>
              <strong>{ticket}</strong>
            </div>
            <div>
              <span>Location</span>
              <strong>{location || item.country}</strong>
            </div>
            <div>
              <span>Provider</span>
              <strong>{owner || "Confidential"}</strong>
            </div>
            <a href="/login">Contact Source</a>
          </aside>
        </section>

        <section className="fd-layout">
          <section className="fd-main">
            <div className="fd-kpis">
              <article>
                <Landmark size={18} />
                <span>{text(item.fundingServiceType, "Funding")}</span>
                <p>Source type</p>
              </article>
              <article>
                <Clock size={18} />
                <span>{text(item.processingTime, "TBD")}</span>
                <p>Processing time</p>
              </article>
              <article>
                <BadgeCheck size={18} />
                <span>{item.isVerified ? "Verified" : "Pending"}</span>
                <p>Verification</p>
              </article>
            </div>

            <DetailBlock title="Funding Source Description" icon={Landmark}>
              {item.description}
            </DetailBlock>

            <DetailBlock title="Funding Terms" icon={Banknote}>
              {item.repaymentTerms}
            </DetailBlock>

            <DetailBlock title="Eligibility Criteria" icon={CheckCircle2}>
              {item.eligibilityCriteria}
            </DetailBlock>

            <DetailBlock title="Required Documents" icon={FileText}>
              {item.requiredDocuments}
            </DetailBlock>

            <DetailBlock title="Fees" icon={Banknote}>
              {item.feesDescription}
            </DetailBlock>

            <DetailBlock title="Regions Covered" icon={MapPin}>
              {listText(item.regionsCovered)}
            </DetailBlock>

            <DetailBlock title="Capital Types" icon={TrendingUp}>
              {listText(item.capitalTypes)}
            </DetailBlock>

            <DetailBlock title="Provider Highlights" icon={ShieldCheck}>
              {item.fundingServiceHighlights}
            </DetailBlock>
          </section>

          <aside className="fd-side">
            <section className="fd-card">
              <div className="fd-card-head">
                <Building2 size={16} />
                <h2>Snapshot</h2>
              </div>

              <dl className="fd-list">
                <div>
                  <dt>Source Type</dt>
                  <dd>{text(item.fundingServiceType)}</dd>
                </div>
                <div>
                  <dt>Provider Type</dt>
                  <dd>{text(item.capitalProviderType)}</dd>
                </div>
                <div>
                  <dt>Industry</dt>
                  <dd>{text(item.industry)}</dd>
                </div>
                <div>
                  <dt>Collateral</dt>
                  <dd>{item.collateralRequired ? "May be required" : "Not required"}</dd>
                </div>
                <div>
                  <dt>License</dt>
                  <dd>{text(item.regulatoryLicense)}</dd>
                </div>
                <div>
                  <dt>Website</dt>
                  <dd>
                    {item.website ? (
                      <a href={item.website} target="_blank" rel="noreferrer">
                        Open website
                      </a>
                    ) : (
                      "Not provided"
                    )}
                  </dd>
                </div>
                <div>
                  <dt>Enquiries</dt>
                  <dd>{item.enquiryCount || item._count?.deals || 0}</dd>
                </div>
                <div>
                  <dt>Views</dt>
                  <dd>{item.viewCount || 0}</dd>
                </div>
              </dl>
            </section>

            <section className="fd-card">
              <div className="fd-card-head">
                <Globe size={16} />
                <h2>Coverage</h2>
              </div>
              <p className="fd-note">
                {listText(item.regionsCovered, location || item.country || "Global")}
              </p>
            </section>
          </aside>
        </section>
      </main>
    </>
  );
}

const styles = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  .fd-page{min-height:100vh;background:#f4f6f9;color:#0f1e36;font-family:'Poppins','Inter',system-ui,sans-serif;padding:128px 24px 64px}
  .fd-back{max-width:82rem;margin:0 auto 14px;display:flex;align-items:center;gap:7px;border:1px solid #e2e6ed;background:#fff;color:#4a5568;height:36px;padding:0 13px;font:900 12px 'Poppins','Inter',system-ui,sans-serif;cursor:pointer;border-radius:4px}
  .fd-hero{max-width:82rem;margin:0 auto 20px;background:#0a1628;color:#fff;padding:30px;display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:24px;border-radius:4px}
  .fd-hero-copy>p{font-size:11px;font-weight:900;text-transform:uppercase;color:#f5a623;margin-bottom:8px}
  .fd-hero h1{font-size:34px;line-height:1.12;margin-bottom:10px}
  .fd-hero span{display:block;max-width:760px;color:rgba(255,255,255,.68);font-size:14px;line-height:1.7}
  .fd-tags{display:flex;flex-wrap:wrap;gap:8px;margin-top:18px}
  .fd-tags b{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);color:#fff;padding:6px 9px;font-size:11px;border-radius:3px}
  .fd-summary{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);padding:16px;border-radius:4px;display:flex;flex-direction:column;gap:12px}
  .fd-summary span{display:block;font-size:10px;text-transform:uppercase;color:rgba(255,255,255,.45);font-weight:900;margin-bottom:3px}
  .fd-summary strong{display:block;color:#fff;font-size:14px}
  .fd-summary a{height:38px;background:#f5a623;color:#fff;text-decoration:none;font-size:12px;font-weight:900;display:flex;align-items:center;justify-content:center;border-radius:3px;margin-top:auto}
  .fd-layout{max-width:82rem;margin:0 auto;display:grid;grid-template-columns:minmax(0,1fr) 360px;gap:22px}
  .fd-main{display:flex;flex-direction:column;gap:14px}
  .fd-kpis{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
  .fd-kpis article,.fd-block,.fd-card,.fd-loading,.fd-error{background:#fff;border:1px solid #e2e6ed;border-radius:4px}
  .fd-kpis article{padding:16px;display:flex;align-items:center;gap:12px}
  .fd-kpis svg{color:#1A56DB}.fd-kpis span{display:block;font-size:16px;font-weight:900}.fd-kpis p{font-size:11px;color:#8896a8;font-weight:800}
  .fd-block{padding:20px}
  .fd-block-head,.fd-card-head{display:flex;align-items:center;gap:9px;margin-bottom:12px}
  .fd-block-head svg,.fd-card-head svg{color:#1A56DB}
  .fd-block h2,.fd-card h2{font-size:17px;font-weight:900}
  .fd-block p,.fd-note{font-size:13px;line-height:1.8;color:#4a5568;white-space:pre-line}
  .fd-side{display:flex;flex-direction:column;gap:14px}
  .fd-card{padding:18px}
  .fd-list{display:flex;flex-direction:column;gap:0}
  .fd-list div{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;border-bottom:1px solid #edf0f5;padding:11px 0}
  .fd-list div:last-child{border-bottom:0}
  .fd-list dt{font-size:11px;text-transform:uppercase;color:#8896a8;font-weight:900}
  .fd-list dd{font-size:12px;color:#0f1e36;font-weight:800;text-align:right}
  .fd-list a{color:#1A56DB;text-decoration:none}
  .fd-loading,.fd-error{max-width:720px;margin:0 auto;padding:38px;text-align:center;color:#4a5568;font-weight:900}
  .fd-error h1{font-size:24px;color:#0f1e36;margin-bottom:8px}.fd-error p{margin-bottom:14px}.fd-error button{height:38px;border:0;background:#f5a623;color:#fff;font:900 12px 'Poppins','Inter',system-ui,sans-serif;padding:0 14px;border-radius:3px;cursor:pointer}
  .spin{animation:spin .7s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}
  @media(max-width:1040px){.fd-hero,.fd-layout{grid-template-columns:1fr}.fd-side{order:-1}}
  @media(max-width:720px){.fd-page{padding:104px 14px 44px}.fd-hero{padding:22px}.fd-hero h1{font-size:28px}.fd-kpis{grid-template-columns:1fr}}
`;