"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ─── Count-up hook ─────────────────────────────────────────────────────────────

function useCountUpTo(target: number, duration: number, active: boolean) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) { setVal(0); return; }
    let start: number | null = null;
    const tick = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setVal(Math.floor((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration, active]);
  return val;
}

// ─── Typewriter helper ─────────────────────────────────────────────────────────

function useTypewriter(text: string, speed: number, active: boolean) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    if (!active) { setDisplayed(""); return; }
    let i = 0;
    setDisplayed("");
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed, active]);
  return displayed;
}

// ─── Page navigation hook ──────────────────────────────────────────────────────

function usePageNav<T>(items: T[], perPage: number) {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(items.length / perPage);
  const prev = useCallback(() => setPage((p) => Math.max(0, p - 1)), []);
  const next = useCallback(() => setPage((p) => Math.min(totalPages - 1, p + 1)), [totalPages]);
  const pageItems = items.slice(page * perPage, page * perPage + perPage);
  return { page, prev, next, pageItems, totalPages, canPrev: page > 0, canNext: page < totalPages - 1 };
}

function Arrow({ onClick, disabled, dir }: { onClick: () => void; disabled: boolean; dir: "prev" | "next" }) {
  return (
    <button className="ms-arrow" onClick={onClick} disabled={disabled} aria-label={dir}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        {dir === "prev"
          ? <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
          : <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
        }
      </svg>
    </button>
  );
}

