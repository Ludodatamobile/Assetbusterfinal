"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import ReactCountryFlag from "react-country-flag";
import { useAuth } from "@/hooks/useAuth";
import type { User } from "@/types/auth";

interface DropdownItem { label: string; href: string; description?: string; }
interface NavLink { label: string; href?: string; dropdown?: DropdownItem[]; }
interface Currency { code: string; symbol: string; countryCode: string; name: string; }

const CURRENCIES: Currency[] = [
  { code: "NGN", symbol: "NGN", countryCode: "NG", name: "Nigerian Naira" },
  { code: "USD", symbol: "$", countryCode: "US", name: "US Dollar" },
  { code: "GBP", symbol: "GBP", countryCode: "GB", name: "British Pound" },
  { code: "EUR", symbol: "EUR", countryCode: "DE", name: "Euro" },
  { code: "AED", symbol: "AED", countryCode: "AE", name: "UAE Dirham" },
  { code: "ZAR", symbol: "ZAR", countryCode: "ZA", name: "South African Rand" },
  { code: "GHS", symbol: "GHS", countryCode: "GH", name: "Ghanaian Cedi" },
  { code: "KES", symbol: "KES", countryCode: "KE", name: "Kenyan Shilling" },
];

const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Businesses for Sale", href: "/businesses-for-sale" },
  { label: "Franchises", href: "/franchises" },
  { label: "Investors & Buyers", href: "/investors-buyers" },
  { label: "Fund Raisers", href: "/fund-raisers" },
  { label: "Funding Sources", href: "/funding-sources" },
  { label: "Startups", href: "/startups" },

  {
    label: "How To",
    dropdown: [
      { label: "How to Buy a Business", href: "/how-to#buy-business", description: "Step-by-step acquisition guide" },
      { label: "How to Sell a Business", href: "/how-to#sell-business", description: "Maximize value when exiting" },
      { label: "How to Find Investors", href: "/how-to#find-investors", description: "Connect with capital partners" },
      { label: "How to Value a Business", href: "/how-to#value-business", description: "Understand your business worth" },
      { label: "Due Diligence Checklist", href: "/how-to#due-diligence", description: "Pre-acquisition checklist" },
    ],
  },
  { label: "Q & A", href: "/qa" },
  {
    label: "Company",
    dropdown: [
      { label: "About Us", href: "/company#about", description: "Our mission and global team" },
      { label: "How It Works", href: "/company#how-it-works", description: "The Asset Busters process" },
      { label: "Success Stories", href: "/company#success-stories", description: "Deals closed on our platform" },
      { label: "Press & Media", href: "/company#press", description: "News and media coverage" },
      { label: "Contact Us", href: "/company#contact", description: "Get in touch with us" },
    ],
  },
];

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 11 11"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ transition: "transform 180ms cubic-bezier(.4,0,.2,1)", transform: open ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0, opacity: 0.55 }}
    >
      <path d="M2 4L5.5 7.5L9 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Logo({ solid = false }: { solid?: boolean }) {
  return (
    <a href="/" className="logo-wrap" aria-label="Asset Busters - Business Acquisition Marketplace">
      <img src="/images/ab.png" alt="Asset Busters" width={36} height={36} style={{ display: "block", flexShrink: 0, objectFit: "contain" }} />
      <div className={`logo-text-group ${solid ? "solid" : ""}`}>
        <span className="logo-name">
          <span className="logo-asset">ASSET</span>
          <span className="logo-busters"> BUSTERS</span>
        </span>
        <span className="logo-tagline">Business Acquisition Marketplace</span>
      </div>
    </a>
  );
}

