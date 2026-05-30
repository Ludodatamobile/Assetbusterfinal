"use client";

import { useState } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface TeamMember {
  name: string;
  role: string;
  image: string;
  bio: string;
  location: string;
}

interface SuccessStory {
  id: number;
  title: string;
  company: string;
  industry: string;
  dealSize: string;
  buyer: string;
  seller: string;
  timeframe: string;
  summary: string;
  challenge: string;
  solution: string;
  outcome: string;
  testimonial: string;
  testimonialAuthor: string;
  testimonialRole: string;
}

interface PressItem {
  id: number;
  title: string;
  outlet: string;
  date: string;
  excerpt: string;
  url: string;
  type: "article" | "interview" | "press-release" | "award";
}

interface JobListing {
  id: number;
  title: string;
  department: string;
  location: string;
  type: "Full-time" | "Part-time" | "Contract";
  remote: boolean;
  description: string;
}

// ─── Data ──────────────────────────────────────────────────────────────────────

const TEAM_MEMBERS: TeamMember[] = [
  {
    name: "Chidi Okonkwo",
    role: "Founder & CEO",
    image: "CO",
    bio: "Former investment banker with 15+ years in M&A across Africa. Led transactions worth over $2B before founding Asset Busters to democratize business acquisitions.",
    location: "Lagos, Nigeria"
  },
  {
    name: "Amara Nwosu",
    role: "Chief Product Officer",
    image: "AN",
    bio: "Product leader who scaled multiple fintech platforms across emerging markets. Previously at Interswitch and Flutterwave.",
    location: "Nairobi, Kenya"
  },
  {
    name: "Kwame Mensah",
    role: "Head of Marketplace",
    image: "KM",
    bio: "Built and scaled online marketplaces in West Africa. Expert in seller acquisition and buyer engagement strategies.",
    location: "Accra, Ghana"
  },
  {
    name: "Fatima Hassan",
    role: "Chief Legal Officer",
    image: "FH",
    bio: "Corporate M&A attorney with expertise in cross-border transactions. Previously with Clifford Chance and Allen & Overy.",
    location: "Dubai, UAE"
  }
];

const SUCCESS_STORIES: SuccessStory[] = [
  {
    id: 1,
    title: "Lagos Tech Consultancy Acquired by Indian PE Firm",
    company: "TechBridge Consulting",
    industry: "IT Services",
    dealSize: "$2.3M",
    buyer: "Mumbai Growth Partners (India)",
    seller: "Founder seeking exit after 8 years",
    timeframe: "4 months from listing to closing",
    summary: "Leading IT consultancy in Lagos with 45 employees and blue-chip client roster acquired by Indian private equity firm seeking African entry point.",
    challenge: "Seller needed to find a buyer who would retain the team and brand while providing growth capital. Previous conversations with local buyers fell through due to financing issues.",
    solution: "Asset Busters matched the business with Mumbai Growth Partners through our cross-border investor network. We facilitated virtual due diligence and connected both parties with experienced M&A counsel for the transaction.",
    outcome: "Deal closed at 5.2x EBITDA. Founder received 70% cash upfront with 30% earnout over 2 years. All 45 employees retained with improved benefits package. Business has since expanded to Kenya and South Africa.",
    testimonial: "Asset Busters opened doors I didn't even know existed. Finding an international buyer seemed impossible until their platform matched us with the perfect partner. The team guided us through every complexity of a cross-border deal.",
    testimonialAuthor: "Adeola Ogunlade",
    testimonialRole: "Former Owner, TechBridge Consulting"
  },
  {
    id: 2,
    title: "Family Manufacturing Business Passes to Next Generation",
    company: "Accra Metal Works",
    industry: "Manufacturing",
    dealSize: "$850K",
    buyer: "Founder's son + angel investor",
    seller: "Retiring founder (68 years old)",
    timeframe: "6 months from listing to closing",
    summary: "35-year-old steel fabrication business transitioned from retiring founder to son through creative deal structure involving outside investor.",
    challenge: "Founder's son wanted to take over but couldn't afford the full purchase price. Traditional lenders hesitant to finance family transitions. Needed to preserve legacy while ensuring fair value for retiring founder.",
    solution: "Asset Busters structured a partnership deal where the son acquired 60% with help from an angel investor who took 40%. Seller provided financing for 25% of purchase price. Deal included 12-month transition period with founder as paid advisor.",
    outcome: "Smooth transition preserved 32 jobs and company legacy. Son is now CEO with clear path to buy out angel investor over 5 years. Founder received fair value and maintains involvement as advisor.",
    testimonial: "This platform saved our family business. Without Asset Busters' creative deal structuring and investor matching, we would have had to sell to a competitor who planned to shut us down and absorb our clients.",
    testimonialAuthor: "Kwabena Mensah Jr.",
    testimonialRole: "Current Owner, Accra Metal Works"
  },
  {
    id: 3,
    title: "E-Commerce Startup Acquired by Regional Retail Chain",
    company: "Glamora Beauty",
    industry: "E-Commerce / Beauty",
    dealSize: "$1.4M",
    buyer: "BeautyWorld Retail (South Africa)",
    seller: "Two co-founders",
    timeframe: "3 months from listing to closing",
    summary: "Online beauty products retailer with 18,000 active customers acquired by brick-and-mortar chain seeking digital capabilities.",
    challenge: "Fast-growing startup burning cash needed either new funding or acquisition. Co-founders disagreed on future direction. Time-sensitive as runway was only 4 months.",
    solution: "Asset Busters ran a rapid auction process, presenting the opportunity to 12 strategic buyers and 8 financial buyers. BeautyWorld emerged as best fit, valuing both the customer base and digital infrastructure.",
    outcome: "Deal closed in record 3 months at 1.2x revenue multiple. Both co-founders stayed for 6-month transition then moved to new ventures. Glamora now powers BeautyWorld's online channel across 6 African countries.",
    testimonial: "We were days away from shutting down when Asset Busters connected us with BeautyWorld. Their speed and professionalism turned what could have been a disaster into a successful exit for everyone involved.",
    testimonialAuthor: "Zainab Bello",
    testimonialRole: "Co-Founder, Glamora Beauty"
  }
];

