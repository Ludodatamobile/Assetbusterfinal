"use client";

import { useState, useEffect, useRef } from "react";

// ─── Count-up ─────────────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 1400, active = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let s: number | null = null;
    const tick = (ts: number) => {
      if (!s) s = ts;
      const p = Math.min((ts - s) / duration, 1);
      setVal(Math.floor((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration, active]);
  return val;
}

function StatPill({ value, suffix, label, color, active }: {
  value: number; suffix: string; label: string; color: string; active: boolean;
}) {
  const n = useCountUp(value, 1400, active);
  return (
    <div className="stat-item">
      <span className="stat-num" style={{ color }}>{n.toLocaleString()}{suffix}</span>
      <span className="stat-lbl">{label}</span>
    </div>
  );
}

// ─── Connection Diagram ───────────────────────────────────────────────────────

function Diagram() {
  const nodes = [
    { id:"biz",     x:16,  y:80,  label:"Businesses\n& Franchises", fill:"#1A56DB", icon:"🏢", r:28 },
    { id:"inv",     x:175, y:16,  label:"Investors",                fill:"#F5A623", icon:"💰", r:22 },
    { id:"lenders", x:272, y:16,  label:"Lenders",                  fill:"#0EA5E9", icon:"🏦", r:22 },
    { id:"adv",     x:370, y:16,  label:"Advisors",                 fill:"#10B981", icon:"🤝", r:22 },
    { id:"buyers",  x:465, y:16,  label:"Buyers",                   fill:"#F97316", icon:"🌐", r:22 },
    { id:"growth",  x:545, y:80,  label:"Growth",                   fill:"#7C3AED", icon:"📈", r:28 },
  ];
  const edges = [
    ["biz","inv"],["biz","lenders"],["biz","adv"],["biz","buyers"],
    ["inv","growth"],["lenders","growth"],["adv","growth"],["buyers","growth"],
  ];
  const get = (id: string) => nodes.find((n) => n.id === id)!;

  return (
    <div className="diagram-card">
      <p className="diagram-eyebrow">How It Works</p>
      <svg viewBox="0 0 632 160" className="diagram-svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <marker id="arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 z" fill="#cbd5e1"/>
          </marker>
        </defs>
        {edges.map(([f,t]) => {
          const a = get(f), b = get(t);
          return (
            <line key={`${f}-${t}`}
              x1={a.x+a.r} y1={a.y+a.r} x2={b.x+b.r} y2={b.y+b.r}
              stroke="#e2e8f0" strokeWidth="1.2" strokeDasharray="4 3"
              markerEnd="url(#arr)"
            />
          );
        })}
        {nodes.map((n) => (
          <g key={n.id} transform={`translate(${n.x},${n.y})`}>
            <circle cx={n.r} cy={n.r} r={n.r} fill={n.fill} opacity=".93"/>
            <circle cx={n.r} cy={n.r} r={n.r} fill="none" stroke="#fff" strokeWidth="1.2" opacity=".2"/>
            <text x={n.r} y={n.r+7} textAnchor="middle" fontSize={n.r===28?16:13}>{n.icon}</text>
            {n.label.split("\n").map((ln, i) => (
              <text key={i} x={n.r} y={n.r*2+13+i*11}
                textAnchor="middle" fontSize="8.5" fill="#64748b"
                fontFamily="'Inter',system-ui,sans-serif" fontWeight="600"
              >{ln}</text>
            ))}
          </g>
        ))}
      </svg>
    </div>
  );
}

// ─── Hero Search ──────────────────────────────────────────────────────────────

function HeroSearch() {
  const [q,   setQ]   = useState("");
  const [foc, setFoc] = useState(false);
  const [cat, setCat] = useState("Businesses");
  const cats = ["Businesses","Franchises","Investors","Advisors","Lenders"];

  return (
    <div className={`hs-wrap ${foc ? "hs-focused" : ""}`}>
      <div className="hs-tabs">
        {cats.map((c) => (
          <button key={c} className={`hs-tab ${cat===c?"hs-tab-active":""}`} onClick={() => setCat(c)}>
            {c}
          </button>
        ))}
      </div>
      <form className="hs-row" onSubmit={(e) => e.preventDefault()} role="search">
        <span className="hs-icon-wrap">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="#94a3b8" strokeWidth="2.2"/>
            <path d="M16.5 16.5L21 21" stroke="#94a3b8" strokeWidth="2.2" strokeLinecap="round"/>
          </svg>
        </span>
        <input
          type="search"
          className="hs-input"
          placeholder={`Search ${cat} for sale, funding, opportunities…`}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFoc(true)}
          onBlur={() => setFoc(false)}
          aria-label={`Search ${cat}`}
        />
        <button type="submit" className="hs-submit">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{marginRight:5}}>
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2.2"/>
            <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
          </svg>
          Search
        </button>
      </form>
    </div>
  );
}

