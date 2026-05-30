import { cn, titleCase } from "@/lib/utils";

const toneMap: Record<string, string> = {
  ACTIVE:
    "bg-emerald-50 text-emerald-700 border border-emerald-200",
  VERIFIED:
    "bg-emerald-50 text-emerald-700 border border-emerald-200",
  CLOSED:
    "bg-emerald-50 text-emerald-700 border border-emerald-200",
  SUPER_ADMIN:
    "bg-[#eef3fd] text-[#1444B8] border border-[#bfdbfe]",
  ADMIN:
    "bg-[#eef3fd] text-[#1444B8] border border-[#bfdbfe]",
  PENDING:
    "bg-amber-50 text-amber-700 border border-amber-200",
  PENDING_REVIEW:
    "bg-amber-50 text-amber-700 border border-amber-200",
  INQUIRY:
    "bg-amber-50 text-amber-700 border border-amber-200",
  NDA_SENT:
    "bg-[#eef3fd] text-[#1444B8] border border-[#bfdbfe]",
  NDA_SIGNED:
    "bg-[#eef3fd] text-[#1444B8] border border-[#bfdbfe]",
  NEGOTIATION:
    "bg-violet-50 text-violet-700 border border-violet-200",
  DUE_DILIGENCE:
    "bg-violet-50 text-violet-700 border border-violet-200",
  DRAFT:
    "bg-slate-100 text-slate-500 border border-slate-200",
  REJECTED:
    "bg-red-50 text-[#b91c1c] border border-red-200",
  SUSPENDED:
    "bg-red-50 text-[#b91c1c] border border-red-200",
  DEACTIVATED:
    "bg-slate-100 text-slate-500 border border-slate-200",
  WITHDRAWN:
    "bg-red-50 text-[#b91c1c] border border-red-200",
};

export function StatusBadge({
  value,
  className,
}: {
  value?: string | null;
  className?: string;
}) {
  const key = value ?? "UNKNOWN";
  const base =
    toneMap[key] ?? "bg-slate-100 text-slate-500 border border-slate-200";

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-[10px] font-bold tracking-[0.5px] uppercase",
        base,
        className
      )}
    >
      {titleCase(key)}
    </span>
  );
}