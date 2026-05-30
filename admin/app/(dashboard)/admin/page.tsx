"use client";

import { useEffect, useState } from "react";
import { Building2, Handshake, ShieldAlert, Users } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  getDealStats,
  getListingStats,
  getRecentActivity,
  getUserStats,
} from "@/services/admin/admin.service";
import type { ActivityItem, StatsRecord } from "@/types/admin";
import { formatNumber, formatShortDate, titleCase } from "@/lib/utils";
import { statValue } from "@/lib/response";

function Shimmer({ className = "" }: { className?: string }) {
  return (
    <span
      className={`block rounded bg-slate-100 relative overflow-hidden ${className}`}
      style={{ isolation: "isolate" }}
    >
      <span
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.7) 50%, transparent 100%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.6s ease-in-out infinite",
        }}
      />
    </span>
  );
}

function StatCardSkeleton({ delay = "0s" }: { delay?: string }) {
  return (
    <div
      className="bg-white border border-slate-200 p-5 flex flex-col gap-3"
      style={{ animation: `fadeUp 0.3s ease ${delay} both` }}
    >
      <Shimmer className="h-8 w-8 rounded-full" />
      <Shimmer className="h-3 w-24" />
      <Shimmer className="h-7 w-16" />
      <Shimmer className="h-3 w-32" />
    </div>
  );
}

function QueueSkeleton() {
  return (
    <div className="divide-y divide-slate-100">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between px-6 py-4"
          style={{ animation: `fadeUp 0.3s ease ${i * 0.07}s both` }}
        >
          <Shimmer className="h-3 w-36" />
          <Shimmer className="h-4 w-8" />
        </div>
      ))}
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="divide-y divide-slate-100">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-start gap-3 px-6 py-4"
          style={{ animation: `fadeUp 0.3s ease ${i * 0.08}s both` }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-slate-200 mt-[7px] flex-shrink-0" />
          <div className="flex-1 flex flex-col gap-1.5">
            <Shimmer className="h-3 w-48" />
            <Shimmer className="h-2.5 w-32" />
          </div>
          <Shimmer className="h-2.5 w-12 flex-shrink-0" />
        </div>
      ))}
    </div>
  );
}