const PRESS_ITEMS: PressItem[] = [
  {
    id: 1,
    title: "Asset Busters Facilitates Record $18M Business Acquisition in Nigeria",
    outlet: "TechCrunch Africa",
    date: "March 2026",
    excerpt: "The Lagos-based marketplace has now facilitated over $2.4B in total transaction value since launching in 2019, with deal sizes ranging from $50K to $18M.",
    url: "#",
    type: "article"
  },
  {
    id: 2,
    title: "How Asset Busters is Democratizing Business Acquisitions Across Africa",
    outlet: "Financial Times",
    date: "February 2026",
    excerpt: "Interview with CEO Chidi Okonkwo on the platform's mission to make business ownership accessible to the next generation of African entrepreneurs.",
    url: "#",
    type: "interview"
  },
  {
    id: 3,
    title: "Asset Busters Named 'Best M&A Platform' at African FinTech Awards",
    outlet: "African Business Magazine",
    date: "January 2026",
    excerpt: "Recognition for innovation in facilitating cross-border business transactions and connecting investors with opportunities across the continent.",
    url: "#",
    type: "award"
  },
  {
    id: 4,
    title: "Asset Busters Expands to Middle East and South Asia Markets",
    outlet: "Company Press Release",
    date: "December 2025",
    excerpt: "Platform now serves business buyers and sellers in 45+ countries, with dedicated teams in Dubai, Mumbai, and Singapore.",
    url: "#",
    type: "press-release"
  },
  {
    id: 5,
    title: "The Rise of Online Business Marketplaces in Emerging Markets",
    outlet: "Bloomberg",
    date: "November 2025",
    excerpt: "Feature article highlighting Asset Busters as a case study in digital transformation of M&A advisory services.",
    url: "#",
    type: "article"
  }
];

const JOB_LISTINGS: JobListing[] = [
  {
    id: 1,
    title: "Senior M&A Advisor",
    department: "Advisory",
    location: "Lagos, Nigeria",
    type: "Full-time",
    remote: false,
    description: "Lead transaction advisory services for mid-market deals. Minimum 5 years M&A experience required. CFA or MBA preferred."
  },
  {
    id: 2,
    title: "Product Manager - Marketplace",
    department: "Product",
    location: "Remote",
    type: "Full-time",
    remote: true,
    description: "Own the buyer and seller experience on our platform. Build features that increase match quality and transaction velocity. 3+ years product experience in marketplaces or fintech."
  },
  {
    id: 3,
    title: "Business Development Representative",
    department: "Sales",
    location: "Nairobi, Kenya",
    type: "Full-time",
    remote: false,
    description: "Source and onboard quality business sellers across East Africa. Build relationships with business brokers, accountants, and lawyers. Hunter mentality required."
  },
  {
    id: 4,
    title: "Software Engineer - Full Stack",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
    remote: true,
    description: "Build and scale our platform serving thousands of buyers and sellers. React/Next.js, Node.js, PostgreSQL stack. 4+ years experience building production applications."
  }
];

// ─── Components ────────────────────────────────────────────────────────────────

