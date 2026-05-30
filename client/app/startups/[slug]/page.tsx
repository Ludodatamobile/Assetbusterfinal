"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Globe,
  ImageIcon,
  Lightbulb,
  Loader2,
  MapPin,
  Rocket,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { StartupService } from "@/services/startup.service";
import type { StartupListing } from "@/types/startup";

function formatMoney(value?: string | number | null, currency = "USD") {
  const amount = Number(value || 0);
  if (!amount) return "Not disclosed";
  return `${currency} ${amount.toLocaleString()}`;
}

function text(value?: string | null, fallback = "Not provided") {
  return value?.trim() || fallback;
}

function DetailBlock({
  title,
  children,
  icon: Icon,
}: {
  title: string;
  children: string;
  icon: typeof Lightbulb;
}) {
  if (!children || children === "Not provided") return null;

  return (
    <article className="sd-block">
      <div className="sd-block-head">
        <Icon size={16} />
        <h2>{title}</h2>
      </div>
      <p>{children}</p>
    </article>
  );
}

export default function StartupDetailPage() {
  const router = useRouter();
  const params = useParams();
  const slug = String(params?.slug || "");
  const [item, setItem] = useState<StartupListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStartup = useCallback(async () => {
    if (!slug) return;

    setLoading(true);
    setError("");

    try {
      const response = await StartupService.getStartupBySlug(slug);
      setItem(response.data);
    } catch (err: any) {
      setError(err?.message || "Startup could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    void loadStartup();
  }, [loadStartup]);

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <main className="sd-page">
          <div className="sd-loading">
            <Loader2 className="spin" size={20} />
            Loading startup
          </div>
        </main>
      </>
    );
  }

  if (error || !item) {
    return (
      <>
        <style>{styles}</style>
        <main className="sd-page">
          <div className="sd-error">
            <h1>Startup not found</h1>
            <p>{error || "This startup is no longer available."}</p>
            <button type="button" onClick={() => router.push("/startups")}>
              Back to Startups
            </button>
          </div>
        </main>
      </>
    );
  }

  const images = item.imageUrls || [];
  const location = [item.city, item.country].filter(Boolean).join(", ");
  const owner = item.user
    ? [item.user.firstName, item.user.lastName].filter(Boolean).join(" ")
    : "Founder";

  return (
    <>
      <style>{styles}</style>
      <main className="sd-page">
        <button type="button" className="sd-back" onClick={() => router.back()}>
          <ArrowLeft size={15} />
          Back
        </button>

        <section className="sd-hero">
          <div className="sd-hero-copy">
            <p>Startup profile</p>
            <h1>{item.title}</h1>
            <span>
              {text(
                item.headline ||
                  item.shortSummary ||
                  item.startupHighlights ||
                  item.description,
              )}
            </span>

            <div className="sd-tags">
              <b>{text(item.startupType, "Startup")}</b>
              <b>{text(item.startupCategory || item.industry, "Category")}</b>
              <b>{text(item.startupStage || item.productStatus, "Stage TBD")}</b>
            </div>
          </div>

          <aside className="sd-summary">
            <div>
              <span>Funding Needed</span>
              <strong>
                {formatMoney(item.fundingNeeded || item.askAmount, item.currency)}
              </strong>
            </div>
            <div>
              <span>Location</span>
              <strong>{location || item.country}</strong>
            </div>
            <div>
              <span>Founder / Owner</span>
              <strong>{owner || "Confidential"}</strong>
            </div>
            <a href="/login">Contact Founder</a>
          </aside>
        </section>

        <section className="sd-layout">
          <section className="sd-main">
            <div className="sd-kpis">
              <article>
                <Rocket size={18} />
                <span>{text(item.startupStage || item.productStatus, "TBD")}</span>
                <p>Startup stage</p>
              </article>
              <article>
                <TrendingUp size={18} />
                <span>{item.viewCount || 0}</span>
                <p>Profile views</p>
              </article>
              <article>
                <BadgeCheck size={18} />
                <span>{item.isVerified ? "Verified" : "Pending"}</span>
                <p>Verification</p>
              </article>
            </div>

            <DetailBlock
              title="Problem Being Solved"
              icon={Target}
            >
              {text(item.problemStatement)}
            </DetailBlock>

            <DetailBlock
              title="Solution"
              icon={Lightbulb}
            >
              {text(item.solutionStatement)}
            </DetailBlock>

            <DetailBlock
              title="Startup Description"
              icon={Rocket}
            >
              {text(item.description)}
            </DetailBlock>

            <DetailBlock
              title="Target Market"
              icon={Users}
            >
              {text(item.targetMarket)}
            </DetailBlock>

            <DetailBlock
              title="Market Size"
              icon={TrendingUp}
            >
              {text(item.marketSize)}
            </DetailBlock>

            <DetailBlock
              title="Business Model"
              icon={Building2}
            >
              {text(item.businessModel || item.revenueModel)}
            </DetailBlock>

            <DetailBlock
              title="Traction"
              icon={CheckCircle2}
            >
              {text(item.tractionSummary || item.traction)}
            </DetailBlock>

            <DetailBlock
              title="Team"
              icon={Users}
            >
              {text(item.teamSummary)}
            </DetailBlock>

            <DetailBlock
              title="Technology Stack"
              icon={Globe}
            >
              {text(item.technologyStack)}
            </DetailBlock>

            <DetailBlock
              title="Go-To-Market Strategy"
              icon={TrendingUp}
            >
              {text(item.goToMarketStrategy)}
            </DetailBlock>

            <DetailBlock
              title="Competitors"
              icon={Building2}
            >
              {text(item.competitors)}
            </DetailBlock>

            <DetailBlock
              title="Highlights"
              icon={BadgeCheck}
            >
              {text(item.startupHighlights)}
            </DetailBlock>
          </section>

          <aside className="sd-side">
            <section className="sd-card">
              <div className="sd-card-head">
                <ImageIcon size={16} />
                <h2>Startup Images</h2>
              </div>

              {images.length ? (
                <div className="sd-gallery">
                  {images.map((image) => (
                    <img key={image} src={image} alt={item.title} />
                  ))}
                </div>
              ) : (
                <div className="sd-image-empty">
                  <ImageIcon size={24} />
                  <p>No startup images uploaded yet.</p>
                </div>
              )}
            </section>

            <section className="sd-card">
              <div className="sd-card-head">
                <Building2 size={16} />
                <h2>Snapshot</h2>
              </div>
              <dl className="sd-list">
                <div>
                  <dt>Category</dt>
                  <dd>{text(item.startupCategory || item.industry)}</dd>
                </div>
                <div>
                  <dt>Project Type</dt>
                  <dd>{text(item.startupType)}</dd>
                </div>
                <div>
                  <dt>Product Status</dt>
                  <dd>{text(item.productStatus)}</dd>
                </div>
                <div>
                  <dt>Website</dt>
                  <dd>
                    {item.website ? (
                      <a href={item.website} target="_blank">
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
              </dl>
            </section>
          </aside>
        </section>
      </main>
    </>
  );
}

const styles = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  .sd-page{min-height:100vh;background:#f4f6f9;color:#0f1e36;font-family:'Poppins','Inter',system-ui,sans-serif;padding:128px 24px 64px}
  .sd-back{max-width:82rem;margin:0 auto 14px;display:flex;align-items:center;gap:7px;border:1px solid #e2e6ed;background:#fff;color:#4a5568;height:36px;padding:0 13px;font:900 12px 'Poppins','Inter',system-ui,sans-serif;cursor:pointer;border-radius:4px}
  .sd-hero{max-width:82rem;margin:0 auto 20px;background:#0a1628;color:#fff;padding:30px;display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:24px;border-radius:4px}
  .sd-hero-copy>p{font-size:11px;font-weight:900;text-transform:uppercase;color:#f5a623;margin-bottom:8px}
  .sd-hero h1{font-size:34px;line-height:1.12;margin-bottom:10px}
  .sd-hero span{display:block;max-width:760px;color:rgba(255,255,255,.68);font-size:14px;line-height:1.7}
  .sd-tags{display:flex;flex-wrap:wrap;gap:8px;margin-top:18px}
  .sd-tags b{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);color:#fff;padding:6px 9px;font-size:11px;border-radius:3px}
  .sd-summary{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);padding:16px;border-radius:4px;display:flex;flex-direction:column;gap:12px}
  .sd-summary span{display:block;font-size:10px;text-transform:uppercase;color:rgba(255,255,255,.45);font-weight:900;margin-bottom:3px}
  .sd-summary strong{display:block;color:#fff;font-size:14px}
  .sd-summary a{height:38px;background:#f5a623;color:#fff;text-decoration:none;font-size:12px;font-weight:900;display:flex;align-items:center;justify-content:center;border-radius:3px;margin-top:auto}
  .sd-layout{max-width:82rem;margin:0 auto;display:grid;grid-template-columns:minmax(0,1fr) 360px;gap:22px}
  .sd-main{display:flex;flex-direction:column;gap:14px}
  .sd-kpis{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
  .sd-kpis article,.sd-block,.sd-card,.sd-loading,.sd-error{background:#fff;border:1px solid #e2e6ed;border-radius:4px}
  .sd-kpis article{padding:16px;display:flex;align-items:center;gap:12px}
  .sd-kpis svg{color:#1A56DB}.sd-kpis span{display:block;font-size:16px;font-weight:900}.sd-kpis p{font-size:11px;color:#8896a8;font-weight:800}
  .sd-block{padding:20px}
  .sd-block-head,.sd-card-head{display:flex;align-items:center;gap:9px;margin-bottom:12px}
  .sd-block-head svg,.sd-card-head svg{color:#1A56DB}
  .sd-block h2,.sd-card h2{font-size:17px;font-weight:900}
  .sd-block p{font-size:13px;line-height:1.8;color:#4a5568;white-space:pre-line}
  .sd-side{display:flex;flex-direction:column;gap:14px}
  .sd-card{padding:18px}
  .sd-gallery{display:grid;grid-template-columns:1fr;gap:10px}
  .sd-gallery img{width:100%;height:210px;object-fit:cover;border-radius:4px;border:1px solid #e2e6ed;background:#eef3f8}
  .sd-image-empty{height:180px;border:1px dashed #e2e6ed;background:#f8fafc;display:grid;place-items:center;text-align:center;color:#8896a8;font-size:12px;font-weight:900;border-radius:4px;padding:18px}
  .sd-list{display:flex;flex-direction:column;gap:0}
  .sd-list div{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;border-bottom:1px solid #edf0f5;padding:11px 0}
  .sd-list div:last-child{border-bottom:0}
  .sd-list dt{font-size:11px;text-transform:uppercase;color:#8896a8;font-weight:900}
  .sd-list dd{font-size:12px;color:#0f1e36;font-weight:800;text-align:right}
  .sd-list a{color:#1A56DB;text-decoration:none}
  .sd-loading,.sd-error{max-width:720px;margin:0 auto;padding:38px;text-align:center;color:#4a5568;font-weight:900}
  .sd-error h1{font-size:24px;color:#0f1e36;margin-bottom:8px}.sd-error p{margin-bottom:14px}.sd-error button{height:38px;border:0;background:#f5a623;color:#fff;font:900 12px 'Poppins','Inter',system-ui,sans-serif;padding:0 14px;border-radius:3px;cursor:pointer}
  .spin{animation:spin .7s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}
  @media(max-width:1040px){.sd-hero,.sd-layout{grid-template-columns:1fr}.sd-side{order:-1}}
  @media(max-width:720px){.sd-page{padding:104px 14px 44px}.sd-hero{padding:22px}.sd-hero h1{font-size:28px}.sd-kpis{grid-template-columns:1fr}}
`;