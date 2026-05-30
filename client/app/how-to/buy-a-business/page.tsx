"use client";

import { useState } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface GuideSection {
  id: string;
  title: string;
  icon: string;
  color: string;
  description: string;
  steps: {
    number: number;
    title: string;
    content: string;
    tips?: string[];
  }[];
  resources?: {
    title: string;
    description: string;
    type: "download" | "template" | "guide";
  }[];
}

// ─── Data ──────────────────────────────────────────────────────────────────────

const GUIDES: GuideSection[] = [
  {
    id: "buy-business",
    title: "How to Buy a Business",
    icon: "🛒",
    color: "#1A56DB",
    description: "A comprehensive step-by-step guide to acquiring your first or next business. Learn the entire process from search to closing.",
    steps: [
      {
        number: 1,
        title: "Define Your Acquisition Criteria",
        content: "Start by establishing clear parameters for your ideal business. Consider industry preferences, revenue range, geographic location, and business model. Are you looking for a hands-on operational role or a passive investment? Define your risk tolerance and investment timeline.",
        tips: [
          "Set a realistic budget including working capital buffer",
          "Identify 3-5 industries where you have expertise or interest",
          "Determine if you want local, regional, or international opportunities"
        ]
      },
      {
        number: 2,
        title: "Source & Screen Opportunities",
        content: "Use platforms like Asset Busters to browse verified listings. Set up search alerts matching your criteria. Review business summaries, financial snapshots, and seller motivations. Shortlist 5-10 businesses for deeper investigation.",
        tips: [
          "Look beyond asking price—focus on sustainable cash flow",
          "Verify seller motivation (retirement, burnout, relocation)",
          "Use our advanced filters to narrow down compatible matches"
        ]
      },
      {
        number: 3,
        title: "Request & Review Documentation",
        content: "Sign NDAs and request comprehensive information packages. Analyze 3+ years of financial statements, tax returns, customer contracts, supplier agreements, and employee records. Look for revenue concentration risks and operational dependencies.",
        tips: [
          "Request both audited and management-prepared financials",
          "Check for customer concentration (no single client >20% revenue)",
          "Verify all assets, liabilities, and contingent obligations"
        ]
      },
      {
        number: 4,
        title: "Conduct Due Diligence",
        content: "Hire professionals to conduct financial, legal, operational, and commercial due diligence. Verify claims made in the information memorandum. Identify hidden liabilities, operational weaknesses, and growth constraints. Assess cultural fit with the existing team.",
        tips: [
          "Engage a transaction advisor experienced in your industry",
          "Interview key employees, customers, and suppliers",
          "Conduct site visits during different times/days",
          "Use our Due Diligence Checklist (downloadable below)"
        ]
      },
      {
        number: 5,
        title: "Structure the Deal",
        content: "Work with your advisor to structure the optimal transaction. Decide between asset purchase vs. share purchase. Negotiate earn-outs, seller financing, and non-compete clauses. Determine the right mix of cash, debt, and equity financing.",
        tips: [
          "Asset purchases reduce liability exposure for buyers",
          "Seller financing shows seller confidence in the business",
          "Structure earn-outs tied to measurable performance metrics",
          "Keep 20-30% of funds as post-acquisition working capital"
        ]
      },
      {
        number: 6,
        title: "Negotiate & Execute",
        content: "Submit a Letter of Intent (LOI) outlining your proposed terms. Negotiate purchase price adjustments, transition support, and closing conditions. Finalize legal agreements with your attorney. Coordinate with banks and investors to secure financing approval.",
        tips: [
          "Include 30-90 day transition period with seller in LOI",
          "Negotiate working capital adjustments at closing",
          "Ensure all key contracts are assignable or renewable",
          "Plan for 60-120 days from LOI to closing"
        ]
      },
      {
        number: 7,
        title: "Close & Transition",
        content: "Complete final verifications, sign purchase agreements, and transfer funds. Execute transition plans: introduce yourself to staff, customers, and suppliers. Implement quick wins while respecting existing culture. Monitor cash flow closely in the first 90 days.",
        tips: [
          "Schedule staff meetings within first week to build trust",
          "Retain key employees with retention bonuses if needed",
          "Don't make drastic changes in the first 3 months",
          "Track weekly cash flow and compare to projections"
        ]
      }
    ],
    resources: [
      {
        title: "Business Acquisition Checklist",
        description: "Complete 87-point checklist covering every stage of the acquisition process",
        type: "download"
      },
      {
        title: "LOI Template",
        description: "Editable Letter of Intent template used by professional acquirers",
        type: "template"
      },
      {
        title: "Valuation Calculator",
        description: "Excel model to calculate fair market value using multiple methods",
        type: "template"
      }
    ]
  },
  {
    id: "sell-business",
    title: "How to Sell a Business",
    icon: "💼",
    color: "#059669",
    description: "Maximize your business value and ensure a smooth exit. Follow our proven framework used by thousands of successful sellers.",
    steps: [
      {
        number: 1,
        title: "Prepare Your Business for Sale",
        content: "Begin preparation 12-24 months before intended sale. Clean up financial statements, resolve legal issues, and strengthen operational systems. Document all processes, reduce owner dependencies, and build a strong management team. The better prepared your business, the higher the valuation.",
        tips: [
          "Get 3 years of audited or reviewed financial statements",
          "Resolve all pending litigation and compliance issues",
          "Document Standard Operating Procedures (SOPs) for key processes",
          "Diversify customer base to reduce concentration risk"
        ]
      },
      {
        number: 2,
        title: "Obtain a Professional Valuation",
        content: "Hire a certified business appraiser to determine fair market value. Understand the multiple methodologies: asset-based, income-based, and market-based approaches. Identify value drivers and detractors. Use the valuation to set a realistic asking price.",
        tips: [
          "Expect valuations of 3-5x EBITDA for most SMEs in Africa",
          "Higher multiples (6-8x) for SaaS, tech, and high-growth businesses",
          "Add-backs: owner salary, personal expenses, one-time costs",
          "Professional valuations cost $3,000-$15,000 but worth the investment"
        ]
      },
      {
        number: 3,
        title: "Create a Confidential Information Memorandum",
        content: "Develop a comprehensive, professional package showcasing your business. Include executive summary, company history, market analysis, financial performance, growth opportunities, and operational details. High-quality documentation attracts serious buyers and commands premium valuations.",
        tips: [
          "Use professional design—first impressions matter",
          "Emphasize competitive advantages and market position",
          "Include customer testimonials and case studies",
          "Highlight growth potential and untapped opportunities"
        ]
      },
      {
        number: 4,
        title: "Market to Qualified Buyers",
        content: "List on Asset Busters and other platforms to access our network of 5,800+ verified investors. Maintain confidentiality through blind listings and NDAs. Pre-screen buyers for financial capability and strategic fit. Conduct controlled virtual data room access.",
        tips: [
          "Premium listings receive 4x more qualified buyer inquiries",
          "Create teaser summary without revealing company identity",
          "Require proof of funds before sharing detailed information",
          "Use our matching algorithm to find strategic buyers"
        ]
      },
      {
        number: 5,
        title: "Negotiate Offers",
        content: "Evaluate offers beyond just price—consider terms, structure, timing, and buyer capability. Compare cash vs. seller financing vs. earn-outs. Negotiate transition support expectations and non-compete duration. Select 2-3 finalists for deeper discussions.",
        tips: [
          "All-cash offers aren't always best—consider tax implications",
          "Seller notes typically 10-30% of purchase price over 3-5 years",
          "Earn-outs should be based on metrics you can influence",
          "Shorter transition periods (30-60 days) often preferable"
        ]
      },
      {
        number: 6,
        title: "Manage Due Diligence",
        content: "Organize a virtual data room with all requested documents. Respond promptly and thoroughly to buyer inquiries. Be transparent about issues—hiding problems kills deals. Continue running the business normally to maintain performance during the process.",
        tips: [
          "Organize documents by category: financial, legal, operational, HR",
          "Assign a point person to coordinate buyer questions",
          "Don't let the sale process distract from daily operations",
          "Address red flags proactively with context and solutions"
        ]
      },
      {
        number: 7,
        title: "Close the Transaction",
        content: "Work with your attorney to finalize purchase agreements. Negotiate final working capital adjustments. Coordinate the transition: train the buyer, introduce key relationships, and transfer institutional knowledge. Ensure proper legal transfer of all assets and contracts.",
        tips: [
          "Hire an M&A attorney—not your general business lawyer",
          "Plan for 60-90 days from accepted offer to closing",
          "Keep the sale confidential until after closing",
          "Celebrate your success and plan your next chapter!"
        ]
      }
    ],
    resources: [
      {
        title: "Business Sale Preparation Checklist",
        description: "12-month action plan to maximize your business value before listing",
        type: "download"
      },
      {
        title: "Information Memorandum Template",
        description: "Professional 25-page template used by investment banks",
        type: "template"
      },
      {
        title: "Seller's Due Diligence Kit",
        description: "Complete list of documents buyers will request",
        type: "download"
      }
    ]
  },
  {
    id: "find-investors",
    title: "How to Find Investors",
    icon: "🤝",
    color: "#F5A623",
    description: "Connect with the right capital partners for your business growth. Learn to attract angels, VCs, PE firms, and strategic investors.",
    steps: [
      {
        number: 1,
        title: "Clarify Your Capital Needs",
        content: "Define exactly how much capital you need and what you'll use it for. Create detailed use-of-funds breakdown: product development, marketing, inventory, hiring, geographic expansion, etc. Determine whether you need equity investment, debt financing, or a hybrid structure.",
        tips: [
          "Raise 18-24 months of runway to hit your next milestone",
          "Add 20-30% buffer for unexpected costs and delays",
          "Be specific: 'NGN 50M for inventory + marketing' vs 'need money to grow'",
          "Consider alternatives: revenue-based financing, grants, strategic partnerships"
        ]
      },
      {
        number: 2,
        title: "Know Your Business Value",
        content: "Understand your current valuation range using comparable transactions and financial metrics. For early-stage: focus on traction, growth rate, and market size. For established businesses: use EBITDA multiples and discounted cash flow models. Be realistic about dilution.",
        tips: [
          "Pre-revenue startups: $500K-$3M valuation typical in Africa",
          "Early revenue (<$500K ARR): 5-10x revenue multiples",
          "Profitable SMEs: 3-6x EBITDA depending on growth and sector",
          "Use our Valuation Calculator to model different scenarios"
        ]
      },
      {
        number: 3,
        title: "Build a Compelling Investment Case",
        content: "Create a professional pitch deck and executive summary. Clearly articulate the problem you solve, your unique solution, market opportunity, traction to date, competitive advantages, financial projections, and team credentials. Tell a story that resonates.",
        tips: [
          "Keep pitch deck to 12-15 slides maximum",
          "Lead with traction and proof points, not product features",
          "Show clear path to 10x return for investors",
          "Include one slide on risks and mitigation strategies",
          "Practice your 3-minute elevator pitch until it's effortless"
        ]
      },
      {
        number: 4,
        title: "Identify Target Investors",
        content: "Research investors who fund businesses in your sector, stage, and geography. Use Asset Busters investor directory to filter by ticket size, industry focus, and deal preferences. Create a target list of 30-50 investors ranked by fit. Prioritize warm introductions over cold outreach.",
        tips: [
          "Angel investors: $10K-$200K for early-stage in Africa",
          "VCs: $250K-$5M for growth-stage tech businesses",
          "PE firms: $500K-$15M for established, profitable SMEs",
          "Family offices: patient capital for dividend-yielding assets"
        ]
      },
      {
        number: 5,
        title: "Execute Strategic Outreach",
        content: "Leverage your network for warm introductions—conversion rates are 10x higher than cold emails. Attend investor conferences and demo days. Engage on platforms like Asset Busters where investors actively search for deals. Personalize every outreach—show you've done your research.",
        tips: [
          "Reference specific investments the investor has made",
          "Explain why you're a good fit for their thesis",
          "Offer a specific ask: 'Can we schedule a 20-minute call?'",
          "Follow up persistently but respectfully (3-5 touch points)",
          "Track all outreach in a CRM or spreadsheet"
        ]
      },
      {
        number: 6,
        title: "Navigate the Investment Process",
        content: "Progress through investor meetings: initial call, pitch presentation, due diligence, term sheet negotiation, and legal documentation. Be prepared for 3-6 months from first contact to closed deal. Maintain momentum by having multiple conversations in parallel.",
        tips: [
          "Expect to pitch 50+ investors to close 1-3 commitments",
          "Have all due diligence documents ready before first meeting",
          "Get legal counsel to review term sheets—clauses matter",
          "Maintain business operations—don't get distracted by fundraising",
          "Consider a lead investor to set terms, then fill the round"
        ]
      },
      {
        number: 7,
        title: "Close & Build Relationships",
        content: "Negotiate final terms, sign investment agreements, and receive funds. Immediately establish reporting cadence and communication expectations. Treat investors as strategic partners—leverage their networks, expertise, and guidance. Deliver on your commitments.",
        tips: [
          "Send monthly investor updates (metrics, wins, challenges, asks)",
          "Schedule quarterly board or advisory meetings",
          "Leverage investor networks for customer intros and hiring",
          "Be transparent about problems early—surprises kill trust",
          "Plan for your next funding round from day one"
        ]
      }
    ],
    resources: [
      {
        title: "Pitch Deck Template",
        description: "Investor-grade presentation template based on 100+ successful fundraises",
        type: "template"
      },
      {
        title: "Financial Model for Startups",
        description: "3-statement model with investor-ready projections and scenarios",
        type: "template"
      },
      {
        title: "Investor Outreach Tracker",
        description: "Spreadsheet to manage your fundraising pipeline",
        type: "template"
      }
    ]
  },
  {
    id: "value-business",
    title: "How to Value a Business",
    icon: "📊",
    color: "#7C3AED",
    description: "Master business valuation techniques used by professional appraisers, investors, and M&A advisors worldwide.",
    steps: [
      {
        number: 1,
        title: "Understand Valuation Fundamentals",
        content: "Business value equals the present value of all future cash flows. Three main approaches exist: asset-based (book value), income-based (cash flow multiples), and market-based (comparable transactions). Most SME valuations use income-based methods as they reflect earning potential.",
        tips: [
          "Fair market value ≠ what you hope to get or what you paid",
          "Valuations are ranges, not precise numbers",
          "Different buyers assign different values based on synergies",
          "Valuation date matters—values change with market conditions"
        ]
      },
      {
        number: 2,
        title: "Calculate Adjusted EBITDA",
        content: "Start with earnings before interest, taxes, depreciation, and amortization. Add back owner compensation above market rates, personal expenses run through the business, one-time costs, and non-recurring items. This 'normalized EBITDA' is the foundation for income-based valuations.",
        tips: [
          "Common add-backs: owner salary excess, family member salaries, personal vehicle, travel, entertainment",
          "Be conservative—aggressive add-backs reduce buyer confidence",
          "Document every adjustment with supporting evidence",
          "Typical EBITDA margins: 10-15% for service businesses, 15-25% for SaaS, 5-10% for retail"
        ]
      },
      {
        number: 3,
        title: "Apply Industry Multiples",
        content: "Multiply your adjusted EBITDA by an industry-standard multiple. African SME multiples typically range 2-6x EBITDA. Higher for: recurring revenue, market leadership, strong management, proprietary IP. Lower for: customer concentration, owner dependency, declining markets, regulatory risk.",
        tips: [
          "SaaS/Tech: 4-8x EBITDA or 3-6x revenue if high growth",
          "Healthcare/Education: 4-7x EBITDA due to stable demand",
          "Manufacturing: 3-5x EBITDA depending on margins and assets",
          "Retail/Restaurants: 2-4x EBITDA due to location dependency",
          "Professional services: 2-4x EBITDA due to people dependency"
        ]
      },
      {
        number: 4,
        title: "Consider Asset-Based Adjustments",
        content: "For asset-heavy businesses (manufacturing, real estate), also calculate asset value. Add market value of tangible assets (equipment, inventory, real estate) and identifiable intangibles (patents, customer lists). Compare to income-based value—use the higher of the two approaches.",
        tips: [
          "Get professional appraisals for significant real estate or equipment",
          "Inventory: value at lower of cost or market",
          "Accounts receivable: discount by expected collection rate",
          "Intangibles often worth 20-40% of total business value"
        ]
      },
      {
        number: 5,
        title: "Apply Discounts & Premiums",
        content: "Adjust the preliminary valuation for specific factors. Discounts: lack of marketability (10-25%), minority interest (20-30%), industry headwinds. Premiums: strategic value to specific buyer, proprietary technology, exceptional management team, market leadership position.",
        tips: [
          "Control premiums: 20-40% for majority ownership",
          "Marketability discounts for closely-held businesses",
          "Key person dependency can reduce value 20-50%",
          "Growth businesses command 30-50% premium over stable ones",
          "Strategic buyers may pay 50-100% premium for synergies"
        ]
      },
      {
        number: 6,
        title: "Validate with Comparable Transactions",
        content: "Research recent sales of similar businesses in your industry and region. Use platforms like Asset Busters transaction database to find comparables. Adjust for differences in size, growth rate, margins, and market position. This market check validates your income-based valuation.",
        tips: [
          "Ideal comparables: same industry, similar revenue size, same geography",
          "Look for 3-5 recent transactions (within 2 years)",
          "Public company multiples are typically 2x private company multiples",
          "African businesses often valued 20-40% below Western comparables"
        ]
      },
      {
        number: 7,
        title: "Document Your Valuation",
        content: "Create a formal valuation report documenting your methodology, assumptions, calculations, and conclusion. Include sensitivity analysis showing value ranges under different scenarios. Be prepared to defend your valuation to buyers, investors, or partners with clear logic and data.",
        tips: [
          "Include best-case, base-case, worst-case scenarios",
          "Show how value changes with different multiples and growth assumptions",
          "Update valuations annually or when material changes occur",
          "Hire a professional appraiser for transactions >$1M or legal purposes"
        ]
      }
    ],
    resources: [
      {
        title: "Business Valuation Calculator",
        description: "Excel model with income, asset, and market approaches",
        type: "template"
      },
      {
        title: "Industry Multiples Database",
        description: "Benchmark EBITDA multiples for 50+ industries in Africa",
        type: "guide"
      },
      {
        title: "Valuation Report Template",
        description: "Professional 15-page valuation report template",
        type: "template"
      }
    ]
  },
  {
    id: "due-diligence",
    title: "Due Diligence Checklist",
    icon: "✅",
    color: "#D42B2B",
    description: "Comprehensive pre-acquisition checklist used by professional buyers to uncover risks and validate opportunities.",
    steps: [
      {
        number: 1,
        title: "Financial Due Diligence",
        content: "Verify all financial claims and uncover hidden liabilities. Request 3-5 years of audited financials, tax returns, bank statements, and management accounts. Analyze revenue trends, profit margins, working capital, debt obligations, and off-balance-sheet items. Reconstruct cash flow statements.",
        tips: [
          "Compare tax returns to financial statements—discrepancies are red flags",
          "Verify accounts receivable aging and collection history",
          "Check for seasonal variations and one-time revenue spikes",
          "Calculate working capital needed to maintain operations",
          "Identify all debt, guarantees, and contingent liabilities",
          "Review depreciation policies and asset valuations"
        ]
      },
      {
        number: 2,
        title: "Legal Due Diligence",
        content: "Confirm clean title to all assets and identify legal risks. Review corporate documents, contracts, permits, licenses, intellectual property, litigation history, and regulatory compliance. Verify proper corporate structure and good standing. Identify all required consents and approvals for ownership transfer.",
        tips: [
          "Verify business is registered and in good standing with all authorities",
          "Review all material contracts (customers, suppliers, leases)",
          "Check for change-of-control clauses that could be triggered",
          "Search for pending or threatened litigation",
          "Confirm IP ownership (trademarks, patents, copyrights)",
          "Verify all licenses, permits, and regulatory approvals are current"
        ]
      },
      {
        number: 3,
        title: "Operational Due Diligence",
        content: "Understand how the business actually runs day-to-day. Map all key processes, systems, and dependencies. Evaluate technology infrastructure, supply chain reliability, and operational efficiency. Assess scalability and identify bottlenecks. Understand reliance on owner vs. established systems.",
        tips: [
          "Request process documentation and SOPs",
          "Evaluate technology stack—is it modern or legacy?",
          "Identify single points of failure in operations",
          "Assess facility condition and equipment maintenance",
          "Review inventory management and turnover rates",
          "Understand production capacity and utilization"
        ]
      },
      {
        number: 4,
        title: "Commercial Due Diligence",
        content: "Validate market position and growth assumptions. Analyze customer concentration, retention, and satisfaction. Evaluate competitive landscape and barriers to entry. Assess product/service differentiation and pricing power. Interview key customers to verify relationships and future commitment.",
        tips: [
          "No customer should represent >20% of revenue (concentration risk)",
          "Calculate customer lifetime value and acquisition costs",
          "Verify claimed market share and competitive position",
          "Assess threat from new entrants and substitutes",
          "Review sales pipeline and backlog",
          "Understand pricing strategy and ability to raise prices"
        ]
      },
      {
        number: 5,
        title: "Human Capital Assessment",
        content: "Evaluate the team that makes the business run. Review organizational structure, key person dependencies, compensation structure, and employee contracts. Assess culture, morale, and retention. Identify critical employees who must be retained post-acquisition. Verify all employment law compliance.",
        tips: [
          "Request org chart with names, roles, tenure, and compensation",
          "Identify employees who could leave post-acquisition",
          "Review non-compete and confidentiality agreements",
          "Check for unfunded pension liabilities or benefits",
          "Assess need for retention bonuses for key staff",
          "Verify compliance with labor laws and regulations"
        ]
      },
      {
        number: 6,
        title: "Tax & Accounting Review",
        content: "Identify tax liabilities and compliance issues. Review tax filings for 3-5 years, outstanding audits, and tax positions. Verify proper accounting policies and revenue recognition. Identify deferred taxes and potential exposures. Assess quality of financial controls and reporting systems.",
        tips: [
          "Engage a tax advisor for complex situations",
          "Check for unpaid VAT, payroll taxes, or property taxes",
          "Review transfer pricing for related party transactions",
          "Identify tax loss carryforwards that could offset future income",
          "Assess quality of accounting systems and internal controls",
          "Verify all tax returns filed and payments current"
        ]
      },
      {
        number: 7,
        title: "Environmental & Regulatory",
        content: "For manufacturing, real estate, and regulated industries, assess environmental liabilities and regulatory compliance. Review environmental permits, waste disposal practices, contamination risks, and remediation obligations. Verify industry-specific regulatory compliance and upcoming regulatory changes.",
        tips: [
          "Conduct Phase I environmental assessment for real property",
          "Review hazardous materials handling and disposal records",
          "Check for EPA or environmental agency violations",
          "Assess exposure to climate regulations and carbon pricing",
          "Verify compliance with industry-specific regulations",
          "Identify required post-closing compliance investments"
        ]
      }
    ],
    resources: [
      {
        title: "Complete Due Diligence Checklist",
        description: "287-item checklist covering all aspects of business acquisition DD",
        type: "download"
      },
      {
        title: "Data Room Setup Guide",
        description: "How to organize a virtual data room for efficient due diligence",
        type: "guide"
      },
      {
        title: "Red Flags Guide",
        description: "20 warning signs that should stop you from buying a business",
        type: "guide"
      }
    ]
  }
];