function SectionNav({ activeSection, onSelect }: { activeSection: string; onSelect: (section: string) => void }) {
  const sections = [
    { id: "about", label: "About Us", icon: "🏢" },
    { id: "how-it-works", label: "How It Works", icon: "⚙️" },
    { id: "success-stories", label: "Success Stories", icon: "🏆" },
    { id: "press", label: "Press & Media", icon: "📰" },
    { id: "careers", label: "Careers", icon: "💼" },
    { id: "contact", label: "Contact Us", icon: "📧" }
  ];

  return (
    <nav className="co-section-nav">
      {sections.map(s => (
        <button
          key={s.id}
          className={`co-nav-btn ${activeSection === s.id ? "active" : ""}`}
          onClick={() => {
            onSelect(s.id);
            document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
        >
          <span className="co-nav-icon">{s.icon}</span>
          <span className="co-nav-label">{s.label}</span>
        </button>
      ))}
    </nav>
  );
}

function TeamMemberCard({ member }: { member: TeamMember }) {
  return (
    <div className="co-team-card">
      <div className="co-team-avatar" style={{ background: `linear-gradient(135deg, ${["#1A56DB", "#059669", "#F5A623", "#7C3AED"][Math.floor(Math.random() * 4)]}, ${["#0d47a1", "#047857", "#D4891A", "#6d28d9"][Math.floor(Math.random() * 4)]})` }}>
        <span className="co-team-initials">{member.image}</span>
      </div>
      <h3 className="co-team-name">{member.name}</h3>
      <p className="co-team-role">{member.role}</p>
      <p className="co-team-location">📍 {member.location}</p>
      <p className="co-team-bio">{member.bio}</p>
    </div>
  );
}

function StoryCard({ story }: { story: SuccessStory }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="co-story-card">
      <div className="co-story-header">
        <div className="co-story-meta-row">
          <span className="co-story-industry">{story.industry}</span>
          <span className="co-story-deal-size">{story.dealSize}</span>
        </div>
        <h3 className="co-story-title">{story.title}</h3>
        <p className="co-story-company">{story.company}</p>
      </div>

      <div className="co-story-stats">
        <div className="co-story-stat">
          <span className="co-story-stat-label">Buyer</span>
          <span className="co-story-stat-val">{story.buyer}</span>
        </div>
        <div className="co-story-stat">
          <span className="co-story-stat-label">Timeframe</span>
          <span className="co-story-stat-val">{story.timeframe}</span>
        </div>
      </div>

      <p className="co-story-summary">{story.summary}</p>

      {expanded && (
        <div className="co-story-details">
          <div className="co-story-section">
            <h4 className="co-story-section-title">The Challenge</h4>
            <p className="co-story-section-text">{story.challenge}</p>
          </div>
          <div className="co-story-section">
            <h4 className="co-story-section-title">Our Solution</h4>
            <p className="co-story-section-text">{story.solution}</p>
          </div>
          <div className="co-story-section">
            <h4 className="co-story-section-title">The Outcome</h4>
            <p className="co-story-section-text">{story.outcome}</p>
          </div>
          <div className="co-story-testimonial">
            <p className="co-story-quote">"{story.testimonial}"</p>
            <div className="co-story-author">
              <span className="co-story-author-name">{story.testimonialAuthor}</span>
              <span className="co-story-author-role">{story.testimonialRole}</span>
            </div>
          </div>
        </div>
      )}

      <button className="co-story-toggle" onClick={() => setExpanded(!expanded)}>
        {expanded ? "Show Less" : "Read Full Story"}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
          <path d={expanded ? "M18 15l-6-6-6 6" : "M6 9l6 6 6-6"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}

function PressCard({ item }: { item: PressItem }) {
  const typeColors = {
    article: "#1A56DB",
    interview: "#059669",
    "press-release": "#7C3AED",
    award: "#F5A623"
  };
  const typeLabels = {
    article: "Article",
    interview: "Interview",
    "press-release": "Press Release",
    award: "Award"
  };

  return (
    <a href={item.url} className="co-press-card" target="_blank" rel="noopener noreferrer">
      <div className="co-press-header">
        <span className="co-press-type" style={{ color: typeColors[item.type], background: typeColors[item.type] + "14", borderColor: typeColors[item.type] + "28" }}>
          {typeLabels[item.type]}
        </span>
        <span className="co-press-date">{item.date}</span>
      </div>
      <h3 className="co-press-title">{item.title}</h3>
      <p className="co-press-outlet">{item.outlet}</p>
      <p className="co-press-excerpt">{item.excerpt}</p>
      <span className="co-press-link">
        Read more →
      </span>
    </a>
  );
}

function JobCard({ job }: { job: JobListing }) {
  return (
    <div className="co-job-card">
      <div className="co-job-header">
        <div className="co-job-meta-row">
          <span className="co-job-dept">{job.department}</span>
          {job.remote && <span className="co-job-remote">🌍 Remote</span>}
        </div>
        <h3 className="co-job-title">{job.title}</h3>
        <div className="co-job-details">
          <span className="co-job-detail">📍 {job.location}</span>
          <span className="co-job-detail">⏰ {job.type}</span>
        </div>
      </div>
      <p className="co-job-desc">{job.description}</p>
      <button className="co-job-btn">
        Apply Now
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function CompanyPage() {
  const [activeSection, setActiveSection] = useState("about");
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
  };

  return (
    <>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{
          --mw:82rem;
          --navy:#0f1e36; --t2:#4a5568; --t3:#8896a8;
          --bdr:#e2e6ed; --surf:#f4f6f9; --bg:#fff;
          --blue:#1A56DB; --green:#059669; --purple:#7C3AED;
          --amber:#F5A623; --red:#D42B2B;
          --font:'Poppins','Inter',system-ui,sans-serif;
          --t:180ms cubic-bezier(.4,0,.2,1);
        }

        body{font-family:var(--font);background:var(--surf);color:var(--navy)}

        .co-page{min-height:100vh;padding-top:102px;background:var(--surf)}

        /* ── Hero ── */
        .co-hero{
          background:var(--navy);
          padding:44px 0 0;
          position:relative;overflow:hidden;
          border-bottom:1px solid rgba(255,255,255,.06);
        }
        .co-hero::before{
          content:'';position:absolute;inset:0;
          background:
            radial-gradient(ellipse 60% 70% at 70% 40%, rgba(26,86,219,.12) 0%, transparent 65%),
            radial-gradient(ellipse 50% 65% at 30% 60%, rgba(245,166,35,.09) 0%, transparent 65%);
          pointer-events:none;
        }
        .co-hero-inner{max-width:var(--mw);margin:0 auto;padding:0 28px 36px;position:relative}
        .co-hero-breadcrumb{
          display:flex;align-items:center;gap:6px;margin-bottom:14px;
          font-size:11px;color:rgba(255,255,255,.38);
        }
        .co-hero-breadcrumb a{color:rgba(255,255,255,.55);text-decoration:none;transition:color var(--t)}
        .co-hero-breadcrumb a:hover{color:#fff}
        .co-hero-eyebrow{
          display:inline-flex;align-items:center;gap:7px;
          background:rgba(26,86,219,.2);border:1px solid rgba(26,86,219,.35);
          color:#7aabff;font-size:10px;font-weight:700;
          letter-spacing:1.2px;text-transform:uppercase;
          padding:4px 10px;margin-bottom:12px;
        }
        .co-hero-eyebrow-icon{font-size:13px}
        .co-hero-heading{
          font-size:clamp(28px,3.6vw,44px);
          font-weight:800;color:#fff;letter-spacing:-.9px;
          margin-bottom:10px;line-height:1.1;
        }
        .co-hero-heading span{color:#F5A623}
        .co-hero-desc{
          font-size:13.5px;color:rgba(255,255,255,.52);line-height:1.75;
          max-width:620px;margin-bottom:24px;
        }

        /* ── Section Nav ── */
        .co-section-nav{
          display:flex;gap:6px;padding:16px 0;
          border-top:1px solid rgba(255,255,255,.08);
          overflow-x:auto;
        }
        .co-section-nav::-webkit-scrollbar{height:3px}
        .co-section-nav::-webkit-scrollbar-thumb{background:rgba(255,255,255,.2)}
        .co-nav-btn{
          display:flex;align-items:center;gap:7px;
          background:rgba(255,255,255,.09);
          border:1px solid rgba(255,255,255,.15);
          color:rgba(255,255,255,.72);
          font-size:11.5px;font-weight:600;
          padding:7px 14px;cursor:pointer;
          font-family:var(--font);transition:all var(--t);
          white-space:nowrap;letter-spacing:.2px;
        }
        .co-nav-btn:hover{background:rgba(255,255,255,.16);color:#fff}
        .co-nav-btn.active{background:var(--amber);color:#fff;border-color:var(--amber)}
        .co-nav-icon{font-size:14px}

        /* ── Main ── */
        .co-main{max-width:var(--mw);margin:0 auto;padding:32px 28px 64px}

        /* ── Section Base ── */
        .co-section{
          background:var(--bg);border:1px solid var(--bdr);
          padding:36px 32px;margin-bottom:24px;
          scroll-margin-top:120px;
        }
        .co-section-title{
          font-size:24px;font-weight:800;color:var(--navy);
          letter-spacing:-.6px;margin-bottom:10px;line-height:1.2;
        }
        .co-section-subtitle{
          font-size:13px;color:var(--t3);line-height:1.7;
          max-width:680px;margin-bottom:28px;
        }

        /* ── About Section ── */
        .co-mission-box{
          background:linear-gradient(135deg,#eef3fd,#f0f9ff);
          border:2px solid #c4d5f9;
          border-left:4px solid var(--blue);
          padding:24px 28px;margin-bottom:32px;
        }
        .co-mission-title{
          font-size:15px;font-weight:700;color:var(--navy);
          margin-bottom:10px;letter-spacing:-.3px;
        }
        .co-mission-text{
          font-size:13px;color:var(--t2);line-height:1.8;
        }

        .co-values-grid{
          display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));
          gap:20px;margin-bottom:32px;
        }
        .co-value-card{
          background:var(--surf);border:1px solid var(--bdr);
          padding:20px;
        }
        .co-value-icon{
          width:44px;height:44px;
          background:linear-gradient(135deg,var(--blue),#0d47a1);
          border-radius:6px;
          display:flex;align-items:center;justify-content:center;
          font-size:20px;margin-bottom:14px;
        }
        .co-value-title{
          font-size:14px;font-weight:700;color:var(--navy);
          margin-bottom:8px;letter-spacing:-.2px;
        }
        .co-value-text{
          font-size:12px;color:var(--t2);line-height:1.7;
        }

        .co-team-grid{
          display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));
          gap:20px;
        }
        .co-team-card{
          background:var(--surf);border:1px solid var(--bdr);
          padding:24px;text-align:center;
          transition:all var(--t);
        }
        .co-team-card:hover{border-color:var(--blue);box-shadow:0 6px 24px rgba(26,86,219,.12)}
        .co-team-avatar{
          width:72px;height:72px;
          border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          margin:0 auto 14px;
          box-shadow:0 4px 14px rgba(0,0,0,.12);
        }
        .co-team-initials{font-size:22px;font-weight:800;color:#fff;letter-spacing:-.5px}
        .co-team-name{font-size:15px;font-weight:700;color:var(--navy);margin-bottom:4px;letter-spacing:-.3px}
        .co-team-role{font-size:12px;color:var(--blue);font-weight:600;margin-bottom:8px}
        .co-team-location{font-size:11px;color:var(--t3);margin-bottom:12px}
        .co-team-bio{font-size:11.5px;color:var(--t2);line-height:1.65}

        /* ── How It Works ── */
        .co-steps-grid{display:flex;flex-direction:column;gap:20px}
        .co-step-card{
          background:var(--surf);border:1px solid var(--bdr);
          padding:24px;display:flex;gap:20px;
          transition:all var(--t);
        }
        .co-step-card:hover{border-color:var(--blue);box-shadow:0 4px 18px rgba(26,86,219,.1)}
        .co-step-number{
          width:48px;height:48px;flex-shrink:0;
          background:linear-gradient(135deg,var(--blue),#0d47a1);
          border-radius:6px;
          display:flex;align-items:center;justify-content:center;
          font-size:20px;font-weight:800;color:#fff;
          box-shadow:0 4px 14px rgba(26,86,219,.2);
        }
        .co-step-content{flex:1}
        .co-step-title{font-size:15px;font-weight:700;color:var(--navy);margin-bottom:8px;letter-spacing:-.3px}
        .co-step-text{font-size:12.5px;color:var(--t2);line-height:1.75}

        /* ── Success Stories ── */
        .co-stories-grid{display:flex;flex-direction:column;gap:24px}
        .co-story-card{
          background:var(--surf);border:1px solid var(--bdr);
          padding:24px;
        }
        .co-story-header{margin-bottom:18px}
        .co-story-meta-row{display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap}
        .co-story-industry{
          font-size:10px;font-weight:700;color:var(--blue);
          background:#eef3fd;border:1px solid #c4d5f9;
          padding:4px 10px;text-transform:uppercase;letter-spacing:.6px;
        }
        .co-story-deal-size{
          font-size:11px;font-weight:800;color:var(--green);
          background:#ecfdf5;border:1px solid #a7f3d0;
          padding:4px 10px;letter-spacing:.3px;
        }
        .co-story-title{
          font-size:17px;font-weight:700;color:var(--navy);
          margin-bottom:6px;letter-spacing:-.4px;line-height:1.3;
        }
        .co-story-company{font-size:12px;color:var(--t3);font-weight:500}
        .co-story-stats{
          display:grid;grid-template-columns:1fr 1fr;gap:12px;
          padding:14px;background:var(--bg);border:1px solid var(--bdr);
          margin-bottom:16px;
        }
        .co-story-stat{display:flex;flex-direction:column;gap:3px}
        .co-story-stat-label{font-size:10px;color:var(--t3);text-transform:uppercase;letter-spacing:.5px;font-weight:600}
        .co-story-stat-val{font-size:12px;font-weight:600;color:var(--navy)}
        .co-story-summary{font-size:12.5px;color:var(--t2);line-height:1.75;margin-bottom:16px}
        .co-story-details{padding-top:16px;border-top:1px solid var(--bdr)}
        .co-story-section{margin-bottom:18px}
        .co-story-section-title{font-size:13px;font-weight:700;color:var(--navy);margin-bottom:8px;letter-spacing:-.2px}
        .co-story-section-text{font-size:12px;color:var(--t2);line-height:1.75}
        .co-story-testimonial{
          background:linear-gradient(135deg,#fffbeb,#fef3c7);
          border:1px solid #fde68a;
          border-left:3px solid var(--amber);
          padding:18px 20px;margin-top:18px;
        }
        .co-story-quote{font-size:12.5px;color:var(--navy);line-height:1.75;font-style:italic;margin-bottom:12px}
        .co-story-author{display:flex;flex-direction:column;gap:2px}
        .co-story-author-name{font-size:12px;font-weight:700;color:var(--navy)}
        .co-story-author-role{font-size:10.5px;color:var(--t3)}
        .co-story-toggle{
          display:flex;align-items:center;gap:6px;
          background:var(--blue);border:none;color:#fff;
          font-size:11.5px;font-weight:700;
          padding:9px 16px;cursor:pointer;
          font-family:var(--font);transition:all var(--t);
          width:100%;justify-content:center;
          margin-top:16px;letter-spacing:.2px;
        }
        .co-story-toggle:hover{background:#1444B8}

        /* ── Press ── */
        .co-press-grid{
          display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));
          gap:18px;
        }
        .co-press-card{
          background:var(--surf);border:1px solid var(--bdr);
          padding:20px;text-decoration:none;
          display:flex;flex-direction:column;gap:12px;
          transition:all var(--t);
        }
        .co-press-card:hover{border-color:var(--blue);box-shadow:0 4px 18px rgba(26,86,219,.1);transform:translateY(-2px)}
        .co-press-header{display:flex;align-items:center;justify-content:space-between;gap:10px}
        .co-press-type{
          font-size:9px;font-weight:700;
          text-transform:uppercase;letter-spacing:.7px;
          border:1px solid;padding:3px 8px;
        }
        .co-press-date{font-size:10.5px;color:var(--t3);font-weight:500}
        .co-press-title{
          font-size:14px;font-weight:700;color:var(--navy);
          line-height:1.4;letter-spacing:-.2px;
        }
        .co-press-outlet{font-size:11.5px;color:var(--blue);font-weight:600}
        .co-press-excerpt{font-size:11.5px;color:var(--t2);line-height:1.7;flex:1}
        .co-press-link{
          font-size:11.5px;font-weight:700;color:var(--blue);
          margin-top:4px;
        }

        /* ── Careers ── */
        .co-careers-intro{
          background:linear-gradient(135deg,#eef3fd,#f0f9ff);
          border:1px solid #c4d5f9;
          padding:24px 28px;margin-bottom:28px;
        }
        .co-careers-intro-title{font-size:16px;font-weight:700;color:var(--navy);margin-bottom:10px;letter-spacing:-.3px}
        .co-careers-intro-text{font-size:12.5px;color:var(--t2);line-height:1.75}

        .co-perks-grid{
          display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
          gap:16px;margin-bottom:32px;
        }
        .co-perk-item{
          background:var(--surf);border:1px solid var(--bdr);
          padding:16px;display:flex;align-items:flex-start;gap:12px;
        }
        .co-perk-icon{font-size:20px;flex-shrink:0}
        .co-perk-content{flex:1}
        .co-perk-title{font-size:12.5px;font-weight:700;color:var(--navy);margin-bottom:4px;letter-spacing:-.2px}
        .co-perk-text{font-size:11px;color:var(--t3);line-height:1.6}

        .co-jobs-grid{display:flex;flex-direction:column;gap:16px}
        .co-job-card{
          background:var(--surf);border:1px solid var(--bdr);
          padding:20px;
        }
        .co-job-header{margin-bottom:14px}
        .co-job-meta-row{display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap}
        .co-job-dept{
          font-size:10px;font-weight:700;color:var(--purple);
          background:#faf5ff;border:1px solid #e9d5ff;
          padding:4px 10px;text-transform:uppercase;letter-spacing:.6px;
        }
        .co-job-remote{
          font-size:10px;font-weight:700;color:var(--green);
          background:#ecfdf5;border:1px solid #a7f3d0;
          padding:4px 10px;
        }
        .co-job-title{font-size:15px;font-weight:700;color:var(--navy);margin-bottom:8px;letter-spacing:-.3px}
        .co-job-details{display:flex;gap:14px;flex-wrap:wrap}
        .co-job-detail{font-size:11.5px;color:var(--t3);font-weight:500}
        .co-job-desc{font-size:12px;color:var(--t2);line-height:1.75;margin-bottom:14px}
        .co-job-btn{
          display:inline-flex;align-items:center;gap:6px;
          background:var(--blue);border:none;color:#fff;
          font-size:11.5px;font-weight:700;
          padding:9px 18px;cursor:pointer;
          font-family:var(--font);transition:all var(--t);
          letter-spacing:.2px;
        }
        .co-job-btn:hover{background:#1444B8}

        /* ── Contact ── */
        .co-contact-grid{
          display:grid;grid-template-columns:1fr 1.2fr;gap:32px;
        }
        .co-contact-info{display:flex;flex-direction:column;gap:24px}
        .co-contact-item{
          background:var(--surf);border:1px solid var(--bdr);
          padding:18px 20px;
        }
        .co-contact-item-title{
          font-size:13px;font-weight:700;color:var(--navy);
          margin-bottom:8px;letter-spacing:-.2px;
        }
        .co-contact-item-text{font-size:12px;color:var(--t2);line-height:1.7}
        .co-contact-item-text a{color:var(--blue);text-decoration:none;font-weight:600}
        .co-contact-item-text a:hover{text-decoration:underline}

        .co-contact-form{
          background:var(--surf);border:1px solid var(--bdr);
          padding:28px;
        }
        .co-form-title{font-size:17px;font-weight:700;color:var(--navy);margin-bottom:18px;letter-spacing:-.4px}
        .co-form-group{margin-bottom:16px}
        .co-form-label{
          display:block;font-size:11.5px;font-weight:700;
          color:var(--navy);margin-bottom:6px;
          text-transform:uppercase;letter-spacing:.5px;
        }
        .co-form-input,.co-form-textarea{
          width:100%;background:var(--bg);border:1px solid var(--bdr);
          padding:10px 14px;font-size:12.5px;color:var(--navy);
          font-family:var(--font);transition:all var(--t);
        }
        .co-form-input:focus,.co-form-textarea:focus{
          outline:none;border-color:var(--blue);
          box-shadow:0 0 0 3px rgba(26,86,219,.1);
        }
        .co-form-textarea{resize:vertical;min-height:120px}
        .co-form-submit{
          width:100%;background:var(--blue);border:none;color:#fff;
          font-size:12.5px;font-weight:700;
          padding:12px 20px;cursor:pointer;
          font-family:var(--font);transition:all var(--t);
          letter-spacing:.2px;margin-top:8px;
        }
        .co-form-submit:hover{background:#1444B8}

        @media(max-width:1024px){
          .co-contact-grid{grid-template-columns:1fr}
        }
        @media(max-width:640px){
          .co-main{padding:24px 16px 48px}
          .co-hero-inner{padding:0 16px 28px}
          .co-section{padding:24px 18px}
          .co-section-nav{padding:12px 0}
          .co-step-card{flex-direction:column}
          .co-values-grid,.co-team-grid,.co-press-grid,.co-perks-grid{grid-template-columns:1fr}
        }
      `}</style>

      <div className="co-page">

        {/* ── Hero ── */}
        <section className="co-hero">
          <div className="co-hero-inner">
            <nav className="co-hero-breadcrumb" aria-label="Breadcrumb">
              <a href="/">Home</a>
              <span>/</span>
              <span>Company</span>
            </nav>

            <div className="co-hero-eyebrow">
              <span className="co-hero-eyebrow-icon">🏢</span>
              About Asset Busters
            </div>
            <h1 className="co-hero-heading">
              Building Africa's <span>Premier</span><br/>
              Business Marketplace
            </h1>
            <p className="co-hero-desc">
              Since 2019, we've been democratizing business ownership by connecting verified
              buyers with quality sellers across 45+ countries. Our mission is to make every
              business transaction transparent, efficient, and successful.
            </p>

            <SectionNav activeSection={activeSection} onSelect={setActiveSection}/>
          </div>
        </section>

        {/* ── Main ── */}
        <main className="co-main">

          {/* ── About Us ── */}
          <section id="about" className="co-section">
            <h2 className="co-section-title">About Asset Busters</h2>
            <p className="co-section-subtitle">
              We're on a mission to transform how businesses change hands across emerging markets,
              making the acquisition process accessible, transparent, and successful for everyone.
            </p>

            <div className="co-mission-box">
              <h3 className="co-mission-title">Our Mission</h3>
              <p className="co-mission-text">
                To democratize business ownership by creating the world's most trusted marketplace
                for buying and selling businesses in emerging markets. We believe every entrepreneur
                deserves access to quality acquisition opportunities and every business owner deserves
                a fair, efficient exit process.
              </p>
            </div>

            <h3 className="co-section-title" style={{ fontSize: "18px", marginBottom: "18px" }}>Our Values</h3>
            <div className="co-values-grid">
              <div className="co-value-card">
                <div className="co-value-icon">🤝</div>
                <h4 className="co-value-title">Trust & Transparency</h4>
                <p className="co-value-text">
                  Every business is verified. Every transaction is documented. No hidden fees.
                  No surprises. We build trust through radical transparency.
                </p>
              </div>
              <div className="co-value-card">
                <div className="co-value-icon">🎯</div>
                <h4 className="co-value-title">Customer Success</h4>
                <p className="co-value-text">
                  Your success is our success. We measure ourselves by closed deals, satisfied
                  clients, and long-term business outcomes—not just platform metrics.
                </p>
              </div>
              <div className="co-value-card">
                <div className="co-value-icon">🌍</div>
                <h4 className="co-value-title">Pan-African Vision</h4>
                <p className="co-value-text">
                  We're building for the entire continent and beyond. Every feature considers
                  the unique needs of emerging market entrepreneurs.
                </p>
              </div>
              <div className="co-value-card">
                <div className="co-value-icon">⚡</div>
                <h4 className="co-value-title">Speed & Efficiency</h4>
                <p className="co-value-text">
                  Time is money in M&A. We leverage technology to compress transaction timelines
                  while maintaining quality and thoroughness.
                </p>
              </div>
            </div>

            <h3 className="co-section-title" style={{ fontSize: "18px", marginBottom: "18px" }}>Leadership Team</h3>
            <div className="co-team-grid">
              {TEAM_MEMBERS.map((member, i) => (
                <TeamMemberCard key={i} member={member}/>
              ))}
            </div>
          </section>

          {/* ── How It Works ── */}
          <section id="how-it-works" className="co-section">
            <h2 className="co-section-title">How Asset Busters Works</h2>
            <p className="co-section-subtitle">
              Our platform simplifies the complex process of buying and selling businesses into
              a streamlined, transparent workflow that protects both parties.
            </p>

            <div className="co-steps-grid">
              <div className="co-step-card">
                <div className="co-step-number">1</div>
                <div className="co-step-content">
                  <h3 className="co-step-title">Sellers Create Verified Listings</h3>
                  <p className="co-step-text">
                    Business owners submit detailed information about their company including
                    financials, operations, and growth opportunities. Our team verifies all claims
                    through our 12-point verification process before listings go live.
                  </p>
                </div>
              </div>

              <div className="co-step-card">
                <div className="co-step-number">2</div>
                <div className="co-step-content">
                  <h3 className="co-step-title">Buyers Browse & Connect</h3>
                  <p className="co-step-text">
                    Registered buyers filter opportunities by industry, location, size, and deal
                    structure. After signing NDAs, buyers access detailed business information and
                    can message sellers directly through our secure platform.
                  </p>
                </div>
              </div>

              <div className="co-step-card">
                <div className="co-step-number">3</div>
                <div className="co-step-content">
                  <h3 className="co-step-title">Due Diligence & Negotiation</h3>
                  <p className="co-step-text">
                    Serious buyers conduct financial, legal, and operational due diligence using our
                    virtual data room. Both parties negotiate terms with optional support from our
                    network of M&A advisors, lawyers, and accountants.
                  </p>
                </div>
              </div>

              <div className="co-step-card">
                <div className="co-step-number">4</div>
                <div className="co-step-content">
                  <h3 className="co-step-title">Transaction Closing</h3>
                  <p className="co-step-text">
                    Once terms are agreed, parties execute purchase agreements with legal counsel.
                    Asset Busters facilitates the closing process, coordinates fund transfers, and
                    ensures smooth transition of ownership and operations.
                  </p>
                </div>
              </div>

              <div className="co-step-card">
                <div className="co-step-number">5</div>
                <div className="co-step-content">
                  <h3 className="co-step-title">Post-Transaction Support</h3>
                  <p className="co-step-text">
                    After closing, we remain available to mediate any disputes, connect parties with
                    integration specialists, and provide ongoing resources to ensure transaction success
                    for both buyer and seller.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ── Success Stories ── */}
          <section id="success-stories" className="co-section">
            <h2 className="co-section-title">Success Stories</h2>
            <p className="co-section-subtitle">
              Real businesses. Real buyers. Real success. See how Asset Busters has facilitated
              life-changing transactions across Africa and beyond.
            </p>

            <div className="co-stories-grid">
              {SUCCESS_STORIES.map(story => (
                <StoryCard key={story.id} story={story}/>
              ))}
            </div>
          </section>

          {/* ── Press & Media ── */}
          <section id="press" className="co-section">
            <h2 className="co-section-title">Press & Media</h2>
            <p className="co-section-subtitle">
              Latest news, features, and recognition from leading business publications and media outlets.
            </p>

            <div className="co-press-grid">
              {PRESS_ITEMS.map(item => (
                <PressCard key={item.id} item={item}/>
              ))}
            </div>
          </section>

          {/* ── Careers ── */}
          <section id="careers" className="co-section">
            <h2 className="co-section-title">Careers at Asset Busters</h2>
            <p className="co-section-subtitle">
              Join a mission-driven team transforming how businesses change hands across emerging markets.
            </p>

            <div className="co-careers-intro">
              <h3 className="co-careers-intro-title">Why Work With Us</h3>
              <p className="co-careers-intro-text">
                We're a fast-growing startup backed by top-tier investors, building software that
                impacts real businesses and real livelihoods across Africa. Join a team that values
                autonomy, continuous learning, and meaningful impact over vanity metrics.
              </p>
            </div>

            <h3 className="co-section-title" style={{ fontSize: "16px", marginBottom: "16px" }}>Benefits & Perks</h3>
            <div className="co-perks-grid">
              <div className="co-perk-item">
                <span className="co-perk-icon">💰</span>
                <div className="co-perk-content">
                  <h4 className="co-perk-title">Competitive Salary</h4>
                  <p className="co-perk-text">Market-rate compensation plus equity</p>
                </div>
              </div>
              <div className="co-perk-item">
                <span className="co-perk-icon">🏥</span>
                <div className="co-perk-content">
                  <h4 className="co-perk-title">Health Coverage</h4>
                  <p className="co-perk-text">Comprehensive medical for you & family</p>
                </div>
              </div>
              <div className="co-perk-item">
                <span className="co-perk-icon">🌍</span>
                <div className="co-perk-content">
                  <h4 className="co-perk-title">Remote-First</h4>
                  <p className="co-perk-text">Work from anywhere in Africa/MENA</p>
                </div>
              </div>
              <div className="co-perk-item">
                <span className="co-perk-icon">📚</span>
                <div className="co-perk-content">
                  <h4 className="co-perk-title">Learning Budget</h4>
                  <p className="co-perk-text">$1,500/year for courses & conferences</p>
                </div>
              </div>
            </div>

            <h3 className="co-section-title" style={{ fontSize: "16px", marginBottom: "16px" }}>Open Positions</h3>
            <div className="co-jobs-grid">
              {JOB_LISTINGS.map(job => (
                <JobCard key={job.id} job={job}/>
              ))}
            </div>
          </section>

          {/* ── Contact Us ── */}
          <section id="contact" className="co-section">
            <h2 className="co-section-title">Contact Us</h2>
            <p className="co-section-subtitle">
              Have questions? Want to partner? Need support? Get in touch with our team.
            </p>

            <div className="co-contact-grid">
              <div className="co-contact-info">
                <div className="co-contact-item">
                  <h3 className="co-contact-item-title">📧 General Inquiries</h3>
                  <p className="co-contact-item-text">
                    <a href="mailto:hello@assetbusters.com">hello@assetbusters.com</a><br/>
                    We respond within 24 hours
                  </p>
                </div>

                <div className="co-contact-item">
                  <h3 className="co-contact-item-title">💼 Business Development</h3>
                  <p className="co-contact-item-text">
                    <a href="mailto:partnerships@assetbusters.com">partnerships@assetbusters.com</a><br/>
                    For broker partnerships and integrations
                  </p>
                </div>

                <div className="co-contact-item">
                  <h3 className="co-contact-item-title">🆘 Support</h3>
                  <p className="co-contact-item-text">
                    <a href="mailto:support@assetbusters.com">support@assetbusters.com</a><br/>
                    Platform issues and account assistance
                  </p>
                </div>

                <div className="co-contact-item">
                  <h3 className="co-contact-item-title">📰 Press & Media</h3>
                  <p className="co-contact-item-text">
                    <a href="mailto:press@assetbusters.com">press@assetbusters.com</a><br/>
                    Media inquiries and interview requests
                  </p>
                </div>

                <div className="co-contact-item">
                  <h3 className="co-contact-item-title">🏢 Headquarters</h3>
                  <p className="co-contact-item-text">
                    15 Awolowo Road<br/>
                    Ikoyi, Lagos, Nigeria<br/>
                    +234 809 123 4567
                  </p>
                </div>
              </div>

              <div className="co-contact-form">
                <h3 className="co-form-title">Send Us a Message</h3>
                <form onSubmit={handleSubmit}>
                  <div className="co-form-group">
                    <label className="co-form-label">Your Name</label>
                    <input
                      type="text"
                      className="co-form-input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="co-form-group">
                    <label className="co-form-label">Email Address</label>
                    <input
                      type="email"
                      className="co-form-input"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="co-form-group">
                    <label className="co-form-label">Subject</label>
                    <input
                      type="text"
                      className="co-form-input"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                    />
                  </div>

                  <div className="co-form-group">
                    <label className="co-form-label">Message</label>
                    <textarea
                      className="co-form-textarea"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                    />
                  </div>

                  <button type="submit" className="co-form-submit">
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </section>

        </main>
      </div>
    </>
  );
}