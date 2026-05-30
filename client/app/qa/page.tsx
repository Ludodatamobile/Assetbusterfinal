"use client";

import { useState } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Question {
  id: string;
  question: string;
  answer: string;
  category: string;
  popular?: boolean;
}

// ─── Data ──────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  "All Questions",
  "Getting Started",
  "Buying a Business",
  "Selling a Business",
  "Pricing & Valuation",
  "Legal & Compliance",
  "Financing & Investment",
  "Platform & Features"
];

const QUESTIONS: Question[] = [
  // Getting Started
  {
    id: "gs-1",
    category: "Getting Started",
    question: "What is Asset Busters and how does it work?",
    answer: "Asset Busters is Africa's leading online marketplace for buying and selling businesses. We connect pre-screened buyers with verified business sellers across 45+ countries. Sellers create confidential listings showcasing their businesses, while buyers browse opportunities filtered by industry, location, revenue, and other criteria. Our platform facilitates the entire transaction process from initial discovery through due diligence to closing, with optional support from our network of M&A advisors, lawyers, and accountants.",
    popular: true
  },
  {
    id: "gs-2",
    category: "Getting Started",
    question: "Is Asset Busters only for businesses in Africa?",
    answer: "While we started in Africa and have the strongest presence across the continent, we now serve businesses and investors globally. Our marketplace includes listings from the Middle East, South Asia, and Southeast Asia. However, our core expertise and largest transaction volume remains in African markets where we have deep relationships and local market knowledge."
  },
  {
    id: "gs-3",
    category: "Getting Started",
    question: "How much does it cost to use Asset Busters?",
    answer: "Creating an account and browsing businesses is completely free for buyers. Sellers have two options: (1) Basic listings are free but have limited visibility and features, or (2) Premium listings cost from $299-$999 depending on business size and desired features, offering priority placement, enhanced analytics, and dedicated support. We only charge success fees (2-5% of transaction value) when a deal closes through our platform.",
    popular: true
  },
  {
    id: "gs-4",
    category: "Getting Started",
    question: "How long does it typically take to buy or sell a business?",
    answer: "The timeline varies significantly based on business size and complexity. For smaller businesses ($100K-$1M), expect 3-6 months from listing to closing. Mid-market deals ($1M-$10M) typically take 6-12 months. Large transactions can extend to 12-18 months. Factors affecting timeline include due diligence complexity, financing arrangements, regulatory approvals, and negotiation dynamics. Our data shows premium listings close 40% faster than basic listings due to higher buyer quality."
  },

  // Buying a Business
  {
    id: "buy-1",
    category: "Buying a Business",
    question: "How do I know if a business listing is legitimate?",
    answer: "Every business on Asset Busters undergoes our 12-point verification process before going live. We verify: business registration, tax compliance, financial statements authenticity, asset ownership, and seller identity. Premium listings receive enhanced verification including third-party financial audits and operational site visits. Look for the blue 'Verified' badge on listings. Additionally, all buyers sign NDAs before accessing detailed information, and we recommend conducting your own due diligence with professional advisors before committing to any transaction.",
    popular: true
  },
  {
    id: "buy-2",
    category: "Buying a Business",
    question: "What information will I receive about a business before making an offer?",
    answer: "After signing an NDA, you'll typically receive: (1) Detailed information memorandum including business history, operations overview, and market position, (2) 3-5 years of financial statements and tax returns, (3) Customer and supplier concentration analysis, (4) Organizational structure and key employee details, (5) Asset inventory and condition reports, (6) Existing contracts, leases, and obligations, (7) Growth opportunities and risks assessment. Premium listings often include professional valuation reports and quality of earnings analyses."
  },
  {
    id: "buy-3",
    category: "Buying a Business",
    question: "Can I visit the business in person before buying?",
    answer: "Yes, site visits are strongly encouraged and typically occur after initial offer discussions. We coordinate confidential visits where you can meet the owner, tour facilities, observe operations, and interview key employees. For businesses in remote locations or international transactions, virtual tours via video call can be arranged. Most sellers allow 1-2 site visits during due diligence, with the final visit occurring just before closing to verify operational continuity."
  },
  {
    id: "buy-4",
    category: "Buying a Business",
    question: "What if I don't have industry experience in the business I want to buy?",
    answer: "Many successful acquisitions involve buyers entering new industries. Strategies for success include: (1) Buying businesses with strong existing management teams who can continue running operations, (2) Negotiating extended transition periods (3-6 months) where the seller trains you, (3) Hiring industry consultants or advisors to guide you through the first year, (4) Starting with smaller acquisitions to learn before scaling, (5) Partnering with someone who has relevant expertise. Focus on businesses with documented systems and processes rather than those heavily dependent on owner expertise.",
    popular: true
  },
  {
    id: "buy-5",
    category: "Buying a Business",
    question: "How much should I budget beyond the purchase price?",
    answer: "Plan for 20-40% additional capital beyond the purchase price. This includes: (1) Transaction costs: legal fees (1-3%), accounting/tax advice (0.5-1%), business valuation ($3K-$15K), (2) Due diligence: financial audits, environmental assessments, IT systems review ($5K-$50K depending on business size), (3) Working capital: 3-6 months of operating expenses to ensure smooth transition, (4) Immediate improvements: technology upgrades, rebranding, deferred maintenance ($10K-$100K+), (5) Contingency reserves: 10% buffer for unexpected issues. Never use 100% of available capital for the purchase—liquidity is crucial post-acquisition."
  },

  // Selling a Business
  {
    id: "sell-1",
    category: "Selling a Business",
    question: "When is the right time to sell my business?",
    answer: "The optimal time to sell is when your business demonstrates strong, sustainable performance and you're not under pressure to exit. Ideal conditions include: (1) 3+ consecutive years of revenue growth, (2) Diversified customer base (no customer >20% of revenue), (3) Strong management team that can operate without you, (4) Clean financials with clear documentation, (5) Industry tailwinds rather than headwinds, (6) You've achieved your personal financial goals with the business. Avoid selling during downturns, pending litigation, or when key contracts are expiring. Prepare 12-24 months in advance for maximum value.",
    popular: true
  },
  {
    id: "sell-2",
    category: "Selling a Business",
    question: "Should I use a broker or sell directly on Asset Busters?",
    answer: "Both approaches have merits. Direct selling via Asset Busters saves broker fees (typically 5-10% of sale price) and gives you full control over the process. However, brokers provide value through: (1) Professional business valuation and positioning, (2) Access to their network of pre-qualified buyers, (3) Negotiation expertise and deal structuring, (4) Managing multiple buyers simultaneously, (5) Maintaining confidentiality. For businesses under $1M, direct selling often makes sense. For larger or complex businesses, broker expertise can increase final sale price by more than their fee. Many sellers list on Asset Busters while also engaging a broker for maximum exposure."
  },
  {
    id: "sell-3",
    category: "Selling a Business",
    question: "How do I maintain confidentiality while selling my business?",
    answer: "Asset Busters uses several confidentiality protection measures: (1) Blind listings that don't reveal business name or specific location, (2) Mandatory NDAs before sharing detailed information, (3) Buyer pre-screening to ensure serious interest and capability, (4) Controlled information release—basic details first, financials only to qualified buyers, (5) Code names for businesses during discussions. Internally, tell employees only when a deal is likely (post-LOI), starting with key personnel. Avoid mentioning the sale to customers or suppliers until after closing. Most successful sellers maintain confidentiality until the transaction completes."
  },
  {
    id: "sell-4",
    category: "Selling a Business",
    question: "What documents do I need to prepare to sell my business?",
    answer: "Essential documents include: (1) Financial statements: 3-5 years of P&L, balance sheets, cash flow statements, tax returns, (2) Legal: articles of incorporation, bylaws, shareholder agreements, material contracts, leases, intellectual property registrations, (3) Operational: customer lists with revenue contribution, supplier agreements, employee roster with compensation, organizational chart, (4) Assets: equipment inventory, real estate appraisals, vehicle titles, (5) Compliance: licenses, permits, insurance policies, pending litigation details, environmental reports. Organize these in a virtual data room. The more organized and transparent your documentation, the faster the sale process and higher the buyer confidence."
  },
  {
    id: "sell-5",
    category: "Selling a Business",
    question: "What can I do to increase my business value before selling?",
    answer: "Focus on these high-impact improvements 12-24 months before selling: (1) Reduce owner dependency: document all processes, build a strong management team, systematize operations, (2) Clean up financials: get audited statements, resolve any tax issues, separate personal from business expenses, (3) Strengthen customer relationships: reduce concentration, increase retention rates, secure long-term contracts, (4) Improve margins: optimize pricing, reduce costs without cutting muscle, automate where possible, (5) Create growth story: enter new markets, launch new products, build scalable marketing systems, (6) Address deferred maintenance: fix equipment issues, update technology, refresh branding. Each of these can increase valuation multiples by 0.5-1x EBITDA."
  },

  // Pricing & Valuation
  {
    id: "val-1",
    category: "Pricing & Valuation",
    question: "How are businesses typically valued?",
    answer: "Most African SMEs are valued using EBITDA multiples (earnings before interest, taxes, depreciation, amortization). Typical multiples: Manufacturing 3-5x, Retail 2-4x, Healthcare 4-7x, SaaS/Tech 4-8x, Professional Services 2-4x. The multiple depends on: growth rate, customer concentration, competitive moat, owner dependency, scalability, and market conditions. For pre-revenue startups, revenue multiples (3-6x ARR) or comparable transaction analysis is used. Asset-heavy businesses may use book value plus goodwill. Get a professional valuation ($3K-$15K) to establish a credible price range supported by data.",
    popular: true
  },
  {
    id: "val-2",
    category: "Pricing & Valuation",
    question: "What is 'adjusted EBITDA' and why does it matter?",
    answer: "Adjusted EBITDA is your business's true earning power after removing owner-specific expenses and one-time items. Start with net income, add back: interest, taxes, depreciation, amortization. Then adjust for: owner salary above market rate, personal expenses (vehicles, travel), family member salaries, one-time costs (legal settlements, restructuring), below-market rent if you own the property. This normalized number reflects what earnings a new owner could expect. Higher adjusted EBITDA directly increases your business value. Buyers scrutinize adjustments—only include legitimate items you can document."
  },
  {
    id: "val-3",
    category: "Pricing & Valuation",
    question: "Why is my asking price different from what buyers are offering?",
    answer: "Common reasons for valuation gaps: (1) Your price is based on hope/emotion rather than market comparables, (2) You're not accounting for risk factors buyers see (customer concentration, owner dependency, market headwinds), (3) Your financials aren't audited/verified, reducing buyer confidence, (4) You're including personal goodwill (your relationships) that won't transfer, (5) Market conditions have changed since your last valuation, (6) Buyers have found issues during due diligence. Bridge the gap by: getting a third-party valuation, improving business fundamentals, offering seller financing or earn-outs to share risk, or adjusting expectations based on market feedback."
  },
  {
    id: "val-4",
    category: "Pricing & Valuation",
    question: "What are 'add-backs' and can I include them in my valuation?",
    answer: "Add-backs are expenses that inflate your reported costs but won't exist for a new owner. Legitimate add-backs: owner salary exceeding market rate (document market data), personal vehicle/travel expenses, family members paid above-market, one-time legal/consulting fees, non-recurring marketing campaigns, excessive charitable donations. Questionable add-backs buyers will challenge: all owner benefits (they need compensation too), depreciation (real expense even if non-cash), deferred maintenance (buyer will face it), normalized slow periods. Document every add-back with evidence. Conservative add-backs build buyer trust; aggressive ones trigger skepticism and lower offers."
  },

  // Legal & Compliance
  {
    id: "legal-1",
    category: "Legal & Compliance",
    question: "Do I need a lawyer to buy or sell a business?",
    answer: "Yes, absolutely. Business transactions involve complex legal, tax, and regulatory issues that can have lasting consequences. A qualified M&A attorney (not just a general business lawyer) will: (1) Structure the transaction optimally (asset vs. share purchase), (2) Negotiate and draft purchase agreements protecting your interests, (3) Identify hidden liabilities and contingent risks, (4) Ensure proper transfer of contracts, licenses, and intellectual property, (5) Navigate regulatory approvals and compliance requirements, (6) Advise on tax implications and optimization strategies. Legal fees typically cost 1-3% of transaction value—cheap insurance against deals gone wrong. Choose attorneys experienced in transactions similar to yours in size and industry.",
    popular: true
  },
  {
    id: "legal-2",
    category: "Legal & Compliance",
    question: "What's the difference between an asset sale and a share sale?",
    answer: "In an asset sale, the buyer purchases specific business assets (equipment, inventory, customer lists, IP) and assumes chosen liabilities. Advantages for buyers: avoid hidden liabilities, select only desired assets, depreciation benefits. Disadvantages: contracts may need re-negotiation, complex asset transfer process. In a share sale, the buyer purchases ownership shares in the legal entity. Advantages for buyers: simpler transfer, contracts remain intact, often required for licensed businesses. Disadvantages: inherit all liabilities including hidden ones. Sellers typically prefer share sales (single tax event, cleaner exit), buyers prefer asset sales (risk mitigation). The structure significantly impacts tax treatment, so consult both legal and tax advisors."
  },
  {
    id: "legal-3",
    category: "Legal & Compliance",
    question: "What is a Letter of Intent (LOI) and is it binding?",
    answer: "An LOI is a preliminary agreement outlining proposed transaction terms before final contracts. Typical LOI contents: purchase price and structure, payment terms (cash/financing/earn-outs), due diligence period and conditions, exclusivity period, transition support expectations, target closing date. Most LOIs are non-binding except for specific clauses: confidentiality obligations, exclusivity period (prevents seller from talking to other buyers), expense allocation. LOIs demonstrate serious intent and align parties before expensive legal work begins. Expect 30-90 days from LOI to final purchase agreement. Never consider an LOI a done deal—50% of LOIs don't reach closing due to due diligence findings or financing issues."
  },
  {
    id: "legal-4",
    category: "Legal & Compliance",
    question: "What happens if something goes wrong after the sale?",
    answer: "Purchase agreements include several protection mechanisms: (1) Representations and warranties: seller's statements about the business (financial condition, legal compliance, etc.). If false, buyer can seek damages, (2) Indemnification clauses: seller compensates buyer for specific losses (pending lawsuits, tax liabilities, environmental issues), (3) Escrow holdbacks: 10-20% of purchase price held for 6-18 months to cover breaches, (4) Earn-outs: future payments contingent on performance metrics, (5) Non-compete agreements: prevent seller from starting competing business. Typical indemnification caps are 10-30% of purchase price for 1-2 years. Both parties should have strong legal counsel negotiating these protective terms."
  },

  // Financing & Investment
  {
    id: "fin-1",
    category: "Financing & Investment",
    question: "How can I finance a business acquisition if I don't have all the cash?",
    answer: "Multiple financing options exist: (1) SBA loans (US) or local SME loan programs: 70-90% financing at reasonable rates, (2) Seller financing: seller provides 10-40% as a note payable over 3-7 years, (3) Bank loans: traditional commercial loans require 20-40% down payment, (4) Investor equity: bring in partners who provide capital for ownership stake, (5) Asset-based lending: borrow against business assets (inventory, receivables, equipment), (6) Rollover equity: if you're selling another business, use proceeds as down payment. Most successful acquisitions use a combination: 30-50% buyer cash, 20-30% seller note, 30-40% bank/investor financing. Strong financials and experienced management significantly improve financing approval odds.",
    popular: true
  },
  {
    id: "fin-2",
    category: "Financing & Investment",
    question: "What is seller financing and how does it work?",
    answer: "Seller financing (or seller note) is when the seller provides part of the purchase price as a loan to the buyer. Example: $1M business—buyer pays $700K cash at closing, seller provides $300K note payable over 5 years at 6% interest. Benefits for buyers: reduces cash needed, shows seller confidence in business, easier approval than bank loans. Benefits for sellers: achieves higher sale price, tax benefits from spreading income, interest income. Typical terms: 10-40% of purchase price, 3-7 year amortization, 5-8% interest rate, secured by business assets, personal guarantee from buyer. Seller notes are subordinated to bank loans and typically don't start payments until 6-12 months post-closing to allow business stabilization."
  },
  {
    id: "fin-3",
    category: "Financing & Investment",
    question: "What do investors look for when evaluating businesses?",
    answer: "Investors prioritize: (1) Traction: proven business model with revenue (even if not profitable yet), (2) Growth potential: large addressable market with clear path to scale, (3) Competitive advantage: what's defensible about your position (IP, network effects, brand), (4) Team: experienced, capable founders who can execute, (5) Unit economics: path to profitability with healthy margins, (6) Return potential: credible path to 10x return within 5-7 years. Different investor types have different criteria—angels prioritize team, VCs prioritize scalability, PE firms prioritize cash flow and EBITDA. Prepare a compelling pitch deck, realistic financials, and clear use of funds. Be ready to discuss risks and mitigation strategies transparently."
  },
  {
    id: "fin-4",
    category: "Financing & Investment",
    question: "What is an 'earn-out' and when should it be used?",
    answer: "An earn-out is a contingent payment where part of the purchase price is paid based on future business performance. Example: $800K upfront + up to $400K over 3 years if business achieves specific revenue/EBITDA targets. Used when: (1) Valuation gap exists between buyer and seller expectations, (2) Business heavily depends on seller relationships that must transition, (3) Business is high-growth with uncertain trajectory, (4) Seller wants to participate in future upside. Earn-out metrics should be: objective and measurable (revenue, EBITDA, customer retention), within seller's influence during earn-out period, independently verifiable, with clear calculation methodology. Typical terms: 20-40% of total price, 2-3 year period, paid annually. Negotiate who controls business operations during earn-out period to avoid disputes."
  },

  // Platform & Features
  {
    id: "plat-1",
    category: "Platform & Features",
    question: "What's the difference between Basic and Premium listings?",
    answer: "Basic listings (free) include: business description up to 500 words, basic financial snapshot, industry category and location, standard search visibility, buyer inquiries forwarded to email. Premium listings ($299-$999) add: priority placement in search results, enhanced 1,500-word description with photos, detailed financial charts and metrics, verified badge after enhanced due diligence, featured placement on homepage/category pages, advanced analytics (views, inquiries, engagement), dedicated account manager support, professional listing copywriting assistance, email alerts to matched investors. Our data shows premium listings receive 4x more buyer inquiries and close 40% faster than basic listings.",
    popular: true
  },
  {
    id: "plat-2",
    category: "Platform & Features",
    question: "How does Asset Busters protect my information?",
    answer: "We employ multiple security layers: (1) All data encrypted in transit (TLS 1.3) and at rest (AES-256), (2) Two-factor authentication available for all accounts, (3) Mandatory NDAs before accessing detailed business information, (4) Buyer identity and financial capability verification before contact, (5) Virtual data rooms with granular access controls and download tracking, (6) Blind listings that don't reveal business identity in search results, (7) Regular third-party security audits and penetration testing, (8) Compliance with GDPR, POPIA, and local data protection laws. We never sell your data to third parties. Sellers control who sees what information and when. All communication within platform is logged for dispute resolution."
  },
  {
    id: "plat-3",
    category: "Platform & Features",
    question: "Can I search for businesses in specific industries or locations?",
    answer: "Yes, our advanced filtering allows you to search by: (1) Industry: 50+ categories from Healthcare to SaaS to Manufacturing, (2) Location: country, state/province, city, or 'remote/online' businesses, (3) Revenue range: from <$100K to $10M+, (4) Asking price: filter by your budget, (5) Profitability: profitable vs. high-growth/pre-profit, (6) Business type: established vs. startup, franchise vs. independent, (7) Deal structure: asset sale vs. equity investment vs. partnership, (8) Seller motivation: retirement, relocation, capital for growth. Save your search criteria and receive email alerts when new matching businesses are listed. Premium members can create up to 10 saved searches vs. 2 for free accounts."
  },
  {
    id: "plat-4",
    category: "Platform & Features",
    question: "What support does Asset Busters provide during the transaction process?",
    answer: "Our support varies by membership level. All users receive: (1) Educational resources: guides, templates, checklists for buying/selling, (2) Secure messaging platform for buyer-seller communication, (3) Transaction checklist and milestone tracking, (4) Access to our professional network (M&A advisors, lawyers, accountants). Premium members additionally get: (1) Dedicated account manager who guides you through the process, (2) Mediation services if disputes arise during negotiation, (3) Document template library (LOI, NDA, purchase agreement frameworks), (4) Valuation support and market analysis, (5) Financing introduction to lenders and investors in our network. We don't provide legal or financial advice directly—always engage your own licensed professionals for that—but we facilitate connections and provide process guidance."
  }
];

