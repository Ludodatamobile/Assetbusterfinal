"use client";

import { useCallback, useEffect, useState } from "react";
import { BadgeDollarSign, Check, Eye, HandCoins, Star, StarOff, X } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Toolbar } from "@/components/admin/Toolbar";
import { metaFromEnvelope, rowsFromEnvelope } from "@/lib/response";
import { formatCurrency, formatShortDate, titleCase } from "@/lib/utils";
import {
  approveListing,
  featureListing,
  listFundraisers,
  rejectListing,
  setPremiumListing,
  suspendListing,
  unfeatureListing,
} from "@/services/admin/listings.service";
import type { BusinessListing, ListingStatus, PaginationMeta } from "@/types/admin";

const BTN =
  "w-7 h-7 flex items-center justify-center border transition-colors duration-150 cursor-pointer";

export default function AdminFundraisersPage() {
  const [fundraisers, setFundraisers] = useState<BusinessListing[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ListingStatus | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await listFundraisers({
        page: 1,
        limit: 25,
        search,
        status,
      });

      setFundraisers(rowsFromEnvelope(response));
      setMeta(metaFromEnvelope(response));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load fund raisers.");
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
      key: "fundraiser",
      header: "Fund Raiser",
      cell: (item) => (
        <div className="flex flex-col gap-0.5">
          <strong className="text-[12.5px] font-bold text-[#0f1e36] leading-snug">
            {item.title}
          </strong>
          <small className="text-[11px] text-slate-400 font-medium">
            {item.industry} · {item.city ? `${item.city}, ` : ""}
            {item.country}
          </small>
        </div>
      ),
    },
    {
      key: "owner",
      header: "Owner",
      cell: (item) => (
        <span className="text-[12px] text-slate-600">
          {item.user?.email ?? "Not attached"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (item) => <StatusBadge value={item.status} />,
    },
    {
      key: "capital",
      header: "Capital",
      cell: (item) => (
        <span className="text-[12.5px] font-bold text-emerald-600">
          {formatCurrency(item.askAmount, item.currency)}
        </span>
      ),
    },
    {
      key: "dealType",
      header: "Deal Type",
      cell: (item) => (
        <span className="text-[11px] font-bold uppercase bg-[#eef3fd] text-[#1444B8] border border-[#bfdbfe] px-1.5 py-0.5">
          {titleCase(item.dealType)}
        </span>
      ),
    },
    {
      key: "signals",
      header: "Signals",
      cell: (item) => (
        <div className="flex items-center gap-1 flex-wrap">
          {item.isVerified && (
            <span className="text-[9.5px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5">
              Verified
            </span>
          )}
          {item.isPremium && (
            <span className="text-[9.5px] font-bold uppercase bg-[#eef3fd] text-[#1444B8] border border-[#bfdbfe] px-1.5 py-0.5">
              Premium
            </span>
          )}
          {item.isFeatured && (
            <span className="text-[9.5px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5">
              Featured
            </span>
          )}
          {!item.isVerified && !item.isPremium && !item.isFeatured && (
            <small className="text-[11px] text-slate-400">None</small>
          )}
        </div>
      ),
    },
    {
      key: "created",
      header: "Created",
      cell: (item) => (
        <span className="text-[12px] text-slate-500">
          {formatShortDate(item.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-44",
      cell: (item) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            title="Approve"
            onClick={() => void run(() => approveListing(item.id))}
            className={`${BTN} border-slate-200 bg-white text-slate-500 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200`}
          >
            <Check size={13} />
          </button>
          <button
            type="button"
            title="Reject"
            onClick={() => void run(() => rejectListing(item.id))}
            className={`${BTN} border-slate-200 bg-white text-slate-500 hover:bg-red-50 hover:text-[#D42B2B] hover:border-red-200`}
          >
            <X size={13} />
          </button>
          <button
            type="button"
            title="Close"
            onClick={() => void run(() => suspendListing(item.id))}
            className={`${BTN} border-slate-200 bg-white text-slate-500 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200`}
          >
            <Eye size={13} />
          </button>
          <button
            type="button"
            title={item.isFeatured ? "Unfeature" : "Feature"}
            onClick={() =>
              void run(() =>
                item.isFeatured ? unfeatureListing(item.id) : featureListing(item.id)
              )
            }
            className={`${BTN} border-slate-200 bg-white text-slate-500 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200`}
          >
            {item.isFeatured ? <StarOff size={13} /> : <Star size={13} />}
          </button>
          <button
            type="button"
            title="Toggle premium"
            onClick={() => void run(() => setPremiumListing(item.id, !item.isPremium))}
            className={`${BTN} border-slate-200 bg-white text-slate-500 hover:bg-[#eef3fd] hover:text-[#1A56DB] hover:border-[#bfdbfe]`}
          >
            <BadgeDollarSign size={13} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Capital raise moderation"
        title="Fund Raisers"
        description="Review, approve, reject, feature, close, and premium-tag companies raising capital."
      />

      <Toolbar search={search} onSearchChange={setSearch} placeholder="Search fund raiser, industry, country">
        <div className="h-9 flex items-center gap-2 border border-slate-200 bg-white text-[12.5px] font-bold text-slate-600 px-3">
          <HandCoins size={14} />
          Raise Capital
        </div>
        <select
          className="h-9 border border-slate-200 bg-white text-[12.5px] font-medium text-slate-700 px-3 outline-none focus:border-[#1A56DB] transition-colors duration-150 cursor-pointer"
          value={status}
          onChange={(e) => setStatus(e.target.value as ListingStatus | "")}
        >
          <option value="">All statuses</option>
          {["DRAFT", "PENDING_REVIEW", "ACTIVE", "REJECTED", "CLOSED"].map((value) => (
            <option key={value} value={value}>
              {titleCase(value)}
            </option>
          ))}
        </select>
      </Toolbar>

      {error && (
        <div className="border border-red-200 border-l-[3px] border-l-[#D42B2B] bg-red-50 text-[#b42318] px-4 py-3 text-[13px] font-bold">
          {error}
        </div>
      )}

      <DataTable
        columns={columns}
        data={fundraisers}
        loading={loading}
        emptyDescription="Fund raiser listings returned by /admin/listings?profileType=RAISE_CAPITAL will appear here."
      />

      {meta && (
        <p className="text-[12px] text-slate-400 font-medium">
          Showing page {meta.page} of {meta.totalPages || 1},{" "}
          <strong className="text-slate-600">{meta.total}</strong> total fund raisers
        </p>
      )}
    </>
  );
}