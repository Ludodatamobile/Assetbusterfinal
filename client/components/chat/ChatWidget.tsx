"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ─── Config ───────────────────────────────────────────────────────────────────
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const SESSION_KEY = "ab_chat_sid";
const WA_BASE = "https://wa.me";

const BRAND = {
  name: "Asset Busters",
  sub: "M&A Deal Desk · Verified Platform",
  navy: "#0f1e36",
  navy2: "#1a2d4a",
  blue: "#1A56DB",
  blueD: "#1444B8",
  amber: "#F5A623",
  green: "#10B981",
  purple: "#7C3AED",
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  role: "assistant" | "user";
  id: string;
  ts: number;
  content: string;
}

interface StaffMember {
  _id: string;
  name: string;
  role: string;
  whatsappNumber: string;
  whatsappGreeting: string;
  avatarInitials: string;
  avatarColor: string;
  isAvailableNow: boolean;
  specialty?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const GREETING: Message = {
  role: "assistant",
  id: "greeting",
  ts: Date.now(),
  content:
    "Good day. I'm Aria, the Asset Busters deal intelligence assistant.\n\nI can help you explore acquisition targets, investment mandates, franchise opportunities, or connect you with our advisory team.\n\nHow can I assist with your transaction today?",
};

const QUICK_REPLIES = [
  "Buy a business",
  "Sell my business",
  "Raise capital",
  "Franchise opportunities",
  "Investor matching",
  "M&A advisory",
];

const FALLBACK_STAFF: StaffMember[] = [
  {
    _id: "1",
    name: "Chidi Okonkwo",
    role: "Head of Deal Advisory",
    whatsappNumber: "2348000000001",
    whatsappGreeting:
      "Hi Chidi, I was exploring Asset Busters and would like to discuss a deal opportunity.",
    avatarInitials: "CO",
    avatarColor: BRAND.blue,
    isAvailableNow: true,
    specialty: "M&A · Cross-Border Deals",
  },
  {
    _id: "2",
    name: "Fatima Hassan",
    role: "Senior Advisor · Legal & Structuring",
    whatsappNumber: "2348000000002",
    whatsappGreeting:
      "Hi Fatima, I was exploring Asset Busters and have questions about deal structuring.",
    avatarInitials: "FH",
    avatarColor: BRAND.purple,
    isAvailableNow: false,
    specialty: "Deal Structuring · Legal",
  },
  {
    _id: "3",
    name: "Kwame Mensah",
    role: "Marketplace Director",
    whatsappNumber: "2348000000003",
    whatsappGreeting:
      "Hi Kwame, I found Asset Busters and would like to discuss listing or acquiring a business.",
    avatarInitials: "KM",
    avatarColor: BRAND.green,
    isAvailableNow: true,
    specialty: "Listings · Buyer Matching",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getSession(): string {
  if (typeof window === "undefined") return "ssr";
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

function waURL(number: string, text: string): string {
  return `${WA_BASE}/${number}?text=${encodeURIComponent(text)}`;
}

function fmtTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function renderContent(text: string): React.ReactNode {
  return text.split("\n").filter(Boolean).map((line, i) => (
    <p key={i} style={{ margin: i > 0 ? "6px 0 0" : "0", lineHeight: 1.7 }}>
      {line}
    </p>
  ));
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const WaIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.978-1.306A9.96 9.96 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" fill="#25D366"/>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" fill="white"/>
  </svg>
);

const SendIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const ChevronIcon = ({ dir = "left" }: { dir?: "left" | "right" }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points={dir === "left" ? "15 18 9 12 15 6" : "9 6 15 12 9 18"}/>
  </svg>
);

const DealIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
  </svg>
);

const AiSparkIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={BRAND.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

// ─── Dot Spinner ──────────────────────────────────────────────────────────────
const DotSpinner = () => (
  <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "2px 0" }}>
    {[0, 1, 2].map((i) => (
      <span key={i} style={{
        width: 5, height: 5, borderRadius: "50%",
        background: BRAND.t3 ?? "#8896a8",
        display: "inline-block",
        animation: `ab-dot 1.3s ${i * 0.22}s infinite ease-in-out`,
      }}/>
    ))}
  </div>
);

// ─── Message Bubbles ──────────────────────────────────────────────────────────
const AiMessage = ({ msg }: { msg: Message }) => (
  <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginBottom: 14, animation: "ab-fadein .22s ease" }}>
    {/* Avatar */}
    <div style={{
      width: 30, height: 30, borderRadius: 0,
      background: `linear-gradient(135deg,${BRAND.navy},${BRAND.navy2})`,
      border: `1px solid ${BRAND.blue}40`,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      <AiSparkIcon />
    </div>
    <div style={{ maxWidth: "80%" }}>
      <div style={{
        background: "#fff",
        border: "1px solid #e2e6ed",
        borderRadius: "0 8px 8px 8px",
        padding: "11px 14px",
        boxShadow: "0 2px 8px rgba(15,30,54,0.06)",
      }}>
        <div style={{ fontSize: 12.5, color: "#2d3748", lineHeight: 1.7, fontFamily: "Poppins, sans-serif" }}>
          {renderContent(msg.content)}
        </div>
      </div>
      <p style={{ fontSize: 9.5, color: "#a0aec0", marginTop: 4, marginLeft: 2, fontFamily: "Poppins, sans-serif", letterSpacing: ".2px" }}>
        Aria · {fmtTime(msg.ts)}
      </p>
    </div>
  </div>
);

const UserMessage = ({ msg }: { msg: Message }) => (
  <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14, animation: "ab-fadein .22s ease" }}>
    <div style={{ maxWidth: "80%" }}>
      <div style={{
        background: `linear-gradient(135deg,${BRAND.navy},${BRAND.navy2})`,
        borderRadius: "8px 0 8px 8px",
        padding: "11px 14px",
        boxShadow: "0 4px 14px rgba(15,30,54,0.22)",
        position: "relative",
      }}>
        {/* amber accent line */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: BRAND.amber, borderRadius: "8px 0 0 0" }}/>
        <p style={{ fontSize: 12.5, color: "#fff", lineHeight: 1.7, margin: 0, fontFamily: "Poppins, sans-serif", paddingTop: 4 }}>{msg.content}</p>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 3, marginTop: 4, marginRight: 2 }}>
        <p style={{ fontSize: 9.5, color: "#a0aec0", fontFamily: "Poppins, sans-serif" }}>{fmtTime(msg.ts)}</p>
        <CheckIcon/>
      </div>
    </div>
  </div>
);

