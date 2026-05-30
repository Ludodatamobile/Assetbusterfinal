"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, RotateCcw, ShieldOff, Trash2, UserPlus } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Toolbar } from "@/components/admin/Toolbar";
import { Button } from "@/components/admin/Button";
import { metaFromEnvelope, rowsFromEnvelope } from "@/lib/response";
import { formatShortDate, initials, titleCase } from "@/lib/utils";
import {
  listUsers,
  reactivateUser,
  removeUser,
  suspendUser,
  verifyUser,
} from "@/services/admin/users.service";
import type { AdminUser, PaginationMeta, UserStatus } from "@/types/admin";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<UserStatus | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await listUsers({ page: 1, limit: 25, search, status });
      setUsers(rowsFromEnvelope(response));
      setMeta(metaFromEnvelope(response));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load users.");
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    const id = window.setTimeout(() => void load(), 250);
    return () => window.clearTimeout(id);
  }, [load]);

  const runAction = async (action: () => Promise<unknown>) => {
    try {
      await action();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed.");
    }
  };

  const columns: DataTableColumn<AdminUser>[] = [
    {
      key: "user",
      header: "User",
      cell: (user) => (
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-[#eef3fd] text-[#1A56DB] text-[11px] font-black flex items-center justify-center flex-shrink-0">
            {initials(user.firstName, user.lastName, user.email)}
          </span>
          <span className="flex flex-col gap-0.5">
            <strong className="text-[12.5px] font-bold text-[#0f1e36] leading-snug">
              {user.firstName} {user.lastName}
            </strong>
            <small className="text-[11px] text-slate-400 font-medium">{user.email}</small>
          </span>
        </div>
      ),
    },
    { key: "role", header: "Role", cell: (user) => <StatusBadge value={user.role} /> },
    { key: "status", header: "Status", cell: (user) => <StatusBadge value={user.status} /> },
    {
      key: "country",
      header: "Country",
      cell: (user) => (
        <span className="text-[12px] text-slate-600">{user.country ?? "Not set"}</span>
      ),
    },
    {
      key: "score",
      header: "Score",
      cell: (user) => (
        <span className="text-[12px] font-bold text-slate-700">{user.profileScore ?? 0}</span>
      ),
    },
    {
      key: "joined",
      header: "Joined",
      cell: (user) => (
        <span className="text-[12px] text-slate-500">
          {formatShortDate(user.memberSince ?? user.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-28",
      cell: (user) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            title="Verify user"
            onClick={() => void runAction(() => verifyUser(user.id))}
            className="w-7 h-7 flex items-center justify-center border border-slate-200 bg-white text-slate-500 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-colors duration-150"
          >
            <CheckCircle2 size={13} />
          </button>
          {user.status === "SUSPENDED" ? (
            <button
              type="button"
              title="Reactivate"
              onClick={() => void runAction(() => reactivateUser(user.id))}
              className="w-7 h-7 flex items-center justify-center border border-slate-200 bg-white text-slate-500 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors duration-150"
            >
              <RotateCcw size={13} />
            </button>
          ) : (
            <button
              type="button"
              title="Suspend"
              onClick={() => void runAction(() => suspendUser(user.id))}
              className="w-7 h-7 flex items-center justify-center border border-slate-200 bg-white text-slate-500 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 transition-colors duration-150"
            >
              <ShieldOff size={13} />
            </button>
          )}
          <button
            type="button"
            title="Delete user"
            onClick={() => {
              if (window.confirm(`Delete ${user.email}? This cannot be undone.`)) {
                void runAction(() => removeUser(user.id));
              }
            }}
            className="w-7 h-7 flex items-center justify-center border border-slate-200 bg-white text-slate-500 hover:bg-red-50 hover:text-[#D42B2B] hover:border-red-200 transition-colors duration-150"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Identity and access"
        title="Users"
        description="Review marketplace accounts, verification state, roles, countries, and risk status."
        actions={
          <Button disabled>
            <UserPlus size={16} />
            Invite admin
          </Button>
        }
      />

      <Toolbar search={search} onSearchChange={setSearch} placeholder="Search name, email, country">
        <select
          className="h-9 border border-slate-200 bg-white text-[12.5px] font-medium text-slate-700 px-3 outline-none focus:border-[#1A56DB] transition-colors duration-150 cursor-pointer"
          value={status}
          onChange={(e) => setStatus(e.target.value as UserStatus | "")}
        >
          <option value="">All statuses</option>
          {["PENDING", "ACTIVE", "SUSPENDED", "DEACTIVATED"].map((v) => (
            <option key={v} value={v}>{titleCase(v)}</option>
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
        data={users}
        loading={loading}
        emptyDescription="Users returned by /admin/users will appear here."
      />

      {meta && (
        <p className="text-[12px] text-slate-400 font-medium">
          Showing page {meta.page} of {meta.totalPages || 1},{" "}
          <strong className="text-slate-600">{meta.total}</strong> total users
        </p>
      )}
    </>
  );
}