// ─── Components ────────────────────────────────────────────────────────────────

function SearchBar({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  return (
    <div className="qa-search-wrap">
      <div className="qa-search-box">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2.2"/>
          <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
        </svg>
        <input
          type="search"
          className="qa-search-input"
          placeholder="Search questions... (e.g., 'how to value', 'seller financing', 'legal requirements')"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}

function CategoryFilter({ categories, active, onSelect }: { categories: string[]; active: string; onSelect: (cat: string) => void }) {
  return (
    <div className="qa-cat-filter">
      {categories.map(cat => (
        <button
          key={cat}
          className={`qa-cat-btn ${active === cat ? "active" : ""}`}
          onClick={() => onSelect(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}

function QuestionCard({ question, isOpen, onToggle }: { question: Question; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className={`qa-card ${isOpen ? "is-open" : ""}`}>
      <button className="qa-card-header" onClick={onToggle}>
        <div className="qa-card-left">
          {question.popular && <span className="qa-popular-badge">Popular</span>}
          <h3 className="qa-question">{question.question}</h3>
        </div>
        <svg
          className="qa-chevron"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M6 9l6 6 6-6"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {isOpen && (
        <div className="qa-card-body">
          <p className="qa-answer">{question.answer}</p>
        </div>
      )}
    </div>
  );
}

// --- Main Component--- Elijah Worked here 😒

export default function QAPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Questions");
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);

  // Filter questions
  const filtered = QUESTIONS.filter(q => {
    const matchesCategory = activeCategory === "All Questions" || q.category === activeCategory;
    const matchesSearch =
      searchQuery === "" ||
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Separate popular questions
  const popularQuestions = filtered.filter(q => q.popular);
  const regularQuestions = filtered.filter(q => !q.popular);

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

        .qa-page{min-height:100vh;padding-top:102px;background:var(--surf)}

        /* ── Hero ── */
        .qa-hero{
          background:var(--navy);
          padding:44px 0 40px;
          position:relative;overflow:hidden;
          border-bottom:1px solid rgba(255,255,255,.06);
        }
        .qa-hero::before{
          content:'';position:absolute;inset:0;
          background:
            radial-gradient(ellipse 55% 70% at 75% 45%, rgba(26,86,219,.13) 0%, transparent 68%),
            radial-gradient(ellipse 45% 65% at 25% 55%, rgba(245,166,35,.09) 0%, transparent 65%);
          pointer-events:none;
        }
        .qa-hero-inner{max-width:var(--mw);margin:0 auto;padding:0 28px;position:relative;text-align:center}
        .qa-hero-breadcrumb{
          display:inline-flex;align-items:center;gap:6px;margin-bottom:14px;
          font-size:11px;color:rgba(255,255,255,.38);
        }
        .qa-hero-breadcrumb a{color:rgba(255,255,255,.55);text-decoration:none;transition:color var(--t)}
        .qa-hero-breadcrumb a:hover{color:#fff}
        .qa-hero-eyebrow{
          display:inline-flex;align-items:center;gap:7px;
          background:rgba(245,166,35,.18);border:1px solid rgba(245,166,35,.32);
          color:#fbbf24;font-size:10px;font-weight:700;
          letter-spacing:1.2px;text-transform:uppercase;
          padding:4px 10px;margin-bottom:12px;
        }
        .qa-hero-eyebrow-icon{font-size:14px}
        .qa-hero-heading{
          font-size:clamp(28px,3.6vw,44px);
          font-weight:800;color:#fff;letter-spacing:-.9px;
          margin-bottom:10px;line-height:1.1;
        }
        .qa-hero-heading span{color:#F5A623}
        .qa-hero-desc{
          font-size:13.5px;color:rgba(255,255,255,.52);line-height:1.75;
          max-width:640px;margin:0 auto 28px;
        }

        /* ── Search ── */
        .qa-search-wrap{max-width:680px;margin:0 auto}
        .qa-search-box{
          background:rgba(255,255,255,.95);
          border:2px solid rgba(255,255,255,.2);
          border-radius:8px;
          display:flex;align-items:center;gap:12px;
          padding:14px 18px;
          box-shadow:0 8px 32px rgba(0,0,0,.15);
          transition:all var(--t);
        }
        .qa-search-box:focus-within{
          border-color:#F5A623;
          box-shadow:0 8px 32px rgba(0,0,0,.15), 0 0 0 3px rgba(245,166,35,.15);
        }
        .qa-search-box svg{color:var(--t3);flex-shrink:0}
        .qa-search-input{
          flex:1;border:none;outline:none;background:none;
          font-size:13.5px;color:var(--navy);font-family:var(--font);font-weight:500;
        }
        .qa-search-input::placeholder{color:var(--t3)}
        .qa-search-input::-webkit-search-cancel-button{display:none}

        /* ── Main ── */
        .qa-main{max-width:var(--mw);margin:0 auto;padding:32px 28px 64px}

        /* ── Category Filter ── */
        .qa-cat-filter{
          display:flex;gap:8px;flex-wrap:wrap;
          margin-bottom:28px;justify-content:center;
        }
        .qa-cat-btn{
          background:var(--bg);border:1px solid var(--bdr);
          color:var(--t2);font-size:12px;font-weight:600;
          padding:8px 16px;cursor:pointer;font-family:var(--font);
          transition:all var(--t);letter-spacing:.2px;
          white-space:nowrap;
        }
        .qa-cat-btn:hover{border-color:var(--blue);color:var(--navy)}
        .qa-cat-btn.active{background:var(--blue);color:#fff;border-color:var(--blue)}

        /* ── Stats Banner ── */
        .qa-stats-banner{
          background:linear-gradient(135deg,#eef3fd,#f0f9ff);
          border:1px solid #c4d5f9;
          border-radius:6px;
          padding:18px 24px;margin-bottom:28px;
          display:flex;align-items:center;justify-content:space-between;
          flex-wrap:wrap;gap:20px;
        }
        .qa-stat-item{display:flex;flex-direction:column;gap:2px}
        .qa-stat-val{font-size:22px;font-weight:800;color:var(--blue);letter-spacing:-.5px}
        .qa-stat-label{font-size:10px;color:var(--t3);text-transform:uppercase;letter-spacing:.6px;font-weight:600}

        /* ── Section Headers ── */
        .qa-section-header{
          display:flex;align-items:center;gap:12px;margin-bottom:16px;
        }
        .qa-section-icon{font-size:20px}
        .qa-section-title{font-size:17px;font-weight:700;color:var(--navy);letter-spacing:-.4px}
        .qa-section-line{flex:1;height:2px;background:linear-gradient(90deg,var(--bdr),transparent)}

        /* ── Questions ── */
        .qa-questions-section{margin-bottom:40px}
        .qa-questions-grid{display:flex;flex-direction:column;gap:12px}
        .qa-card{
          background:var(--bg);border:1px solid var(--bdr);
          transition:all var(--t);
        }
        .qa-card:hover{border-color:#c4d0e8;box-shadow:0 4px 18px rgba(0,0,0,.06)}
        .qa-card.is-open{border-color:var(--blue);box-shadow:0 6px 24px rgba(26,86,219,.12)}
        .qa-card-header{
          width:100%;background:none;border:none;
          padding:18px 22px;cursor:pointer;
          display:flex;align-items:center;justify-content:space-between;
          gap:16px;text-align:left;font-family:var(--font);
        }
        .qa-card-left{display:flex;flex-direction:column;gap:8px;flex:1;min-width:0}
        .qa-popular-badge{
          display:inline-flex;align-items:center;gap:5px;
          background:linear-gradient(135deg,#fbbf24,#f59e0b);
          color:#fff;font-size:9px;font-weight:800;
          letter-spacing:.8px;text-transform:uppercase;
          padding:3px 9px;border-radius:3px;
          width:fit-content;
        }
        .qa-popular-badge::before{content:'⭐';font-size:10px}
        .qa-question{
          font-size:14px;font-weight:600;color:var(--navy);
          line-height:1.4;letter-spacing:-.2px;
        }
        .qa-chevron{
          color:var(--t3);flex-shrink:0;
          transition:transform var(--t);
        }
        .qa-card.is-open .qa-chevron{transform:rotate(180deg);color:var(--blue)}
        .qa-card-body{
          padding:0 22px 22px;
          border-top:1px solid var(--surf);
          animation:qaSlideDown .2s ease;
        }
        @keyframes qaSlideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        .qa-answer{
          font-size:12.5px;color:var(--t2);line-height:1.8;
          padding-top:16px;
        }

        /* ── Empty State ── */
        .qa-empty{
          text-align:center;padding:60px 20px;
          background:var(--bg);border:1px solid var(--bdr);
        }
        .qa-empty-icon{font-size:42px;margin-bottom:14px}
        .qa-empty-title{font-size:15px;font-weight:600;color:var(--t2);margin-bottom:6px}
        .qa-empty-desc{font-size:12px;color:var(--t3)}

        /* ── CTA Section ── */
        .qa-cta-section{
          background:var(--bg);border:1px solid var(--bdr);
          padding:32px 28px;text-align:center;
        }
        .qa-cta-title{
          font-size:19px;font-weight:700;color:var(--navy);
          letter-spacing:-.4px;margin-bottom:8px;
        }
        .qa-cta-desc{
          font-size:12.5px;color:var(--t3);line-height:1.7;
          max-width:560px;margin:0 auto 20px;
        }
        .qa-cta-btns{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
        .qa-cta-btn{
          display:inline-flex;align-items:center;gap:7px;
          font-size:12.5px;font-weight:700;
          padding:10px 20px;cursor:pointer;border:none;
          text-decoration:none;font-family:var(--font);
          transition:all var(--t);letter-spacing:.2px;
        }
        .qa-cta-primary{background:var(--blue);color:#fff}
        .qa-cta-primary:hover{background:#1444B8;transform:translateY(-1px)}
        .qa-cta-outline{background:none;color:var(--t2);border:1px solid var(--bdr)!important}
        .qa-cta-outline:hover{border-color:var(--blue)!important;color:var(--blue)}

        @media(max-width:640px){
          .qa-main{padding:24px 16px 48px}
          .qa-hero{padding:32px 0 28px}
          .qa-hero-inner{padding:0 16px}
          .qa-cat-filter{justify-content:flex-start}
          .qa-stats-banner{flex-direction:column;align-items:flex-start}
          .qa-card-header{padding:14px 16px}
          .qa-card-body{padding:0 16px 16px}
        }
      `}</style>

      <div className="qa-page">

        {/* ── Hero ── */}
        <section className="qa-hero">
          <div className="qa-hero-inner">
            <nav className="qa-hero-breadcrumb" aria-label="Breadcrumb">
              <a href="/">Home</a>
              <span>/</span>
              <span>Q & A</span>
            </nav>

            <div className="qa-hero-eyebrow">
              <span className="qa-hero-eyebrow-icon">💬</span>
              Help Center
            </div>
            <h1 className="qa-hero-heading">
              Questions &amp; <span>Answers</span>
            </h1>
            <p className="qa-hero-desc">
              Everything you need to know about buying, selling, and investing in businesses.
              Search our comprehensive knowledge base or browse by category.
            </p>

            <SearchBar value={searchQuery} onChange={setSearchQuery}/>
          </div>
        </section>

        {/* ── Main ── */}
        <main className="qa-main">

          {/* Stats Banner */}
          <div className="qa-stats-banner">
            <div className="qa-stat-item">
              <span className="qa-stat-val">{QUESTIONS.length}</span>
              <span className="qa-stat-label">Questions Answered</span>
            </div>
            <div className="qa-stat-item">
              <span className="qa-stat-val">{CATEGORIES.length - 1}</span>
              <span className="qa-stat-label">Topic Categories</span>
            </div>
            <div className="qa-stat-item">
              <span className="qa-stat-val">24/7</span>
              <span className="qa-stat-label">Knowledge Access</span>
            </div>
            <div className="qa-stat-item">
              <span className="qa-stat-val">12,000+</span>
              <span className="qa-stat-label">Questions Resolved Monthly</span>
            </div>
          </div>

          {/* Category Filter */}
          <CategoryFilter
            categories={CATEGORIES}
            active={activeCategory}
            onSelect={setActiveCategory}
          />

          {/* Popular Questions */}
          {popularQuestions.length > 0 && (
            <div className="qa-questions-section">
              <div className="qa-section-header">
                <span className="qa-section-icon">⭐</span>
                <h2 className="qa-section-title">Most Popular Questions</h2>
                <div className="qa-section-line"/>
              </div>
              <div className="qa-questions-grid">
                {popularQuestions.map(q => (
                  <QuestionCard
                    key={q.id}
                    question={q}
                    isOpen={openQuestion === q.id}
                    onToggle={() => setOpenQuestion(openQuestion === q.id ? null : q.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Regular Questions */}
          {regularQuestions.length > 0 && (
            <div className="qa-questions-section">
              <div className="qa-section-header">
                <span className="qa-section-icon">📋</span>
                <h2 className="qa-section-title">
                  {activeCategory === "All Questions" ? "All Questions" : activeCategory}
                </h2>
                <div className="qa-section-line"/>
              </div>
              <div className="qa-questions-grid">
                {regularQuestions.map(q => (
                  <QuestionCard
                    key={q.id}
                    question={q}
                    isOpen={openQuestion === q.id}
                    onToggle={() => setOpenQuestion(openQuestion === q.id ? null : q.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {filtered.length === 0 && (
            <div className="qa-empty">
              <div className="qa-empty-icon">🔍</div>
              <p className="qa-empty-title">No questions found</p>
              <p className="qa-empty-desc">
                Try adjusting your search or browse a different category
              </p>
            </div>
          )}

          {/* CTA */}
          <div className="qa-cta-section">
            <h3 className="qa-cta-title">Still have questions?</h3>
            <p className="qa-cta-desc">
              Can't find what you're looking for? Our support team is here to help. Send us a
              message and we'll get back to you within 24 hours.
            </p>
            <div className="qa-cta-btns">
              <a href="/company/contact" className="qa-cta-btn qa-cta-primary">
                Contact Support
              </a>
              <a href="/how-to" className="qa-cta-btn qa-cta-outline">
                Browse Guides
              </a>
            </div>
          </div>

        </main>
      </div>
    </>
  );
}