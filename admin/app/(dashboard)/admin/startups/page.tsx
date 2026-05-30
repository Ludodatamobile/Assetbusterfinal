"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BadgeDollarSign,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Rocket,
  Search,
  ShieldOff,
  Star,
  XCircle,
} from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  approveListing,
  featureListing,
  listStartups,
  rejectListing,
  setPremiumListing,
  suspendListing,
  unfeatureListing,
} from "@/services/admin/listings.service";
import type { BusinessListing } from "@/types/admin";
import { formatCurrency, formatNumber, formatShortDate, titleCase } from "@/lib/utils";
import { metaFromEnvelope, rowsFromEnvelope } from "@/lib/response";

const STARTUP_CATEGORIES = [
  "Technology",
  "Fintech",
  "Healthtech",
  "Edtech",
  "Climate",
  "Energy",
  "Agritech",
  "Logistics",
  "E-commerce",
  "SaaS",
  "Marketplace",
  "AI / Automation",
  "Real Estate",
  "Consumer Products",
  "Media",
  "Other",
];

const STARTUP_STAGES = [
  "Idea",
  "Prototype",
  "MVP",
  "Pre-Revenue",
  "Revenue",
  "Growth",
  "Scaling",
];

type StartupListing = BusinessListing & {
  startupType?: string | null;
  startupCategory?: string | null;
  startupStage?: string | null;
  fundingNeeded?: number | string | null;
  askAmount?: number | string | null;
  currency?: string | null;
  businessName?: string | null;
  country?: string | null;
  city?: string | null;
  slug?: string | null;
  status?: string | null;
  isFeatured?: boolean | null;
  isPremium?: boolean | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  user?: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
  } | null;
  _count?: {
    deals?: number;
    documents?: number;
    savedBy?: number;
  } | null;
};

type StartupFilters = {
  page: number;
  limit: number;
  search: string;
  status: string;
  country: string;
  startupCategory: string;
  startupStage: string;
};

const DEFAULT_FILTERS: StartupFilters = {
  page: 1,
  limit: 12,
  search: "",
  status: "",
  country: "",
  startupCategory: "",
  startupStage: "",
};

function ownerName(item: StartupListing) {
  return (
    [item.user?.firstName, item.user?.lastName].filter(Boolean).join(" ") ||
    item.user?.email ||
    "Creator"
  );
}

function MiniStat({
  label,
  value,
  detail,
}: {
  label: string;
  value: string | number;
  detail: string;
}) {
  return (
    <article className="bg-white border border-slate-200 p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.8px] text-slate-400">
        {label}
      </p>
      <strong className="block text-2xl font-black text-[#0f1e36] mt-1">
        {value}
      </strong>
      <span className="block text-[11.5px] font-medium text-slate-500 mt-1">
        {detail}
      </span>
    </article>
  );
}

