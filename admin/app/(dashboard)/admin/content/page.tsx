"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Ban,
  Clock,
  Megaphone,
  RefreshCcw,
  Send,
  Star,
  Users,
} from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/admin/Button";
import { rowsFromEnvelope } from "@/lib/response";
import { formatShortDate, titleCase } from "@/lib/utils";
import {
  cancelCampaign,
  createCampaign,
  getAuditLogs,
  getContentStats,
  getFeaturedInvestors,
  getFeaturedListings,
  listCampaigns,
  type BroadcastCampaign,
} from "@/services/admin/content.service";
import type { AuditLog, BusinessListing, StatsRecord } from "@/types/admin";


const AUDIENCE_OPTIONS = [
  { value: "ALL",                label: "All Users" },
  { value: "BUSINESS_OWNER",     label: "Business Owners" },
  { value: "INVESTOR",           label: "Investors" },
  { value: "FRANCHISE_PARTNER",  label: "Franchise Partners" },
  { value: "ADVISOR",            label: "Advisors" },
  { value: "BUYER",              label: "Buyers" },
];

const EMPTY_FORM = {
  title:        "",
  subject:      "",
  body:         "",
  audience:     "ALL",
  scheduleMode: "now" as "now" | "later",
  scheduledAt:  "",
};

function Spinner({ size = 15 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className="animate-spin flex-shrink-0"
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function CampaignSkeleton() {
  return (
    <div className="divide-y divide-slate-100">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-4 px-6 py-4 animate-pulse">
          <div className="flex-1 min-w-0">
            <div className="h-3 bg-slate-200 rounded w-44 mb-2" />
            <div className="h-2.5 bg-slate-100 rounded w-32" />
          </div>
          <div className="h-5 bg-slate-200 rounded w-24" />
          <div className="h-3 bg-slate-100 rounded w-20" />
          <div className="h-3 bg-slate-100 rounded w-12" />
        </div>
      ))}
    </div>
  );
}

const inputCls =
  "w-full h-11 border-[1.5px] border-slate-200 bg-white text-[#0f1e36] text-[13px] font-medium px-3 outline-none focus:border-[#1A56DB] focus:ring-[3px] focus:ring-[#1A56DB]/10 transition-all duration-150";

const labelCls =
  "text-[11px] font-black text-[#0f1e36] uppercase tracking-[0.5px]";