function CurrencySelector({ selected, onSelect }: { selected: Currency; onSelect: (currency: Currency) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);
  const filtered = CURRENCIES.filter((c) => `${c.code} ${c.name}`.toLowerCase().includes(search.toLowerCase()));

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) { setOpen(false); setSearch(""); }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div className="cur-wrap" ref={wrapRef}>
      <button type="button" className="cur-trigger" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-haspopup="listbox" title={selected.name}>
        <ReactCountryFlag countryCode={selected.countryCode} svg style={{ width: "1.1em", height: "1.1em", borderRadius: "2px", flexShrink: 0 }} title={selected.name} />
        <span>{selected.code}</span>
        <ChevronIcon open={open} />
      </button>
      {open && (
        <div className="cur-panel" role="listbox">
          <input className="cur-search-inp" placeholder="Search currency…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search currencies" />
          <div className="cur-list">
            {filtered.map((c) => (
              <button key={c.code} role="option" aria-selected={c.code === selected.code} className={`cur-opt ${c.code === selected.code ? "is-active" : ""}`} onClick={() => { onSelect(c); setOpen(false); setSearch(""); }}>
                <ReactCountryFlag countryCode={c.countryCode} svg style={{ width: "1.2em", height: "1.2em", borderRadius: "2px", flexShrink: 0 }} title={c.name} />
                <span className="cur-opt-code">{c.code}</span>
                <span className="cur-opt-name">{c.name}</span>
                <span className="cur-opt-sym">{c.symbol}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const t = query.trim();
    if (t) router.push(`/businesses-for-sale?search=${encodeURIComponent(t)}`);
  };

  return (
    <form className="nav-search" onSubmit={submit} role="search">
      <svg className="nav-search-ico" width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5"/><path d="M10 10L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
      <input type="search" className="nav-search-inp" placeholder="Search businesses, investors, franchises…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search" />
      <button type="submit" className="nav-search-btn" aria-label="Search">Search</button>
    </form>
  );
}

function NavDropdown({ items }: { items: DropdownItem[] }) {
  return (
    <div className="nav-dd" role="menu">
      {items.map((item) => (
        <a key={item.href} href={item.href} className="nav-dd-item" role="menuitem">
          <span>{item.label}</span>
          {item.description && <small>{item.description}</small>}
        </a>
      ))}
    </div>
  );
}

function NavItem({ link, solid }: { link: NavLink; solid: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (!link.dropdown) return;
    const close = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [link.dropdown]);

  if (!link.dropdown) {
    return <li className="nav-item" ref={ref}><a href={link.href} className={`nav-link ${solid ? "is-dark" : "is-light"}`}>{link.label}</a></li>;
  }

  return (
    <li className="nav-item" ref={ref}>
      <button type="button" className={`nav-link nav-link-btn ${solid ? "is-dark" : "is-light"} ${open ? "is-open" : ""}`} onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-haspopup="menu">
        {link.label}<ChevronIcon open={open} />
      </button>
      {open && <NavDropdown items={link.dropdown} />}
    </li>
  );
}

function NotificationDot() {
  return (
    <span style={{ position: "absolute", top: 7, right: 7, width: 7, height: 7, borderRadius: "50%", background: "#D42B2B", border: "2px solid transparent" }} />
  );
}

function UserMenu({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;
  const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || user.email.slice(0, 2).toUpperCase();

  useEffect(() => {
    const close = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div className="user-menu" ref={ref}>
      <button type="button" className="user-trigger" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-haspopup="menu">
        <span className="user-avatar">{initials}</span>
        <span className="user-meta">
          <span className="user-name">{name}</span>
          <span className="user-role">{user.role.replaceAll("_", " ")}</span>
        </span>
        <ChevronIcon open={open} />
      </button>
      {open && (
        <div className="user-dd" role="menu">
          <div className="user-dd-head">
            <div className="user-dd-avatar">{initials}</div>
            <div style={{ minWidth: 0 }}>
              <strong>{name}</strong>
              <small>{user.email}</small>
            </div>
          </div>
          <div className="user-dd-section">
            <a href="/dashboard" className="user-dd-item" role="menuitem">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/><rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/><rect x="1" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/><rect x="8" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/></svg>
              Dashboard
            </a>
            <a href="/dashboard?tab=profiles" className="user-dd-item" role="menuitem">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4"/><path d="M2 12c0-2.761 2.239-4 5-4s5 1.239 5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
              My Profiles
            </a>
            <a href="/dashboard?tab=documents" className="user-dd-item" role="menuitem">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 1h6l3 3v9a1 1 0 01-1 1H3a1 1 0 01-1-1V2a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.4"/><path d="M9 1v3h3" stroke="currentColor" strokeWidth="1.4"/></svg>
              Data Room
            </a>
            <a href="/dashboard?tab=account" className="user-dd-item" role="menuitem">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.4"/><path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.636 2.636l1.06 1.06M10.304 10.304l1.06 1.06M11.364 2.636l-1.06 1.06M3.696 10.304l-1.06 1.06" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
              Account Settings
            </a>
          </div>
          <div className="user-dd-divider" />
          <button type="button" className="user-dd-item user-dd-danger" onClick={onLogout}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 1H2a1 1 0 00-1 1v10a1 1 0 001 1h3M9 10l3-3-3-3M13 7H5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

function MobileMenu({
  open, onClose, currency, onCurrencySelect, isLoggedIn, user, onLogout,
}: {
  open: boolean; onClose: () => void; currency: Currency; onCurrencySelect: (c: Currency) => void;
  isLoggedIn: boolean; user: User | null; onLogout: () => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const addProfileHref = isLoggedIn ? "/dashboard?tab=add-profile" : "/add-profile";

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="mob-overlay" role="dialog" aria-modal="true" aria-label="Navigation menu">
      <div className="mob-panel">
        <div className="mob-head">
          <Logo />
          <button className="mob-close" onClick={onClose} aria-label="Close menu">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
          </button>
        </div>
        {isLoggedIn && user && (
          <div className="mob-user-card">
            <span>{`${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase()}</span>
            <div>
              <p>{[user.firstName, user.lastName].filter(Boolean).join(" ") || user.email}</p>
              <small>{user.email}</small>
            </div>
          </div>
        )}
        <nav className="mob-nav">
          {NAV_LINKS.map((link) => (
            <div key={link.label} className="mob-grp">
              {link.dropdown ? (
                <>
                  <button className="mob-nl" onClick={() => setExpanded(expanded === link.label ? null : link.label)}>
                    {link.label}
                    <ChevronIcon open={expanded === link.label} />
                  </button>
                  {expanded === link.label && (
                    <div className="mob-sub">{link.dropdown.map((item) => <a key={item.href} href={item.href} onClick={onClose}>{item.label}</a>)}</div>
                  )}
                </>
              ) : (
                <a href={link.href} className="mob-nl" onClick={onClose}>{link.label}</a>
              )}
            </div>
          ))}
        </nav>
        <div className="mob-foot">
          <div className="mob-cur-row"><span>Currency</span><CurrencySelector selected={currency} onSelect={onCurrencySelect} /></div>
          {isLoggedIn ? (
            <>
              <a href="/dashboard" className="mob-btn mob-btn-dashboard" onClick={onClose}>Go to Dashboard</a>
              <a href={addProfileHref} className="mob-btn mob-btn-outline" onClick={onClose}>Add Profile</a>
              <button type="button" className="mob-btn mob-btn-ghost" onClick={onLogout}>Logout</button>
            </>
          ) : (
            <>
              <a href="/register" className="mob-btn mob-btn-primary" onClick={onClose}>Register</a>
              <a href={addProfileHref} className="mob-btn mob-btn-outline" onClick={onClose}>Add Profile</a>
              <a href="/login" className="mob-btn mob-btn-ghost" onClick={onClose}>Login</a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Navbar() {
  const [currency, setCurrency] = useState<Currency>(CURRENCIES[0]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user, initialized, isAuthenticated, fetchCurrentUser, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!initialized) void fetchCurrentUser();
  }, [initialized, fetchCurrentUser]);

  const isLoggedIn = Boolean(initialized && isAuthenticated && user);
  const solidNav = pathname !== "/" || scrolled;
  const addProfileHref = isLoggedIn ? "/dashboard?tab=add-profile" : "/add-profile";

  const handleLogout = async () => {
    await logout();
    setMobileOpen(false);
    router.replace("/");
  };

  if (pathname.startsWith("/dashboard")) return null;

  return (
    <>
      <style>{styles}</style>
      <header className={`navbar ${solidNav ? "is-solid" : ""}`} role="banner">
        <div className="nav-top-band">
          <div className="nav-top-inner">
            <Logo solid={solidNav} />
            <CurrencySelector selected={currency} onSelect={setCurrency} />
            <SearchBar />
            <div className="nav-actions">
              {isLoggedIn && user ? (
                <>
                  <a href="/dashboard" className="nav-btn nav-btn-dashboard">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="1" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="8" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/></svg>
                    Dashboard
                  </a>
                  <a href={addProfileHref} className="nav-btn nav-btn-outline">
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
                    Add Profile
                  </a>
                  <UserMenu user={user} onLogout={handleLogout} />
                </>
              ) : (
                <>
                  <a href="/register" className="nav-btn nav-btn-primary">Register</a>
                  <a href={addProfileHref} className="nav-btn nav-btn-outline">
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
                    Add Profile
                  </a>
                  <a href="/login" className="nav-btn nav-btn-ghost">Login</a>
                </>
              )}
            </div>
            <button className="hamburger" onClick={() => setMobileOpen(true)} aria-label="Open navigation" aria-expanded={mobileOpen}>
              <span /><span /><span />
            </button>
          </div>
        </div>

        <nav aria-label="Main navigation" style={{ position: "relative", zIndex: 999 }}>
          <div className="nav-bot-band">
            <div className="nav-bot-inner">
              <ul className="nav-list" role="menubar">
                {NAV_LINKS.map((link) => <NavItem key={link.label} link={link} solid={solidNav} />)}
              </ul>
            </div>
          </div>
        </nav>
      </header>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} currency={currency} onCurrencySelect={setCurrency} isLoggedIn={isLoggedIn} user={user} onLogout={handleLogout} />
    </>
  );
}

const styles = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --max-w:82rem;
    --bg-nav-dark:#0a1628;
    --surface:#f4f6f9;
    --border:#e2e6ed;
    --text:#0f1e36;
    --text-2:#4a5568;
    --text-3:#8896a8;
    --accent:#F5A623;
    --blue:#1A56DB;
    --blue-d:#1444B8;
    --green:#10B981;
    --red:#dc2626;
    --font-sans:'Poppins','Inter',system-ui,sans-serif;
    --r4:4px;
    --shadow-dd:0 20px 48px rgba(15,30,54,.18),0 4px 12px rgba(15,30,54,.08);
    --t:180ms cubic-bezier(.4,0,.2,1)
  }

  .navbar{position:fixed;top:0;left:0;right:0;z-index:1000;font-family:var(--font-sans);background:transparent;transition:background var(--t),box-shadow var(--t)}
  .navbar.is-solid{background:#fff;box-shadow:0 1px 0 var(--border),0 8px 28px rgba(15,30,54,.06)}

  .nav-top-band{background:rgba(10,22,40,.9);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-bottom:1px solid rgba(255,255,255,.07)}
  .navbar.is-solid .nav-top-band{background:#fff;border-bottom:1px solid var(--border);backdrop-filter:none}
  .nav-top-inner{max-width:var(--max-w);margin:0 auto;padding:0 24px;height:60px;display:flex;align-items:center;gap:14px}

  .logo-wrap{display:flex;align-items:center;gap:9px;text-decoration:none;flex-shrink:0}
  .logo-text-group{display:flex;flex-direction:column;line-height:1;gap:3px}
  .logo-name{font-size:15px;font-weight:900;letter-spacing:.5px;text-transform:uppercase}
  .logo-asset{color:#D42B2B}
  .logo-busters{color:#fff}
  .logo-text-group.solid .logo-busters{color:var(--text)}
  .logo-tagline{font-size:7px;font-weight:700;color:rgba(255,255,255,.36);letter-spacing:.7px;text-transform:uppercase}
  .logo-text-group.solid .logo-tagline{color:var(--text-3)}

  .cur-wrap{position:relative;flex-shrink:0}
  .cur-trigger{height:34px;display:flex;align-items:center;gap:6px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);color:rgba(255,255,255,.82);padding:0 10px;border-radius:var(--r4);cursor:pointer;font-size:12px;font-weight:800;font-family:var(--font-sans);transition:all var(--t)}
  .cur-trigger:hover{background:rgba(255,255,255,.12);border-color:rgba(255,255,255,.2)}
  .navbar.is-solid .cur-trigger{background:var(--surface);border-color:var(--border);color:var(--text-2)}
  .navbar.is-solid .cur-trigger:hover{background:#eaecf0}

  .cur-panel{position:absolute;top:calc(100% + 10px);left:0;background:#fff;border:1px solid var(--border);box-shadow:var(--shadow-dd);width:290px;z-index:1100;padding:10px}
  .cur-search-inp{width:100%;border:1px solid var(--border);outline:none;color:var(--text);font-size:13px;font-family:var(--font-sans);padding:9px 10px;margin-bottom:7px;transition:border-color var(--t)}
  .cur-search-inp:focus{border-color:var(--blue)}
  .cur-list{max-height:272px;overflow-y:auto}
  .cur-opt{display:flex;align-items:center;gap:8px;width:100%;padding:8px 9px;background:none;border:none;color:var(--text-2);cursor:pointer;font-size:12px;border-radius:var(--r4);font-family:var(--font-sans);text-align:left;transition:background var(--t)}
  .cur-opt:hover,.cur-opt.is-active{background:var(--surface);color:var(--blue)}
  .cur-opt-code{font-weight:900;min-width:32px}
  .cur-opt-name{color:var(--text-3);font-size:11px;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .cur-opt-sym{margin-left:auto;color:var(--text-3);font-size:11px}

  .nav-search{flex:1;display:flex;align-items:center;gap:0;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);border-radius:var(--r4);height:34px;overflow:hidden;transition:all var(--t)}
  .nav-search:focus-within{border-color:rgba(255,255,255,.28);background:rgba(255,255,255,.1)}
  .navbar.is-solid .nav-search{background:var(--surface);border-color:var(--border)}
  .navbar.is-solid .nav-search:focus-within{border-color:var(--blue);box-shadow:0 0 0 3px rgba(26,86,219,.1)}
  .nav-search-ico{flex-shrink:0;margin-left:11px;color:rgba(255,255,255,.36);pointer-events:none}
  .navbar.is-solid .nav-search-ico{color:var(--text-3)}
  .nav-search-inp{flex:1;background:none;border:none;outline:none;color:#fff;font-size:13px;font-family:var(--font-sans);padding:0 10px;height:100%}
  .navbar.is-solid .nav-search-inp{color:var(--text)}
  .nav-search-inp::placeholder{color:rgba(255,255,255,.32)}
  .navbar.is-solid .nav-search-inp::placeholder{color:var(--text-3)}
  .nav-search-btn{background:var(--accent);border:none;color:#fff;height:100%;cursor:pointer;padding:0 14px;font-size:11px;font-weight:900;font-family:var(--font-sans);letter-spacing:.3px;transition:background var(--t)}
  .nav-search-btn:hover{background:#e09310}

  .nav-actions{display:flex;align-items:center;gap:8px;flex-shrink:0}
  .nav-btn{height:34px;display:inline-flex;align-items:center;justify-content:center;gap:7px;text-decoration:none;font-size:12.5px;font-weight:900;border-radius:var(--r4);padding:0 14px;white-space:nowrap;transition:all var(--t)}
  .nav-btn-primary{background:var(--accent);color:#fff;box-shadow:0 2px 8px rgba(245,166,35,.35)}
  .nav-btn-primary:hover{background:#e09310;box-shadow:0 4px 16px rgba(245,166,35,.45)}
  .nav-btn-dashboard{background:var(--blue);color:#fff;box-shadow:0 2px 8px rgba(26,86,219,.28)}
  .nav-btn-dashboard:hover{background:var(--blue-d);box-shadow:0 4px 16px rgba(26,86,219,.36)}
  .nav-btn-outline{background:rgba(255,255,255,.08);color:rgba(255,255,255,.88);border:1px solid rgba(255,255,255,.18)}
  .nav-btn-outline:hover{background:rgba(255,255,255,.14);border-color:rgba(255,255,255,.28)}
  .navbar.is-solid .nav-btn-outline{background:#fff;color:var(--text-2);border-color:var(--border)}
  .navbar.is-solid .nav-btn-outline:hover{background:var(--surface)}
  .nav-btn-ghost{color:rgba(255,255,255,.68);background:none;border:1px solid transparent}
  .nav-btn-ghost:hover{color:#fff;background:rgba(255,255,255,.07)}
  .navbar.is-solid .nav-btn-ghost{color:var(--text-2)}
  .navbar.is-solid .nav-btn-ghost:hover{background:var(--surface);color:var(--text)}

  .user-menu{position:relative}
  .user-trigger{height:38px;min-width:0;display:inline-flex;align-items:center;gap:9px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.16);color:#fff;border-radius:var(--r4);padding:3px 10px 3px 4px;cursor:pointer;font-family:var(--font-sans);transition:all var(--t)}
  .user-trigger:hover{background:rgba(255,255,255,.13);border-color:rgba(255,255,255,.26)}
  .navbar.is-solid .user-trigger{background:#fff;border-color:var(--border);color:var(--text)}
  .navbar.is-solid .user-trigger:hover{background:var(--surface)}

  .user-avatar{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,var(--blue),var(--accent));color:#fff;font-size:11px;font-weight:900;flex-shrink:0;letter-spacing:.5px}
  .user-meta{display:flex;flex-direction:column;text-align:left}
  .user-name{max-width:110px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;font-weight:900;line-height:1.2}
  .user-role{font-size:9.5px;font-weight:700;color:rgba(255,255,255,.44);text-transform:uppercase;letter-spacing:.4px;line-height:1}
  .navbar.is-solid .user-role{color:var(--text-3)}

  .user-dd{position:absolute;top:calc(100% + 10px);right:0;background:#fff;border:1px solid var(--border);box-shadow:var(--shadow-dd);padding:6px;z-index:1100;width:248px}
  .user-dd-head{display:flex;align-items:center;gap:10px;padding:12px 10px;border-bottom:1px solid var(--border);margin-bottom:4px}
  .user-dd-avatar{width:36px;height:36px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,var(--blue),var(--accent));color:#fff;font-size:12px;font-weight:900;flex-shrink:0}
  .user-dd-head strong{display:block;font-size:13px;color:var(--text);font-weight:900;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .user-dd-head small{display:block;font-size:11px;color:var(--text-3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .user-dd-section{display:flex;flex-direction:column;gap:1px}
  .user-dd-divider{height:1px;background:var(--border);margin:5px 0}
  .user-dd-item{width:100%;display:flex;align-items:center;gap:9px;text-align:left;text-decoration:none;background:none;border:none;color:var(--text-2);font-family:var(--font-sans);font-size:12.5px;font-weight:800;padding:9px 10px;border-radius:var(--r4);cursor:pointer;transition:background var(--t)}
  .user-dd-item:hover{background:var(--surface);color:var(--text)}
  .user-dd-item svg{flex-shrink:0;color:var(--text-3)}
  .user-dd-danger{color:var(--red)}
  .user-dd-danger:hover{background:#fef2f2;color:var(--red)}
  .user-dd-danger svg{color:var(--red)}

  .nav-bot-band{background:rgba(10,22,40,.75);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-top:1px solid rgba(255,255,255,.07)}
  .navbar.is-solid .nav-bot-band{background:#fff;border-top:none;border-bottom:1px solid var(--border);backdrop-filter:none}
  .nav-bot-inner{max-width:var(--max-w);margin:0 auto;padding:0 24px;height:38px;display:flex;align-items:center}
  .nav-list{list-style:none;display:flex;align-items:center}
  .nav-item{position:relative}

  .nav-dd{position:absolute;top:calc(100% + 12px);left:0;right:auto;background:#fff;border:1px solid var(--border);box-shadow:var(--shadow-dd);padding:6px;z-index:1200;min-width:264px}
  .nav-dd-item{width:100%;display:block;text-align:left;text-decoration:none;background:none;border:none;color:var(--text-2);font-family:var(--font-sans);font-size:12.5px;font-weight:800;padding:10px 11px;border-radius:var(--r4);cursor:pointer;transition:background var(--t)}
  .nav-dd-item:hover{background:var(--surface);color:var(--text)}
  .nav-dd-item span{display:block;color:var(--text);font-weight:900}
  .nav-dd-item small{display:block;color:var(--text-3);font-size:11px;margin-top:2px}

  .nav-link,.nav-link-btn{display:inline-flex;align-items:center;gap:5px;text-decoration:none;font-size:12.5px;font-weight:800;padding:6px 10px;border-radius:var(--r4);background:none;border:none;cursor:pointer;white-space:nowrap;font-family:var(--font-sans);transition:all var(--t)}
  .nav-link.is-light,.nav-link-btn.is-light{color:rgba(255,255,255,.72)}
  .nav-link.is-light:hover,.nav-link-btn.is-light:hover,.nav-link-btn.is-light.is-open{color:#fff;background:rgba(255,255,255,.08)}
  .nav-link.is-dark,.nav-link-btn.is-dark{color:var(--text-2)}
  .nav-link.is-dark:hover,.nav-link-btn.is-dark:hover,.nav-link-btn.is-dark.is-open{color:var(--text);background:var(--surface)}

  .hamburger{display:none;flex-direction:column;gap:4px;background:none;border:none;cursor:pointer;padding:7px;border-radius:var(--r4);margin-left:auto}
  .hamburger span{display:block;width:18px;height:1.5px;background:rgba(255,255,255,.85);border-radius:2px;transition:background var(--t)}
  .navbar.is-solid .hamburger span{background:var(--text)}

  .mob-overlay{position:fixed;inset:0;z-index:2000;background:rgba(8,16,32,.6);backdrop-filter:blur(4px);display:flex;justify-content:flex-end}
  .mob-panel{width:min(360px,100vw);background:#fff;height:100%;overflow-y:auto;display:flex;flex-direction:column;box-shadow:-12px 0 48px rgba(0,0,0,.2)}
  .mob-head{display:flex;align-items:center;justify-content:space-between;padding:13px 18px;background:var(--bg-nav-dark)}
  .mob-close{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);border-radius:var(--r4);color:rgba(255,255,255,.8);padding:8px;cursor:pointer;display:grid;place-items:center;transition:background var(--t)}
  .mob-close:hover{background:rgba(255,255,255,.14)}
  .mob-user-card{display:flex;align-items:center;gap:10px;padding:14px 18px;border-bottom:1px solid var(--border)}
  .mob-user-card>span{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,var(--blue),var(--accent));color:#fff;font-weight:900;font-size:13px}
  .mob-user-card p{font-size:13px;font-weight:900;color:var(--text)}
  .mob-user-card small{font-size:11px;color:var(--text-3)}
  .mob-nav{flex:1;padding:4px 12px}
  .mob-grp{border-bottom:1px solid var(--border)}
  .mob-nl{display:flex;align-items:center;justify-content:space-between;text-decoration:none;color:var(--text-2);font-size:13px;font-weight:800;padding:13px 8px;width:100%;background:none;border:none;cursor:pointer;font-family:var(--font-sans)}
  .mob-sub{padding:2px 0 10px 14px}
  .mob-sub a{display:block;text-decoration:none;color:var(--text-3);font-size:12.5px;padding:8px 8px;font-weight:700}
  .mob-foot{padding:16px 18px;border-top:1px solid var(--border);display:flex;flex-direction:column;gap:8px}
  .mob-cur-row{display:flex;align-items:center;justify-content:space-between;padding-bottom:10px;border-bottom:1px solid var(--border);margin-bottom:2px;font-size:10px;color:var(--text-3);text-transform:uppercase;font-weight:800}
  .mob-foot .cur-trigger{background:var(--surface);border-color:var(--border);color:var(--text-2)}
  .mob-btn{display:flex;align-items:center;justify-content:center;text-decoration:none;font-size:13px;font-weight:900;border-radius:var(--r4);padding:11px 14px;border:none;cursor:pointer;width:100%;font-family:var(--font-sans)}
  .mob-btn-primary{background:var(--accent);color:#fff}
  .mob-btn-dashboard{background:var(--blue);color:#fff}
  .mob-btn-outline{background:none;color:var(--text-2);border:1px solid var(--border)}
  .mob-btn-ghost{background:none;color:var(--text-3)}

  @media(max-width:1100px){.user-name,.user-role{display:none}.user-trigger{min-width:0;padding:4px;gap:0}.user-trigger svg:last-child{display:none}}
  @media(max-width:1024px){.nav-bot-band{display:none}.hamburger{display:flex}.nav-search{max-width:240px}.logo-tagline{display:none}}
  @media(max-width:640px){.nav-top-inner{padding:0 14px;gap:9px}.cur-wrap{display:none}.nav-actions{display:none}.nav-search{max-width:none}}
`;