"use client";

import type { ElementType } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Building2,
  ChevronRight,
  HandCoins,
  Handshake,
  LayoutDashboard,
  LineChart,
  PanelTop,
  Rocket,
  ShieldCheck,
  Users,
} from "lucide-react";
import { ADMIN_NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const iconMap: Record<string, ElementType> = {
  LayoutDashboard,
  Users,
  Building2,
  HandCoins,
  Handshake,
  LineChart,
  PanelTop,
  Rocket,
  ShieldCheck,
};

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 h-screen flex flex-col overflow-y-auto overflow-x-hidden bg-[#0b1629] border-r border-white/[0.07]">
      <Link
        href="/admin"
        className="flex items-center gap-3 px-5 py-5 border-b border-white/[0.08] hover:bg-white/[0.03] transition-colors duration-150"
        aria-label="Asset Busters Admin"
      >
        <div className="relative w-10 h-10 flex-shrink-0 overflow-hidden">
          <Image
            src="/images/ab.png"
            alt="Asset Busters Logo"
            width={40}
            height={40}
            className="object-contain"
            priority
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
              const fallback = e.currentTarget.nextSibling as HTMLElement;
              if (fallback) fallback.style.display = "flex";
            }}
          />
          <span
            className="absolute inset-0 hidden items-center justify-center bg-gradient-to-br from-[#D42B2B] to-[#1A56DB] text-white text-[13px] font-black"
            aria-hidden="true"
          >
            AB
          </span>
        </div>

        <span className="flex flex-col min-w-0">
          <strong className="text-white text-[15px] font-black leading-tight tracking-[-0.2px] truncate">
            Asset Busters
          </strong>
          <small className="text-white/40 text-[10px] font-bold uppercase tracking-[0.8px] mt-0.5">
            Operations Console
          </small>
        </span>
      </Link>

      <p className="px-5 pt-5 pb-2 text-[10px] font-bold text-white/30 uppercase tracking-[0.9px]">
        Workspace
      </p>

      <nav className="flex flex-col gap-1 px-3 flex-1" aria-label="Admin navigation">
        {ADMIN_NAV_ITEMS.map((item) => {
          const Icon = iconMap[item.icon] ?? LayoutDashboard;
          const active =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-2.5 px-3 py-2.5 text-[12.5px] font-bold border border-transparent transition-all duration-150 group",
                active
                  ? "bg-white/[0.08] text-white border-white/[0.1] shadow-[inset_3px_0_0_#F5A623]"
                  : "text-white/55 hover:text-white hover:bg-white/[0.06]"
              )}
            >
              <Icon size={16} className="flex-shrink-0" />
              <span className="flex-1 truncate">{item.label}</span>
              <ChevronRight
                size={13}
                className={cn(
                  "transition-all duration-150",
                  active
                    ? "opacity-60 translate-x-0"
                    : "opacity-0 -translate-x-1 group-hover:opacity-60 group-hover:translate-x-0"
                )}
              />
            </Link>
          );
        })}
      </nav>

      <div className="mx-3 mt-4 flex items-center justify-between px-3 py-2.5 border border-emerald-500/20 bg-emerald-500/[0.07]">
        <span className="text-[11px] font-bold text-white/45">API status</span>
        <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-300 uppercase tracking-[0.7px]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Protected
        </span>
      </div>

      <div className="mx-3 mt-2 mb-4 flex gap-2.5 items-start p-3.5 border border-white/[0.08] bg-white/[0.04]">
        <ShieldCheck size={16} className="text-white/40 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="block text-[12px] font-bold text-white/80">
            Protected workspace
          </strong>
          <span className="block text-[11px] text-white/35 leading-snug mt-1">
            Every admin action is audited server-side.
          </span>
        </div>
      </div>
    </aside>
  );
}