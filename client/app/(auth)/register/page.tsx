"use client";

import { useState } from "react";
import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

const ROLES = [
  {
    id: "BUSINESS_OWNER",
    icon: "🏢",
    label: "Business Owner",
    desc: "Sell, franchise, or raise capital for my business",
    color: "#1A56DB",
  },
  {
    id: "INVESTOR",
    icon: "💰",
    label: "Investor / Buyer",
    desc: "Acquire businesses or invest as an angel / PE / VC",
    color: "#F5A623",
  },
  {
    id: "FRANCHISE_PARTNER",
    icon: "🏪",
    label: "Franchise Partner",
    desc: "Find franchise opportunities or list my brand",
    color: "#10B981",
  },
  {
    id: "ADVISOR",
    icon: "🤝",
    label: "Advisor / Consultant",
    desc: "Provide M&A, legal, or financial advisory services",
    color: "#7C3AED",
  },
];

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    country: "",
    agree: false,
  });
  const [showPw, setShowPw] = useState(false);
  const [registrationState, setRegistrationState] = useState<"form" | "submitting" | "verifying">("form");
  const [userEmail, setUserEmail] = useState("");
  const router = useRouter();
  const { register, resendVerificationEmail, loading } = useAuth();
  const [error, setError] = useState("");

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({
      ...f,
      [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));

  const handleRoleNext = () => {
    if (!role) {
      setError("Please select your role to continue.");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const email = form.email.trim().toLowerCase();
    const { firstName, lastName, password, agree } = form;

    if (!role) {
      setError("Please select your role to continue.");
      setStep(1);
      return;
    }

    if (!firstName || !lastName || !email || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!agree) {
      setError("Please agree to the Terms & Privacy Policy.");
      return;
    }

    setError("");
    setRegistrationState("submitting");
    setUserEmail(email);

    try {
      await register({
        email,
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        role: role as any,
        phone: form.phone.trim() || undefined,
        country: form.country || undefined,
      });

      setTimeout(() => {
        setRegistrationState("verifying");
      }, 1000);
    } catch (err: any) {
      setError(err?.message || "Registration failed. Please try again.");
      setRegistrationState("form");
    }
  };

  const selectedRole = ROLES.find((r) => r.id === role);

  if (registrationState === "submitting") {
    return (
      <>
        <style>{styles}</style>
        <div className="reg-state-page">
          <div className="reg-loading-screen">
            <div className="reg-loading-content">
              <div className="reg-loading-spinner-wrap">
                <div className="reg-loading-spinner" />
                <div className="reg-loading-pulse" />
              </div>
              <h2 className="reg-loading-title">Creating your account</h2>
              <p className="reg-loading-text">Setting up your profile and preferences...</p>
              <div className="reg-loading-steps">
                <div className="reg-loading-step active">
                  <div className="reg-loading-step-icon">✓</div>
                  <span>Validating information</span>
                </div>
                <div className="reg-loading-step active">
                  <div className="reg-loading-step-icon">
                    <div className="reg-loading-step-spinner" />
                  </div>
                  <span>Creating your account</span>
                </div>
                <div className="reg-loading-step">
                  <div className="reg-loading-step-icon">3</div>
                  <span>Preparing verification email</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (registrationState === "verifying") {
    return (
      <>
        <style>{styles}</style>
        <div className="reg-state-page">
          <div className="reg-verify-screen">
            <div className="reg-verify-content">
              <div className="reg-verify-icon-wrap">
                <div className="reg-verify-icon">
                  <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                    <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="2" opacity="0.2" />
                    <path d="M16 32L28 44L48 20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="reg-verify-pulse" />
              </div>

              <h2 className="reg-verify-title">Check your email</h2>
              <p className="reg-verify-text">
                We've sent a verification link to<br />
                <strong>{userEmail}</strong>
              </p>

              <div className="reg-verify-steps">
                <div className="reg-verify-step">
                  <div className="reg-verify-step-num">1</div>
                  <div>
                    <h4>Open the email</h4>
                    <p>Check your inbox and spam folder</p>
                  </div>
                </div>
                <div className="reg-verify-step">
                  <div className="reg-verify-step-num">2</div>
                  <div>
                    <h4>Click the verification link</h4>
                    <p>This confirms your email address</p>
                  </div>
                </div>
                <div className="reg-verify-step">
                  <div className="reg-verify-step-num">3</div>
                  <div>
                    <h4>Sign in to your account</h4>
                    <p>You can continue to your dashboard after verification</p>
                  </div>
                </div>
              </div>

              <div className="reg-verify-actions">
                <button className="reg-verify-btn-primary" onClick={() => router.push("/login")}>
                  Go to Login →
                </button>
                <button
                  className="reg-verify-btn-secondary"
                  type="button"
                  onClick={async () => {
                    try {
                      await resendVerificationEmail(userEmail);
                      alert("Verification email resent!");
                    } catch (err: any) {
                      setError(err?.message || "Unable to resend verification email.");
                    }
                  }}
                >
                  Resend email
                </button>
              </div>

              <p className="reg-verify-help">
                Didn't receive the email? Check your spam folder or{" "}
                <a href="mailto:support@assetbusters.com">contact support</a>
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>

      <div className="reg-page">
        <div className="reg-left">
          <div className="reg-left-texture" />
          <div className="reg-left-content">
            <div className="reg-left-eyebrow">
              <span className="reg-left-eyebrow-dot" />
              Verified M&A Marketplace
            </div>
            <h2 className="reg-left-heading">
              Build Your Deal Room
              <br />
              for <span>Buy, Sell & Capital Raise</span>
            </h2>
            <p className="reg-left-body">
              Join an enterprise-grade marketplace built for business owners, buyers,
              investors, franchise partners, and advisors.
            </p>

            <div className="reg-features">
              {[
                {
                  icon: "🎯",
                  color: "#1A56DB",
                  title: "Curated Deal Flow",
                  desc: "Match with relevant buyers, sellers, and investors based on your exact mandate.",
                },
                {
                  icon: "🔒",
                  color: "#10B981",
                  title: "Confidential by Default",
                  desc: "Protect your identity and disclose sensitive details only to verified parties.",
                },
                {
                  icon: "📊",
                  color: "#F5A623",
                  title: "Financially Structured",
                  desc: "Organize revenues, EBITDA, valuation, documents, and buyer interest in one workflow.",
                },
                {
                  icon: "🌍",
                  color: "#7C3AED",
                  title: "Cross-Border Reach",
                  desc: "Access business and investor opportunities across Africa, Asia, Europe, and the Middle East.",
                },
              ].map((f) => (
                <div className="reg-feature" key={f.title}>
                  <div className="reg-feature-icon" style={{ background: f.color + "18", color: f.color }}>
                    {f.icon}
                  </div>
                  <div className="reg-feature-text">
                    <p className="reg-feature-title">{f.title}</p>
                    <p className="reg-feature-desc">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="reg-left-bottom">
            <div className="reg-bottom-badge">
              <span className="reg-bottom-badge-icon">⚡</span>
              <p className="reg-bottom-badge-text">
                <strong>Fast onboarding —</strong> create your profile, select your mandate,
                and start receiving qualified opportunities.
              </p>
            </div>
          </div>
        </div>

        <div className="reg-right">
          <div className="reg-form-card">
            <div className="reg-progress">
              <div className={`reg-step-dot ${step >= 1 ? (step > 1 ? "done" : "active") : "pending"}`}>
                {step > 1 ? "✓" : "1"}
              </div>
              <div className="reg-step-line">
                <div className="reg-step-line-fill" style={{ width: step > 1 ? "100%" : "0%" }} />
              </div>
              <div className={`reg-step-dot ${step >= 2 ? "active" : "pending"}`}>2</div>
              <span className="reg-step-label">{step === 1 ? "Choose role" : "Your details"}</span>
            </div>

            {step === 1 ? (
              <>
                <h1 className="reg-title">Create your account</h1>
                <p className="reg-subtitle">
                  Already have an account? <a href="/login">Sign in →</a>
                </p>

                {error && <div className="reg-error">⚠ {error}</div>}

                <p className="reg-section-label">I am joining as a...</p>

                <div className="reg-roles">
                  {ROLES.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      className={`reg-role-card ${role === r.id ? "selected" : ""}`}
                      onClick={() => {
                        setRole(r.id);
                        setError("");
                      }}
                      style={role === r.id ? { borderColor: r.color, background: r.color + "08" } : {}}
                    >
                      <div className="reg-role-check" style={role === r.id ? { background: r.color, borderColor: r.color } : {}}>
                        {role === r.id && "✓"}
                      </div>
                      <div className="reg-role-icon" style={{ background: role === r.id ? r.color + "18" : "var(--surf)", color: r.color }}>
                        {r.icon}
                      </div>
                      <p className="reg-role-label">{r.label}</p>
                      <p className="reg-role-desc">{r.desc}</p>
                    </button>
                  ))}
                </div>

                <button type="button" className="reg-next-btn" onClick={handleRoleNext}>
                  Continue{selectedRole ? ` as ${selectedRole.label}` : ""} →
                </button>

                <p className="reg-login-link">
                  Already have an account? <a href="/login">Sign in here</a>
                </p>
              </>
            ) : (
              <>
                {selectedRole && (
                  <div className="reg-selected-role" style={{ background: selectedRole.color + "10", borderColor: selectedRole.color + "28" }}>
                    <span className="reg-selected-role-icon">{selectedRole.icon}</span>
                    <div>
                      <p className="reg-selected-role-kicker" style={{ color: selectedRole.color }}>Joining as</p>
                      <p className="reg-selected-role-label">{selectedRole.label}</p>
                    </div>
                  </div>
                )}

                <h1 className="reg-title">Your details</h1>
                <p className="reg-subtitle">Fill in your information to complete registration.</p>

                {error && <div className="reg-error">⚠ {error}</div>}

                <form onSubmit={handleSubmit}>
                  <div className="reg-name-row">
                    <div className="reg-field" style={{ marginBottom: 0 }}>
                      <label className="reg-label">First Name <span>*</span></label>
                      <input className="reg-input" placeholder="Emeka" value={form.firstName} onChange={set("firstName")} />
                    </div>
                    <div className="reg-field" style={{ marginBottom: 0 }}>
                      <label className="reg-label">Last Name <span>*</span></label>
                      <input className="reg-input" placeholder="Okafor" value={form.lastName} onChange={set("lastName")} />
                    </div>
                  </div>

                  <div className="reg-field" style={{ marginTop: 14 }}>
                    <label className="reg-label">Email Address <span>*</span></label>
                    <input className="reg-input" type="email" placeholder="you@company.com" value={form.email} onChange={set("email")} autoComplete="email" />
                  </div>

                  <div className="reg-field">
                    <label className="reg-label">Phone Number</label>
                    <input className="reg-input" type="tel" placeholder="+234 800 000 0000" value={form.phone} onChange={set("phone")} />
                  </div>

                  <div className="reg-field">
                    <label className="reg-label">Country</label>
                    <select className="reg-input reg-select" value={form.country} onChange={set("country") as any}>
                      <option value="">Select your country...</option>
                      {["Nigeria", "Kenya", "South Africa", "Ghana", "Senegal", "Ethiopia", "Tanzania", "Egypt", "UAE", "India", "UK", "USA", "Singapore", "Other"].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="reg-field">
                    <label className="reg-label">Password <span>*</span></label>
                    <div className="reg-input-wrap">
                      <input
                        className="reg-input"
                        type={showPw ? "text" : "password"}
                        placeholder="Create a strong password"
                        value={form.password}
                        onChange={set("password")}
                        autoComplete="new-password"
                        style={{ paddingRight: 44 }}
                      />
                      <button type="button" className="reg-pw-toggle" onClick={() => setShowPw((v) => !v)}>
                        {showPw ? "🙈" : "👁"}
                      </button>
                    </div>
                  </div>

                  <label className="reg-agree">
                    <input type="checkbox" checked={form.agree} onChange={set("agree")} />
                    <span className="reg-agree-text">
                      I agree to Asset Busters' <a href="/terms">Terms of Service</a> and{" "}
                      <a href="/privacy">Privacy Policy</a>. I consent to receiving deal-matching emails.
                    </span>
                  </label>

                  <div className="reg-btn-row">
                    <button type="button" className="reg-back-btn" onClick={() => { setStep(1); setError(""); }}>
                      ← Back
                    </button>
                    <button type="submit" className="reg-submit" disabled={loading}>
                      {loading ? (
                        <>
                          <span className="reg-spinner" />
                          Creating account...
                        </>
                      ) : (
                        <>Create My Account →</>
                      )}
                    </button>
                  </div>
                </form>

                <p className="reg-login-link">
                  Already have an account? <a href="/login">Sign in here</a>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

const styles = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --max-w:82rem;
    --nav-h:106px;
    --navy:#0f1e36;--navy2:#1a2d4a;
    --blue:#1A56DB;--blue-d:#1444B8;
    --amber:#F5A623;--amber-d:#D4891A;--green:#10B981;--purple:#7C3AED;
    --t2:#4a5568;--t3:#8896a8;
    --bdr:#e2e6ed;--surf:#f4f6f9;--bg:#fff;
    --font:'Poppins','Inter',system-ui,sans-serif;
    --t:180ms cubic-bezier(.4,0,.2,1);
  }
  body{font-family:var(--font);background:var(--surf);color:var(--navy);min-height:100vh}

  .reg-page,.reg-state-page{
    margin-top:var(--nav-h);
    min-height:calc(100vh - var(--nav-h));
  }

  .reg-loading-screen,.reg-verify-screen{
    min-height:calc(100vh - var(--nav-h));
    display:flex;align-items:center;justify-content:center;
    padding:28px;
  }
  .reg-loading-screen{
    background:linear-gradient(135deg,var(--navy) 0%,var(--navy2) 100%);
    position:relative;overflow:hidden;
  }
  .reg-loading-screen::before{
    content:'';position:absolute;inset:0;
    background:
      radial-gradient(ellipse 60% 50% at 30% 20%,rgba(26,86,219,.15),transparent 60%),
      radial-gradient(ellipse 55% 60% at 70% 80%,rgba(245,166,35,.1),transparent 60%);
  }
  .reg-loading-content{position:relative;z-index:2;text-align:center;animation:loadIn .6s cubic-bezier(.22,1,.36,1)}
  @keyframes loadIn{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
  .reg-loading-spinner-wrap{position:relative;width:120px;height:120px;margin:0 auto 32px}
  .reg-loading-spinner{width:120px;height:120px;border-radius:50%;border:3px solid rgba(255,255,255,.1);border-top-color:var(--blue);animation:spinLoad 1s cubic-bezier(.68,-.55,.265,1.55) infinite}
  .reg-loading-pulse{position:absolute;inset:8px;border-radius:50%;background:radial-gradient(circle,rgba(26,86,219,.2),transparent);animation:pulseLoad 2s ease-in-out infinite}
  @keyframes spinLoad{to{transform:rotate(360deg)}}
  @keyframes pulseLoad{0%,100%{transform:scale(1);opacity:.3}50%{transform:scale(1.1);opacity:.5}}
  .reg-loading-title{font-size:26px;font-weight:800;color:#fff;letter-spacing:-.6px;margin-bottom:8px}
  .reg-loading-text{font-size:14px;color:rgba(255,255,255,.6);margin-bottom:40px}
  .reg-loading-steps{display:flex;flex-direction:column;gap:16px;max-width:360px;margin:0 auto}
  .reg-loading-step{display:flex;align-items:center;gap:14px;padding:14px 18px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:8px;transition:all .3s ease}
  .reg-loading-step.active{background:rgba(26,86,219,.15);border-color:rgba(26,86,219,.3)}
  .reg-loading-step-icon{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.1);color:#fff;font-size:13px;font-weight:700;flex-shrink:0}
  .reg-loading-step.active .reg-loading-step-icon{background:var(--blue)}
  .reg-loading-step-spinner{width:14px;height:14px;border-radius:50%;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;animation:spinSmall .6s linear infinite}
  @keyframes spinSmall{to{transform:rotate(360deg)}}
  .reg-loading-step span{font-size:13px;color:rgba(255,255,255,.5);font-weight:500}
  .reg-loading-step.active span{color:rgba(255,255,255,.9)}

  .reg-verify-screen{background:var(--surf)}
  .reg-verify-content{max-width:520px;width:100%;background:var(--bg);border:1px solid var(--bdr);border-radius:8px;padding:48px 40px;text-align:center;animation:verifyIn .5s cubic-bezier(.22,1,.36,1);box-shadow:0 18px 50px rgba(15,30,54,.08)}
  @keyframes verifyIn{from{opacity:0;transform:translateY(20px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}
  .reg-verify-icon-wrap{position:relative;width:100px;height:100px;margin:0 auto 28px}
  .reg-verify-icon{width:100px;height:100px;background:linear-gradient(135deg,var(--green) 0%,#059669 100%);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;position:relative;z-index:2;animation:iconPop .6s cubic-bezier(.68,-.55,.265,1.55)}
  @keyframes iconPop{from{transform:scale(0)}to{transform:scale(1)}}
  .reg-verify-pulse{position:absolute;inset:-8px;border-radius:50%;background:var(--green);opacity:.2;animation:verifyPulse 2s ease-in-out infinite}
  @keyframes verifyPulse{0%,100%{transform:scale(1);opacity:.2}50%{transform:scale(1.15);opacity:.05}}
  .reg-verify-title{font-size:26px;font-weight:800;color:var(--navy);letter-spacing:-.7px;margin-bottom:10px}
  .reg-verify-text{font-size:14px;color:var(--t2);line-height:1.7;margin-bottom:36px}
  .reg-verify-text strong{color:var(--navy);font-weight:700}
  .reg-verify-steps{display:flex;flex-direction:column;gap:12px;margin-bottom:32px;text-align:left}
  .reg-verify-step{display:flex;gap:14px;padding:14px 16px;background:var(--surf);border:1px solid var(--bdr);border-radius:8px}
  .reg-verify-step-num{width:32px;height:32px;flex-shrink:0;border-radius:50%;background:var(--blue);color:#fff;font-size:14px;font-weight:700;display:flex;align-items:center;justify-content:center}
  .reg-verify-step h4{font-size:13px;font-weight:700;color:var(--navy);margin-bottom:2px}
  .reg-verify-step p{font-size:12px;color:var(--t3);line-height:1.5}
  .reg-verify-actions{display:flex;flex-direction:column;gap:10px;margin-bottom:20px}
  .reg-verify-btn-primary{width:100%;background:var(--blue);color:#fff;border:none;font-family:var(--font);font-size:14px;font-weight:700;padding:14px 24px;border-radius:6px;cursor:pointer;transition:all var(--t)}
  .reg-verify-btn-primary:hover{background:var(--blue-d);transform:translateY(-2px);box-shadow:0 6px 20px rgba(26,86,219,.3)}
  .reg-verify-btn-secondary{width:100%;background:var(--bg);color:var(--t2);border:1.5px solid var(--bdr);font-family:var(--font);font-size:13px;font-weight:600;padding:12px 24px;border-radius:6px;cursor:pointer;transition:all var(--t)}
  .reg-verify-btn-secondary:hover{background:var(--surf);border-color:#c4d0e8}
  .reg-verify-help{font-size:12px;color:var(--t3);line-height:1.6}
  .reg-verify-help a{color:var(--blue);font-weight:600;text-decoration:none}
  .reg-verify-help a:hover{text-decoration:underline}

  .reg-page{
    max-width:var(--max-w);
    margin-left:auto;
    margin-right:auto;
    display:grid;
    grid-template-columns:minmax(0,1fr) minmax(460px,1fr);
    background:var(--bg);
    box-shadow:0 1px 0 var(--bdr);
  }
  .reg-left{
    position:relative;background:var(--navy);
    display:flex;flex-direction:column;justify-content:space-between;
    padding:44px 52px 38px;overflow:hidden;
  }
  .reg-left::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 65% 55% at 85% 15%,rgba(245,166,35,.15),transparent 60%),radial-gradient(ellipse 55% 65% at 10% 80%,rgba(26,86,219,.2),transparent 65%);pointer-events:none}
  .reg-left-texture{position:absolute;inset:0;background-image:repeating-linear-gradient(-45deg,rgba(255,255,255,.018) 0,rgba(255,255,255,.018) 1px,transparent 1px,transparent 20px);pointer-events:none}
  .reg-left-content{position:relative;z-index:2}
  .reg-left-eyebrow{display:inline-flex;align-items:center;gap:7px;background:rgba(16,185,129,.15);border:1px solid rgba(16,185,129,.28);color:#6ee7b7;font-size:10px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;padding:4px 12px;margin-bottom:28px}
  .reg-left-eyebrow-dot{width:6px;height:6px;border-radius:50%;background:var(--green);animation:rpulse 1.8s infinite}
  @keyframes rpulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.7)}}
  .reg-left-heading{font-size:clamp(26px,2.5vw,36px);font-weight:800;color:#fff;letter-spacing:-.8px;line-height:1.12;margin-bottom:16px}
  .reg-left-heading span{color:var(--amber)}
  .reg-left-body{font-size:13px;color:rgba(255,255,255,.56);line-height:1.75;max-width:370px;margin-bottom:32px}
  .reg-features{display:flex;flex-direction:column;gap:12px}
  .reg-feature{display:flex;align-items:flex-start;gap:12px;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.08);padding:14px 16px;border-radius:6px}
  .reg-feature-icon{width:34px;height:34px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:16px;border-radius:5px}
  .reg-feature-text{flex:1}
  .reg-feature-title{font-size:12.5px;font-weight:700;color:#fff;margin-bottom:3px}
  .reg-feature-desc{font-size:11px;color:rgba(255,255,255,.48);line-height:1.5}
  .reg-left-bottom{position:relative;z-index:2}
  .reg-bottom-badge{display:flex;align-items:center;gap:12px;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.08);padding:14px 16px;margin-top:24px;border-radius:6px}
  .reg-bottom-badge-icon{font-size:22px}
  .reg-bottom-badge-text{font-size:11.5px;color:rgba(255,255,255,.6);line-height:1.5}
  .reg-bottom-badge-text strong{color:#fff}

  .reg-right{
    display:flex;align-items:center;justify-content:center;
    padding:36px 40px;background:linear-gradient(180deg,#f8fafc 0%,var(--surf) 100%);
    overflow-y:auto;
  }
  .reg-form-card{
    width:100%;max-width:460px;
    background:var(--bg);
    border:1px solid var(--bdr);
    border-radius:8px;
    padding:28px;
    box-shadow:0 18px 45px rgba(15,30,54,.08);
    animation:formIn .5s cubic-bezier(.22,1,.36,1) both;
  }
  @keyframes formIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  .reg-progress{display:flex;align-items:center;gap:6px;margin-bottom:24px}
  .reg-step-dot{display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;font-size:11.5px;font-weight:700;border:2px solid;transition:all var(--t)}
  .reg-step-dot.done,.reg-step-dot.active{background:var(--blue);border-color:var(--blue);color:#fff}
  .reg-step-dot.active{box-shadow:0 0 0 4px rgba(26,86,219,.14)}
  .reg-step-dot.pending{background:var(--bg);border-color:var(--bdr);color:var(--t3)}
  .reg-step-line{flex:1;height:2px;background:var(--bdr);border-radius:2px;overflow:hidden}
  .reg-step-line-fill{height:100%;background:var(--blue);transition:width .5s ease;border-radius:2px}
  .reg-step-label{font-size:10.5px;color:var(--t3);font-weight:700;margin-left:2px;white-space:nowrap;text-transform:uppercase;letter-spacing:.45px}
  .reg-title{font-size:24px;font-weight:800;color:var(--navy);letter-spacing:-.6px;margin-bottom:6px}
  .reg-subtitle{font-size:13px;color:var(--t3);margin-bottom:24px;line-height:1.5}
  .reg-subtitle a,.reg-login-link a,.reg-agree-text a{color:var(--blue);font-weight:600;text-decoration:none}
  .reg-subtitle a:hover,.reg-login-link a:hover,.reg-agree-text a:hover{text-decoration:underline}
  .reg-section-label{font-size:11px;font-weight:800;color:var(--t3);text-transform:uppercase;letter-spacing:.7px;margin-bottom:12px}
  .reg-error{background:#fef2f2;border:1px solid #fecaca;border-left:3px solid #ef4444;padding:10px 14px;margin-bottom:16px;font-size:12px;color:#b91c1c;font-weight:500;border-radius:4px}
  .reg-roles{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:22px}
  .reg-role-card{background:var(--bg);border:1.5px solid var(--bdr);border-radius:7px;padding:16px 14px;cursor:pointer;display:flex;flex-direction:column;gap:8px;transition:all var(--t);position:relative;text-align:left;font-family:var(--font)}
  .reg-role-card:hover{border-color:#c4d0e8;background:#fbfcfe;transform:translateY(-2px);box-shadow:0 8px 22px rgba(15,30,54,.08)}
  .reg-role-card.selected{transform:translateY(-2px);box-shadow:0 8px 22px rgba(15,30,54,.12)}
  .reg-role-check{position:absolute;top:10px;right:10px;width:18px;height:18px;border-radius:50%;border:2px solid var(--bdr);background:var(--surf);display:flex;align-items:center;justify-content:center;transition:all var(--t);font-size:9px}
  .reg-role-card.selected .reg-role-check{color:#fff}
  .reg-role-icon{width:38px;height:38px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;transition:background var(--t)}
  .reg-role-label{font-size:13px;font-weight:700;color:var(--navy);line-height:1.2}
  .reg-role-desc{font-size:11px;color:var(--t3);line-height:1.45}
  .reg-selected-role{display:flex;align-items:center;gap:10px;border:1px solid;padding:10px 14px;margin-bottom:20px;border-radius:6px}
  .reg-selected-role-icon{font-size:18px}
  .reg-selected-role-kicker{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.5px}
  .reg-selected-role-label{font-size:13px;font-weight:800;color:var(--navy)}
  .reg-name-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px}
  .reg-field{display:flex;flex-direction:column;gap:6px;margin-bottom:14px}
  .reg-label{font-size:11.5px;font-weight:700;color:var(--navy);letter-spacing:.1px}
  .reg-label span{color:#ef4444;margin-left:2px}
  .reg-input-wrap{position:relative}
  .reg-input{width:100%;background:var(--bg);border:1.5px solid var(--bdr);border-radius:6px;color:var(--navy);font-size:13.5px;font-family:var(--font);padding:11px 14px;outline:none;transition:border-color var(--t),box-shadow var(--t)}
  .reg-input:focus{border-color:var(--blue);box-shadow:0 0 0 3px rgba(26,86,219,.1)}
  .reg-input::placeholder{color:var(--t3)}
  .reg-select{appearance:none;background-image:url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%238896a8' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 14px center;padding-right:38px;cursor:pointer}
  .reg-pw-toggle{position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--t3);display:flex;align-items:center;padding:4px;transition:color var(--t)}
  .reg-pw-toggle:hover{color:var(--navy)}
  .reg-agree{display:flex;align-items:flex-start;gap:9px;margin-bottom:20px;cursor:pointer}
  .reg-agree input{width:16px;height:16px;accent-color:var(--blue);cursor:pointer;margin-top:1px;flex-shrink:0}
  .reg-agree-text{font-size:11.5px;color:var(--t2);line-height:1.55}
  .reg-btn-row{display:flex;gap:8px}
  .reg-back-btn{background:var(--bg);border:1.5px solid var(--bdr);border-radius:6px;color:var(--t2);font-family:var(--font);font-size:13px;font-weight:600;padding:12px 20px;cursor:pointer;transition:all var(--t)}
  .reg-back-btn:hover{background:var(--surf);color:var(--navy)}
  .reg-submit,.reg-next-btn{border:none;font-family:var(--font);font-size:13.5px;font-weight:800;padding:13px 24px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:9px;transition:all var(--t);letter-spacing:.15px;border-radius:6px}
  .reg-submit{flex:1;background:var(--blue);color:#fff}
  .reg-submit:hover:not(:disabled){background:var(--blue-d);transform:translateY(-1px);box-shadow:0 5px 18px rgba(26,86,219,.32)}
  .reg-submit:disabled{opacity:.65;cursor:not-allowed;transform:none;box-shadow:none}
  .reg-next-btn{width:100%;background:var(--navy);color:#fff}
  .reg-next-btn:hover{background:var(--navy2);transform:translateY(-1px);box-shadow:0 5px 18px rgba(15,30,54,.28)}
  .reg-spinner{width:16px;height:16px;border-radius:50%;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;animation:rspin .65s linear infinite}
  @keyframes rspin{to{transform:rotate(360deg)}}
  .reg-login-link{text-align:center;margin-top:18px;font-size:12px;color:var(--t3)}

  @media(max-width:1024px){
    :root{--nav-h:64px}
    .reg-page{grid-template-columns:1fr;max-width:100%}
    .reg-left{display:none}
    .reg-right{min-height:calc(100vh - var(--nav-h));padding:32px 24px;align-items:flex-start}
    .reg-form-card{max-width:560px;margin:0 auto}
  }
  @media(max-width:520px){
    .reg-right{padding:22px 14px}
    .reg-form-card{padding:22px 16px}
    .reg-roles,.reg-name-row{grid-template-columns:1fr}
    .reg-btn-row{flex-direction:column}
    .reg-back-btn,.reg-submit{width:100%}
  }
`;