function Dots({ total, current }: { total: number; current: number }) {
  return (
    <div className="ms-dots">
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} className={`ms-dot ${i === current ? "ms-dot-active" : ""}`}/>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// 1. BUSINESS VALUATION CALCULATOR
// ══════════════════════════════════════════════════════════════════════════════

const DEMO_CASES = [
  { industry: "Technology / SaaS", revenue: "₦85,000,000", ebitda: "22%", growth: "38%", multiple: "6.4×", valuation: "NGN 548 Mn", color: "#1A56DB", bar: 72 },
  { industry: "Food & Beverage", revenue: "₦240,000,000", ebitda: "18%", growth: "14%", multiple: "3.2×", valuation: "NGN 768 Mn", color: "#F5A623", bar: 55 },
  { industry: "Healthcare Services", revenue: "₦110,000,000", ebitda: "31%", growth: "22%", multiple: "5.1×", valuation: "NGN 561 Mn", color: "#10B981", bar: 64 },
];

function ValuationSimulator() {
  const [caseIdx, setCaseIdx] = useState(0);
  const [phase, setPhase] = useState<"typing" | "counting" | "done">("typing");
  const demo = DEMO_CASES[caseIdx];

  useEffect(() => {
    setPhase("typing");
    const t1 = setTimeout(() => setPhase("counting"), 1800);
    const t2 = setTimeout(() => setPhase("done"), 3600);
    const t3 = setTimeout(() => {
      setCaseIdx((i) => (i + 1) % DEMO_CASES.length);
    }, 5200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [caseIdx]);

  const industryText = useTypewriter(demo.industry, 38, phase === "typing" || phase === "counting" || phase === "done");
  const revenueText = useTypewriter(demo.revenue, 30, phase === "typing" || phase === "counting" || phase === "done");
  const ebitdaText = useTypewriter(demo.ebitda, 55, phase === "typing" || phase === "counting" || phase === "done");
  const growthText = useTypewriter(demo.growth, 60, phase === "typing" || phase === "counting" || phase === "done");

  const valNum = parseInt(demo.valuation.replace(/[^0-9]/g, ""), 10);
  const countedVal = useCountUpTo(valNum, 1600, phase === "counting" || phase === "done");
  const suffix = demo.valuation.includes("Mn") ? " Mn" : " Bn";
  const prefix = demo.valuation.startsWith("NGN") ? "NGN " : "USD ";

  return (
    <div className="val-sim">
      <div className="val-sim-topbar">
        <div className="val-sim-dots-row">
          <span className="val-sim-dot-r"/><span className="val-sim-dot-y"/><span className="val-sim-dot-g"/>
        </div>
        <span className="val-sim-title-bar">SMERGERS Valuation Engine</span>
        <span className="val-sim-live">● LIVE</span>
      </div>

      <div className="val-sim-body">
        <div className="val-sim-form">
          <div className="val-sim-row">
            <label className="val-sim-label">Industry / Sector</label>
            <div className="val-sim-field">
              <span className="val-sim-cursor">{industryText}<span className="val-cursor-blink">|</span></span>
            </div>
          </div>
          <div className="val-sim-row">
            <label className="val-sim-label">Annual Revenue</label>
            <div className="val-sim-field">
              <span className="val-sim-cursor">{revenueText}<span className="val-cursor-blink">|</span></span>
            </div>
          </div>
          <div className="val-sim-row2">
            <div>
              <label className="val-sim-label">EBITDA Margin</label>
              <div className="val-sim-field-sm">{ebitdaText}<span className="val-cursor-blink">|</span></div>
            </div>
            <div>
              <label className="val-sim-label">YoY Growth</label>
              <div className="val-sim-field-sm">{growthText}<span className="val-cursor-blink">|</span></div>
            </div>
          </div>

          <div className="val-sim-chart-label">Comparable Transactions</div>
          <div className="val-sim-bars">
            {[
              { label: "Listed cos.", pct: demo.bar, color: demo.color },
              { label: "Private M&A", pct: demo.bar - 8, color: demo.color + "bb" },
              { label: "SMERGERS DB", pct: demo.bar + 10, color: demo.color + "77" },
            ].map(({ label, pct, color }) => (
              <div key={label} className="val-sim-bar-row">
                <span className="val-sim-bar-lbl">{label}</span>
                <div className="val-sim-bar-track">
                  <div
                    className="val-sim-bar-fill"
                    style={{
                      width: (phase === "counting" || phase === "done") ? `${pct}%` : "0%",
                      background: color,
                      transition: "width 1.1s cubic-bezier(.22,1,.36,1)",
                    }}
                  />
                </div>
                <span className="val-sim-bar-pct">{(phase === "counting" || phase === "done") ? `${pct}%` : "—"}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="val-sim-result" style={{ borderColor: demo.color + "40" }}>
          <div className="val-sim-result-eyebrow">Estimated Valuation</div>
          <div className="val-sim-result-val" style={{ color: demo.color }}>
            {phase === "typing" ? (
              <span className="val-result-placeholder">Analysing…</span>
            ) : (
              <>{prefix}{countedVal.toLocaleString()}<span className="val-result-suffix">{suffix}</span></>
            )}
          </div>
          <div className="val-sim-result-mult">
            <span className="val-mult-label">Revenue Multiple</span>
            <span className="val-mult-val" style={{ color: demo.color }}>
              {(phase === "counting" || phase === "done") ? demo.multiple : "—"}
            </span>
          </div>
          <div className="val-sim-progress">
            <div className="val-sim-progress-bar" style={{ background: demo.color, width: phase === "done" ? "100%" : phase === "counting" ? "60%" : "0%" }}/>
          </div>
          <div className="val-sim-confidence">
            {(phase === "counting" || phase === "done") ? "Confidence: High (84th percentile)" : "Processing comparable data…"}
          </div>
          <div className="val-sim-industry-badge" style={{ background: demo.color + "14", color: demo.color, borderColor: demo.color + "30" }}>
            {demo.industry}
          </div>
        </div>
      </div>

      <div className="val-sim-footer">
        {DEMO_CASES.map((_, i) => (
          <button key={i} className={`val-sim-ind ${i === caseIdx ? "is-active" : ""}`} onClick={() => setCaseIdx(i)}
            style={{ background: i === caseIdx ? demo.color : undefined }}/>
        ))}
        <span className="val-sim-hint">Live simulation · refreshes every 5s</span>
      </div>
    </div>
  );
}

function ValuationSection() {
  return (
    <section className="val-section">
      <div className="val-bg" aria-hidden="true">
        <div className="val-bg-grid"/>
        <div className="val-bg-glow1"/>
        <div className="val-bg-glow2"/>
      </div>

      <div className="val-inner">
        <div className="val-copy">
          <div className="val-eyebrow-row">
            <span className="val-eyebrow">Free Tool</span>
          </div>
          <h2 className="val-heading">
            Business Valuation<br/>
            <span className="val-heading-accent">Calculator</span>
          </h2>
          <p className="val-body">
            At SMERGERS, we define Business Valuation as a technique used to capture the
            true value of a business based on similar comparable companies. Our comparable
            data includes publicly trading companies across all stock exchanges in the world
            and private transactions of thousands of small businesses on SMERGERS.
          </p>
          <p className="val-body val-body-2">
            Curious to know the valuation of your business? Try our simple, yet one of the
            most effective, online valuation calculators — <strong>for free</strong>.
          </p>

          <div className="val-feature-list">
            {[
              { icon: "📊", text: "Based on global public & private comps" },
              { icon: "🔒", text: "100% confidential — no data shared" },
              { icon: "⚡", text: "Instant result in under 60 seconds" },
              { icon: "🌍", text: "Covers 900+ industries worldwide" },
            ].map(({ icon, text }) => (
              <div key={text} className="val-feature-item">
                <span className="val-feature-icon">{icon}</span>
                <span className="val-feature-text">{text}</span>
              </div>
            ))}
          </div>

          <a href="/business-valuation-calculator" className="val-cta">
            Try Valuation Tool
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{marginLeft:8}}>
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
          </a>
        </div>

        <div className="val-sim-wrap">
          <ValuationSimulator/>
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// 2. INDUSTRY WATCH
// ══════════════════════════════════════════════════════════════════════════════

const INDUSTRIES = [
  { name: "Fintech & Payments", deals: 214, growth: "+34%", trend: "up", avg: "NGN 1.2 Bn", tag: "Hot", color: "#1A56DB" },
  { name: "Healthcare & Telemedicine", deals: 178, growth: "+28%", trend: "up", avg: "NGN 680 Mn", tag: "Rising", color: "#10B981" },
  { name: "Food & Beverage", deals: 312, growth: "+12%", trend: "up", avg: "NGN 320 Mn", tag: "Steady", color: "#F5A623" },
  { name: "EdTech & Training", deals: 96, growth: "+41%", trend: "up", avg: "USD 450 K", tag: "Breakout", color: "#7C3AED" },
  { name: "Logistics & Transport", deals: 143, growth: "+9%", trend: "up", avg: "NGN 540 Mn", tag: "Steady", color: "#0EA5E9" },
  { name: "Real Estate & PropTech", deals: 187, growth: "-3%", trend: "down", avg: "NGN 2.1 Bn", tag: "Watch", color: "#F97316" },
  { name: "Agriculture & Agro-processing", deals: 229, growth: "+18%", trend: "up", avg: "NGN 410 Mn", tag: "Rising", color: "#059669" },
  { name: "Retail & E-commerce", deals: 155, growth: "+6%", trend: "up", avg: "NGN 290 Mn", tag: "Steady", color: "#DC2626" },
];

function IndustryWatch() {
  const [sortBy, setSortBy] = useState<"deals" | "growth">("deals");
  const sorted = [...INDUSTRIES].sort((a, b) =>
    sortBy === "deals"
      ? b.deals - a.deals
      : parseFloat(b.growth) - parseFloat(a.growth)
  );

  return (
    <section className="iw-section">
      <div className="iw-inner">
        <div className="iw-header">
          <div>
            <span className="iw-eyebrow">Market Intelligence</span>
            <h2 className="iw-heading">Industry Watch <span className="iw-heading-sub">— Q2 2026</span></h2>
          </div>
          <div className="iw-controls">
            <span className="iw-sort-label">Sort by</span>
            <div className="iw-sort-btns">
              <button className={`iw-sort-btn ${sortBy === "deals" ? "is-active" : ""}`} onClick={() => setSortBy("deals")}>Deal Volume</button>
              <button className={`iw-sort-btn ${sortBy === "growth" ? "is-active" : ""}`} onClick={() => setSortBy("growth")}>Growth Rate</button>
            </div>
          </div>
        </div>

        <div className="iw-table-wrap">
          <div className="iw-table-head">
            <span>Industry</span>
            <span>Active Deals</span>
            <span>YoY Growth</span>
            <span>Avg. Ask</span>
            <span>Signal</span>
          </div>
          {sorted.map((ind, i) => (
            <div className="iw-table-row" key={ind.name} style={{ animationDelay: `${i * 0.04}s` }}>
              <div className="iw-row-name">
                <span className="iw-row-bar" style={{ background: ind.color }}/>
                {ind.name}
              </div>
              <div className="iw-row-deals">{ind.deals.toLocaleString()}</div>
              <div className={`iw-row-growth ${ind.trend === "up" ? "is-up" : "is-down"}`}>
                {ind.trend === "up" ? "▲" : "▼"} {ind.growth}
              </div>
              <div className="iw-row-avg">{ind.avg}</div>
              <div>
                <span className="iw-tag" style={{ background: ind.color + "14", color: ind.color, borderColor: ind.color + "30" }}>
                  {ind.tag}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="iw-footer-note">
          Data sourced from SMERGERS platform listings and verified transactions. Updated weekly.
          <a href="/blog/industry-trends" className="iw-more-link">View full report →</a>
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// 3. HOW IT WORKS
// ══════════════════════════════════════════════════════════════════════════════

const GUIDE_STEPS = [
  { num: "01", icon: "📋", color: "#1A56DB", title: "Create Your Profile", desc: "Register as a business owner, investor, buyer, or advisor. Our AI-assisted profile builder helps you present the right information.", link: "/register", linkLabel: "Register Free" },
  { num: "02", icon: "🔍", color: "#F5A623", title: "Discover Matches", desc: "Our intelligent matching engine connects you with verified parties that meet your exact criteria — industry, deal size, geography.", link: "/how-it-works", linkLabel: "How Matching Works" },
  { num: "03", icon: "🤝", color: "#10B981", title: "Connect Confidentially", desc: "Express interest and initiate confidential conversations. Your identity remains private until you choose to disclose.", link: "/how-to/due-diligence", linkLabel: "Due Diligence Guide" },
  { num: "04", icon: "📈", color: "#7C3AED", title: "Close the Deal", desc: "Finalize your transaction with support from vetted M&A advisors, lawyers, and financial consultants on the platform.", link: "/company/success-stories", linkLabel: "Success Stories" },
];

const GUIDE_RESOURCES = [
  { icon: "📖", label: "How to Sell a Business", href: "/how-to/sell-a-business" },
  { icon: "💰", label: "How to Raise Capital", href: "/how-to/find-investors" },
  { icon: "🏢", label: "How to Buy a Business", href: "/how-to/buy-a-business" },
  { icon: "📊", label: "How to Value a Business", href: "/how-to/value-a-business" },
  { icon: "🔎", label: "Due Diligence Checklist", href: "/how-to/due-diligence" },
  { icon: "🤝", label: "Franchise Your Brand", href: "/how-to/franchise-business" },
];

function SMERGERSGuide() {
  return (
    <section className="guide-section">
      <div className="guide-inner">
        <div className="guide-header">
          <div>
            <span className="guide-eyebrow">Platform Guide</span>
            <h2 className="guide-heading">How SMERGERS Works</h2>
            <p className="guide-subhead">From discovery to deal close — four focused steps.</p>
          </div>
          <a href="/company/how-it-works" className="guide-header-link">
            Full Platform Tour →
          </a>
        </div>

        <div className="guide-steps">
          {GUIDE_STEPS.map((step, i) => (
            <div className="guide-step" key={step.num} style={{ animationDelay: `${i * 0.09}s` }}>
              <div className="guide-step-num" style={{ color: step.color, borderColor: step.color + "28" }}>
                {step.num}
              </div>
              <div className="guide-step-icon" style={{ background: step.color + "12", color: step.color }}>
                {step.icon}
              </div>
              <h3 className="guide-step-title">{step.title}</h3>
              <p className="guide-step-desc">{step.desc}</p>
              <a href={step.link} className="guide-step-link" style={{ color: step.color }}>
                {step.linkLabel}
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" style={{marginLeft:4}}>
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
                </svg>
              </a>
              {i < GUIDE_STEPS.length - 1 && <div className="guide-connector" aria-hidden="true"/>}
            </div>
          ))}
        </div>

        <div className="guide-resources">
          <div className="guide-res-label">Quick Guides</div>
          <div className="guide-res-grid">
            {GUIDE_RESOURCES.map((r) => (
              <a key={r.label} href={r.href} className="guide-res-item">
                <span className="guide-res-icon">{r.icon}</span>
                <span className="guide-res-text">{r.label}</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="guide-res-arr">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// 4. TESTIMONIALS
// ══════════════════════════════════════════════════════════════════════════════

const TESTIMONIALS = [
  { id: 1, quote: "SMERGERS connected us with a strategic buyer in Dubai within 3 weeks of listing. The process was transparent and confidential — exactly what we needed.", name: "Taiwo Adeyemi", role: "Founder & CEO", company: "TechBridge Nigeria Ltd", avatar: "TA", color: "#1A56DB", deal: "Full Sale · NGN 2.4 Bn", flag: "🇳🇬" },
  { id: 2, quote: "We found our ideal manufacturing investment through SMERGERS. The pre-screening saved us months of due diligence — every lead was serious and well-documented.", name: "Rajesh Pillai", role: "Managing Director", company: "Meridian Capital Partners", avatar: "RP", color: "#F5A623", deal: "Investment · USD 3.2 Mn", flag: "🇮🇳" },
  { id: 3, quote: "As an M&A advisor, SMERGERS has become my primary deal flow source for African SME transactions. The quality of listings is consistently high.", name: "Adaeze Okafor", role: "Senior M&A Advisor", company: "Okafor & Partners", avatar: "AO", color: "#10B981", deal: "Advisory · 14 closed deals", flag: "🇳🇬" },
  { id: 4, quote: "We raised growth capital from an investor in Riyadh for our Lagos food business. The platform made cross-border transactions feel simple and secure.", name: "Kolade Benson", role: "Co-founder", company: "QuickBite Express", avatar: "KB", color: "#7C3AED", deal: "Partial Stake · NGN 800 Mn", flag: "🇳🇬" },
  { id: 5, quote: "SMERGERS helped us franchise our brand into three new countries in under a year. The investor-matching is genuinely precise — not just noise.", name: "Priya Sharma", role: "Head of Expansion", company: "EduBridge Academy", avatar: "PS", color: "#F97316", deal: "Franchise · 12 new units", flag: "🇬🇭" },
  { id: 6, quote: "The valuation tool gave us a realistic benchmark before negotiations. We closed 8% above our initial ask. That's real value.", name: "James Whitfield", role: "Principal", company: "Whitfield Capital Group", avatar: "JW", color: "#0EA5E9", deal: "Business Loan · GBP 4.5 Mn", flag: "🇬🇧" },
];

function TestimonialCard({ t }: { t: typeof TESTIMONIALS[0] }) {
  return (
    <div className="tst-card">
      <div className="tst-card-top">
        <div className="tst-quote-mark" style={{ color: t.color }}>"</div>
        <span className="tst-flag">{t.flag}</span>
      </div>
      <p className="tst-quote">{t.quote}</p>
      <div className="tst-deal-badge" style={{ background: t.color + "12", color: t.color, borderColor: t.color + "28" }}>
        {t.deal}
      </div>
      <div className="tst-person">
        <div className="tst-avatar" style={{ background: t.color + "18", color: t.color, borderColor: t.color + "28" }}>
          {t.avatar}
        </div>
        <div className="tst-person-info">
          <span className="tst-name">{t.name}</span>
          <span className="tst-role">{t.role}</span>
          <span className="tst-company">{t.company}</span>
        </div>
      </div>
    </div>
  );
}

function TestimonialsSection() {
  const PER_PAGE = 3;
  const { page, prev, next, pageItems, totalPages, canPrev, canNext } = usePageNav(TESTIMONIALS, PER_PAGE);

  return (
    <section className="tst-section">
      <div className="tst-inner">
        <div className="tst-header">
          <div>
            <span className="tst-eyebrow">Success Stories</span>
            <h2 className="tst-heading">What Our Members Say</h2>
            <p className="tst-subhead">2,800+ deals closed. Real outcomes from real businesses.</p>
          </div>
          <div className="tst-nav">
            <Arrow onClick={prev} disabled={!canPrev} dir="prev"/>
            <Arrow onClick={next} disabled={!canNext} dir="next"/>
          </div>
        </div>

        <div className="ms-float-grid ms-grid-3col" key={page}>
          {pageItems.map((t, i) => (
            <div key={t.id} className="ms-float-item" style={{ animationDelay: `${i * 0.09}s` }}>
              <TestimonialCard t={t}/>
            </div>
          ))}
        </div>

        <div className="tst-footer">
          <Dots total={totalPages} current={page}/>
          <a href="/company/testimonials" className="tst-all-link">
            Read All Testimonials →
          </a>
        </div>

        <div className="tst-stats-bar">
          {[
            { num: "2,800+", label: "Deals Closed" },
            { num: "4.8/5", label: "Average Rating" },
            { num: "110+", label: "Countries Represented" },
            { num: "NGN 450 Bn+", label: "Total Deal Value" },
          ].map(({ num, label }) => (
            <div key={label} className="tst-stat-item">
              <span className="tst-stat-num">{num}</span>
              <span className="tst-stat-label">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ROOT EXPORT
// ══════════════════════════════════════════════════════════════════════════════

export default function AdditionalSections() {
  return (
    <>
      <style>{`
       
        :root {
          --max-w: 82rem;
          --blue: #1A56DB; --blue-d: #1444B8;
          --accent: #F5A623; --accent-d: #D4891A;
          --green: #10B981; --purple: #7C3AED;
          --orange: #F97316; --teal: #0EA5E9;
          --text: #0f1e36; --text-2: #4a5568; --text-3: #8896a8;
          --border: #e2e6ed; --surface: #f4f6f9; --bg: #ffffff;
          --dark: #0b1629; --dark-2: #0f1e36;
          --font-sans: 'Inter', system-ui, sans-serif;
          --font-display: 'Poppins', 'Inter', sans-serif;
          --font-serif: 'Playfair Display', Georgia, serif;
          --r4: 4px; --r6: 6px; --r8: 8px;
          --shadow-card: 0 1px 2px rgba(0,0,0,.06), 0 2px 8px rgba(0,0,0,.04);
          --shadow-hover: 0 5px 22px rgba(0,0,0,.10), 0 1px 5px rgba(0,0,0,.05);
          --t: 180ms cubic-bezier(.4,0,.2,1);
        }

        /* Float animation */
        @keyframes msFloatIn {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .ms-float-item { animation: msFloatIn 0.4s cubic-bezier(.22,1,.36,1) both; }
        .ms-float-grid { display: grid; gap: 12px; }
        .ms-grid-3col { grid-template-columns: repeat(3, 1fr); }
        .ms-arrow {
          width: 30px; height: 30px; border-radius: var(--r4);
          background: #fff; border: 1px solid var(--border);
          color: var(--text-2); cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all var(--t); flex-shrink: 0;
        }
        .ms-arrow:hover:not(:disabled) { background: var(--blue); color: #fff; border-color: var(--blue); }
        .ms-arrow:disabled { opacity: .3; cursor: not-allowed; }
        .ms-dots { display: flex; gap: 5px; align-items: center; }
        .ms-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--border); transition: all var(--t); }
        .ms-dot-active { background: var(--blue); transform: scale(1.2); }

        /* ══════ VALUATION SECTION ══════ */
        .val-section {
          position: relative; overflow: hidden;
          background: var(--dark); padding: 64px 0;
          border-top: 1px solid rgba(255,255,255,.07);
          font-family: var(--font-sans);
        }
        .val-bg { position: absolute; inset: 0; pointer-events: none; }
        .val-bg-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,.028) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.028) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        .val-bg-glow1 {
          position: absolute; top: -100px; left: -80px;
          width: 480px; height: 480px; border-radius: 50%;
          background: radial-gradient(circle, rgba(26,86,219,.14) 0%, transparent 65%);
        }
        .val-bg-glow2 {
          position: absolute; bottom: -80px; right: -60px;
          width: 360px; height: 360px; border-radius: 50%;
          background: radial-gradient(circle, rgba(245,166,35,.10) 0%, transparent 65%);
        }
        .val-inner {
          position: relative; z-index: 1;
          max-width: var(--max-w); margin: 0 auto; padding: 0 24px;
          display: grid; grid-template-columns: 1fr 1fr; gap: 52px; align-items: center;
        }
        .val-copy { display: flex; flex-direction: column; gap: 16px; }
        .val-eyebrow-row { display: flex; gap: 10px; align-items: center; }
        .val-eyebrow {
          display: inline-block; font-size: 10px; font-weight: 700;
          letter-spacing: 1.3px; text-transform: uppercase;
          background: rgba(245,166,35,.15); color: var(--accent);
          border: 1px solid rgba(245,166,35,.28); border-radius: 100px; padding: 2px 10px;
        }
        .val-heading {
          font-family: var(--font-display); font-size: clamp(24px, 2.8vw, 38px);
          font-weight: 800; line-height: 1.1; color: #fff; letter-spacing: -.7px;
        }
        .val-heading-accent {
          font-family: var(--font-serif); font-style: italic;
          background: linear-gradient(130deg, #F5A623, #F97316);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .val-body { font-size: 13px; color: rgba(255,255,255,.56); line-height: 1.7; }
        .val-body-2 strong { color: rgba(255,255,255,.82); }
        .val-feature-list { display: flex; flex-direction: column; gap: 8px; }
        .val-feature-item {
          display: flex; align-items: center; gap: 10px;
          padding: 8px 11px; background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.07);
          border-radius: var(--r4); transition: background var(--t);
        }
        .val-feature-item:hover { background: rgba(255,255,255,.07); }
        .val-feature-icon { font-size: 15px; flex-shrink: 0; }
        .val-feature-text { font-size: 12.5px; color: rgba(255,255,255,.72); font-weight: 500; }
        .val-cta {
          display: inline-flex; align-items: center; text-decoration: none;
          background: var(--accent); color: #fff; font-weight: 700;
          font-size: 13px; padding: 10px 20px; border-radius: var(--r6);
          width: fit-content; letter-spacing: .1px;
          transition: background var(--t), box-shadow var(--t), transform var(--t);
        }
        .val-cta:hover { background: var(--accent-d); box-shadow: 0 5px 18px rgba(245,166,35,.38); transform: translateY(-2px); }

        .val-sim-wrap { display: flex; flex-direction: column; }
        .val-sim {
          background: #0d1b2e; border: 1px solid rgba(255,255,255,.1);
          border-radius: 0; overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,.5), 0 4px 12px rgba(0,0,0,.3);
        }
        .val-sim-topbar {
          display: flex; align-items: center; gap: 10px;
          padding: 8px 14px; background: rgba(255,255,255,.04);
          border-bottom: 1px solid rgba(255,255,255,.07);
        }
        .val-sim-dots-row { display: flex; gap: 5px; }
        .val-sim-dot-r { width: 9px; height: 9px; border-radius: 50%; background: #ef4444; }
        .val-sim-dot-y { width: 9px; height: 9px; border-radius: 50%; background: #F5A623; }
        .val-sim-dot-g { width: 9px; height: 9px; border-radius: 50%; background: #10B981; }
        .val-sim-title-bar {
          flex: 1; font-size: 11px; font-weight: 600; color: rgba(255,255,255,.45);
          letter-spacing: .3px; text-align: center;
        }
        .val-sim-live {
          font-size: 9.5px; font-weight: 700; color: #10B981;
          letter-spacing: .5px; animation: pulse-live 2s ease infinite;
        }
        @keyframes pulse-live { 0%,100% { opacity: 1; } 50% { opacity: .5; } }
        .val-sim-body { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
        .val-sim-form {
          padding: 15px; border-right: 1px solid rgba(255,255,255,.06);
          display: flex; flex-direction: column; gap: 11px;
        }
        .val-sim-row { display: flex; flex-direction: column; gap: 4px; }
        .val-sim-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .val-sim-label {
          font-size: 9.5px; font-weight: 700; text-transform: uppercase;
          letter-spacing: .7px; color: rgba(255,255,255,.3);
        }
        .val-sim-field {
          background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.09);
          border-radius: var(--r4); padding: 7px 10px;
          font-size: 12.5px; color: rgba(255,255,255,.85); min-height: 32px;
          font-family: var(--font-sans);
        }
        .val-sim-field-sm {
          background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.09);
          border-radius: var(--r4); padding: 7px 10px;
          font-size: 12.5px; color: rgba(255,255,255,.85); min-height: 32px;
        }
        .val-cursor-blink { animation: blink .8s step-end infinite; color: var(--accent); }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        .val-sim-chart-label {
          font-size: 9.5px; font-weight: 700; text-transform: uppercase;
          letter-spacing: .7px; color: rgba(255,255,255,.3);
        }
        .val-sim-bars { display: flex; flex-direction: column; gap: 7px; }
        .val-sim-bar-row { display: flex; align-items: center; gap: 7px; }
        .val-sim-bar-lbl { font-size: 10px; color: rgba(255,255,255,.4); width: 66px; flex-shrink: 0; }
        .val-sim-bar-track { flex: 1; height: 6px; background: rgba(255,255,255,.07); border-radius: 3px; overflow: hidden; }
        .val-sim-bar-fill { height: 100%; border-radius: 3px; }
        .val-sim-bar-pct { font-size: 9.5px; color: rgba(255,255,255,.45); width: 28px; text-align: right; flex-shrink: 0; }
        .val-sim-result {
          padding: 15px; display: flex; flex-direction: column; gap: 11px;
          border-left: 2px solid;
        }
        .val-sim-result-eyebrow {
          font-size: 9.5px; font-weight: 700; text-transform: uppercase;
          letter-spacing: .7px; color: rgba(255,255,255,.3);
        }
        .val-sim-result-val {
          font-family: var(--font-display);
          font-size: 26px; font-weight: 900; line-height: 1; letter-spacing: -1px;
          min-height: 30px;
        }
        .val-result-placeholder {
          font-size: 16px; font-weight: 600; color: rgba(255,255,255,.3);
          animation: pulse-live 1s ease infinite;
        }
        .val-result-suffix { font-size: 16px; font-weight: 600; margin-left: 2px; }
        .val-sim-result-mult {
          display: flex; flex-direction: column; gap: 2px;
          background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.07);
          border-radius: var(--r4); padding: 8px 10px;
        }
        .val-mult-label { font-size: 9.5px; color: rgba(255,255,255,.3); font-weight: 600; text-transform: uppercase; letter-spacing: .5px; }
        .val-mult-val { font-family: var(--font-display); font-size: 18px; font-weight: 800; }
        .val-sim-progress { height: 3px; background: rgba(255,255,255,.07); border-radius: 2px; overflow: hidden; }
        .val-sim-progress-bar { height: 100%; border-radius: 2px; transition: width 1.4s cubic-bezier(.22,1,.36,1); }
        .val-sim-confidence { font-size: 10.5px; color: rgba(255,255,255,.38); }
        .val-sim-industry-badge {
          display: inline-block; font-size: 10px; font-weight: 700;
          border: 1px solid; border-radius: 100px; padding: 3px 10px;
          width: fit-content;
        }
        .val-sim-footer {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 14px; border-top: 1px solid rgba(255,255,255,.06);
          background: rgba(255,255,255,.02);
        }
        .val-sim-ind {
          width: 7px; height: 7px; border-radius: 50%; background: rgba(255,255,255,.18);
          border: none; cursor: pointer; transition: all var(--t);
        }
        .val-sim-ind.is-active { transform: scale(1.3); }
        .val-sim-hint { font-size: 9.5px; color: rgba(255,255,255,.22); margin-left: auto; }

        /* ══════ INDUSTRY WATCH ══════ */
        .iw-section {
          padding: 52px 0; background: var(--surface);
          border-top: 1px solid var(--border); font-family: var(--font-sans);
        }
        .iw-inner { max-width: var(--max-w); margin: 0 auto; padding: 0 24px; }
        .iw-header {
          display: flex; align-items: flex-end; justify-content: space-between;
          gap: 20px; margin-bottom: 22px;
        }
        .iw-eyebrow {
          display: inline-block; font-size: 10px; font-weight: 700; letter-spacing: 1.3px;
          text-transform: uppercase; color: var(--blue); background: #eef3fd;
          border-radius: 100px; padding: 2px 9px; margin-bottom: 8px;
        }
        .iw-heading {
          font-family: var(--font-display); font-size: clamp(19px, 2.2vw, 28px);
          font-weight: 800; line-height: 1.1; color: var(--text); letter-spacing: -.5px;
        }
        .iw-heading-sub { font-size: clamp(14px, 1.5vw, 18px); color: var(--text-3); font-weight: 500; }
        .iw-controls { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
        .iw-sort-label { font-size: 11.5px; font-weight: 600; color: var(--text-3); }
        .iw-sort-btns { display: flex; border: 1px solid var(--border); border-radius: 0; overflow: hidden; }
        .iw-sort-btn {
          padding: 6px 13px; font-size: 12px; font-weight: 600; cursor: pointer;
          background: none; border: none; color: var(--text-3);
          font-family: var(--font-sans); transition: all var(--t);
        }
        .iw-sort-btn.is-active { background: var(--blue); color: #fff; }
        .iw-sort-btn:first-child { border-right: 1px solid var(--border); }
        .iw-table-wrap { border: 1px solid var(--border); background: var(--bg); }
        .iw-table-head {
          display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
          padding: 9px 16px; background: var(--surface); border-bottom: 1px solid var(--border);
          font-size: 9.5px; font-weight: 700; text-transform: uppercase;
          letter-spacing: .8px; color: var(--text-3);
        }
        .iw-table-row {
          display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
          padding: 11px 16px; border-bottom: 1px solid var(--border);
          align-items: center; font-size: 13px;
          transition: background var(--t);
          animation: msFloatIn .35s ease both;
        }
        .iw-table-row:last-child { border-bottom: none; }
        .iw-table-row:hover { background: var(--surface); }
        .iw-row-name { display: flex; align-items: center; gap: 10px; font-weight: 600; color: var(--text); }
        .iw-row-bar { width: 3px; height: 18px; flex-shrink: 0; }
        .iw-row-deals { font-weight: 700; color: var(--text-2); }
        .iw-row-growth { font-weight: 700; font-size: 12.5px; }
        .iw-row-growth.is-up { color: #10B981; }
        .iw-row-growth.is-down { color: #ef4444; }
        .iw-row-avg { font-size: 12.5px; color: var(--text-2); }
        .iw-tag {
          display: inline-block; font-size: 9.5px; font-weight: 700;
          letter-spacing: .4px; border: 1px solid; border-radius: 100px; padding: 2px 9px;
        }
        .iw-footer-note {
          margin-top: 12px; font-size: 11.5px; color: var(--text-3);
          display: flex; align-items: center; gap: 12px;
        }
        .iw-more-link {
          color: var(--blue); font-weight: 600; text-decoration: none;
          transition: color var(--t);
        }
        .iw-more-link:hover { color: var(--blue-d); }

        /* ══════ GUIDE ══════ */
        .guide-section {
          padding: 56px 0; background: var(--bg);
          border-top: 1px solid var(--border); font-family: var(--font-sans);
        }
        .guide-inner { max-width: var(--max-w); margin: 0 auto; padding: 0 24px; }
        .guide-header {
          display: flex; align-items: flex-end; justify-content: space-between;
          gap: 20px; margin-bottom: 30px;
        }
        .guide-eyebrow {
          display: inline-block; font-size: 10px; font-weight: 700; letter-spacing: 1.3px;
          text-transform: uppercase; color: var(--blue); background: #eef3fd;
          border-radius: 100px; padding: 2px 9px; margin-bottom: 8px;
        }
        .guide-heading {
          font-family: var(--font-display); font-size: clamp(20px, 2.4vw, 30px);
          font-weight: 800; line-height: 1.1; color: var(--text); letter-spacing: -.5px;
        }
        .guide-subhead { font-size: 13px; color: var(--text-3); margin-top: 5px; }
        .guide-header-link {
          text-decoration: none; color: var(--blue); font-weight: 600;
          font-size: 13px; white-space: nowrap;
          transition: color var(--t); flex-shrink: 0;
        }
        .guide-header-link:hover { color: var(--blue-d); }
        .guide-steps {
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 0; position: relative;
        }
        .guide-step {
          position: relative; padding: 22px 18px 18px;
          border: 1px solid var(--border); background: var(--bg);
          display: flex; flex-direction: column; gap: 9px;
          transition: background var(--t), box-shadow var(--t);
          animation: msFloatIn .4s ease both;
        }
        .guide-step:not(:first-child) { border-left: none; }
        .guide-step:hover { background: var(--surface); }
        .guide-step-num {
          font-family: var(--font-serif); font-size: 28px; font-weight: 700;
          line-height: 1; border: 1.5px solid; width: 44px; height: 44px;
          display: flex; align-items: center; justify-content: center;
          font-style: italic; border-radius: 50%;
        }
        .guide-step-icon {
          width: 36px; height: 36px; border-radius: var(--r6);
          display: flex; align-items: center; justify-content: center; font-size: 17px;
        }
        .guide-step-title {
          font-family: var(--font-display); font-size: 15px; font-weight: 700;
          color: var(--text); letter-spacing: -.15px;
        }
        .guide-step-desc { font-size: 12.5px; color: var(--text-2); line-height: 1.65; flex: 1; }
        .guide-step-link {
          display: inline-flex; align-items: center; font-size: 12px; font-weight: 700;
          text-decoration: none; margin-top: 4px; transition: gap var(--t);
        }
        .guide-step-link:hover { gap: 5px; }
        .guide-connector {
          position: absolute; top: 50px; right: -14px;
          width: 28px; height: 2px; background: var(--border); z-index: 2;
        }
        .guide-resources {
          margin-top: 26px; padding: 18px 18px 14px;
          border: 1px solid var(--border); background: var(--surface);
        }
        .guide-res-label {
          font-size: 9.5px; font-weight: 700; text-transform: uppercase;
          letter-spacing: .9px; color: var(--text-3); margin-bottom: 11px;
        }
        .guide-res-grid {
          display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px;
        }
        .guide-res-item {
          display: flex; align-items: center; gap: 7px;
          text-decoration: none; padding: 8px 10px;
          background: var(--bg); border: 1px solid var(--border); border-radius: var(--r4);
          transition: border-color var(--t), box-shadow var(--t);
        }
        .guide-res-item:hover { border-color: var(--blue); box-shadow: 0 2px 8px rgba(26,86,219,.1); }
        .guide-res-icon { font-size: 14px; flex-shrink: 0; }
        .guide-res-text { font-size: 11.5px; font-weight: 600; color: var(--text-2); line-height: 1.3; flex: 1; }
        .guide-res-arr { color: var(--text-3); flex-shrink: 0; transition: transform var(--t); }
        .guide-res-item:hover .guide-res-arr { transform: translateX(2px); color: var(--blue); }

        /* ══════ TESTIMONIALS ══════ */
        .tst-section {
          padding: 56px 0; background: var(--surface);
          border-top: 1px solid var(--border); font-family: var(--font-sans);
        }
        .tst-inner { max-width: var(--max-w); margin: 0 auto; padding: 0 24px; }
        .tst-header {
          display: flex; align-items: flex-start; justify-content: space-between;
          gap: 20px; margin-bottom: 22px;
        }
        .tst-eyebrow {
          display: inline-block; font-size: 10px; font-weight: 700; letter-spacing: 1.3px;
          text-transform: uppercase; color: var(--accent); background: rgba(245,166,35,.1);
          border-radius: 100px; padding: 2px 9px; margin-bottom: 8px;
        }
        .tst-heading {
          font-family: var(--font-display); font-size: clamp(20px, 2.4vw, 30px);
          font-weight: 800; line-height: 1.1; color: var(--text); letter-spacing: -.5px;
        }
        .tst-subhead { font-size: 13px; color: var(--text-3); margin-top: 5px; }
        .tst-nav { display: flex; gap: 7px; padding-top: 8px; flex-shrink: 0; }
        .tst-card {
          background: var(--bg); border: 1px solid var(--border); border-radius: 0;
          padding: 18px; display: flex; flex-direction: column; gap: 11px;
          height: 100%; box-shadow: var(--shadow-card);
          transition: transform var(--t), box-shadow var(--t), border-color var(--t);
        }
        .tst-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-hover); border-color: #c4d0e8; }
        .tst-card-top { display: flex; align-items: center; justify-content: space-between; }
        .tst-quote-mark { font-family: var(--font-serif); font-size: 48px; line-height: .7; font-style: italic; }
        .tst-flag { font-size: 20px; }
        .tst-quote { font-size: 13px; color: var(--text-2); line-height: 1.7; flex: 1; font-style: italic; }
        .tst-deal-badge {
          display: inline-block; font-size: 10px; font-weight: 700;
          border: 1px solid; border-radius: 100px; padding: 3px 10px; width: fit-content;
        }
        .tst-person { display: flex; align-items: center; gap: 11px; padding-top: 4px; }
        .tst-avatar {
          width: 40px; height: 40px; border-radius: 50%; border: 1.5px solid;
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-display); font-size: 12px; font-weight: 800; flex-shrink: 0;
        }
        .tst-person-info { display: flex; flex-direction: column; gap: 1px; }
        .tst-name { font-size: 13px; font-weight: 700; color: var(--text); }
        .tst-role { font-size: 11px; color: var(--text-3); }
        .tst-company { font-size: 11px; color: var(--text-3); font-style: italic; }
        .tst-footer {
          display: flex; align-items: center; justify-content: space-between;
          margin-top: 18px; padding-top: 14px; border-top: 1px solid var(--border);
        }
        .tst-all-link {
          text-decoration: none; color: var(--blue); font-size: 13px; font-weight: 600;
          transition: color var(--t);
        }
        .tst-all-link:hover { color: var(--blue-d); }
        .tst-stats-bar {
          margin-top: 26px;
          display: grid; grid-template-columns: repeat(4, 1fr);
          border: 1px solid var(--border); background: var(--bg);
        }
        .tst-stat-item {
          display: flex; flex-direction: column; gap: 3px;
          padding: 15px 18px; border-right: 1px solid var(--border);
        }
        .tst-stat-item:last-child { border-right: none; }
        .tst-stat-num { font-family: var(--font-display); font-size: 22px; font-weight: 800; color: var(--blue); letter-spacing: -.5px; }
        .tst-stat-label { font-size: 10.5px; font-weight: 600; color: var(--text-3); text-transform: uppercase; letter-spacing: .5px; }

        @media(max-width:1024px){
          .val-inner { grid-template-columns: 1fr; gap: 36px; }
          .guide-steps { grid-template-columns: repeat(2, 1fr); }
          .guide-steps .guide-step:nth-child(2) { border-left: none; border-top: none; }
          .guide-steps .guide-step:nth-child(3) { border-top: none; }
          .guide-steps .guide-step:nth-child(4) { border-left: none; border-top: none; }
          .guide-connector { display: none; }
          .guide-res-grid { grid-template-columns: repeat(3, 1fr); }
          .ms-grid-3col { grid-template-columns: repeat(2, 1fr); }
          .iw-table-head, .iw-table-row { grid-template-columns: 2fr 1fr 1fr 1fr; }
          .iw-table-head span:nth-child(5), .iw-table-row div:nth-child(5) { display: none; }
          .tst-stats-bar { grid-template-columns: repeat(2, 1fr); }
          .tst-stats-bar .tst-stat-item:nth-child(2) { border-right: none; }
          .tst-stats-bar .tst-stat-item:nth-child(3),
          .tst-stats-bar .tst-stat-item:nth-child(4) { border-top: 1px solid var(--border); }
        }
        @media(max-width:640px){
          .val-section { padding: 48px 0; }
          .val-inner { padding: 0 16px; }
          .val-sim-body { grid-template-columns: 1fr; }
          .val-sim-result { border-left: none; border-top: 1px solid rgba(255,255,255,.08); }
          .iw-inner, .guide-inner, .tst-inner { padding: 0 16px; }
          .iw-header { flex-direction: column; align-items: flex-start; gap: 12px; }
          .iw-table-head, .iw-table-row { grid-template-columns: 2fr 1fr 1fr; }
          .iw-table-head span:nth-child(4), .iw-table-row div:nth-child(4) { display: none; }
          .guide-steps { grid-template-columns: 1fr; }
          .guide-step + .guide-step { border-top: none; }
          .guide-res-grid { grid-template-columns: repeat(2, 1fr); }
          .ms-grid-3col { grid-template-columns: 1fr; }
          .tst-header { flex-direction: column; }
          .tst-stats-bar { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      <ValuationSection/>
      <IndustryWatch/>
      <SMERGERSGuide/>
      <TestimonialsSection/>
    </>
  );
}