// ─── Components ────────────────────────────────────────────────────────────────

function GuideNav({ guides, activeId, onSelect }: { guides: GuideSection[]; activeId: string; onSelect: (id: string) => void }) {
  return (
    <nav className="ht-guide-nav">
      <div className="ht-nav-header">
        <h3 className="ht-nav-title">Knowledge Center</h3>
        <p className="ht-nav-subtitle">Select a guide</p>
      </div>
      <div className="ht-nav-list">
        {guides.map(g => (
          <button
            key={g.id}
            className={`ht-nav-item ${activeId === g.id ? "active" : ""}`}
            onClick={() => onSelect(g.id)}
            style={{
              borderLeftColor: activeId === g.id ? g.color : "transparent"
            }}
          >
            <span className="ht-nav-icon" style={{ background: g.color + "14", color: g.color }}>
              {g.icon}
            </span>
            <span className="ht-nav-label">{g.title}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

function StepCard({ step, color }: { step: { number: number; title: string; content: string; tips?: string[] }; color: string }) {
  return (
    <div className="ht-step-card">
      <div className="ht-step-number" style={{ background: color, boxShadow: `0 4px 14px ${color}30` }}>
        {step.number}
      </div>
      <div className="ht-step-content">
        <h3 className="ht-step-title">{step.title}</h3>
        <p className="ht-step-text">{step.content}</p>
        {step.tips && step.tips.length > 0 && (
          <div className="ht-step-tips">
            <p className="ht-tips-header">
              <span className="ht-tips-icon">💡</span>
              Key Tips
            </p>
            <ul className="ht-tips-list">
              {step.tips.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function ResourceCard({ resource }: { resource: { title: string; description: string; type: string } }) {
  const icons = {
    download: "⬇️",
    template: "📄",
    guide: "📖"
  };
  const labels = {
    download: "Download",
    template: "Template",
    guide: "Guide"
  };
  return (
    <div className="ht-resource-card">
      <div className="ht-resource-header">
        <span className="ht-resource-icon">{icons[resource.type]}</span>
        <span className="ht-resource-type">{labels[resource.type]}</span>
      </div>
      <h4 className="ht-resource-title">{resource.title}</h4>
      <p className="ht-resource-desc">{resource.description}</p>
      <button className="ht-resource-btn">
        Download Free
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function HowToPage() {
  const [activeGuide, setActiveGuide] = useState("buy-business");

  const guide = GUIDES.find(g => g.id === activeGuide) || GUIDES[0];

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

        .ht-page{min-height:100vh;padding-top:102px;background:var(--surf)}

        /* ── Hero ── */
        .ht-hero{
          background:var(--navy);
          padding:40px 0 36px;
          position:relative;overflow:hidden;
          border-bottom:1px solid rgba(255,255,255,.06);
        }
        .ht-hero::before{
          content:'';position:absolute;inset:0;
          background:
            radial-gradient(ellipse 60% 75% at 20% 30%, rgba(245,166,35,.12) 0%, transparent 65%),
            radial-gradient(ellipse 50% 70% at 85% 50%, rgba(26,86,219,.1) 0%, transparent 70%);
          pointer-events:none;
        }
        .ht-hero-inner{max-width:var(--mw);margin:0 auto;padding:0 28px;position:relative}
        .ht-hero-breadcrumb{
          display:flex;align-items:center;gap:6px;margin-bottom:14px;
          font-size:11px;color:rgba(255,255,255,.38);
        }
        .ht-hero-breadcrumb a{color:rgba(255,255,255,.55);text-decoration:none;transition:color var(--t)}
        .ht-hero-breadcrumb a:hover{color:#fff}
        .ht-hero-eyebrow{
          display:inline-flex;align-items:center;gap:7px;
          background:rgba(245,166,35,.18);border:1px solid rgba(245,166,35,.32);
          color:#fbbf24;font-size:10px;font-weight:700;
          letter-spacing:1.2px;text-transform:uppercase;
          padding:4px 10px;margin-bottom:12px;
        }
        .ht-hero-eyebrow-icon{font-size:13px}
        .ht-hero-heading{
          font-size:clamp(26px,3.4vw,42px);
          font-weight:800;color:#fff;letter-spacing:-.9px;
          margin-bottom:10px;line-height:1.1;
        }
        .ht-hero-heading span{color:#F5A623}
        .ht-hero-desc{
          font-size:13.5px;color:rgba(255,255,255,.52);line-height:1.75;
          max-width:620px;margin-bottom:24px;
        }
        .ht-stats-row{
          display:flex;gap:32px;flex-wrap:wrap;
          padding-top:16px;border-top:1px solid rgba(255,255,255,.08);
        }
        .ht-stat{display:flex;flex-direction:column;gap:3px}
        .ht-stat-val{font-size:20px;font-weight:800;color:#fff;letter-spacing:-.5px}
        .ht-stat-label{font-size:10px;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.6px;font-weight:500}

        /* ── Main Layout ── */
        .ht-main{
          max-width:var(--mw);margin:0 auto;padding:28px 28px 64px;
          display:grid;grid-template-columns:280px 1fr;gap:32px;align-items:start;
        }

        /* ── Guide Nav ── */
        .ht-guide-nav{
          position:sticky;top:120px;
          background:var(--bg);border:1px solid var(--bdr);
          display:flex;flex-direction:column;
        }
        .ht-nav-header{
          padding:16px 18px;border-bottom:1px solid var(--bdr);
        }
        .ht-nav-title{font-size:14px;font-weight:800;color:var(--navy);letter-spacing:-.3px;margin-bottom:3px}
        .ht-nav-subtitle{font-size:11px;color:var(--t3);font-weight:500}
        .ht-nav-list{display:flex;flex-direction:column;padding:6px}
        .ht-nav-item{
          display:flex;align-items:center;gap:12px;
          background:none;border:none;border-left:3px solid;
          padding:12px 14px;cursor:pointer;
          font-family:var(--font);text-align:left;
          transition:all var(--t);
        }
        .ht-nav-item:hover{background:var(--surf)}
        .ht-nav-item.active{background:#eef3fd}
        .ht-nav-icon{
          width:36px;height:36px;flex-shrink:0;
          display:flex;align-items:center;justify-content:center;
          font-size:16px;border-radius:4px;
        }
        .ht-nav-label{font-size:12.5px;font-weight:600;color:var(--t2);line-height:1.3}
        .ht-nav-item.active .ht-nav-label{color:var(--navy)}

        /* ── Content ── */
        .ht-content{display:flex;flex-direction:column;gap:24px}

        /* ── Guide Header ── */
        .ht-guide-header{
          background:var(--bg);border:1px solid var(--bdr);
          padding:28px;position:relative;overflow:hidden;
        }
        .ht-guide-header::before{
          content:'';position:absolute;top:0;right:0;
          width:160px;height:160px;
          background:radial-gradient(circle,var(--guide-color)0A,transparent 70%);
          pointer-events:none;
        }
        .ht-guide-icon-wrap{
          width:56px;height:56px;
          background:var(--guide-color)14;
          border:2px solid var(--guide-color)28;
          border-radius:8px;
          display:flex;align-items:center;justify-content:center;
          font-size:26px;margin-bottom:18px;
          box-shadow:0 4px 14px var(--guide-color)18;
        }
        .ht-guide-title{
          font-size:26px;font-weight:800;color:var(--navy);
          letter-spacing:-.7px;margin-bottom:8px;line-height:1.2;
        }
        .ht-guide-desc{
          font-size:13.5px;color:var(--t2);line-height:1.7;
          max-width:680px;
        }

        /* ── Steps Section ── */
        .ht-steps-section{display:flex;flex-direction:column;gap:20px}
        .ht-section-header{
          display:flex;align-items:center;gap:12px;margin-bottom:4px;
        }
        .ht-section-title{
          font-size:16px;font-weight:700;color:var(--navy);
          letter-spacing:-.3px;
        }
        .ht-section-line{flex:1;height:2px;background:linear-gradient(90deg,var(--bdr),transparent)}

        .ht-step-card{
          background:var(--bg);border:1px solid var(--bdr);
          padding:24px;display:flex;gap:22px;
          transition:transform var(--t),box-shadow var(--t),border-color var(--t);
        }
        .ht-step-card:hover{
          transform:translateX(4px);
          box-shadow:0 8px 28px rgba(0,0,0,.09);
          border-color:#c4d0e8;
        }
        .ht-step-number{
          width:44px;height:44px;flex-shrink:0;
          display:flex;align-items:center;justify-content:center;
          border-radius:6px;
          font-size:18px;font-weight:800;color:#fff;
          letter-spacing:-.3px;
        }
        .ht-step-content{flex:1;min-width:0}
        .ht-step-title{
          font-size:16px;font-weight:700;color:var(--navy);
          letter-spacing:-.3px;margin-bottom:10px;line-height:1.3;
        }
        .ht-step-text{
          font-size:13px;color:var(--t2);line-height:1.75;
          margin-bottom:14px;
        }
        .ht-step-tips{
          background:var(--surf);border:1px solid var(--bdr);
          border-left:3px solid var(--amber);
          padding:14px 16px;
        }
        .ht-tips-header{
          display:flex;align-items:center;gap:7px;
          font-size:11.5px;font-weight:700;color:var(--navy);
          text-transform:uppercase;letter-spacing:.5px;
          margin-bottom:9px;
        }
        .ht-tips-icon{font-size:14px}
        .ht-tips-list{
          list-style:none;display:flex;flex-direction:column;gap:7px;
        }
        .ht-tips-list li{
          font-size:12px;color:var(--t2);line-height:1.6;
          padding-left:16px;position:relative;
        }
        .ht-tips-list li::before{
          content:'•';position:absolute;left:4px;top:0;
          color:var(--amber);font-weight:700;font-size:16px;
        }

        /* ── Resources ── */
        .ht-resources-section{
          background:var(--bg);border:1px solid var(--bdr);
          padding:28px;
        }
        .ht-resources-header{margin-bottom:20px}
        .ht-resources-title{
          font-size:18px;font-weight:700;color:var(--navy);
          letter-spacing:-.4px;margin-bottom:6px;
        }
        .ht-resources-subtitle{
          font-size:12px;color:var(--t3);line-height:1.5;
        }
        .ht-resources-grid{
          display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));
          gap:16px;
        }
        .ht-resource-card{
          background:var(--surf);border:1px solid var(--bdr);
          padding:18px;display:flex;flex-direction:column;gap:10px;
          transition:all var(--t);cursor:pointer;
        }
        .ht-resource-card:hover{
          border-color:var(--blue);
          box-shadow:0 4px 18px rgba(26,86,219,.12);
          transform:translateY(-2px);
        }
        .ht-resource-header{display:flex;align-items:center;justify-content:space-between}
        .ht-resource-icon{font-size:22px}
        .ht-resource-type{
          font-size:9px;font-weight:700;color:var(--t3);
          text-transform:uppercase;letter-spacing:.7px;
          background:var(--bg);border:1px solid var(--bdr);
          padding:3px 8px;border-radius:3px;
        }
        .ht-resource-title{
          font-size:13.5px;font-weight:700;color:var(--navy);
          line-height:1.3;letter-spacing:-.2px;
        }
        .ht-resource-desc{
          font-size:11.5px;color:var(--t3);line-height:1.6;
          flex:1;
        }
        .ht-resource-btn{
          display:flex;align-items:center;justify-content:center;gap:6px;
          background:var(--blue);border:none;color:#fff;
          font-size:11.5px;font-weight:700;
          padding:9px 14px;cursor:pointer;
          font-family:var(--font);transition:all var(--t);
          letter-spacing:.2px;
          margin-top:4px;
        }
        .ht-resource-btn:hover{background:#1444B8}

        /* ── CTA Section ── */
        .ht-cta-section{
          background:linear-gradient(135deg,var(--navy),#1a2d4a);
          border:1px solid rgba(255,255,255,.08);
          padding:36px 32px;position:relative;overflow:hidden;
        }
        .ht-cta-section::before{
          content:'';position:absolute;inset:0;
          background:
            radial-gradient(circle at 20% 50%,rgba(245,166,35,.08),transparent 50%),
            radial-gradient(circle at 80% 50%,rgba(26,86,219,.08),transparent 50%);
          pointer-events:none;
        }
        .ht-cta-inner{position:relative;text-align:center;max-width:600px;margin:0 auto}
        .ht-cta-title{
          font-size:22px;font-weight:800;color:#fff;
          letter-spacing:-.5px;margin-bottom:10px;line-height:1.2;
        }
        .ht-cta-desc{
          font-size:13px;color:rgba(255,255,255,.58);
          line-height:1.7;margin-bottom:24px;
        }
        .ht-cta-btns{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
        .ht-cta-btn{
          display:inline-flex;align-items:center;gap:7px;
          font-size:12.5px;font-weight:700;
          padding:11px 22px;cursor:pointer;border:none;
          text-decoration:none;font-family:var(--font);
          transition:all var(--t);letter-spacing:.2px;
        }
        .ht-cta-primary{background:var(--amber);color:#fff}
        .ht-cta-primary:hover{background:#D4891A;transform:translateY(-1px)}
        .ht-cta-outline{
          background:rgba(255,255,255,.09);color:rgba(255,255,255,.88);
          border:1px solid rgba(255,255,255,.2)!important;
        }
        .ht-cta-outline:hover{background:rgba(255,255,255,.16);color:#fff}

        @media(max-width:1024px){
          .ht-main{grid-template-columns:1fr;gap:24px}
          .ht-guide-nav{position:static}
          .ht-nav-list{flex-direction:row;flex-wrap:wrap}
          .ht-nav-item{border-left:none;border-bottom:3px solid}
          .ht-resources-grid{grid-template-columns:repeat(auto-fill,minmax(230px,1fr))}
        }
        @media(max-width:640px){
          .ht-main{padding:20px 16px 48px}
          .ht-hero{padding:28px 0 24px}
          .ht-hero-inner{padding:0 16px}
          .ht-step-card{flex-direction:column;gap:14px}
          .ht-step-number{width:40px;height:40px;font-size:16px}
          .ht-resources-grid{grid-template-columns:1fr}
          .ht-stats-row{gap:20px}
          .ht-cta-btns{flex-direction:column}
        }
      `}</style>

      <div className="ht-page" style={{ "--guide-color": guide.color } as React.CSSProperties}>

        {/* ── Hero ── */}
        <section className="ht-hero">
          <div className="ht-hero-inner">
            <nav className="ht-hero-breadcrumb" aria-label="Breadcrumb">
              <a href="/">Home</a>
              <span>/</span>
              <span>How To</span>
            </nav>

            <div className="ht-hero-eyebrow">
              <span className="ht-hero-eyebrow-icon">📚</span>
              Knowledge Center
            </div>
            <h1 className="ht-hero-heading">
              Learn <span>Everything</span> About<br/>
              Business Acquisitions
            </h1>
            <p className="ht-hero-desc">
              Master the complete acquisition lifecycle with our in-depth guides. From finding the
              right business to closing the deal, we've compiled best practices from thousands of
              successful transactions across Africa and beyond.
            </p>

            <div className="ht-stats-row">
              <div className="ht-stat">
                <span className="ht-stat-val">5</span>
                <span className="ht-stat-label">Comprehensive Guides</span>
              </div>
              <div className="ht-stat">
                <span className="ht-stat-val">45+</span>
                <span className="ht-stat-label">Step-by-Step Processes</span>
              </div>
              <div className="ht-stat">
                <span className="ht-stat-val">15</span>
                <span className="ht-stat-label">Free Templates & Tools</span>
              </div>
              <div className="ht-stat">
                <span className="ht-stat-val">2,400+</span>
                <span className="ht-stat-label">Businesses Acquired Using These Guides</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Main ── */}
        <main className="ht-main">
          <GuideNav guides={GUIDES} activeId={activeGuide} onSelect={setActiveGuide}/>

          <div className="ht-content">

            {/* Guide Header */}
            <div className="ht-guide-header">
              <div className="ht-guide-icon-wrap">
                {guide.icon}
              </div>
              <h2 className="ht-guide-title">{guide.title}</h2>
              <p className="ht-guide-desc">{guide.description}</p>
            </div>

            {/* Steps */}
            <div className="ht-steps-section">
              <div className="ht-section-header">
                <h3 className="ht-section-title">Step-by-Step Process</h3>
                <div className="ht-section-line"/>
              </div>

              {guide.steps.map(step => (
                <StepCard key={step.number} step={step} color={guide.color}/>
              ))}
            </div>

            {/* Resources */}
            {guide.resources && guide.resources.length > 0 && (
              <div className="ht-resources-section">
                <div className="ht-resources-header">
                  <h3 className="ht-resources-title">Free Resources & Templates</h3>
                  <p className="ht-resources-subtitle">
                    Download professional templates and tools to accelerate your acquisition journey
                  </p>
                </div>
                <div className="ht-resources-grid">
                  {guide.resources.map((r, i) => (
                    <ResourceCard key={i} resource={r}/>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="ht-cta-section">
              <div className="ht-cta-inner">
                <h3 className="ht-cta-title">Ready to Take Action?</h3>
                <p className="ht-cta-desc">
                  Browse our marketplace of verified businesses for sale or connect with investors
                  actively looking for acquisition opportunities in your industry and region.
                </p>
                <div className="ht-cta-btns">
                  <a href="/businesses-for-sale" className="ht-cta-btn ht-cta-primary">
                    Browse Businesses for Sale →
                  </a>
                  <a href="/investors-buyers" className="ht-cta-btn ht-cta-outline">
                    Connect with Investors
                  </a>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </>
  );
}