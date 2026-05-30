"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, KeyRound, Loader2, ShieldCheck, UserPlus } from "lucide-react";
import { bootstrapSuperAdmin, getAdminBootstrapStatus } from "@/services/admin/auth.service";

export default function CreateAdminPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    setupSecret: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    const checkBootstrap = async () => {
      let redirected = false;
      try {
        const status = await getAdminBootstrapStatus();
        if (active && !status.requiresBootstrap) {
          redirected = true;
          router.replace("/admin/login");
        }
      } catch {
        if (active) setError("Unable to verify admin setup status. Confirm the backend is running.");
      } finally {
        if (active && !redirected) setChecking(false);
      }
    };

    void checkBootstrap();
    return () => {
      active = false;
    };
  }, [router]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await bootstrapSuperAdmin({
        ...form,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
      });
      router.replace("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create the first admin.");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <main className="min-h-screen grid place-items-center bg-gradient-to-b from-slate-50 to-[#f4f6f9]">
        <div className="flex items-center gap-3 border border-slate-200 bg-white shadow-sm px-5 py-3.5">
          <Loader2 className="animate-spin text-[#1A56DB]" size={20} />
          <span className="text-[13px] font-bold text-[#0f1e36]">Checking one-time setup</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen grid grid-cols-1 lg:grid-cols-[1.08fr_0.92fr]">
      {/* ── Left intel panel ── */}
      <section className="relative hidden lg:flex flex-col justify-center overflow-hidden bg-[#0b1629] px-14 py-16">
        {/* Grid texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px)",
            backgroundSize: "42px 42px",
            maskImage: "linear-gradient(90deg, rgba(0,0,0,.7), transparent 72%)",
          }}
        />
        {/* Colour glows */}
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-[#F5A623]/14 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full bg-[#1A56DB]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-[600px]">
          {/* Logo + brand */}
          <div className="flex items-center gap-3 mb-10">
            <div className="relative w-12 h-12 flex-shrink-0">
              <Image
                src="/images/ab.png"
                alt="Asset Busters Logo"
                width={48}
                height={48}
                className="object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                  const fb = e.currentTarget.nextSibling as HTMLElement;
                  if (fb) fb.style.display = "flex";
                }}
              />
              <span
                className="absolute inset-0 hidden items-center justify-center bg-gradient-to-br from-[#D42B2B] to-[#1A56DB] text-white text-sm font-black"
                aria-hidden="true"
              >
                AB
              </span>
            </div>
            <div>
              <p className="text-white font-black text-lg leading-tight tracking-tight">Asset Busters</p>
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.8px] mt-0.5">Admin Setup</p>
            </div>
          </div>

          {/* Rest of the component remains the same... */}
          <div className="inline-flex items-center gap-2 bg-white/[0.07] border border-white/[0.14] text-[#fde68a] text-[10px] font-bold uppercase tracking-[1.1px] px-3 py-1.5 mb-7">
            <KeyRound size={12} />
            One-time secure bootstrap
          </div>

          <h1 className="text-[clamp(36px,4vw,58px)] font-black text-white leading-[1.05] tracking-tight mb-5">
            Create Super<br />Admin
          </h1>

          <p className="text-white/55 text-[14px] leading-[1.8] max-w-md mb-8">
            This setup path is available only while there are no active admins. After the first account is
            created, the workspace locks back to normal admin sign-in.
          </p>

          {/* System card */}
          <div className="border border-white/[0.1] overflow-hidden">
            {[
              { label: "Bootstrap gate", value: "Protected by setup secret" },
              { label: "First account", value: "Super admin privileges" },
              { label: "After setup", value: "Login becomes the only entry" },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between gap-4 px-4 py-3 bg-[#0f1e36]/60 border-b border-white/[0.07] last:border-b-0"
              >
                <span className="text-white/45 text-[11px] font-bold uppercase tracking-[0.7px]">{row.label}</span>
                <strong className="text-white text-[13px] font-bold text-right">{row.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Right form panel ── */}
      <section className="flex items-center justify-center bg-gradient-to-b from-slate-50 to-[#f4f6f9] px-6 py-10 lg:px-10">
        <form
          onSubmit={submit}
          className="w-full max-w-[440px] bg-white border border-slate-200 shadow-[0_18px_45px_rgba(15,30,54,0.08)] p-8"
        >
          {/* Card header */}
          <div className="flex items-center justify-between gap-4 mb-5">
            <div className="w-12 h-12 flex items-center justify-center bg-[#fffbeb] border border-[#fde68a] text-[#92400e]">
              <ShieldCheck size={22} />
            </div>
            <span className="inline-flex items-center gap-1.5 h-7 border border-[#fde68a] bg-[#fffbeb] text-[#92400e] px-3 text-[10px] font-black uppercase tracking-[0.6px]">
              Bootstrap
            </span>
          </div>

          <p className="text-[10px] font-bold text-[#D42B2B] uppercase tracking-[1.1px] mb-1">
            First admin setup
          </p>
          <h2 className="text-[27px] font-black text-[#0f1e36] tracking-tight leading-tight mb-1.5">
            Create Super Admin
          </h2>
          <p className="text-[13px] text-slate-500 leading-relaxed mb-7">
            Enter the private setup secret and create the first admin account.
          </p>

          {error && (
            <div className="border border-slate-200 border-l-[3px] border-l-[#D42B2B] bg-red-50 text-[#b42318] px-4 py-3 mb-5 text-[13px] font-bold">
              {error}
            </div>
          )}

          {/* Setup secret */}
          <label className="flex flex-col gap-1.5 mb-4">
            <span className="text-[11px] font-black text-[#0f1e36] uppercase tracking-[0.5px]">Setup secret</span>
            <input
              type="password"
              value={form.setupSecret}
              onChange={(e) => setForm((v) => ({ ...v, setupSecret: e.target.value }))}
              placeholder="ADMIN_BOOTSTRAP_SECRET"
              autoComplete="off"
              required
              className="w-full h-11 border-[1.5px] border-slate-200 bg-white text-[#0f1e36] text-[13px] font-medium px-3 outline-none focus:border-[#1A56DB] focus:ring-[3px] focus:ring-[#1A56DB]/10 transition-all duration-150"
            />
          </label>

          {/* Name row */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-black text-[#0f1e36] uppercase tracking-[0.5px]">First name</span>
              <input
                value={form.firstName}
                onChange={(e) => setForm((v) => ({ ...v, firstName: e.target.value }))}
                autoComplete="given-name"
                required
                className="w-full h-11 border-[1.5px] border-slate-200 bg-white text-[#0f1e36] text-[13px] font-medium px-3 outline-none focus:border-[#1A56DB] focus:ring-[3px] focus:ring-[#1A56DB]/10 transition-all duration-150"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-black text-[#0f1e36] uppercase tracking-[0.5px]">Last name</span>
              <input
                value={form.lastName}
                onChange={(e) => setForm((v) => ({ ...v, lastName: e.target.value }))}
                autoComplete="family-name"
                required
                className="w-full h-11 border-[1.5px] border-slate-200 bg-white text-[#0f1e36] text-[13px] font-medium px-3 outline-none focus:border-[#1A56DB] focus:ring-[3px] focus:ring-[#1A56DB]/10 transition-all duration-150"
              />
            </label>
          </div>

          {/* Email */}
          <label className="flex flex-col gap-1.5 mb-4">
            <span className="text-[11px] font-black text-[#0f1e36] uppercase tracking-[0.5px]">Email address</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((v) => ({ ...v, email: e.target.value }))}
              placeholder="superadmin@assetbusters.com"
              autoComplete="email"
              required
              className="w-full h-11 border-[1.5px] border-slate-200 bg-white text-[#0f1e36] text-[13px] font-medium px-3 outline-none focus:border-[#1A56DB] focus:ring-[3px] focus:ring-[#1A56DB]/10 transition-all duration-150"
            />
          </label>

          {/* Password */}
          <label className="flex flex-col gap-1.5 mb-6">
            <span className="text-[11px] font-black text-[#0f1e36] uppercase tracking-[0.5px]">Password</span>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm((v) => ({ ...v, password: e.target.value }))}
                placeholder="12+ chars with number and symbol"
                autoComplete="new-password"
                required
                className="w-full h-11 border-[1.5px] border-slate-200 bg-white text-[#0f1e36] text-[13px] font-medium px-3 pr-11 outline-none focus:border-[#1A56DB] focus:ring-[3px] focus:ring-[#1A56DB]/10 transition-all duration-150"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute top-1/2 -translate-y-1/2 right-2.5 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors duration-150"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 flex items-center justify-center gap-2 bg-[#1A56DB] hover:bg-[#1444B8] text-white text-[13px] font-black tracking-[0.1px] transition-all duration-150 shadow-sm hover:shadow-[0_8px_22px_rgba(26,86,219,0.28)] disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99]"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <UserPlus size={16} />}
            {loading ? "Creating admin" : "Create super admin"}
          </button>
        </form>
      </section>
    </main>
  );
}