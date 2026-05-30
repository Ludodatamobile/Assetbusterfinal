"use client";

import { useState } from "react";

// ─── Data ──────────────────────────────────────────────────────────────────────

const FOOTER_CAT_TABS = [
  "Popular", "Food & Beverage", "Technology", "Manufacturing", "Retail Stores",
  "Personal Services", "Business Services", "Hotels & Resorts", "Healthcare",
  "Entertainment & Recreation", "Investors & Buyers", "Franchise",
  "In-Demand Industry Hubs", "Other",
];

const FOOTER_BROWSE_LINKS = [
  { label: "Mid Market Businesses for Sale", href: "/mid-market-businesses-for-sale-and-investment/x48b/" },
  { label: "Lower Middle Market Businesses", href: "/lower-middle-market-businesses-for-sale-and-investment/x49b/" },
  { label: "Low Price Businesses for Sale", href: "/low-price-businesses-for-sale-and-investment/x50b/" },
  { label: "Public Shells for Sale", href: "/shell-companies-for-sale-and-investment/s1447b/" },
  { label: "Investment Banking Firms", href: "/investment-banking-firms/m6x60i/" },
  { label: "Business for Takeover", href: "/businesses-for-sale/t2x62b/" },
  { label: "Business Opportunities", href: "/businesses-for-sale-and-investment/x63b/" },
  { label: "Business Joint Venture Opportunities", href: "/businesses-for-sale-and-investment/t5t11x74b/" },
  { label: "Business for Sale by Owner", href: "/businesses-for-sale-by-owner/t2x75b/" },
  { label: "Startups for Sale", href: "/startups-for-sale/t2x76b/" },
  { label: "Best Businesses for Sale", href: "/best-businesses-for-sale-and-investment/x77b/" },
  { label: "Companies for Sale", href: "/companies-for-sale-and-investment/x78b/" },
  { label: "Manufacturing Business for Sale", href: "/manufacturing-businesses-for-sale-and-investment/x88b/" },
  { label: "Sell Company", href: "/company-buyers/m2t2x92i/" },
  { label: "Sell Public Shells", href: "/shell-company-buyers/s1447t2i/" },
  { label: "Distributors", href: "/distributorship-opportunities/t11x147b/" },
  { label: "Dealerships", href: "/dealership-opportunities/t11x148b/" },
  { label: "Businesses for Sale", href: "/businesses-for-sale/t2b/" },
  { label: "Investors", href: "/investors/i/" },
  { label: "M&A Advisors", href: "/ma-advisors/m19i/" },
  { label: "Owner Financed Businesses", href: "/owner-financed-businesses-for-sale/t2x214b/" },
  { label: "Factories for Sale", href: "/factories-for-sale-and-investment/x225b/" },
  { label: "Retiring Owner Business", href: "/retiring-owner-businesses-for-sale/t2x227b/" },
  { label: "Boring Businesses for Sale", href: "/boring-hvac-businesses-for-sale-and-investment/x233b/" },
];