const TypingBubble = () => (
  <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginBottom: 14 }}>
    <div style={{
      width: 30, height: 30, borderRadius: 0,
      background: `linear-gradient(135deg,${BRAND.navy},${BRAND.navy2})`,
      border: `1px solid ${BRAND.blue}40`,
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>
      <AiSparkIcon/>
    </div>
    <div style={{
      background: "#fff", border: "1px solid #e2e6ed",
      borderRadius: "0 8px 8px 8px", padding: "13px 16px",
      boxShadow: "0 2px 8px rgba(15,30,54,0.06)",
    }}>
      <DotSpinner/>
    </div>
  </div>
);

// ─── Staff Card ───────────────────────────────────────────────────────────────
const StaffCard = ({ member, onTap }: { member: StaffMember; onTap: (m: StaffMember) => void }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={() => onTap(member)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%", textAlign: "left", cursor: "pointer",
        background: hovered ? "#f8fafc" : "#fff",
        border: `1px solid ${hovered ? BRAND.blue : "#e2e6ed"}`,
        borderLeft: `3px solid ${member.avatarColor}`,
        padding: "14px 16px",
        display: "flex", alignItems: "center", gap: 12,
        marginBottom: 10, transition: "all 0.18s",
        boxShadow: hovered ? "0 4px 16px rgba(26,86,219,0.1)" : "none",
      }}
    >
      {/* Avatar */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <div style={{
          width: 44, height: 44,
          background: `linear-gradient(135deg,${member.avatarColor},${member.avatarColor}aa)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, fontWeight: 800, color: "#fff",
          letterSpacing: 0.5, fontFamily: "Poppins, sans-serif",
          borderRadius: 2,
        }}>
          {member.avatarInitials}
        </div>
        <div style={{
          position: "absolute", bottom: -2, right: -2,
          width: 11, height: 11, borderRadius: "50%",
          background: member.isAvailableNow ? BRAND.green : "#9ca3af",
          border: "2px solid #fff",
        }}/>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: BRAND.navy, margin: "0 0 2px", letterSpacing: "-.2px", fontFamily: "Poppins, sans-serif" }}>{member.name}</p>
            <p style={{ fontSize: 11, color: "#4a5568", margin: "0 0 4px", fontFamily: "Poppins, sans-serif" }}>{member.role}</p>
            {member.specialty && (
              <p style={{ fontSize: 10, color: member.avatarColor, fontWeight: 700, margin: 0, letterSpacing: ".3px", fontFamily: "Poppins, sans-serif" }}>
                {member.specialty}
              </p>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
            <WaIcon/>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#c4d0e8" strokeWidth="2" strokeLinecap="round">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
              <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </div>
        </div>
        <p style={{ fontSize: 10.5, fontWeight: 600, color: member.isAvailableNow ? BRAND.green : "#9ca3af", margin: "6px 0 0", fontFamily: "Poppins, sans-serif" }}>
          {member.isAvailableNow ? "● Available now" : "● Away · replies within a few hours"}
        </p>
      </div>
    </button>
  );
};

// ─── Main Widget ──────────────────────────────────────────────────────────────
export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<"ai" | "advisory">("ai");
  const [msgs, setMsgs] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const [everOpened, setEverOpened] = useState(false);
  const [showNudge, setShowNudge] = useState(false);
  const [online, setOnline] = useState(true);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const sessionId = useRef<string>(getSession());

  const scrollBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(scrollBottom, [msgs, loading]);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { if (!everOpened) setShowNudge(true); }, 10000);
    return () => clearTimeout(t);
  }, [everOpened]);

  useEffect(() => {
    if (tab === "advisory" && staff.length === 0) loadStaff();
  }, [tab]);

  useEffect(() => {
    if (isOpen) {
      setUnread(0); setEverOpened(true); setShowNudge(false);
      setTimeout(() => inputRef.current?.focus(), 350);
    }
  }, [isOpen]);

  const loadStaff = async () => {
    setStaffLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/chat/staff`);
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.staff) && data.staff.length > 0) {
        setStaff(data.staff);
      } else throw new Error("fallback");
    } catch {
      setStaff(FALLBACK_STAFF);
    } finally {
      setStaffLoading(false);
    }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading || !online) return;

    const userMsg: Message = { role: "user", id: `u-${Date.now()}`, ts: Date.now(), content: text };
    setMsgs((p) => [...p, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/chat/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sessionId.current, message: text, pageUrl: window.location.href }),
      });
      const data = await res.json();
      const reply: string = data.reply || "Apologies, I was unable to process your request. Please try again or contact our advisory team directly.";
      const aiMsg: Message = { role: "assistant", id: `a-${Date.now()}`, ts: Date.now(), content: reply };
      setMsgs((p) => [...p, aiMsg]);
      if (!isOpen) setUnread((c) => c + 1);
    } catch {
      const errMsg: Message = {
        role: "assistant", id: `e-${Date.now()}`, ts: Date.now(),
        content: "Network disruption detected. Please check your connection or reach our team via WhatsApp.",
      };
      setMsgs((p) => [...p, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleStaffTap = async (member: StaffMember) => {
    fetch(`${API_BASE}/api/chat/transfer`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: sessionId.current, staffName: member.name }),
    }).catch(() => {});
    window.open(waURL(member.whatsappNumber, member.whatsappGreeting), "_blank", "noopener,noreferrer");
  };

  const isFirstMsg = msgs.length === 1 && msgs[0].id === "greeting";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        @keyframes ab-dot{0%,60%,100%{transform:scale(0.55);opacity:0.4}30%{transform:scale(1);opacity:1}}
        @keyframes ab-ping{75%,100%{transform:scale(2);opacity:0}}
        @keyframes ab-spin{to{transform:rotate(360deg)}}
        @keyframes ab-fadein{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes ab-slidein{from{opacity:0;transform:translateY(18px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes ab-nudge{from{opacity:0;transform:translateY(8px) scale(.95)}to{opacity:1;transform:translateY(0) scale(1)}}
        .ab-scroll::-webkit-scrollbar{width:3px}
        .ab-scroll::-webkit-scrollbar-track{background:transparent}
        .ab-scroll::-webkit-scrollbar-thumb{background:#e2e6ed;border-radius:4px}
        .ab-textarea{font-family:'Poppins',sans-serif;resize:none;outline:none;width:100%;border:1.5px solid #e2e6ed;border-radius:4px;padding:10px 14px;font-size:12.5px;line-height:1.6;background:#f8fafc;color:#0f1e36;transition:border-color .18s;max-height:80px;scrollbar-width:none}
        .ab-textarea:focus{border-color:#1A56DB;background:#fff;box-shadow:0 0 0 3px rgba(26,86,219,0.1)}
        .ab-textarea::placeholder{color:#a0aec0}
        .ab-tab{flex:1;display:flex;align-items:center;justify-content:center;gap:6px;padding:9px 4px;border:none;font-family:'Poppins',sans-serif;font-size:11px;font-weight:700;cursor:pointer;letter-spacing:.3px;text-transform:uppercase;transition:all .18s;border-bottom:2px solid transparent}
        .ab-tab.active{color:#1A56DB;border-bottom-color:#1A56DB;background:rgba(26,86,219,.04)}
        .ab-tab.inactive{color:#8896a8;background:transparent}
        .ab-tab.inactive:hover{color:#4a5568;background:#f4f6f9}
        .ab-qr{font-family:'Poppins',sans-serif;font-size:11px;font-weight:600;padding:5px 10px;border:1px solid rgba(26,86,219,.25);background:rgba(26,86,219,.05);color:#1A56DB;cursor:pointer;transition:all .15s;letter-spacing:.1px}
        .ab-qr:hover{background:rgba(26,86,219,.12);border-color:rgba(26,86,219,.5)}
        .ab-send{width:36px;height:36px;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .18s;border-radius:2px}
        .ab-send:disabled{background:#e2e6ed;color:#a0aec0;cursor:not-allowed}
        .ab-send:not(:disabled){background:linear-gradient(135deg,#1A56DB,#1444B8);color:#fff;box-shadow:0 4px 12px rgba(26,86,219,.3)}
        .ab-send:not(:disabled):hover{box-shadow:0 6px 18px rgba(26,86,219,.4);transform:translateY(-1px)}
      `}</style>

      {/* ── NUDGE TOOLTIP ── */}
      {showNudge && !isOpen && (
        <div
          onClick={() => { setIsOpen(true); setShowNudge(false); }}
          style={{
            position: "fixed", bottom: 92, right: 24, zIndex: 9998,
            background: BRAND.navy, border: `1px solid ${BRAND.blue}40`,
            borderLeft: `3px solid ${BRAND.amber}`,
            padding: "12px 16px", maxWidth: 210,
            boxShadow: "0 12px 32px rgba(15,30,54,0.3)",
            cursor: "pointer", animation: "ab-nudge .28s ease",
            fontFamily: "Poppins, sans-serif",
          }}
        >
          <p style={{ margin: "0 0 3px", fontSize: 12.5, fontWeight: 800, color: "#fff", letterSpacing: "-.2px" }}>
            Explore deals →
          </p>
          <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,.55)", lineHeight: 1.55 }}>
            Our AI deal desk is active. Ask about acquisitions, funding, or franchises.
          </p>
          {/* accent stripe */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${BRAND.blue},${BRAND.amber})` }}/>
        </div>
      )}

      {/* ── TRIGGER BUTTON ── */}
      <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999 }}>
        {/* ping ring */}
        {!isOpen && (
          <span style={{
            position: "absolute", inset: 0,
            borderRadius: 0,
            background: `${BRAND.blue}40`,
            animation: "ab-ping 2.2s cubic-bezier(0,0,.2,1) infinite",
          }}/>
        )}
        <button
          onClick={() => setIsOpen((o) => !o)}
          aria-label={isOpen ? "Close deal desk" : "Open deal desk"}
          style={{
            width: 54, height: 54,
            background: isOpen
              ? `linear-gradient(135deg,${BRAND.navy},${BRAND.navy2})`
              : `linear-gradient(135deg,${BRAND.blue},${BRAND.blueD})`,
            border: `2px solid ${isOpen ? BRAND.blue + "60" : "transparent"}`,
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 6px 24px rgba(26,86,219,0.45)",
            position: "relative", transition: "all .2s", borderRadius: 0,
          }}
        >
          {isOpen ? <CloseIcon/> : <DealIcon/>}
          {unread > 0 && !isOpen && (
            <span style={{
              position: "absolute", top: -5, right: -5,
              width: 20, height: 20,
              background: BRAND.amber,
              color: "#fff", fontSize: 9.5, fontWeight: 800,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "Poppins, sans-serif",
            }}>
              {unread}
            </span>
          )}
        </button>
      </div>

      {/* ── CHAT PANEL ── */}
      {isOpen && (
        <div
          style={{
            position: "fixed", bottom: 90, right: 24, zIndex: 9998,
            width: "clamp(330px, 92vw, 390px)",
            height: "clamp(500px, 74vh, 600px)",
            display: "flex", flexDirection: "column",
            background: "#f4f6f9",
            border: `1px solid ${BRAND.navy}30`,
            boxShadow: "0 24px 64px rgba(15,30,54,0.22), 0 4px 20px rgba(15,30,54,0.1)",
            animation: "ab-slidein .28s cubic-bezier(.22,1,.36,1)",
            overflow: "hidden", borderRadius: 0,
          }}
        >
          {/* ── TOP ACCENT BAR ── */}
          <div style={{ height: 3, background: `linear-gradient(90deg,${BRAND.blue} 0%,${BRAND.amber} 50%,${BRAND.green} 100%)`, flexShrink: 0 }}/>

          {/* ── HEADER ── */}
          <div style={{ background: `linear-gradient(135deg,${BRAND.navy} 0%,${BRAND.navy2} 100%)`, padding: "16px 18px 0", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {/* Logo mark */}
                <div style={{ width: 36, height: 36, background: BRAND.blue, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <DealIcon/>
                </div>
                <div>
                  <p style={{ color: "#fff", fontSize: 13.5, fontWeight: 800, margin: 0, letterSpacing: "-.3px", fontFamily: "Poppins, sans-serif" }}>
                    Asset Busters
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: online ? BRAND.green : "#9ca3af" }}/>
                    <p style={{ color: "rgba(255,255,255,.5)", fontSize: 9.5, margin: 0, letterSpacing: ".4px", textTransform: "uppercase", fontFamily: "Poppins, sans-serif" }}>
                      {online ? "M&A Deal Desk · Live" : "You're offline"}
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{ background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.12)", padding: "6px 7px", cursor: "pointer", color: "rgba(255,255,255,.7)", display: "flex", borderRadius: 2 }}
              >
                <CloseIcon/>
              </button>
            </div>

            {/* ── TABS ── */}
            <div style={{ display: "flex", background: "#fff", borderBottom: "none" }}>
              <button className={`ab-tab ${tab === "ai" ? "active" : "inactive"}`} onClick={() => setTab("ai")}>
                <AiSparkIcon/>
                AI Intelligence
              </button>
              <button className={`ab-tab ${tab === "advisory" ? "active" : "inactive"}`} onClick={() => setTab("advisory")}>
                <WaIcon/>
                Advisory Desk
              </button>
            </div>
          </div>

          {/* ── AI CHAT TAB ── */}
          {tab === "ai" && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, background: "#f4f6f9" }}>
              {/* Messages */}
              <div className="ab-scroll" style={{ flex: 1, overflowY: "auto", padding: "18px 16px 8px" }}>
                {msgs.map((m) =>
                  m.role === "assistant"
                    ? <AiMessage key={m.id} msg={m}/>
                    : <UserMessage key={m.id} msg={m}/>
                )}
                {loading && <TypingBubble/>}
                <div ref={bottomRef}/>
              </div>

              {/* Quick replies */}
              {isFirstMsg && (
                <div style={{ padding: "0 16px 10px", display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {QUICK_REPLIES.map((q) => (
                    <button key={q} className="ab-qr"
                      onClick={() => { setInput(q); inputRef.current?.focus(); }}>
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Input bar */}
              <div style={{ background: "#fff", borderTop: "1px solid #e2e6ed", padding: "12px 14px 14px", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
                  <textarea
                    ref={inputRef}
                    className="ab-textarea"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder={online ? "Ask about acquisitions, mandates, valuations…" : "You're offline"}
                    disabled={!online}
                    rows={1}
                  />
                  <button
                    className="ab-send"
                    onClick={sendMessage}
                    disabled={!input.trim() || loading || !online}
                    aria-label="Send"
                  >
                    {loading ? (
                      <div style={{ width: 13, height: 13, borderRadius: "50%", border: "2px solid #a0aec0", borderTopColor: "transparent", animation: "ab-spin .6s linear infinite" }}/>
                    ) : <SendIcon/>}
                  </button>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 9 }}>
                  <p style={{ fontSize: 9.5, color: "#a0aec0", margin: 0, fontFamily: "Poppins, sans-serif", letterSpacing: ".2px" }}>
                    Powered by Asset Busters AI · Responses are automated
                  </p>
                  <button
                    onClick={() => setTab("advisory")}
                    style={{ fontSize: 9.5, fontWeight: 700, color: BRAND.blue, background: "none", border: "none", cursor: "pointer", fontFamily: "Poppins, sans-serif", display: "flex", alignItems: "center", gap: 3 }}
                  >
                    Talk to an advisor <ChevronIcon dir="right"/>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── ADVISORY DESK TAB ── */}
          {tab === "advisory" && (
            <div className="ab-scroll" style={{ flex: 1, overflowY: "auto", background: "#f4f6f9" }}>
              {/* Sub-header */}
              <div style={{ background: "#fff", borderBottom: "1px solid #e2e6ed", padding: "16px 18px" }}>
                <p style={{ fontSize: 14, fontWeight: 800, color: BRAND.navy, margin: "0 0 4px", letterSpacing: "-.3px", fontFamily: "Poppins, sans-serif" }}>
                  Advisory Team
                </p>
                <p style={{ fontSize: 11.5, color: "#4a5568", margin: 0, lineHeight: 1.65, fontFamily: "Poppins, sans-serif" }}>
                  Connect directly with a verified M&A advisor on WhatsApp. Conversations are private and confidential.
                </p>
              </div>

              <div style={{ padding: "16px 16px 10px" }}>
                {/* Verified badge */}
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: `${BRAND.green}12`, border: `1px solid ${BRAND.green}28`,
                  padding: "5px 10px", marginBottom: 16,
                }}>
                  <CheckIcon/>
                  <span style={{ fontSize: 9.5, fontWeight: 700, color: BRAND.green, letterSpacing: ".5px", textTransform: "uppercase", fontFamily: "Poppins, sans-serif" }}>
                    Verified Advisors · NDA Protected
                  </span>
                </div>

                {staffLoading ? (
                  <div style={{ display: "flex", justifyContent: "center", padding: "28px 0" }}>
                    <DotSpinner/>
                  </div>
                ) : (
                  staff.map((m) => <StaffCard key={m._id} member={m} onTap={handleStaffTap}/>)
                )}

                {/* Office hours */}
                <div style={{
                  background: "#fff",
                  border: `1px solid ${BRAND.amber}40`,
                  borderLeft: `3px solid ${BRAND.amber}`,
                  padding: "12px 14px", marginTop: 6,
                }}>
                  <p style={{ fontSize: 11, fontWeight: 800, color: "#92400e", margin: "0 0 3px", fontFamily: "Poppins, sans-serif", textTransform: "uppercase", letterSpacing: ".4px" }}>
                    ⏱ Business Hours
                  </p>
                  <p style={{ fontSize: 11, color: "#b45309", margin: "0 0 2px", fontFamily: "Poppins, sans-serif" }}>
                    Monday – Friday · 8:00 AM – 6:00 PM WAT
                  </p>
                  <p style={{ fontSize: 10.5, color: "#d97706", margin: 0, fontFamily: "Poppins, sans-serif" }}>
                    Outside hours? Our AI intelligence is always available.
                  </p>
                </div>

                {/* Switch back */}
                <div style={{ textAlign: "center", marginTop: 16 }}>
                  <button
                    onClick={() => setTab("ai")}
                    style={{ fontSize: 11.5, fontWeight: 700, color: BRAND.blue, background: "none", border: "none", cursor: "pointer", fontFamily: "Poppins, sans-serif", display: "inline-flex", alignItems: "center", gap: 4 }}
                  >
                    <ChevronIcon dir="left"/> Back to AI Intelligence
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── BOTTOM ACCENT BAR ── */}
          <div style={{ height: 2, background: `linear-gradient(90deg,${BRAND.navy}80,${BRAND.blue}50)`, flexShrink: 0 }}/>
        </div>
      )}
    </>
  );
}