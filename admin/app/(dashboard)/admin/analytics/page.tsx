"use client";

import { useEffect, useMemo, useState } from "react";
import { Building2, Globe2, Handshake, Users } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  getDealFunnel,
  getListingsByCountry,
  getListingsByIndustry,
  getUserGrowth,
} from "@/services/admin/admin.service";
import { formatNumber, titleCase } from "@/lib/utils";

interface ChartDatum {
  label: string;
  value: number;
}

function normalizeRows(
  rows: Array<Record<string, unknown>>,
  labelKeys: string[],
  valueKeys: string[]
): ChartDatum[] {
  return rows.map((row) => {
    const label = labelKeys.map((k) => row[k]).find(Boolean) ?? "Unknown";
    const value = valueKeys.map((k) => row[k]).find((v) => v !== undefined) ?? 0;
    return { label: titleCase(String(label)), value: Number(value) || 0 };
  });
}

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

function BarListSkeleton() {
  return (
    <div className="px-6 py-4 flex flex-col gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3"
          style={{ animation: `fadeUp 0.3s ease ${i * 0.06}s both` }}
        >
          <Shimmer className="h-3 w-28 flex-shrink-0" />
          <Shimmer className="h-2 flex-1" style={{ width: `${40 + Math.random() * 50}%` }} />
          <Shimmer className="h-3 w-8 flex-shrink-0" />
        </div>
      ))}
    </div>
  );
}

function BarList({
  title,
  data,
  loading,
  empty,
  accentColor = "#1A56DB",
}: {
  title: string;
  data: ChartDatum[];
  loading: boolean;
  empty: string;
  accentColor?: string;
}) {
  const max = useMemo(() => Math.max(1, ...data.map((d) => d.value)), [data]);

  return (
    <article className="bg-white border border-slate-200">
      <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-100">
        <div>
          <p className="text-[10px] font-bold text-[#1A56DB] uppercase tracking-[0.9px] mb-1">
            Distribution
          </p>
          <h2 className="text-[18px] font-black text-[#0f1e36] tracking-tight">{title}</h2>
        </div>
        <StatusBadge value="ACTIVE" />
      </div>

      {loading ? (
        <BarListSkeleton />
      ) : (
        <div className="px-6 py-4 flex flex-col gap-3">
          {data.length ? (
            data.slice(0, 10).map((item, i) => (
              <div
                key={item.label}
                className="flex items-center gap-3"
                style={{ animation: `fadeUp 0.35s ease ${i * 0.05}s both` }}
              >
                <span className="text-[12px] font-medium text-slate-600 w-36 flex-shrink-0 truncate">
                  {item.label}
                </span>
                <div className="flex-1 h-2 bg-slate-100 overflow-hidden">
                  <div
                    className="h-full"
                    style={{
                      width: `${Math.max(4, (item.value / max) * 100)}%`,
                      background: accentColor,
                      animation: `barGrow 0.6s ease ${i * 0.05}s both`,
                      transformOrigin: "left",
                    }}
                  />
                </div>
                <strong className="text-[12px] font-black text-[#0f1e36] w-10 text-right flex-shrink-0">
                  {formatNumber(item.value)}
                </strong>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
              <strong className="text-[13px] font-bold text-slate-500">No data yet</strong>
              <span className="text-[12px] text-slate-400 max-w-xs leading-relaxed">{empty}</span>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

export default function AdminAnalyticsPage() {
  const [industry, setIndustry] = useState<ChartDatum[]>([]);
  const [country, setCountry] = useState<ChartDatum[]>([]);
  const [funnel, setFunnel] = useState<ChartDatum[]>([]);
  const [growth, setGrowth] = useState<ChartDatum[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      setLoading(true);
      setError("");

      const [industryRows, countryRows, funnelRows, growthRows] = await Promise.allSettled([
        getListingsByIndustry(),
        getListingsByCountry(),
        getDealFunnel(),
        getUserGrowth(),
      ]);

      if (controller.signal.aborted) return;

      if (industryRows.status === "fulfilled")
        setIndustry(normalizeRows(industryRows.value as Array<Record<string, unknown>>, ["industry", "label"], ["count", "value"]));
      if (countryRows.status === "fulfilled")
        setCountry(normalizeRows(countryRows.value as Array<Record<string, unknown>>, ["country", "label"], ["count", "value"]));
      if (funnelRows.status === "fulfilled")
        setFunnel(normalizeRows(funnelRows.value as Array<Record<string, unknown>>, ["status", "label"], ["count", "value"]));
      if (growthRows.status === "fulfilled")
        setGrowth(normalizeRows(growthRows.value as Array<Record<string, unknown>>, ["date", "label"], ["count", "value"]));

      if ([industryRows, countryRows, funnelRows, growthRows].some((r) => r.status === "rejected"))
        setError("Some analytics endpoints could not be loaded.");

      setLoading(false);
    };

    void load();
    return () => controller.abort();
  }, []);

  const totalIndustries = industry.reduce((s, i) => s + i.value, 0);
  const totalCountries = country.length;
  const totalDeals = funnel.reduce((s, i) => s + i.value, 0);
  const newestGrowth = growth.at(-1)?.value ?? 0;

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
        @keyframes barGrow {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
      `}</style>

      <PageHeader
        eyebrow="Executive analytics"
        title="Analytics"
        description="Read marketplace supply concentration, regional demand, user growth, and deal-stage performance."
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
              { icon: Building2, label: "Industry listings",   value: formatNumber(totalIndustries), detail: "Listings grouped by sector",       delay: "0s"    },
              { icon: Globe2,    label: "Countries",           value: formatNumber(totalCountries),  detail: "Countries with active supply",     delay: "0.07s" },
              { icon: Handshake, label: "Deal funnel",         value: formatNumber(totalDeals),      detail: "Tracked deal records",             delay: "0.14s" },
              { icon: Users,     label: "Latest growth point", value: formatNumber(newestGrowth),    detail: "Newest user-growth bucket",        delay: "0.21s" },
            ].map(({ delay, ...props }) => (
              <div key={props.label} style={{ animation: `fadeUp 0.4s ease ${delay} both` }}>
                <StatCard {...props} />
              </div>
            ))}
          </>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <BarList title="Listings by industry" data={industry} loading={loading} accentColor="#1A56DB" empty="Connect /admin/analytics/listings-by-industry to populate." />
        <BarList title="Listings by country"  data={country}  loading={loading} accentColor="#10B981" empty="Connect /admin/analytics/listings-by-country to populate."  />
        <BarList title="Deal funnel"          data={funnel}   loading={loading} accentColor="#7C3AED" empty="Connect /admin/analytics/deal-funnel to populate."           />
        <BarList title="User growth"          data={growth}   loading={loading} accentColor="#F5A623" empty="Connect /admin/analytics/user-growth to populate."           />
      </div>
    </>
  );
}