const FOOTER_COLS = [
  {
    title: "Get Started",
    links: [
      { label: "Sell your Business", href: "/how-to/sell-your-business/" },
      { label: "Finance your Business", href: "/how-to/finance-your-business/" },
      { label: "Buy a Business", href: "/how-to/buy-a-business/" },
      { label: "Invest in a Business", href: "/how-to/invest-in-a-business/" },
      { label: "Franchise your Business", href: "/how-to/find-franchise-partners/" },
      { label: "Register as Advisor", href: "/register-as-advisor/" },
    ],
  },
  {
    title: "Businesses",
    links: [
      { label: "Businesses For Sale", href: "/businesses-for-sale/t2b/" },
      { label: "Investment Opportunities", href: "/business-investment-opportunities/t5b/" },
      { label: "Businesses Seeking Loan", href: "/businesses-seeking-loan/t10b/" },
      { label: "Business Assets For Sale", href: "/business-assets-for-sale/t9b/" },
    ],
  },
  {
    title: "Investors",
    links: [
      { label: "Individual Investors", href: "/individual-business-investors/m1i/" },
      { label: "Business Buyers", href: "/business-buyers/t2i/" },
      { label: "Corporate Investors", href: "/business-strategic-investors/m2i/" },
      { label: "Venture Capital Firms", href: "/venture-capital-firms/m3i/" },
      { label: "Private Equity Firms", href: "/private-equity-firms/m4i/" },
      { label: "Family Offices", href: "/family-offices/m8i/" },
      { label: "Business Lenders", href: "/business-lenders/m5i/" },
    ],
  },
  {
    title: "Valuation",
    links: [
      { label: "How to Value a Business", href: "/how-to-value-a-business/" },
      { label: "Business Valuation Calculator", href: "/business-valuation-calculator" },
    ],
  },
  {
    title: "Advisors",
    links: [
      { label: "Investment Banks", href: "/investment-banks/m17i/" },
      { label: "M&A Advisors", href: "/ma-advisors/m19i/" },
      { label: "Business Brokers", href: "/business-brokers/m15i/" },
      { label: "CRE Brokers", href: "/commercial-real-estate-brokers/m21i/" },
      { label: "Financial Consultants", href: "/business-financial-consultants/m16i/" },
      { label: "Accountants", href: "/business-accounting-firms/m14i/" },
      { label: "Law Firms", href: "/law-firms/m18i/" },
    ],
  },
  {
    title: "CIM / Business Plan",
    links: [
      { label: "Confidential Information Memorandum", href: "/confidential-information-memorandum/" },
    ],
  },
  {
    title: "Franchises",
    links: [
      { label: "Franchises For Sale", href: "/franchise-opportunities/t11b/" },
      { label: "Franchise Investors", href: "/franchise-buyers/t11i/" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about/" },
      { label: "Testimonials", href: "/testimonials/" },
      { label: "Blog", href: "/blog/" },
      { label: "Press", href: "/press/" },
      { label: "FAQs", href: "/faq/" },
    ],
  },
];

const SOCIALS = [
  {
    name: "LinkedIn",
    href: "https://linkedin.com/company/asset-busters",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
  },
  {
    name: "WhatsApp",
    href: "https://wa.me/assetbusters",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
      </svg>
    ),
  },
  {
    name: "Twitter / X",
    href: "https://twitter.com/assetbusters",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    name: "Facebook",
    href: "https://facebook.com/assetbusters",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
  {
    name: "YouTube",
    href: "https://youtube.com/assetbusters",
    icon: (
      <svg width="20" height="14" viewBox="0 0 24 17" fill="currentColor">
        <path d="M23.495 2.205a3.02 3.02 0 0 0-2.126-2.138C19.505 0 12 0 12 0S4.495 0 2.631.067A3.02 3.02 0 0 0 .505 2.205 31.24 31.24 0 0 0 0 8.005a31.24 31.24 0 0 0 .505 5.8 3.02 3.02 0 0 0 2.126 2.137C4.495 16.01 12 16.01 12 16.01s7.505 0 9.369-.067a3.02 3.02 0 0 0 2.126-2.138A31.24 31.24 0 0 0 24 8.005a31.24 31.24 0 0 0-.505-5.8zM9.609 11.445V4.564l6.264 3.44-6.264 3.441z"/>
      </svg>
    ),
  },
  {
    name: "Instagram",
    href: "https://instagram.com/assetbusters",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
      </svg>
    ),
  },
];

// ══════════════════════════════════════════════════════════════════════════════
// FOOTER COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