export default function AdminOverviewPage() {
  const [userStats, setUserStats] = useState<StatsRecord>({});
  const [listingStats, setListingStats] = useState<StatsRecord>({});
  const [dealStats, setDealStats] = useState<StatsRecord>({});
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      setLoading(true);
      setError("");

      const [users, listings, deals, recent] = await Promise.allSettled([
        getUserStats(),
        getListingStats(),
        getDealStats(),
        getRecentActivity(),
      ]);

      if (controller.signal.aborted) return;

      if (users.status === "fulfilled") setUserStats(users.value);
      if (listings.status === "fulfilled") setListingStats(listings.value);
      if (deals.status === "fulfilled") setDealStats(deals.value);
      if (recent.status === "fulfilled") setActivity(recent.value);

      const coreFailed = [users, listings, deals].some((r) => r.status === "rejected");
      if (coreFailed)
        setError("Some admin metrics could not be loaded. The backend may be slow or unavailable.");

      setLoading(false);
    };

    void load();
    return () => controller.abort();
  }, []);

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
      `}</style>

      <PageHeader
        eyebrow="Marketplace command"
        title="Admin Overview"
        description="A focused view of users, listings, deal flow, moderation queues, and recent platform activity."
      />

      {error && (
        <div className="border border-amber-200 border-l-[3px] border-l-amber-400 bg-amber-50 text-amber-800 px-4 py-3 text-[13px] font-bold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {loading ? (
          <>
            <StatCardSkeleton delay="0s" />
            <StatCardSkeleton delay="0.07s" />
            <StatCardSkeleton delay="0.14s" />
            <StatCardSkeleton delay="0.21s" />
          </>
        ) : (
          <>
            {[
              {
                icon: Users,
                label: "Total users",
                value: formatNumber(statValue(userStats, ["total", "totalUsers", "users"])),
                detail: `${formatNumber(statValue(userStats, ["active", "activeUsers"]))} active accounts`,
                trend: "Live",
                trendDirection: "up" as const,
                delay: "0s",
              },
              {
                icon: Building2,
                label: "Listings",
                value: formatNumber(statValue(listingStats, ["total", "totalListings", "listings"])),
                detail: `${formatNumber(statValue(listingStats, ["pending", "pendingReview", "PENDING_REVIEW"]))} awaiting review`,
                trend: "Review queue",
                trendDirection: "neutral" as const,
                delay: "0.07s",
              },
              {
                icon: Handshake,
                label: "Deals",
                value: formatNumber(statValue(dealStats, ["total", "totalDeals", "deals"])),
                detail: `${formatNumber(statValue(dealStats, ["closed", "CLOSED"]))} closed deals`,
                trend: "Pipeline",
                trendDirection: "up" as const,
                delay: "0.14s",
              },
              {
                icon: ShieldAlert,
                label: "Trust actions",
                value: formatNumber(statValue(userStats, ["suspended", "SUSPENDED"])),
                detail: "Suspended or restricted users",
                trend: "Risk",
                trendDirection: "down" as const,
                delay: "0.21s",
              },
            ].map(({ delay, ...props }) => (
              <div
                key={props.label}
                style={{ animation: `fadeUp 0.4s ease ${delay} both` }}
              >
                <StatCard {...props} />
              </div>
            ))}
          </>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <article className="bg-white border border-slate-200">
          <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-100">
            <div>
              <p className="text-[10px] font-bold text-[#1A56DB] uppercase tracking-[0.9px] mb-1">
                Operational queues
              </p>
              <h2 className="text-[18px] font-black text-[#0f1e36] tracking-tight">Admin attention</h2>
            </div>
          </div>

          {loading ? (
            <QueueSkeleton />
          ) : (
            <div className="divide-y divide-slate-100">
              {[
                { label: "Pending users",         value: statValue(userStats,    ["pending",       "PENDING"])                      },
                { label: "Listings in review",     value: statValue(listingStats, ["pendingReview", "pending", "PENDING_REVIEW"])    },
                { label: "Rejected listings",      value: statValue(listingStats, ["rejected",      "REJECTED"])                    },
                { label: "Deals in due diligence", value: statValue(dealStats,    ["dueDiligence",  "DUE_DILIGENCE"])               },
              ].map(({ label, value }, i) => (
                <div
                  key={label}
                  className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/70 transition-colors duration-100"
                  style={{ animation: `fadeUp 0.35s ease ${i * 0.07}s both` }}
                >
                  <span className="text-[13px] font-medium text-slate-600">{label}</span>
                  <strong className="text-[15px] font-black text-[#0f1e36]">{formatNumber(value)}</strong>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="bg-white border border-slate-200">
          <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-100">
            <div>
              <p className="text-[10px] font-bold text-[#1A56DB] uppercase tracking-[0.9px] mb-1">
                Recent activity
              </p>
              <h2 className="text-[18px] font-black text-[#0f1e36] tracking-tight">Marketplace events</h2>
            </div>
            <StatusBadge value="ACTIVE" />
          </div>

          <div className="divide-y divide-slate-100">
            {loading ? (
              <ActivitySkeleton />
            ) : activity.length ? (
              activity.slice(0, 7).map((item, i) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 px-6 py-4 hover:bg-slate-50/70 transition-colors duration-100"
                  style={{ animation: `fadeUp 0.35s ease ${i * 0.06}s both` }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1A56DB] mt-[7px] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <strong className="block text-[12.5px] font-bold text-[#0f1e36] leading-snug">
                      {item.title ?? titleCase(item.type)}
                    </strong>
                    <p className="text-[11.5px] text-slate-500 mt-0.5 leading-snug">
                      {item.description ?? item.actor ?? "Activity recorded"}
                    </p>
                  </div>
                  <time className="text-[11px] font-bold text-slate-400 flex-shrink-0 whitespace-nowrap">
                    {formatShortDate(item.createdAt)}
                  </time>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-center px-6">
                <strong className="text-[13px] font-bold text-slate-500">No recent activity yet</strong>
                <span className="text-[12px] text-slate-400 max-w-xs leading-relaxed">
                  When the analytics endpoint returns events, they will appear here.
                </span>
              </div>
            )}
          </div>
        </article>
      </div>
    </>
  );
}