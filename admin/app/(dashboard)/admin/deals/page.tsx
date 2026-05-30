"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowRight, RefreshCcw } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Toolbar } from "@/components/admin/Toolbar";
import { DEAL_STATUSES } from "@/lib/constants";
import { metaFromEnvelope, rowsFromEnvelope } from "@/lib/response";
import { formatCurrency, formatShortDate, titleCase } from "@/lib/utils";
import { listDeals, updateDealStatus } from "@/services/admin/deals.service";
import type { AdminDeal, DealStatus, PaginationMeta } from "@/types/admin";

export default function AdminDealsPage() {
  const [deals, setDeals] = useState<AdminDeal[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<DealStatus | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await listDeals({ page: 1, limit: 25, search, status });
      setDeals(rowsFromEnvelope(response));
      setMeta(metaFromEnvelope(response));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load deals.");
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    const id = window.setTimeout(() => void load(), 250);
    return () => window.clearTimeout(id);
  }, [load]);

  const columns: DataTableColumn<AdminDeal>[] = [
    {
      key: "deal",
      header: "Deal",
      cell: (deal) => (
        <div className="flex flex-col gap-0.5">
          <strong className="text-[12.5px] font-bold text-[#0f1e36] leading-snug">
            {deal.business?.title ?? deal.businessId}
          </strong>
          <small className="text-[11px] text-slate-400 font-medium">
            {deal.business?.industry ?? "Business"} ·{" "}
            {deal.business ? formatCurrency(deal.business.askAmount, deal.business.currency) : "Value hidden"}
          </small>
        </div>
      ),
    },
    {
      key: "parties",
      header: "Parties",
      cell: (deal) => (
        <div className="flex items-center gap-1.5 text-[12px] text-slate-600">
          <span className="max-w-[110px] truncate">{deal.initiator?.email ?? deal.initiatorId}</span>
          <ArrowRight size={11} className="text-slate-400 flex-shrink-0" />
          <span className="max-w-[110px] truncate">{deal.receiver?.email ?? deal.receiverId}</span>
        </div>
      ),
    },
    { key: "status", header: "Status", cell: (deal) => <StatusBadge value={deal.status} /> },
    {
      key: "nda",
      header: "NDA",
      cell: (deal) => (
        <span className={`text-[11px] font-bold uppercase tracking-[0.4px] ${deal.ndaSigned ? "text-emerald-600" : "text-slate-400"}`}>
          {deal.ndaSigned ? "Signed" : "Pending"}
        </span>
      ),
    },
    {
      key: "created",
      header: "Created",
      cell: (deal) => <span className="text-[12px] text-slate-500">{formatShortDate(deal.createdAt)}</span>,
    },
    {
      key: "actions",
      header: "Update status",
      className: "w-44",
      cell: (deal) => (
        <select
          className="w-full h-8 border border-slate-200 bg-white text-[12px] font-medium text-slate-700 px-2 outline-none focus:border-[#1A56DB] transition-colors duration-150 cursor-pointer"
          value={deal.status}
          onChange={(e) => void updateDealStatus(deal.id, e.target.value as DealStatus).then(load)}
        >
          {DEAL_STATUSES.map((v) => (
            <option key={v} value={v}>{titleCase(v)}</option>
          ))}
        </select>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Pipeline governance"
        title="Deals"
        description="Track NDA progress, negotiation state, due diligence movement, and closed or withdrawn transactions."
        actions={
          <button type="button" onClick={() => void load()} className="inline-flex items-center gap-2 h-9 px-4 border border-slate-200 bg-white text-[12.5px] font-bold text-slate-600 hover:bg-slate-50 transition-colors duration-150">
            <RefreshCcw size={14} /> Refresh
          </button>
        }
      />
      <Toolbar search={search} onSearchChange={setSearch} placeholder="Search business, party, status">
        <select className="h-9 border border-slate-200 bg-white text-[12.5px] font-medium text-slate-700 px-3 outline-none focus:border-[#1A56DB] transition-colors duration-150 cursor-pointer" value={status} onChange={(e) => setStatus(e.target.value as DealStatus | "")}>
          <option value="">All stages</option>
          {DEAL_STATUSES.map((v) => <option key={v} value={v}>{titleCase(v)}</option>)}
        </select>
      </Toolbar>
      {error && <div className="border border-red-200 border-l-[3px] border-l-[#D42B2B] bg-red-50 text-[#b42318] px-4 py-3 text-[13px] font-bold">{error}</div>}
      <DataTable columns={columns} data={deals} loading={loading} emptyDescription="Deals returned by /admin/deals will appear here." />
      {meta && (
        <p className="text-[12px] text-slate-400 font-medium">
          Showing page {meta.page} of {meta.totalPages || 1},{" "}
          <strong className="text-slate-600">{meta.total}</strong> total deals
        </p>
      )}
    </>
  );
}