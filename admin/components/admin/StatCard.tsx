import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  detail?: string;
  trend?: string;
  trendDirection?: "up" | "down" | "neutral";
  icon: LucideIcon;
}

export function StatCard({
  label,
  value,
  detail,
  trend,
  trendDirection = "neutral",
  icon: Icon,
}: StatCardProps) {
  const TrendIcon =
    trendDirection === "down" ? ArrowDownRight : ArrowUpRight;

  return (
    <article className="bg-white border border-slate-200 p-5 flex flex-col gap-3 hover:border-slate-300 hover:shadow-sm transition-all duration-150">
      <div className="flex items-start justify-between gap-3">
        <span className="w-10 h-10 flex items-center justify-center bg-[#eef3fd] text-[#1A56DB] border border-[#dce8fb] flex-shrink-0">
          <Icon size={18} />
        </span>
        {trend && (
          <span
            className={cn(
              "inline-flex items-center gap-1 text-[10px] font-bold tracking-[0.5px] uppercase px-2 py-1",
              trendDirection === "up" &&
                "bg-emerald-50 text-emerald-700 border border-emerald-200",
              trendDirection === "down" &&
                "bg-red-50 text-[#b91c1c] border border-red-200",
              trendDirection === "neutral" &&
                "bg-slate-100 text-slate-500 border border-slate-200"
            )}
          >
            <TrendIcon size={11} />
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.7px] mb-1.5">
          {label}
        </p>
        <h3 className="text-2xl font-black text-[#0f1e36] tracking-tight leading-none">
          {value}
        </h3>
        {detail && (
          <p className="text-[11.5px] text-slate-500 font-medium mt-1.5 leading-snug">
            {detail}
          </p>
        )}
      </div>
    </article>
  );
}