// listings page
"use client";

import { useCallback, useEffect, useState } from "react";
import { BadgeDollarSign, Check, Eye, Star, StarOff, X } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Toolbar } from "@/components/admin/Toolbar";
import { metaFromEnvelope, rowsFromEnvelope } from "@/lib/response";
import { formatCurrency, formatShortDate, titleCase } from "@/lib/utils";
import {
  approveListing,
  featureListing,
  listListings,
  rejectListing,
  setPremiumListing,
  suspendListing,
  unfeatureListing,
} from "@/services/admin/listings.service";
import type { BusinessListing, ListingStatus, PaginationMeta } from "@/types/admin";

const BTN = "w-7 h-7 flex items-center justify-center border transition-colors duration-150 cursor-pointer";

export default function AdminListingsPage() {
  const [listings, setListings] = useState<BusinessListing[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ListingStatus | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await listListings({ page: 1, limit: 25, search, status });
      setListings(rowsFromEnvelope(response));
      setMeta(metaFromEnvelope(response));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load listings.");
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    const id = window.setTimeout(() => void load(), 250);
    return () => window.clearTimeout(id);
  }, [load]);

  const run = async (action: () => Promise<unknown>) => {
    try {
      await action();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed.");
    }
  };

  const columns: DataTableColumn<BusinessListing>[] = [
    {
      key: "listing",
      header: "Listing",
      cell: (l) => (
        <div className="flex flex-col gap-0.5">
          <strong className="text-[12.5px] font-bold text-[#0f1e36] leading-snug">{l.title}</strong>
          <small className="text-[11px] text-slate-400 font-medium">
            {l.industry} · {l.city ? `${l.city}, ` : ""}{l.country}
          </small>
        </div>
      ),
    },
    {
      key: "owner",
      header: "Owner",
      cell: (l) => (
        <span className="text-[12px] text-slate-600">{l.user?.email ?? "Not attached"}</span>
      ),
    },
    { key: "status", header: "Status", cell: (l) => <StatusBadge value={l.status} /> },
    {
      key: "ask",
      header: "Ask",
      cell: (l) => (
        <span className="text-[12.5px] font-bold text-emerald-600">
          {formatCurrency(l.askAmount, l.currency)}
        </span>
      ),
    },
    {
      key: "signals",
      header: "Signals",
      cell: (l) => (
        <div className="flex items-center gap-1 flex-wrap">
          {l.isVerified && <span className="text-[9.5px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5">Verified</span>}
          {l.isPremium && <span className="text-[9.5px] font-bold uppercase bg-[#eef3fd] text-[#1444B8] border border-[#bfdbfe] px-1.5 py-0.5">Premium</span>}
          {l.isFeatured && <span className="text-[9.5px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5">Featured</span>}
          {!l.isVerified && !l.isPremium && !l.isFeatured && <small className="text-[11px] text-slate-400">None</small>}
        </div>
      ),
    },
    {
      key: "created",
      header: "Created",
      cell: (l) => <span className="text-[12px] text-slate-500">{formatShortDate(l.createdAt)}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-44",
      cell: (l) => (
        <div className="flex items-center gap-1">
          <button type="button" title="Approve" onClick={() => void run(() => approveListing(l.id))} className={`${BTN} border-slate-200 bg-white text-slate-500 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200`}><Check size={13} /></button>
          <button type="button" title="Reject" onClick={() => void run(() => rejectListing(l.id))} className={`${BTN} border-slate-200 bg-white text-slate-500 hover:bg-red-50 hover:text-[#D42B2B] hover:border-red-200`}><X size={13} /></button>
          <button type="button" title="Suspend" onClick={() => void run(() => suspendListing(l.id))} className={`${BTN} border-slate-200 bg-white text-slate-500 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200`}><Eye size={13} /></button>
          <button type="button" title={l.isFeatured ? "Unfeature" : "Feature"} onClick={() => void run(() => l.isFeatured ? unfeatureListing(l.id) : featureListing(l.id))} className={`${BTN} border-slate-200 bg-white text-slate-500 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200`}>{l.isFeatured ? <StarOff size={13} /> : <Star size={13} />}</button>
          <button type="button" title="Toggle premium" onClick={() => void run(() => setPremiumListing(l.id, !l.isPremium))} className={`${BTN} border-slate-200 bg-white text-slate-500 hover:bg-[#eef3fd] hover:text-[#1A56DB] hover:border-[#bfdbfe]`}><BadgeDollarSign size={13} /></button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Supply moderation"
        title="Listings"
        description="Approve, reject, feature, suspend, and premium-tag business profiles."
      />
      <Toolbar search={search} onSearchChange={setSearch} placeholder="Search listing, industry, country">
        <select className="h-9 border border-slate-200 bg-white text-[12.5px] font-medium text-slate-700 px-3 outline-none focus:border-[#1A56DB] transition-colors duration-150 cursor-pointer" value={status} onChange={(e) => setStatus(e.target.value as ListingStatus | "")}>
          <option value="">All statuses</option>
          {["DRAFT", "PENDING_REVIEW", "ACTIVE", "REJECTED", "CLOSED"].map((v) => (
            <option key={v} value={v}>{titleCase(v)}</option>
          ))}
        </select>
      </Toolbar>
      {error && <div className="border border-red-200 border-l-[3px] border-l-[#D42B2B] bg-red-50 text-[#b42318] px-4 py-3 text-[13px] font-bold">{error}</div>}
      <DataTable columns={columns} data={listings} loading={loading} emptyDescription="Listings returned by /admin/listings will appear here." />
      {meta && (
        <p className="text-[12px] text-slate-400 font-medium">
          Showing page {meta.page} of {meta.totalPages || 1},{" "}
          <strong className="text-slate-600">{meta.total}</strong> total listings
        </p>
      )}
    </>
  );
}