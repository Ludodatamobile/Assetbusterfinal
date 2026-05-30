"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

const LOGIN_TIMEOUT_MS = 20000;

const withTimeout = async <T,>(promise: Promise<T>, ms: number): Promise<T> => {
  let timeoutId: ReturnType<typeof setTimeout>;

  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error("Login is taking too long. Please try again."));
    }, ms);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timeoutId!);
  }
};

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();
  const { login } = useAuth();

  const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    return () => {
      mounted.current = false;

      if (redirectTimer.current) {
        clearTimeout(redirectTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!success) return;

    redirectTimer.current = setTimeout(() => {
      router.replace("/dashboard");
      router.refresh();
    }, 600);

    return () => {
      if (redirectTimer.current) {
        clearTimeout(redirectTimer.current);
      }
    };
  }, [success, router]);

  const set =
    (key: "email" | "password") => (e: ChangeEvent<HTMLInputElement>) => {
      setForm((current) => ({ ...current, [key]: e.target.value }));
    };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (submitting) return;

    const email = form.email.trim().toLowerCase();
    const password = form.password;

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess(false);

    try {
      await withTimeout(login({ email, password }), LOGIN_TIMEOUT_MS);

      if (mounted.current) {
        setSuccess(true);
      }
    } catch (err: any) {
      if (mounted.current) {
        setError(err?.message || "Unable to sign in. Please try again.");
      }
    } finally {
      if (mounted.current) {
        setSubmitting(false);
      }
    }
  };

  if (success) {
    return (
      <>
        <style>{styles}</style>
        <div className="auth-state-page">
          <div className="auth-success-screen">
            <div className="auth-success-content">
              <div className="auth-success-icon-wrap">
                <div className="auth-success-icon">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <path d="M10 24L20 34L38 14" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="auth-success-pulse" />
              </div>
              <h2 className="auth-success-title">Welcome back!</h2>
              <p className="auth-success-text">Taking you to your dashboard...</p>
              <div className="auth-success-dots"><span /><span /><span /></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="auth-page">
        <div className="auth-left">
          <div className="auth-left-texture" />
          <div className="auth-left-top">
            <div className="auth-left-eyebrow"><span className="auth-left-eyebrow-dot" />Enterprise M&amp;A Marketplace</div>
            <h2 className="auth-left-heading">Manage Serious Deals<br />from <span>One Secure Workspace</span></h2>
            <p className="auth-left-body">Access qualified buyers, investors, business sellers, advisors, documents, pipeline activity, and deal conversations in one professional system.</p>
            <div className="auth-left-stats">
              <div className="auth-stat-row">
                <div className="auth-stat-card"><span className="auth-stat-card-val">15,000+</span><span className="auth-stat-card-label">Businesses Listed</span></div>
                <div className="auth-stat-card"><span className="auth-stat-card-val">$2.4 Bn</span><span className="auth-stat-card-label">Capital Interest</span></div>
              </div>
              <div className="auth-stat-row">
                <div className="auth-stat-card"><span className="auth-stat-card-val">60+</span><span className="auth-stat-card-label">Countries</span></div>
                <div className="auth-stat-card"><span className="auth-stat-card-val">2,800+</span><span className="auth-stat-card-label">Closed Deals</span></div>
              </div>
            </div>
          </div>
          <div className="auth-left-bottom">
            <div className="auth-testimonial">
              <p className="auth-testimonial-text">"Asset Busters connected us with qualified strategic buyers faster than our offline advisor network. The quality of conversations improved immediately."</p>
              <div className="auth-testimonial-author">
                <div className="auth-testimonial-avatar">AO</div>
                <div>
                  <p className="auth-testimonial-name">Adaeze Okafor</p>
                  <p className="auth-testimonial-role">Exited healthcare business - Lagos, Nigeria</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-form-card">
            <div className="auth-card-kicker">Secure account access</div>
            <h1 className="auth-form-title">Welcome back</h1>
            <p className="auth-form-subtitle">Don't have an account? <Link href="/register">Create one free</Link></p>

            <div className="auth-social-row">
              <button className="auth-social-btn" type="button"><span className="auth-social-icon">G</span>Google</button>
              <button className="auth-social-btn" type="button"><span className="auth-social-icon">in</span>LinkedIn</button>
            </div>

            <div className="auth-divider"><div className="auth-divider-line" /><span className="auth-divider-text">or sign in with email</span><div className="auth-divider-line" /></div>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="auth-field">
                <label className="auth-label">Email Address</label>
                <input className="auth-input" type="email" placeholder="you@company.com" value={form.email} onChange={set("email")} autoComplete="email" disabled={submitting} />
              </div>

              <div className="auth-field">
                <label className="auth-label">Password</label>
                <div className="auth-input-wrap">
                  <input className="auth-input" type={showPw ? "text" : "password"} placeholder="Enter your password" value={form.password} onChange={set("password")} autoComplete="current-password" disabled={submitting} style={{ paddingRight: 44 }} />
                  <button type="button" className="auth-pw-toggle" onClick={() => setShowPw((value) => !value)} disabled={submitting}>{showPw ? "Hide" : "Show"}</button>
                </div>
              </div>

              <div className="auth-row">
                <label className="auth-check-label"><input type="checkbox" disabled={submitting} /><span className="auth-check-text">Remember me for 30 days</span></label>
                <Link href="/forgot-password" className="auth-forgot">Forgot password?</Link>
              </div>

              <button type="submit" className="auth-submit" disabled={submitting}>
                {submitting ? <><span className="auth-spinner" />Signing in...</> : <>Sign In to Dashboard</>}
              </button>
            </form>

            <div className="auth-trust">
              <span className="auth-trust-item">Secure login</span><span className="auth-trust-dot" />
              <span className="auth-trust-item">Verified marketplace</span><span className="auth-trust-dot" />
              <span className="auth-trust-item">Global deal flow</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// CSS styles 
const styles = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --max-w:82rem;--nav-h:106px;
    --navy:#0f1e36;--navy2:#1a2d4a;
    --blue:#1A56DB;--blue-d:#1444B8;
    --amber:#F5A623;--amber-d:#D4891A;--green:#10B981;
    --t2:#4a5568;--t3:#8896a8;--bdr:#e2e6ed;--surf:#f4f6f9;--bg:#fff;
    --font:'Poppins','Inter',system-ui,sans-serif;
    --t:180ms cubic-bezier(.4,0,.2,1);
  }
  body{font-family:var(--font);background:var(--surf);color:var(--navy);min-height:100vh}
  .auth-page,.auth-state-page{margin-top:var(--nav-h);min-height:calc(100vh - var(--nav-h))}
  .auth-success-screen{min-height:calc(100vh - var(--nav-h));display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,var(--navy) 0%,var(--navy2) 100%);position:relative;overflow:hidden;padding:28px}
  .auth-success-screen::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 60% 50% at 50% 50%,rgba(26,86,219,.2),transparent 70%)}
  .auth-success-content{position:relative;z-index:2;text-align:center;animation:successIn .5s cubic-bezier(.22,1,.36,1)}
  @keyframes successIn{from{opacity:0;transform:translateY(30px) scale(.95)}to{opacity:1;transform:translateY(0) scale(1)}}
  .auth-success-icon-wrap{position:relative;width:100px;height:100px;margin:0 auto 24px}
  .auth-success-icon{width:100px;height:100px;border-radius:50%;background:linear-gradient(135deg,var(--green) 0%,#059669 100%);display:flex;align-items:center;justify-content:center;color:#fff;position:relative;z-index:2;animation:successPop .6s cubic-bezier(.68,-.55,.265,1.55)}
  @keyframes successPop{0%{transform:scale(0) rotate(-180deg)}60%{transform:scale(1.1) rotate(10deg)}100%{transform:scale(1) rotate(0)}}
  .auth-success-pulse{position:absolute;inset:-12px;border-radius:50%;background:var(--green);opacity:.3;animation:successPulse 1.5s ease-in-out infinite}
  @keyframes successPulse{0%,100%{transform:scale(1);opacity:.3}50%{transform:scale(1.2);opacity:.05}}
  .auth-success-title{font-size:28px;font-weight:800;color:#fff;letter-spacing:-.7px;margin-bottom:8px}
  .auth-success-text{font-size:14px;color:rgba(255,255,255,.6);margin-bottom:20px}
  .auth-success-dots{display:flex;gap:6px;justify-content:center}
  .auth-success-dots span{width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,.4);animation:dotBounce 1.4s ease-in-out infinite}
  .auth-success-dots span:nth-child(1){animation-delay:0s}
  .auth-success-dots span:nth-child(2){animation-delay:.2s}
  .auth-success-dots span:nth-child(3){animation-delay:.4s}
  @keyframes dotBounce{0%,80%,100%{transform:scale(0);opacity:.3}40%{transform:scale(1);opacity:1}}
  .auth-page{max-width:var(--max-w);margin-left:auto;margin-right:auto;display:grid;grid-template-columns:minmax(0,1fr) minmax(460px,1fr);background:var(--bg);box-shadow:0 1px 0 var(--bdr)}
  .auth-left{position:relative;background:var(--navy);display:flex;flex-direction:column;justify-content:space-between;padding:44px 52px 38px;overflow:hidden}
  .auth-left::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 70% 55% at 15% 20%,rgba(26,86,219,.22) 0%,transparent 65%),radial-gradient(ellipse 55% 60% at 85% 75%,rgba(245,166,35,.12) 0%,transparent 60%);pointer-events:none}
  .auth-left-texture{position:absolute;inset:0;background-image:repeating-linear-gradient(-45deg,rgba(255,255,255,.018) 0,rgba(255,255,255,.018) 1px,transparent 1px,transparent 20px);pointer-events:none}
  .auth-left-top,.auth-left-bottom{position:relative;z-index:2}
  .auth-left-eyebrow{display:inline-flex;align-items:center;gap:7px;background:rgba(245,166,35,.14);border:1px solid rgba(245,166,35,.3);color:#fbbf24;font-size:10px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;padding:4px 12px;margin-bottom:32px}
  .auth-left-eyebrow-dot{width:6px;height:6px;border-radius:50%;background:var(--amber);animation:lpulse 1.8s infinite}
  @keyframes lpulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.7)}}
  .auth-left-heading{font-size:clamp(27px,2.7vw,38px);font-weight:800;color:#fff;letter-spacing:-.9px;line-height:1.1;margin-bottom:16px}
  .auth-left-heading span{color:var(--amber)}
  .auth-left-body{font-size:13.5px;color:rgba(255,255,255,.56);line-height:1.75;max-width:390px}
  .auth-left-stats{display:flex;flex-direction:column;gap:10px;margin-top:40px}
  .auth-stat-row{display:flex;gap:10px}
  .auth-stat-card{flex:1;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);padding:14px 16px;display:flex;flex-direction:column;gap:3px}
  .auth-stat-card-val{font-size:18px;font-weight:800;color:#fff;letter-spacing:-.5px}
  .auth-stat-card-label{font-size:9.5px;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.6px}
  .auth-testimonial{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-left:3px solid var(--amber);padding:18px 20px;margin-top:28px}
  .auth-testimonial-text{font-size:12.5px;color:rgba(255,255,255,.72);line-height:1.7;font-style:italic;margin-bottom:12px}
  .auth-testimonial-author{display:flex;align-items:center;gap:10px}
  .auth-testimonial-avatar{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,var(--blue),var(--amber));display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:#fff;flex-shrink:0}
  .auth-testimonial-name{font-size:12px;font-weight:700;color:#fff}
  .auth-testimonial-role{font-size:10.5px;color:rgba(255,255,255,.42)}
  .auth-right{display:flex;align-items:center;justify-content:center;padding:36px 40px;background:linear-gradient(180deg,#f8fafc 0%,var(--surf) 100%)}
  .auth-form-card{width:100%;max-width:440px;background:var(--bg);border:1px solid var(--bdr);padding:30px;box-shadow:0 18px 45px rgba(15,30,54,.08);animation:formIn .5s cubic-bezier(.22,1,.36,1) both}
  @keyframes formIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  .auth-card-kicker{font-size:10.5px;font-weight:800;color:var(--blue);text-transform:uppercase;letter-spacing:.75px;margin-bottom:8px}
  .auth-form-title{font-size:25px;font-weight:800;color:var(--navy);letter-spacing:-.7px;margin-bottom:6px}
  .auth-form-subtitle{font-size:13px;color:var(--t3);margin-bottom:28px;line-height:1.5}
  .auth-form-subtitle a{color:var(--blue);font-weight:600;text-decoration:none}
  .auth-social-row{display:flex;gap:8px;margin-bottom:22px}
  .auth-social-btn{flex:1;display:flex;align-items:center;justify-content:center;gap:8px;background:var(--bg);border:1px solid var(--bdr);padding:10px 14px;cursor:pointer;font-family:var(--font);font-size:12.5px;font-weight:700;color:var(--t2);transition:all var(--t)}
  .auth-social-btn:hover{background:var(--surf);color:var(--navy)}
  .auth-social-icon{font-size:16px;font-weight:800}
  .auth-divider{display:flex;align-items:center;gap:12px;margin-bottom:22px}
  .auth-divider-line{flex:1;height:1px;background:var(--bdr)}
  .auth-divider-text{font-size:10.5px;color:var(--t3);font-weight:800;text-transform:uppercase;letter-spacing:.55px;white-space:nowrap}
  .auth-field{display:flex;flex-direction:column;gap:6px;margin-bottom:14px}
  .auth-label{font-size:11.5px;font-weight:700;color:var(--navy);letter-spacing:.1px}
  .auth-input-wrap{position:relative}
  .auth-input{width:100%;background:var(--bg);border:1.5px solid var(--bdr);color:var(--navy);font-size:13.5px;font-family:var(--font);padding:11px 14px;outline:none;transition:border-color var(--t),box-shadow var(--t)}
  .auth-input:focus{border-color:var(--blue);box-shadow:0 0 0 3px rgba(26,86,219,.1)}
  .auth-input::placeholder{color:var(--t3)}
  .auth-pw-toggle{position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--t3);display:flex;align-items:center;padding:4px}
  .auth-error{background:#fef2f2;border:1px solid #fecaca;border-left:3px solid #ef4444;padding:10px 14px;margin-bottom:14px;font-size:12px;color:#b91c1c;font-weight:500;animation:errorShake .4s ease}
  @keyframes errorShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}
  .auth-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;gap:12px}
  .auth-check-label{display:flex;align-items:center;gap:7px;cursor:pointer}
  .auth-check-label input{width:15px;height:15px;accent-color:var(--blue);cursor:pointer}
  .auth-check-text{font-size:12px;color:var(--t2)}
  .auth-forgot{font-size:12px;color:var(--blue);font-weight:700;text-decoration:none;white-space:nowrap}
  .auth-submit{width:100%;background:var(--blue);color:#fff;border:none;font-family:var(--font);font-size:13.5px;font-weight:800;padding:13px 24px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:9px;transition:all var(--t);letter-spacing:.15px}
  .auth-submit:hover:not(:disabled){background:var(--blue-d);transform:translateY(-2px);box-shadow:0 6px 22px rgba(26,86,219,.34)}
  .auth-submit:disabled{opacity:.65;cursor:not-allowed}
  .auth-spinner{width:16px;height:16px;border-radius:50%;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;animation:spin .65s linear infinite}
  @keyframes spin{to{transform:rotate(360deg)}}
  .auth-trust{display:flex;align-items:center;justify-content:center;gap:8px;margin-top:20px;flex-wrap:wrap}
  .auth-trust-item{font-size:10.5px;color:var(--t3)}
  .auth-trust-dot{width:3px;height:3px;border-radius:50%;background:var(--bdr)}
  @media(max-width:1024px){:root{--nav-h:64px}.auth-page{grid-template-columns:1fr;max-width:100%}.auth-left{display:none}.auth-right{min-height:calc(100vh - var(--nav-h));padding:32px 24px;align-items:flex-start}.auth-form-card{max-width:520px;margin:0 auto}}
  @media(max-width:520px){.auth-right{padding:22px 14px}.auth-form-card{padding:24px 16px}.auth-social-row{flex-direction:column}.auth-row{flex-direction:column;align-items:flex-start}}
`;