// ─── Feature Card ─────────────────────────────────────────────────────────────

function FeatureCard({ icon, label, title, desc, href, accent, delay }: {
  icon: string; label: string; title: string; desc: string;
  href: string; accent: string; delay: string;
}) {
  return (
    <a href={href} className="feat-card" style={{ animationDelay: delay }}>
      <div className="feat-card-top">
        <span className="feat-icon" style={{ background: accent+"14", color: accent }}>{icon}</span>
        <span className="feat-label" style={{ color: accent, background: accent+"10" }}>{label}</span>
      </div>
      <p className="feat-title">{title}</p>
      <p className="feat-desc">{desc}</p>
      <div className="feat-footer">
        <span className="feat-link" style={{ color: accent }}>
          Explore
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" style={{marginLeft:3}}>
            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
          </svg>
        </span>
      </div>
    </a>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function HeroSection() {
  const [statsOn, setStatsOn] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setStatsOn(true), 500);
    return () => clearTimeout(t);
  }, []);

  // navbar: 52px top + 36px bottom = 88px
  const NAV_H = 88;

  return (
    <>
      <style>{`
     
        :root {
          --max-w: 82rem;
          --accent:   #F5A623;
          --accent-d: #D4891A;
          --blue:     #1A56DB;
          --blue-d:   #1444B8;
          --green:    #10B981;
          --orange:   #F97316;
          --purple:   #7C3AED;
          --text:     #0f1e36;
          --text-2:   #4a5568;
          --text-3:   #8896a8;
          --border:   #e2e6ed;
          --surface:  #f4f6f9;
          --bg:       #ffffff;
          --font-sans:    'Inter', system-ui, sans-serif;
          --font-display: 'Poppins', 'Inter', sans-serif;
          --font-serif:   'Playfair Display', Georgia, serif;
          --r4: 4px; --r6: 6px; --r8: 8px;
          --shadow-card: 0 1px 2px rgba(0,0,0,.06), 0 2px 10px rgba(0,0,0,.05);
          --shadow-lg:   0 4px 20px rgba(0,0,0,.10), 0 1px 5px rgba(0,0,0,.05);
          --shadow-xl:   0 10px 36px rgba(0,0,0,.12), 0 2px 8px rgba(0,0,0,.06);
          --t: 180ms cubic-bezier(.4,0,.2,1);
        }

        .hero-page {
          font-family: var(--font-sans);
          background: #f8fafc;
          min-height: 100vh;
        }

        /* ── Hero Split ── */
        .hero-split {
          position: relative; width: 100%;
          min-height: 100vh;
          display: flex; overflow: hidden;
        }
        .hero-split-left {
          position: absolute; inset: 0 48% 0 0;
          background: #0b1629; z-index: 0;
        }
        .hero-split-left::after {
          content: ''; position: absolute;
          top: 0; right: -50px; bottom: 0; width: 100px;
          background: inherit;
          clip-path: polygon(0 0, 50px 0, 0 100%);
        }
        .hero-glow-amber {
          position: absolute; top: -100px; left: -100px;
          width: 420px; height: 420px; border-radius: 50%;
          background: radial-gradient(circle, rgba(245,166,35,.14) 0%, transparent 65%);
          pointer-events: none; z-index: 1;
        }
        .hero-glow-blue {
          position: absolute; bottom: -60px; left: 28%;
          width: 280px; height: 280px; border-radius: 50%;
          background: radial-gradient(circle, rgba(26,86,219,.11) 0%, transparent 65%);
          pointer-events: none; z-index: 1;
        }
        .hero-texture {
          position: absolute; inset: 0 48% 0 0;
          background-image: repeating-linear-gradient(
            -45deg,
            rgba(255,255,255,.02) 0px, rgba(255,255,255,.02) 1px,
            transparent 1px, transparent 18px
          );
          pointer-events: none; z-index: 2;
        }
        .hero-split-right {
          position: absolute; inset: 0 0 0 52%;
          background: #f8fafc; z-index: 0;
        }
        .hero-inner {
          position: relative; z-index: 3;
          max-width: var(--max-w); margin: 0 auto;
          padding: 0 24px; width: 100%;
          display: grid; grid-template-columns: 52fr 48fr;
          min-height: 100vh; align-items: center;
        }

        /* ── Left copy ── */
        .hero-copy {
          padding: ${NAV_H + 36}px 36px 52px 0;
          display: flex; flex-direction: column; gap: 22px;
        }

        .hero-badge {
          display: inline-flex; align-items: center; gap: 7px;
          background: rgba(245,166,35,.12);
          border: 1px solid rgba(245,166,35,.28);
          border-radius: 100px; padding: 4px 12px 4px 9px;
          width: fit-content;
          opacity: 0; animation: fadeUp .5s ease .05s forwards;
        }
        .badge-pulse {
          width: 7px; height: 7px; border-radius: 50%;
          background: var(--accent);
          animation: pulse 2.4s ease infinite;
        }
        @keyframes pulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(245,166,35,.4); }
          50%      { box-shadow: 0 0 0 7px rgba(245,166,35,0); }
        }
        .badge-label {
          font-size: 10.5px; font-weight: 700;
          color: var(--accent); letter-spacing: .4px; text-transform: uppercase;
        }

        .hero-eyebrow {
          font-size: 10.5px; font-weight: 600; letter-spacing: 1.4px;
          text-transform: uppercase; color: rgba(255,255,255,.34);
          opacity: 0; animation: fadeUp .5s ease .11s forwards;
        }

        .hero-h1 {
          font-family: var(--font-display);
          font-size: clamp(28px, 3.4vw, 46px);
          font-weight: 800; line-height: 1.08;
          color: #ffffff; letter-spacing: -1px;
          opacity: 0; animation: fadeUp .55s ease .17s forwards;
        }
        .hero-h1 .h1-accent {
          font-family: var(--font-serif); font-style: italic;
          background: linear-gradient(130deg, #F5A623 20%, #F97316 80%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text; font-weight: 700;
        }

        .hero-body {
          font-size: clamp(13px, 1.3vw, 14.5px);
          color: rgba(255,255,255,.56); line-height: 1.7;
          max-width: 420px;
          opacity: 0; animation: fadeUp .55s ease .25s forwards;
        }

        .hero-ctas {
          display: flex; flex-wrap: wrap; gap: 9px;
          opacity: 0; animation: fadeUp .55s ease .32s forwards;
        }
        .cta {
          display: inline-flex; align-items: center; gap: 6px;
          text-decoration: none; font-family: var(--font-sans);
          font-size: 12.5px; font-weight: 700;
          border-radius: var(--r6); padding: 10px 18px;
          cursor: pointer; border: none; white-space: nowrap;
          letter-spacing: .12px;
          transition: transform .13s ease, box-shadow .13s ease;
        }
        .cta:hover { transform: translateY(-2px); }
        .cta-arr { font-size: 13px; transition: transform .13s ease; }
        .cta:hover .cta-arr { transform: translateX(3px); }
        .cta-primary {
          background: linear-gradient(135deg, #1A56DB 0%, #2563EB 100%);
          color: #fff; box-shadow: 0 3px 14px rgba(26,86,219,.38);
        }
        .cta-primary:hover { box-shadow: 0 6px 22px rgba(26,86,219,.5); }
        .cta-amber {
          background: linear-gradient(135deg, #F5A623 0%, #F97316 100%);
          color: #fff; box-shadow: 0 3px 14px rgba(245,166,35,.34);
        }
        .cta-amber:hover { box-shadow: 0 6px 22px rgba(245,166,35,.48); }
        .cta-outline {
          background: rgba(255,255,255,.07); color: rgba(255,255,255,.82);
          border: 1px solid rgba(255,255,255,.16);
        }
        .cta-outline:hover { background: rgba(255,255,255,.12); color: #fff; }

        /* Stats */
        .hero-stats {
          display: flex; gap: 0; flex-wrap: wrap;
          padding-top: 20px; border-top: 1px solid rgba(255,255,255,.09);
          opacity: 0; animation: fadeUp .55s ease .4s forwards;
        }
        .stat-item {
          display: flex; flex-direction: column; gap: 2px;
          padding: 0 22px 0 0; margin-right: 22px;
          border-right: 1px solid rgba(255,255,255,.1);
        }
        .stat-item:last-child { border-right: none; margin-right: 0; padding-right: 0; }
        .stat-num {
          font-family: var(--font-display);
          font-size: 22px; font-weight: 800; letter-spacing: -.8px;
        }
        .stat-lbl {
          font-size: 9.5px; font-weight: 600;
          color: rgba(255,255,255,.38);
          text-transform: uppercase; letter-spacing: .6px;
        }

        /* ── Right visual ── */
        .hero-visual {
          padding: ${NAV_H + 32}px 0 44px 42px;
          display: flex; flex-direction: column; gap: 14px;
          opacity: 0; animation: slideRight .65s ease .28s forwards;
        }
        @keyframes slideRight {
          from { opacity:0; transform:translateX(24px); }
          to   { opacity:1; transform:translateX(0); }
        }

        .diagram-card {
          background: #fff; border: 1px solid var(--border);
          border-radius: 0; padding: 16px 14px 12px;
          box-shadow: var(--shadow-card);
        }
        .diagram-eyebrow {
          font-size: 10px; font-weight: 700;
          text-transform: uppercase; letter-spacing: .9px;
          color: var(--text-3); margin-bottom: 10px;
        }
        .diagram-svg { width: 100%; height: auto; display: block; }

        .feat-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
        .feat-card {
          background: #fff; border: 1px solid var(--border);
          border-radius: 0; padding: 13px 12px;
          text-decoration: none; display: flex; flex-direction: column; gap: 8px;
          box-shadow: var(--shadow-card);
          opacity: 0; animation: fadeUp .45s ease forwards;
          transition: transform var(--t), box-shadow var(--t), border-color var(--t);
        }
        .feat-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg); border-color: #c4d0e8;
        }
        .feat-card-top { display: flex; align-items: center; justify-content: space-between; gap: 7px; }
        .feat-icon {
          width: 30px; height: 30px; border-radius: var(--r6);
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; flex-shrink: 0;
        }
        .feat-label {
          font-size: 8.5px; font-weight: 700; letter-spacing: .4px;
          text-transform: uppercase; border-radius: 100px; padding: 2px 7px;
        }
        .feat-title { font-size: 12px; font-weight: 700; color: var(--text); line-height: 1.3; }
        .feat-desc { font-size: 11px; color: var(--text-3); line-height: 1.5; flex: 1; }
        .feat-footer { margin-top: 2px; }
        .feat-link {
          display: inline-flex; align-items: center;
          font-size: 11px; font-weight: 700;
          transition: gap var(--t);
        }
        .feat-card:hover .feat-link { gap: 5px; }

        /* ── Search section ── */
        .search-section {
          max-width: var(--max-w); margin: -22px auto 0;
          padding: 0 24px; position: relative; z-index: 10;
        }
        .hs-wrap {
          background: #fff; border: 1px solid var(--border);
          border-radius: 0; box-shadow: var(--shadow-xl); overflow: hidden;
          transition: box-shadow var(--t);
        }
        .hs-focused {
          box-shadow: var(--shadow-xl), 0 0 0 2px rgba(26,86,219,.1);
        }
        .hs-tabs {
          display: flex; gap: 0; background: var(--surface);
          border-bottom: 1px solid var(--border); padding: 0 6px;
        }
        .hs-tab {
          background: none; border: none; cursor: pointer;
          font-family: var(--font-sans); font-size: 12px; font-weight: 600;
          color: var(--text-3); padding: 9px 14px;
          border-bottom: 2px solid transparent; margin-bottom: -1px;
          transition: color var(--t), border-color var(--t);
          white-space: nowrap; letter-spacing: .1px;
        }
        .hs-tab:hover { color: var(--text-2); }
        .hs-tab-active { color: var(--blue); border-bottom-color: var(--blue); }
        .hs-row {
          display: flex; align-items: center;
          padding: 6px 7px 6px 16px; gap: 9px;
        }
        .hs-icon-wrap { display: flex; flex-shrink: 0; }
        .hs-input {
          flex: 1; border: none; outline: none; background: none;
          font-size: 13.5px; color: var(--text); padding: 8px 9px;
          font-family: var(--font-sans);
        }
        .hs-input::placeholder { color: var(--text-3); }
        .hs-input::-webkit-search-cancel-button { display: none; }
        .hs-submit {
          display: inline-flex; align-items: center;
          background: linear-gradient(135deg, var(--blue), #2563EB);
          color: #fff; border: none; cursor: pointer;
          font-size: 13px; font-weight: 700;
          padding: 9px 20px; border-radius: var(--r6);
          font-family: var(--font-sans); letter-spacing: .1px;
          transition: box-shadow var(--t), transform var(--t);
          white-space: nowrap;
        }
        .hs-submit:hover { box-shadow: 0 3px 14px rgba(26,86,219,.38); transform: translateY(-1px); }

        /* ── Trust bar ── */
        .trust-bar {
          border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
          background: var(--surface); padding: 11px 0; margin-top: 16px;
        }
        .trust-inner {
          max-width: var(--max-w); margin: 0 auto; padding: 0 24px;
          display: flex; align-items: center; gap: 9px; flex-wrap: wrap;
        }
        .trust-eyebrow {
          font-size: 9.5px; font-weight: 700; letter-spacing: .8px;
          text-transform: uppercase; color: var(--text-3); margin-right: 4px; white-space: nowrap;
        }
        .trust-chip {
          background: #fff; border: 1px solid var(--border); border-radius: 100px;
          padding: 3px 12px; font-size: 11px; font-weight: 600; color: var(--text-2);
          box-shadow: 0 1px 2px rgba(0,0,0,.04);
        }

        /* ── Get Started ── */
        .gs-section {
          max-width: var(--max-w); margin: 0 auto; padding: 40px 24px 52px;
        }
        .gs-header {
          display: flex; align-items: center; gap: 16px; margin-bottom: 22px;
        }
        .gs-heading {
          font-family: var(--font-display);
          font-size: 20px; font-weight: 800; color: var(--text); letter-spacing: -.4px; white-space: nowrap;
        }
        .gs-rule { flex: 1; height: 1px; background: var(--border); }
        .gs-sub { font-size: 12.5px; color: var(--text-3); white-space: nowrap; }

        .gs-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; }
        .gs-card {
          position: relative; overflow: hidden; border-radius: 0;
          padding: 24px 20px 20px;
          display: flex; flex-direction: column; gap: 12px;
          text-decoration: none;
          transition: transform .18s ease, box-shadow .18s ease;
        }
        .gs-card::before {
          content: ''; position: absolute; inset: 0; border-radius: 0;
          border: 1px solid rgba(255,255,255,.13); pointer-events: none;
        }
        .gs-card::after {
          content: ''; position: absolute;
          top: -36px; right: -36px; width: 110px; height: 110px; border-radius: 50%;
          background: rgba(255,255,255,.07); pointer-events: none;
        }
        .gs-card:hover { transform: translateY(-4px); box-shadow: 0 12px 36px rgba(0,0,0,.22); }
        .gs-c1 { background: linear-gradient(145deg, #0f2d6b 0%, #1A56DB 60%, #2d72f5 100%); box-shadow: 0 3px 20px rgba(26,86,219,.24); }
        .gs-c2 { background: linear-gradient(145deg, #92400e 0%, #D97706 55%, #F5A623 100%); box-shadow: 0 3px 20px rgba(217,119,6,.24); }
        .gs-c3 { background: linear-gradient(145deg, #064e3b 0%, #059669 55%, #10B981 100%); box-shadow: 0 3px 20px rgba(5,150,105,.22); }
        .gs-icon { font-size: 26px; filter: drop-shadow(0 2px 3px rgba(0,0,0,.18)); }
        .gs-card-title {
          font-family: var(--font-display); font-size: 15px; font-weight: 700; color: #fff; letter-spacing: -.15px;
        }
        .gs-card-desc { font-size: 12.5px; color: rgba(255,255,255,.75); line-height: 1.55; flex: 1; }
        .gs-btn {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,.13);
          border: 1px solid rgba(255,255,255,.2); border-radius: var(--r6);
          padding: 8px 14px; font-size: 12.5px; font-weight: 700; color: #fff; margin-top: 2px;
          transition: background .13s ease;
        }
        .gs-card:hover .gs-btn { background: rgba(255,255,255,.22); }

        @keyframes fadeUp {
          from { opacity:0; transform:translateY(18px); }
          to   { opacity:1; transform:translateY(0); }
        }

        @media (max-width: 960px) {
          .hero-split-left  { inset: 0; }
          .hero-split-right { display: none; }
          .hero-texture     { inset: 0; }
          .hero-inner { grid-template-columns: 1fr; min-height: unset; }
          .hero-copy  { padding: ${NAV_H + 36}px 0 32px; }
          .hero-visual { padding: 0 0 44px; }
          .feat-grid  { grid-template-columns: 1fr 1fr 1fr; }
          .gs-grid    { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .hero-inner   { padding: 0 16px; }
          .hero-copy    { padding: ${NAV_H + 24}px 0 28px; }
          .hero-visual  { display: none; }
          .hero-ctas    { flex-direction: column; }
          .cta          { justify-content: center; }
          .stat-item    { padding: 0 18px 0 0; margin-right: 18px; }
          .search-section { padding: 0 14px; }
          .gs-section   { padding: 32px 14px 40px; }
          .feat-grid    { grid-template-columns: 1fr; }
          .trust-inner  { padding: 0 14px; }
          .hs-tab       { padding: 8px 10px; font-size: 11.5px; }
        }
      `}</style>

      <div className="hero-page" ref={ref}>

        {/* Hero Split */}
        <section className="hero-split" aria-label="Hero">
          <div className="hero-split-left"  aria-hidden="true"/>
          <div className="hero-glow-amber"  aria-hidden="true"/>
          <div className="hero-glow-blue"   aria-hidden="true"/>
          <div className="hero-texture"     aria-hidden="true"/>
          <div className="hero-split-right" aria-hidden="true"/>

          <div className="hero-inner">
            <div className="hero-copy">
              <div className="hero-badge">
                <span className="badge-pulse" aria-hidden="true"/>
                <span className="badge-label">Africa &amp; Asia's Premier SME Marketplace</span>
              </div>

              <p className="hero-eyebrow">Investment Banking for SMEs</p>

              <h1 className="hero-h1">
                Connect Businesses<br/>
                with <span className="h1-accent">Investors,<br/>Buyers &amp; Advisors</span>
              </h1>

              <p className="hero-body">
                Thousands of business owners franchise, sell, or raise growth capital through SMERGERS —
                the trusted platform built for SMEs worldwide.
              </p>

              <div className="hero-ctas">
                <a href="/businesses-for-sale" className="cta cta-primary">
                  Browse Businesses <span className="cta-arr">→</span>
                </a>
                <a href="/add-profile" className="cta cta-amber">
                  List Your Business <span className="cta-arr">→</span>
                </a>
                <a href="/investors-buyers" className="cta cta-outline">
                  Find Investors
                </a>
              </div>

              <div className="hero-stats">
                <StatPill value={15000} suffix="+" label="Businesses Listed"  color="#F5A623" active={statsOn}/>
                <StatPill value={47000} suffix="+" label="Investors & Buyers" color="#60A5FA" active={statsOn}/>
                <StatPill value={110}   suffix="+" label="Countries"          color="#34D399" active={statsOn}/>
                <StatPill value={2800}  suffix="+" label="Deals Closed"       color="#F87171" active={statsOn}/>
              </div>
            </div>

            <div className="hero-visual">
              <Diagram/>
              <div className="feat-grid">
                <FeatureCard icon="🏢" label="Buy"       title="Businesses for Sale"   desc="Vetted SMEs across all industries"               href="/businesses-for-sale" accent="#1A56DB" delay=".44s"/>
                <FeatureCard icon="🏪" label="Franchise" title="Franchise Opportunities" desc="Established brands seeking partners"            href="/franchises"          accent="#F5A623" delay=".51s"/>
                <FeatureCard icon="💼" label="Invest"    title="Investors & Lenders"   desc="Active capital providers ready to deploy"        href="/investors-buyers"    accent="#10B981" delay=".58s"/>
              </div>
            </div>
          </div>
        </section>

        {/* Search */}
        <div className="search-section">
          <HeroSearch/>
        </div>

        {/* Trust Bar */}
        <div className="trust-bar">
          <div className="trust-inner">
            <span className="trust-eyebrow">As seen in</span>
            {["Forbes","Bloomberg","Economic Times","Business Day NG","TechCrunch","The Hindu"].map((n) => (
              <span className="trust-chip" key={n}>{n}</span>
            ))}
          </div>
        </div>

        {/* Get Started */}
        <section className="gs-section" aria-label="Get Started">
          <div className="gs-header">
            <h2 className="gs-heading">Get Started</h2>
            <div className="gs-rule" aria-hidden="true"/>
            <span className="gs-sub">Choose your path below</span>
          </div>
          <div className="gs-grid">
            <a href="/add-profile?type=business" className="gs-card gs-c1">
              <span className="gs-icon">🏢</span>
              <p className="gs-card-title">Sell or Raise Funds</p>
              <p className="gs-card-desc">Create a business profile and reach thousands of investors, buyers, and advisors actively looking for opportunities.</p>
              <span className="gs-btn">Create Business Profile →</span>
            </a>
            <a href="/add-profile?type=franchise" className="gs-card gs-c2">
              <span className="gs-icon">🏪</span>
              <p className="gs-card-title">Franchise Your Brand</p>
              <p className="gs-card-desc">Connect your franchise with motivated partners and franchisees across Africa, Asia, and beyond.</p>
              <span className="gs-btn">Create Franchise Profile →</span>
            </a>
            <a href="/investors-buyers" className="gs-card gs-c3">
              <span className="gs-icon">💰</span>
              <p className="gs-card-title">Invest or Acquire</p>
              <p className="gs-card-desc">Browse live deals as an investor, buyer, lender, or advisor. Connect directly with business owners.</p>
              <span className="gs-btn">View Opportunities →</span>
            </a>
          </div>
        </section>

      </div>
    </>
  );
}