export default function Footer() {
  const [activeTab, setActiveTab] = useState("Popular");

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --max-w: 82rem;
          --blue: #1A56DB; --accent: #F5A623; --accent-d: #D4891A;
          --dark: #0b1629; --dark-2: #0f1e36; --dark-3: #1a2d4a;
          --font-sans: 'Inter', system-ui, sans-serif;
          --font-display: 'Poppins', 'Inter', sans-serif;
          --r4: 4px; --r6: 6px; --r8: 8px;
          --t: 180ms cubic-bezier(.4,0,.2,1);
        }

        .footer { font-family: var(--font-sans); background: var(--dark-2); }

        /* ══════ CTA BAND ══════ */
        .footer-cta-band {
          background: linear-gradient(135deg, #0f1e36 0%, #1A56DB 55%, #2563eb 100%);
          border-top: 1px solid rgba(255,255,255,.06);
          position: relative;
          overflow: hidden;
        }
        .footer-cta-band::before {
          content: '';
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(ellipse 60% 70% at 25% 40%, rgba(245,166,35,.14) 0%, transparent 60%),
            radial-gradient(ellipse 50% 65% at 80% 60%, rgba(212,42,43,.12) 0%, transparent 65%);
          pointer-events: none;
        }
        .footer-cta-inner {
          max-width: var(--max-w); margin: 0 auto; padding: 32px 24px;
          display: flex; align-items: center; justify-content: space-between; gap: 28px;
          flex-wrap: wrap; position: relative;
        }
        .footer-cta-heading {
          font-family: var(--font-display); font-size: 20px; font-weight: 800;
          color: #fff; letter-spacing: -.4px; line-height: 1.3;
        }
        .footer-cta-sub { 
          font-size: 13.5px; color: rgba(255,255,255,.62); 
          margin-top: 5px; line-height: 1.6; 
        }
        .footer-cta-actions { display: flex; gap: 11px; flex-shrink: 0; flex-wrap: wrap; }
        .footer-cta-btn-primary {
          display: inline-flex; align-items: center; gap: 6px;
          text-decoration: none;
          background: var(--accent); color: #fff; font-weight: 700;
          font-size: 13.5px; padding: 11px 22px; border-radius: var(--r6);
          transition: all var(--t); box-shadow: 0 4px 14px rgba(245,166,35,.28);
        }
        .footer-cta-btn-primary:hover { 
          background: var(--accent-d); 
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(245,166,35,.35);
        }
        .footer-cta-btn-outline {
          display: inline-flex; align-items: center; gap: 6px;
          text-decoration: none;
          background: rgba(255,255,255,.1); color: rgba(255,255,255,.92);
          border: 1.5px solid rgba(255,255,255,.24); font-weight: 600;
          font-size: 13.5px; padding: 10px 22px; border-radius: var(--r6);
          transition: all var(--t);
        }
        .footer-cta-btn-outline:hover { 
          background: rgba(255,255,255,.18); 
          border-color: rgba(255,255,255,.4);
          transform: translateY(-1px);
        }

        /* ══════ BROWSE BY CATEGORY ══════ */
        .footer-cat-section {
          background: linear-gradient(180deg, #0d1b2e 0%, #0b1629 100%);
          border-top: 1px solid rgba(255,255,255,.05);
          padding: 28px 0;
        }
        .footer-cat-inner { max-width: var(--max-w); margin: 0 auto; padding: 0 24px; }
        .footer-cat-header { margin-bottom: 14px; }
        .footer-cat-title {
          font-size: 10px; font-weight: 700; letter-spacing: 1.3px;
          text-transform: uppercase; color: rgba(255,255,255,.32);
        }
        .footer-cat-tabs {
          display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px;
        }
        .footer-cat-tab {
          background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.09);
          color: rgba(255,255,255,.5); font-size: 11.5px; font-weight: 600;
          padding: 5px 13px; border-radius: 100px; cursor: pointer;
          font-family: var(--font-sans); transition: all var(--t);
        }
        .footer-cat-tab:hover { 
          background: rgba(255,255,255,.11); 
          color: rgba(255,255,255,.8); 
          border-color: rgba(255,255,255,.15);
        }
        .footer-cat-tab.is-active { 
          background: var(--blue); 
          border-color: var(--blue); 
          color: #fff; 
          box-shadow: 0 2px 8px rgba(26,86,219,.3);
        }
        .footer-browse-links {
          display: flex; flex-wrap: wrap; gap: 7px;
        }
        .footer-browse-link {
          text-decoration: none; font-size: 12px; color: rgba(255,255,255,.4);
          font-weight: 500; padding: 2px 0;
          transition: color var(--t);
        }
        .footer-browse-link:hover { color: rgba(255,255,255,.8); }
        .footer-browse-link::after { 
          content: "·"; margin-left: 7px; 
          color: rgba(255,255,255,.15); 
        }
        .footer-browse-link:last-child::after { display: none; }

        /* ══════ MAIN LINK AREA ══════ */
        .footer-main {
          background: var(--dark-2);
          border-top: 1px solid rgba(255,255,255,.05);
          padding: 48px 0 38px;
        }
        .footer-main-inner {
          max-width: var(--max-w); margin: 0 auto; padding: 0 24px;
          display: grid; grid-template-columns: 300px 1fr; gap: 56px;
        }

        /* Brand col */
        .footer-brand-col { display: flex; flex-direction: column; gap: 18px; }
        .footer-logo-wrap {
          display: flex; align-items: center; gap: 10px; text-decoration: none;
          margin-bottom: 4px;
        }
        .footer-logo-text-group { display: flex; flex-direction: column; line-height: 1; gap: 3px; }
        .footer-logo-name {
          font-family: var(--font-display); font-size: 16px; font-weight: 800;
          letter-spacing: .6px; text-transform: uppercase;
        }
        .footer-logo-tagline {
          font-size: 7.5px; color: rgba(255,255,255,.38);
          letter-spacing: .8px; text-transform: uppercase;
        }
        .footer-brand-desc { 
          font-size: 12.5px; color: rgba(255,255,255,.42); 
          line-height: 1.75; 
        }
        .footer-contact-row { display: flex; flex-direction: column; gap: 8px; }
        .footer-contact-chip {
          display: inline-flex; align-items: center; gap: 8px;
          text-decoration: none; color: rgba(255,255,255,.52); 
          font-size: 12.5px; font-weight: 500;
          background: rgba(255,255,255,.06); 
          border: 1px solid rgba(255,255,255,.09);
          padding: 8px 14px; border-radius: var(--r6);
          transition: all var(--t);
        }
        .footer-contact-chip:hover { 
          background: rgba(255,255,255,.11); 
          color: rgba(255,255,255,.9); 
          border-color: rgba(255,255,255,.15);
        }

        /* Link grid */
        .footer-link-grid {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px 24px;
        }
        .footer-col-title {
          font-size: 11.5px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 1px; color: rgba(255,255,255,.58); margin-bottom: 13px;
          padding-bottom: 8px; border-bottom: 1.5px solid rgba(255,255,255,.08);
        }
        .footer-col-links { list-style: none; display: flex; flex-direction: column; gap: 8px; }
        .footer-col-link {
          text-decoration: none; font-size: 12.5px; font-weight: 500;
          color: rgba(255,255,255,.4); transition: color var(--t);
          display: inline-block;
        }
        .footer-col-link:hover { color: rgba(255,255,255,.85); }

        /* ══════ BOTTOM BAR ══════ */
        .footer-bottom {
          background: var(--dark); 
          border-top: 1px solid rgba(255,255,255,.05);
          padding: 18px 0;
        }
        .footer-bottom-inner {
          max-width: var(--max-w); margin: 0 auto; padding: 0 24px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 20px; flex-wrap: wrap;
        }
        .footer-bottom-left { display: flex; flex-direction: column; gap: 8px; }
        .footer-copy { 
          font-size: 12px; color: rgba(255,255,255,.3); 
          font-weight: 500;
        }
        .footer-legal-links { display: flex; gap: 0; flex-wrap: wrap; }
        .footer-legal-link {
          text-decoration: none; font-size: 12px; color: rgba(255,255,255,.3);
          transition: color var(--t); padding-right: 16px; margin-right: 16px;
          border-right: 1px solid rgba(255,255,255,.12);
          font-weight: 500;
        }
        .footer-legal-link:last-child { border-right: none; }
        .footer-legal-link:hover { color: rgba(255,255,255,.7); }

        .footer-socials { display: flex; align-items: center; gap: 9px; flex-wrap: wrap; }
        .footer-social-btn {
          display: flex; align-items: center; justify-content: center;
          width: 38px; height: 38px; border-radius: var(--r6);
          background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.11);
          color: rgba(255,255,255,.5); text-decoration: none;
          transition: all var(--t);
        }
        .footer-social-btn:hover { 
          background: rgba(255,255,255,.15); 
          color: #fff; 
          border-color: rgba(255,255,255,.22); 
          transform: translateY(-2px);
        }
        .footer-payment-chip {
          display: inline-flex; align-items: center; gap: 7px;
          background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.11);
          border-radius: var(--r6); padding: 7px 14px;
          font-size: 11.5px; color: rgba(255,255,255,.42); font-weight: 600;
          margin-left: 6px;
        }

        @media(max-width:1024px){
          .footer-main-inner { grid-template-columns: 1fr; gap: 36px; }
          .footer-link-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media(max-width:640px){
          .footer-cta-inner { flex-direction: column; gap: 20px; align-items: flex-start; }
          .footer-main { padding: 36px 0 32px; }
          .footer-link-grid { grid-template-columns: repeat(2, 1fr); gap: 28px 18px; }
          .footer-bottom-inner { flex-direction: column; align-items: flex-start; gap: 14px; }
          .footer-cat-section, .footer-main { padding-left: 0; padding-right: 0; }
          .footer-cat-inner, .footer-main-inner, .footer-bottom-inner { padding: 0 16px; }
        }
      `}</style>

      <footer className="footer">
        {/* CTA Band */}
        <div className="footer-cta-band">
          <div className="footer-cta-inner">
            <div className="footer-cta-copy">
              <h3 className="footer-cta-heading">Ready to connect with the right partner?</h3>
              <p className="footer-cta-sub">Join 67,000+ businesses and investors already on Asset Busters.</p>
            </div>
            <div className="footer-cta-actions">
              <a href="/register" className="footer-cta-btn-primary">
                Register Free
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
              <a href="/businesses-for-sale" className="footer-cta-btn-outline">Browse Listings</a>
            </div>
          </div>
        </div>

        {/* Browse by Category */}
        <div className="footer-cat-section">
          <div className="footer-cat-inner">
            <div className="footer-cat-header">
              <span className="footer-cat-title">Browse by Category</span>
            </div>
            <div className="footer-cat-tabs">
              {FOOTER_CAT_TABS.map((tab) => (
                <button
                  key={tab}
                  className={`footer-cat-tab ${activeTab === tab ? "is-active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="footer-browse-links">
              {FOOTER_BROWSE_LINKS.map((link) => (
                <a key={link.label} href={link.href} className="footer-browse-link">
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Main Link Columns */}
        <div className="footer-main">
          <div className="footer-main-inner">
            {/* Brand Column */}
            <div className="footer-brand-col">
              <a href="/" className="footer-logo-wrap">
                <img
                  src="/images/ab.png"
                  alt="Asset Busters"
                  width={36}
                  height={36}
                  style={{ display: "block", flexShrink: 0, objectFit: "contain" }}
                />
                <div className="footer-logo-text-group">
                  <div className="footer-logo-name">
                    <span style={{ color: "#D42B2B" }}>ASSET</span>{" "}
                    <span style={{ color: "#3B7FE8" }}>BUSTERS</span>
                  </div>
                  <div className="footer-logo-tagline">Business Acquisition Marketplace</div>
                </div>
              </a>
              <p className="footer-brand-desc">
                Asset Busters is a user-friendly and transparent online platform that connects SMEs and franchise brands
                with the right investors, buyers, and M&A advisors globally. Boasting a robust network of over
                20K businesses, 80K investors and buyers, 4K advisors, and 2K franchises.
              </p>
              <div className="footer-contact-row">
                <a href="https://wa.me/assetbusters" className="footer-contact-chip">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style={{ color: "#25D366" }}>
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                  </svg>
                  Chat on WhatsApp
                </a>
                <a href="mailto:support@assetbusters.com" className="footer-contact-chip">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                  Email Support
                </a>
              </div>
            </div>

            {/* Link Grid */}
            <div className="footer-link-grid">
              {FOOTER_COLS.map((col) => (
                <div key={col.title} className="footer-col">
                  <h4 className="footer-col-title">{col.title}</h4>
                  <ul className="footer-col-links">
                    {col.links.map((link) => (
                      <li key={link.label}>
                        <a href={link.href} className="footer-col-link">{link.label}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div className="footer-bottom-inner">
            <div className="footer-bottom-left">
              <span className="footer-copy">© 2026 Asset Busters Global Ltd. All Rights Reserved.</span>
              <div className="footer-legal-links">
                {[
                  { label: "Privacy Policy", href: "/privacy/" },
                  { label: "Terms of Use", href: "/terms/" },
                  { label: "Refund Policy", href: "/refund-policy/" },
                  { label: "Best Practices", href: "/best-practices/" },
                  { label: "Sitemap", href: "/html-sitemap" },
                ].map(({ label, href }) => (
                  <a key={label} href={href} className="footer-legal-link">{label}</a>
                ))}
              </div>
            </div>

            <div className="footer-socials">
              {SOCIALS.map((s) => (
                <a key={s.name} href={s.href} className="footer-social-btn" aria-label={s.name} target="_blank" rel="noopener noreferrer">
                  {s.icon}
                </a>
              ))}
              <div className="footer-payment-chip">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="5" width="20" height="14" rx="1"/>
                  <path d="M2 10h20"/>
                </svg>
                Net Banking
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}