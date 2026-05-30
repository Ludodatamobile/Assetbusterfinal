"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CalendarClock, LogOut, RefreshCcw, Shield } from "lucide-react";
import { logoutAdmin } from "@/services/admin/auth.service";
import type { AdminAccount } from "@/types/admin";
import { initials, titleCase } from "@/lib/utils";

interface AdminTopbarProps {
  admin: AdminAccount | null;
  onRefresh?: () => void;
}

export function AdminTopbar({ admin, onRefresh }: AdminTopbarProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logoutAdmin();
      router.replace("/admin/login");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 min-h-[62px] px-6 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      {/* Left: title */}
      <div className="flex flex-col">
        <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#1A56DB] uppercase tracking-[0.9px]">
          <Shield size={12} />
          Admin Console
        </span>
        <strong className="text-[12.5px] font-bold text-[#0f1e36] mt-0.5 hidden sm:block">
          Monitor marketplace risk, trust, content, and deal flow.
        </strong>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        {/* Status pill */}
        <div className="hidden md:flex items-center gap-2 h-9 px-3 border border-slate-200 bg-white text-[12px] font-bold text-slate-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live workspace
          <CalendarClock size={13} className="ml-1 text-slate-400" />
        </div>

        <button
          type="button"
          onClick={onRefresh}
          aria-label="Refresh data"
          title="Refresh data"
          className="w-9 h-9 flex items-center justify-center border border-slate-200 bg-white text-slate-500 hover:text-[#0f1e36] hover:bg-slate-50 transition-colors duration-150"
        >
          <RefreshCcw size={15} />
        </button>

        <button
          type="button"
          aria-label="Notifications"
          title="Notifications"
          className="w-9 h-9 flex items-center justify-center border border-slate-200 bg-white text-slate-500 hover:text-[#0f1e36] hover:bg-slate-50 transition-colors duration-150"
        >
          <Bell size={15} />
        </button>

        {/* Profile pill */}
        <div className="flex items-center gap-2.5 h-9 pl-1 pr-3 border border-slate-200 bg-white">
          <span className="w-7 h-7 flex items-center justify-center bg-gradient-to-br from-[#1A56DB] to-[#F5A623] text-white text-[10px] font-black flex-shrink-0">
            {initials(admin?.firstName, admin?.lastName, admin?.email)}
          </span>
          <span className="hidden sm:flex flex-col leading-none">
            <strong className="text-[12px] font-bold text-[#0f1e36]">
              {admin ? `${admin.firstName} ${admin.lastName}` : "Admin"}
            </strong>
            <small className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.5px] mt-0.5">
              {titleCase(admin?.role ?? "ADMIN")}
            </small>
          </span>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          aria-label="Logout"
          title="Logout"
          className="w-9 h-9 flex items-center justify-center border border-slate-200 bg-white text-[#D42B2B] hover:bg-red-50 hover:border-red-200 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LogOut
            size={15}
            className={loggingOut ? "animate-spin" : undefined}
          />
        </button>
      </div>
    </header>
  );
}