export default function AdminStartupsPage() {
  const [filters, setFilters] = useState<StartupFilters>(DEFAULT_FILTERS);
  const [draftFilters, setDraftFilters] = useState<StartupFilters>(DEFAULT_FILTERS);
  const [rows, setRows] = useState<StartupListing[]>([]);
  const [meta, setMeta] = useState<Record<string, unknown> | undefined>();
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const envelope = await listStartups(filters);
      setRows(rowsFromEnvelope(envelope) as StartupListing[]);
      setMeta(metaFromEnvelope(envelope) as Record<string, unknown> | undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load startups.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void load();
  }, [load]);

  const stats = useMemo(() => {
    const total = Number(meta?.total ?? rows.length);
    const pending = rows.filter((item) => item.status === "PENDING_REVIEW").length;
    const active = rows.filter((item) => item.status === "ACTIVE").length;
    const featured = rows.filter((item) => item.isFeatured).length;

    return { total, pending, active, featured };
  }, [rows, meta]);

  const page = Number(meta?.page ?? filters.page);
  const totalPages = Number(meta?.totalPages ?? 1);

  const runAction = async (key: string, action: () => Promise<unknown>) => {
    setBusyAction(key);
    setError("");

    try {
      await action();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed.");
    } finally {
      setBusyAction("");
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Startup moderation"
        title="Startup Controls"
        description="Review startup ideas, approve public visibility, reject weak submissions, suspend live posts, and manage featured or premium placement."
      />

      {error && (
        <div className="border border-red-200 border-l-[3px] border-l-red-500 bg-red-50 text-red-700 px-4 py-3 text-[13px] font-bold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <MiniStat label="Total startups" value={formatNumber(stats.total)} detail="Matching current filters" />
        <MiniStat label="In review" value={formatNumber(stats.pending)} detail="Awaiting admin action" />
        <MiniStat label="Active" value={formatNumber(stats.active)} detail="Visible on marketplace" />
        <MiniStat label="Featured" value={formatNumber(stats.featured)} detail="Promoted startup posts" />
      </div>

      <form
        className="bg-white border border-slate-200 p-4 grid grid-cols-1 md:grid-cols-6 gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          setFilters({ ...draftFilters, page: 1 });
        }}
      >
        <label className="md:col-span-2">
          <span className="block text-[10px] font-black uppercase tracking-[0.7px] text-slate-400 mb-1.5">
            Search
          </span>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={draftFilters.search}
              onChange={(e) => setDraftFilters((v) => ({ ...v, search: e.target.value }))}
              className="w-full border border-slate-200 pl-9 pr-3 py-2.5 text-[13px] font-semibold outline-none focus:border-[#1A56DB]"
              placeholder="Title, problem, solution..."
            />
          </div>
        </label>

        <label>
          <span className="block text-[10px] font-black uppercase tracking-[0.7px] text-slate-400 mb-1.5">
            Status
          </span>
          <select
            value={draftFilters.status}
            onChange={(e) => setDraftFilters((v) => ({ ...v, status: e.target.value }))}
            className="w-full border border-slate-200 px-3 py-2.5 text-[13px] font-semibold outline-none focus:border-[#1A56DB]"
          >
            <option value="">All</option>
            <option value="DRAFT">Draft</option>
            <option value="PENDING_REVIEW">Pending Review</option>
            <option value="ACTIVE">Active</option>
            <option value="REJECTED">Rejected</option>
            <option value="CLOSED">Suspended</option>
          </select>
        </label>

        <label>
          <span className="block text-[10px] font-black uppercase tracking-[0.7px] text-slate-400 mb-1.5">
            Category
          </span>
          <select
            value={draftFilters.startupCategory}
            onChange={(e) => setDraftFilters((v) => ({ ...v, startupCategory: e.target.value }))}
            className="w-full border border-slate-200 px-3 py-2.5 text-[13px] font-semibold outline-none focus:border-[#1A56DB]"
          >
            <option value="">All</option>
            {STARTUP_CATEGORIES.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </label>

        <label>
          <span className="block text-[10px] font-black uppercase tracking-[0.7px] text-slate-400 mb-1.5">
            Stage
          </span>
          <select
            value={draftFilters.startupStage}
            onChange={(e) => setDraftFilters((v) => ({ ...v, startupStage: e.target.value }))}
            className="w-full border border-slate-200 px-3 py-2.5 text-[13px] font-semibold outline-none focus:border-[#1A56DB]"
          >
            <option value="">All</option>
            {STARTUP_STAGES.map((stage) => (
              <option key={stage} value={stage}>{stage}</option>
            ))}
          </select>
        </label>

        <label>
          <span className="block text-[10px] font-black uppercase tracking-[0.7px] text-slate-400 mb-1.5">
            Country
          </span>
          <input
            value={draftFilters.country}
            onChange={(e) => setDraftFilters((v) => ({ ...v, country: e.target.value }))}
            className="w-full border border-slate-200 px-3 py-2.5 text-[13px] font-semibold outline-none focus:border-[#1A56DB]"
            placeholder="Nigeria"
          />
        </label>

        <div className="md:col-span-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 border border-slate-200 bg-white px-4 py-2 text-[12px] font-black text-slate-600 hover:bg-slate-50"
            onClick={() => {
              setDraftFilters(DEFAULT_FILTERS);
              setFilters(DEFAULT_FILTERS);
            }}
          >
            Reset
          </button>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 bg-[#1A56DB] px-4 py-2 text-[12px] font-black text-white hover:bg-[#1444B8]"
          >
            Apply Filters
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 border border-slate-200 bg-white px-4 py-2 text-[12px] font-black text-slate-600 hover:bg-slate-50"
            onClick={() => void load()}
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </form>

      <section className="bg-white border border-slate-200">
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-slate-100">
          <div>
            <p className="text-[10px] font-black text-[#1A56DB] uppercase tracking-[0.8px]">
              Startup queue
            </p>
            <h2 className="text-[17px] font-black text-[#0f1e36] tracking-tight">
              Creator submissions
            </h2>
          </div>
          {loading && <Loader2 className="animate-spin text-[#1A56DB]" size={18} />}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {["Startup", "Category", "Stage", "Location", "Funding", "Creator", "Status", "Signals", "Updated", "Controls"].map((head) => (
                  <th key={head} className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-[0.6px] text-slate-400">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => {
                const status = String(item.status || "UNKNOWN");
                const actionBase = item.id;
                const featured = Boolean(item.isFeatured);
                const premium = Boolean(item.isPremium);

                return (
                  <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/70">
                    <td className="px-4 py-4 align-top">
                      <div className="flex items-start gap-3">
                        <span className="w-9 h-9 flex items-center justify-center bg-[#eef3fd] text-[#1A56DB] border border-[#dce8fb] flex-shrink-0">
                          <Rocket size={16} />
                        </span>
                        <div className="min-w-0">
                          <strong className="block text-[12.5px] font-black text-[#0f1e36] leading-snug">
                            {item.title}
                          </strong>
                          <span className="block text-[11px] text-slate-400 mt-0.5 truncate max-w-[240px]">
                            {item.slug}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-[12px] font-bold text-slate-600">
                      {item.startupCategory || item.industry || "Not set"}
                    </td>
                    <td className="px-4 py-4 text-[12px] font-bold text-slate-600">
                      {item.startupStage || "Not set"}
                    </td>
                    <td className="px-4 py-4 text-[12px] font-bold text-slate-600">
                      {[item.city, item.country].filter(Boolean).join(", ") || "Not set"}
                    </td>
                    <td className="px-4 py-4 text-[12px] font-black text-emerald-700">
                      {formatCurrency(item.fundingNeeded ?? item.askAmount, item.currency || "USD")}
                    </td>
                    <td className="px-4 py-4 text-[12px] font-bold text-slate-600">
                      {ownerName(item)}
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge value={status} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {featured && <span className="text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1">Featured</span>}
                        {premium && <span className="text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1">Premium</span>}
                        <span className="text-[10px] font-black bg-slate-100 text-slate-500 border border-slate-200 px-2 py-1">
                          {formatNumber(item._count?.deals ?? 0)} enquiries
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-[11px] font-bold text-slate-400">
                      {formatShortDate(item.updatedAt || item.createdAt)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {status !== "ACTIVE" && status !== "CLOSED" && (
                          <button
                            type="button"
                            disabled={Boolean(busyAction)}
                            onClick={() => void runAction(`${actionBase}:approve`, () => approveListing(item.id))}
                            className="inline-flex items-center gap-1.5 border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[11px] font-black text-emerald-700 disabled:opacity-50"
                          >
                            <CheckCircle2 size={13} />
                            Approve
                          </button>
                        )}

                        {status !== "REJECTED" && status !== "CLOSED" && (
                          <button
                            type="button"
                            disabled={Boolean(busyAction)}
                            onClick={() => {
                              const reason = window.prompt("Reason for rejection (optional)");
                              if (reason === null) return;
                              void runAction(`${actionBase}:reject`, () => rejectListing(item.id, reason.trim() || undefined));
                            }}
                            className="inline-flex items-center gap-1.5 border border-red-200 bg-red-50 px-2.5 py-1.5 text-[11px] font-black text-red-700 disabled:opacity-50"
                          >
                            <XCircle size={13} />
                            Reject
                          </button>
                        )}

                        {status === "ACTIVE" && (
                          <button
                            type="button"
                            disabled={Boolean(busyAction)}
                            onClick={() => {
                              if (!window.confirm("Suspend this startup listing?")) return;
                              void runAction(`${actionBase}:suspend`, () => suspendListing(item.id));
                            }}
                            className="inline-flex items-center gap-1.5 border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-black text-slate-600 disabled:opacity-50"
                          >
                            <ShieldOff size={13} />
                            Suspend
                          </button>
                        )}

                        <button
                          type="button"
                          disabled={Boolean(busyAction)}
                          onClick={() =>
                            void runAction(
                              `${actionBase}:feature`,
                              () => featured ? unfeatureListing(item.id) : featureListing(item.id),
                            )
                          }
                          className="inline-flex items-center gap-1.5 border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[11px] font-black text-amber-700 disabled:opacity-50"
                        >
                          <Star size={13} />
                          {featured ? "Unfeature" : "Feature"}
                        </button>

                        <button
                          type="button"
                          disabled={Boolean(busyAction)}
                          onClick={() =>
                            void runAction(`${actionBase}:premium`, () => setPremiumListing(item.id, !premium))
                          }
                          className="inline-flex items-center gap-1.5 border border-[#dce8fb] bg-[#eef3fd] px-2.5 py-1.5 text-[11px] font-black text-[#1A56DB] disabled:opacity-50"
                        >
                          <BadgeDollarSign size={13} />
                          {premium ? "Remove Premium" : "Premium"}
                        </button>

                        <a
                          href={item.slug ? `/startups/${item.slug}` : "/startups"}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-black text-slate-600 hover:bg-slate-50"
                        >
                          View
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {!loading && !rows.length && (
            <div className="grid place-items-center py-16 px-6 text-center">
              <strong className="text-[13px] font-black text-slate-500">
                No startup submissions found
              </strong>
              <span className="text-[12px] text-slate-400 mt-1">
                {titleCase(filters.status) || "Try changing the filters."}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-slate-100">
          <span className="text-[12px] font-bold text-slate-500">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={loading || page <= 1}
              onClick={() => setFilters((v) => ({ ...v, page: Math.max(1, v.page - 1) }))}
              className="border border-slate-200 bg-white px-3 py-2 text-[12px] font-black text-slate-600 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={loading || page >= totalPages}
              onClick={() => setFilters((v) => ({ ...v, page: v.page + 1 }))}
              className="border border-slate-200 bg-white px-3 py-2 text-[12px] font-black text-slate-600 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </>
  );
}