export default function AdminContentPage() {
  const [stats, setStats]                   = useState<StatsRecord>({});
  const [featuredListings, setFeaturedListings] = useState<BusinessListing[]>([]);
  const [featuredInvestors, setFeaturedInvestors] = useState<Array<Record<string, unknown>>>([]);
  const [auditLogs, setAuditLogs]           = useState<AuditLog[]>([]);
  const [campaigns, setCampaigns]           = useState<BroadcastCampaign[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(true);

  const [form, setForm]       = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice]   = useState("");
  const [error, setError]     = useState("");

  const loadCampaigns = useCallback(async () => {
    setCampaignsLoading(true);
    try {
      const res = await listCampaigns({ page: 1, limit: 20 });
      setCampaigns(rowsFromEnvelope(res));
    } catch {
      // non-blocking
    } finally {
      setCampaignsLoading(false);
    }
  }, []);

  const load = useCallback(async () => {
    setError("");
    const [contentStats, listings, investors, logs] = await Promise.allSettled([
      getContentStats(),
      getFeaturedListings(),
      getFeaturedInvestors(),
      getAuditLogs({ page: 1, limit: 12 }),
    ]);
    if (contentStats.status === "fulfilled") setStats(contentStats.value);
    if (listings.status   === "fulfilled")   setFeaturedListings(listings.value);
    if (investors.status  === "fulfilled")   setFeaturedInvestors(investors.value);
    if (logs.status       === "fulfilled")   setAuditLogs(rowsFromEnvelope(logs.value));
    if ([contentStats, listings, investors, logs].some((r) => r.status === "rejected"))
      setError("Some content data could not be loaded.");
  }, []);

  useEffect(() => {
    void load();
    void loadCampaigns();
  }, [load, loadCampaigns]);

  const set = (key: keyof typeof EMPTY_FORM) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const minScheduledAt = new Date(Date.now() + 5 * 60 * 1000)
    .toISOString()
    .slice(0, 16);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (form.scheduleMode === "later" && !form.scheduledAt) {
      setError("Please pick a date and time to schedule.");
      return;
    }
    setSubmitting(true);
    setNotice("");
    setError("");
    try {
      await createCampaign({
        title:       form.title,
        subject:     form.subject,
        body:        form.body,
        audience:    form.audience,
        scheduledAt: form.scheduleMode === "later" ? form.scheduledAt : undefined,
      });
      setForm(EMPTY_FORM);
      setNotice(
        form.scheduleMode === "now"
          ? "Campaign is being sent to recipients."
          : `Campaign scheduled for ${new Date(form.scheduledAt).toLocaleString()}.`,
      );
      await Promise.all([load(), loadCampaigns()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create campaign.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id: string, title: string) => {
    if (!window.confirm(`Cancel campaign "${title}"?`)) return;
    try {
      await cancelCampaign(id);
      await loadCampaigns();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel campaign.");
    }
  };

  const campaignColumns: DataTableColumn<BroadcastCampaign>[] = [
    {
      key: "campaign",
      header: "Campaign",
      cell: (c) => (
        <div className="flex flex-col gap-0.5">
          <strong className="text-[12.5px] font-bold text-[#0f1e36] leading-snug">
            {c.title}
          </strong>
          <small className="text-[11px] text-slate-400 font-medium truncate max-w-[180px]">
            {c.subject}
          </small>
        </div>
      ),
    },
    {
      key: "audience",
      header: "Audience",
      cell: (c) => (
        <span className="text-[12px] text-slate-600">
          {AUDIENCE_OPTIONS.find((o) => o.value === c.audience)?.label ?? c.audience}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (c) => <StatusBadge value={c.status} />,
    },
    {
      key: "date",
      header: "Date",
      cell: (c) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-[12px] text-slate-600">
            {c.sentAt
              ? formatShortDate(c.sentAt)
              : c.scheduledAt
              ? formatShortDate(c.scheduledAt)
              : formatShortDate(c.createdAt)}
          </span>
          <small className="text-[10px] text-slate-400 uppercase tracking-wide">
            {c.sentAt ? "Sent" : c.scheduledAt ? "Scheduled" : "Created"}
          </small>
        </div>
      ),
    },
    {
      key: "recipients",
      header: "Recipients",
      cell: (c) => (
        <div className="flex flex-col gap-0.5 text-right">
          <strong className="text-[12.5px] font-black text-[#0f1e36]">
            {c.recipientCount > 0 ? c.recipientCount.toLocaleString() : "—"}
          </strong>
          {c.failedCount > 0 && (
            <small className="text-[10px] text-red-500 font-bold">
              {c.failedCount} failed
            </small>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-10",
      cell: (c) =>
        c.status === "SCHEDULED" || c.status === "DRAFT" ? (
          <button
            type="button"
            title="Cancel campaign"
            onClick={() => void handleCancel(c.id, c.title)}
            className="w-7 h-7 flex items-center justify-center border border-slate-200 bg-white text-slate-400 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors duration-150"
          >
            <Ban size={12} />
          </button>
        ) : null,
    },
  ];

  const auditColumns: DataTableColumn<AuditLog>[] = [
    { key: "admin",    header: "Admin",     cell: (l) => l.admin?.email ?? l.adminId },
    { key: "action",   header: "Action",    cell: (l) => titleCase(l.action) },
    { key: "entity",   header: "Entity",    cell: (l) => <StatusBadge value={l.entity} /> },
    {
      key: "entityId", header: "Entity ID",
      cell: (l) => (
        <code className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5">
          {l.entityId.slice(0, 12)}
        </code>
      ),
    },
    { key: "date", header: "Date", cell: (l) => formatShortDate(l.createdAt) },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Content operations"
        title="Content & Audit"
        description="Send email campaigns, manage featured listings, and review admin action history."
      />

      {notice && (
        <div className="border border-emerald-200 border-l-[3px] border-l-emerald-500 bg-emerald-50 text-emerald-800 px-4 py-3 text-[13px] font-bold">
          {notice}
        </div>
      )}
      {error && (
        <div className="border border-amber-200 border-l-[3px] border-l-amber-400 bg-amber-50 text-amber-800 px-4 py-3 text-[13px] font-bold">
          {error}
        </div>
      )}

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Star}      label="Featured listings"  value={featuredListings.length}               detail="Promoted by admin" />
        <StatCard icon={Users}     label="Featured investors" value={featuredInvestors.length}              detail="Investor profiles promoted" />
        <StatCard icon={Megaphone} label="Campaigns sent"     value={String(stats.broadcasts ?? stats.totalBroadcasts ?? 0)} detail="Email campaigns delivered" />
      </div>

      {/* Composer + featured listings */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        <article className="bg-white border border-slate-200">
          <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-100">
            <div>
              <p className="text-[10px] font-bold text-[#1A56DB] uppercase tracking-[0.9px] mb-1">
                Email newsletter
              </p>
              <h2 className="text-[18px] font-black text-[#0f1e36] tracking-tight">
                New Campaign
              </h2>
            </div>
            <StatusBadge value="SUPER_ADMIN" />
          </div>

          <form className="px-6 py-5 flex flex-col gap-5" onSubmit={handleSubmit}>

            {/* Campaign name */}
            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Campaign name <span className="text-slate-400 normal-case font-medium tracking-normal">internal label</span></span>
              <input
                value={form.title}
                onChange={set("title")}
                required
                placeholder="e.g. May Newsletter"
                className={inputCls}
              />
            </label>

            {/* Subject */}
            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Email subject line</span>
              <input
                value={form.subject}
                onChange={set("subject")}
                required
                placeholder="What recipients see in their inbox"
                className={inputCls}
              />
            </label>

            {/* Body */}
            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>
                Message body
                <span className="text-slate-400 normal-case font-medium tracking-normal ml-1">
                  use *BOLD* for emphasis
                </span>
              </span>
              <div className="relative">
                <textarea
                  value={form.body}
                  onChange={set("body")}
                  required
                  rows={7}
                  maxLength={5000}
                  placeholder={"Write your message here…\n\nSeparate paragraphs with a blank line.\nUse **bold text** to emphasise key phrases."}
                  className="w-full border-[1.5px] border-slate-200 bg-white text-[#0f1e36] text-[13px] font-medium px-3 py-2.5 outline-none focus:border-[#1A56DB] focus:ring-[3px] focus:ring-[#1A56DB]/10 transition-all duration-150 resize-none"
                />
                <span className={`absolute bottom-2 right-3 text-[10px] font-bold ${form.body.length > 4500 ? "text-amber-500" : "text-slate-300"}`}>
                  {form.body.length}/5000
                </span>
              </div>
            </label>

            {/* Audience */}
            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Audience</span>
              <select value={form.audience} onChange={set("audience")} className={`${inputCls} cursor-pointer`}>
                {AUDIENCE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </label>

            {/* Delivery */}
            <fieldset className="flex flex-col gap-2">
              <legend className={labelCls}>Delivery</legend>
              <div className="flex flex-col gap-2 pt-1">

                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="radio"
                    name="scheduleMode"
                    value="now"
                    checked={form.scheduleMode === "now"}
                    onChange={() => setForm((f) => ({ ...f, scheduleMode: "now", scheduledAt: "" }))}
                    className="accent-[#1A56DB] w-4 h-4 cursor-pointer"
                  />
                  <Send size={13} className="text-slate-400" />
                  <span className="text-[13px] font-medium text-[#0f1e36]">Send immediately</span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer group">
                  <input
                    type="radio"
                    name="scheduleMode"
                    value="later"
                    checked={form.scheduleMode === "later"}
                    onChange={() => setForm((f) => ({ ...f, scheduleMode: "later" }))}
                    className="accent-[#1A56DB] w-4 h-4 mt-0.5 cursor-pointer"
                  />
                  <Clock size={13} className="text-slate-400 mt-0.5" />
                  <div className="flex flex-col gap-2 flex-1">
                    <span className="text-[13px] font-medium text-[#0f1e36]">Schedule for later</span>
                    {form.scheduleMode === "later" && (
                      <input
                        type="datetime-local"
                        value={form.scheduledAt}
                        onChange={set("scheduledAt")}
                        min={minScheduledAt}
                        required={form.scheduleMode === "later"}
                        className="h-10 border-[1.5px] border-slate-200 bg-white text-[#0f1e36] text-[13px] font-medium px-3 outline-none focus:border-[#1A56DB] focus:ring-[3px] focus:ring-[#1A56DB]/10 transition-all duration-150 w-full max-w-[220px]"
                      />
                    )}
                  </div>
                </label>

              </div>
            </fieldset>

            {/* Submit */}
            <div className="pt-1">
              <Button type="submit" disabled={submitting} className="inline-flex items-center gap-2">
                {submitting ? (
                  <>
                    <Spinner size={15} />
                    {form.scheduleMode === "now" ? "Sending…" : "Scheduling…"}
                  </>
                ) : (
                  <>
                    {form.scheduleMode === "now" ? <Send size={15} /> : <Clock size={15} />}
                    {form.scheduleMode === "now" ? "Send Campaign" : "Schedule Campaign"}
                  </>
                )}
              </Button>
            </div>

          </form>
        </article>

        <article className="bg-white border border-slate-200">
          <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-100">
            <div>
              <p className="text-[10px] font-bold text-[#1A56DB] uppercase tracking-[0.9px] mb-1">
                Promoted supply
              </p>
              <h2 className="text-[18px] font-black text-[#0f1e36] tracking-tight">
                Featured listings
              </h2>
            </div>
            <StatusBadge value="ACTIVE" />
          </div>
          <div className="divide-y divide-slate-100">
            {featuredListings.length ? (
              featuredListings.slice(0, 8).map((listing) => (
                <div
                  key={listing.id}
                  className="flex items-center justify-between gap-3 px-6 py-3.5 hover:bg-slate-50/70 transition-colors duration-100"
                >
                  <div className="min-w-0">
                    <strong className="block text-[12.5px] font-bold text-[#0f1e36] truncate">
                      {listing.title}
                    </strong>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {listing.industry} · {listing.country}
                    </span>
                  </div>
                  <Star size={14} className="text-[#F5A623] flex-shrink-0" />
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-center px-6">
                <strong className="text-[13px] font-bold text-slate-500">No featured listings</strong>
                <span className="text-[12px] text-slate-400">
                  Use the listings page to feature marketplace supply.
                </span>
              </div>
            )}
          </div>
        </article>
      </div>

      {/* ── Campaign history ─────────────────────────────────────────────── */}
      <article className="bg-white border border-slate-200">
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-100">
          <div>
            <p className="text-[10px] font-bold text-[#1A56DB] uppercase tracking-[0.9px] mb-1">
              Campaign history
            </p>
            <h2 className="text-[18px] font-black text-[#0f1e36] tracking-tight">
              Email Campaigns
            </h2>
          </div>
          <button
            type="button"
            onClick={() => void loadCampaigns()}
            className="inline-flex items-center gap-1.5 h-8 px-3 border border-slate-200 bg-white text-[12px] font-bold text-slate-500 hover:bg-slate-50 transition-colors duration-150"
          >
            <RefreshCcw size={13} /> Refresh
          </button>
        </div>

        {campaignsLoading ? (
          <CampaignSkeleton />
        ) : (
          <DataTable
            columns={campaignColumns}
            data={campaigns}
            emptyDescription="Campaigns you create will appear here with delivery status and recipient counts."
          />
        )}
      </article>

      {/* Audit trail  */}
      <article className="bg-white border border-slate-200">
        <div className="px-6 py-5 border-b border-slate-100">
          <p className="text-[10px] font-bold text-[#1A56DB] uppercase tracking-[0.9px] mb-1">
            Audit trail
          </p>
          <h2 className="text-[18px] font-black text-[#0f1e36] tracking-tight">
            Recent admin actions
          </h2>
        </div>
        <DataTable
          columns={auditColumns}
          data={auditLogs}
          emptyDescription="Audit log records will appear here."
        />
      </article>
    </>
  );
}