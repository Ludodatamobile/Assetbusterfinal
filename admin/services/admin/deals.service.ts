import { apiData, apiRequest } from "@/lib/api";
import { toQueryString } from "@/lib/utils";
import type { AdminDeal, AdminListParams, DealStatus, StatsRecord } from "@/types/admin";

export async function getDealStats() {
  return apiData<StatsRecord>("/admin/deals/stats");
}

export async function listDeals(params: AdminListParams = {}) {
  return apiRequest<AdminDeal[]>(`/admin/deals${toQueryString(params)}`);
}

export async function getDeal(id: string) {
  return apiData<AdminDeal>(`/admin/deals/${id}`);
}

export async function updateDealStatus(id: string, status: DealStatus) {
  return apiData<AdminDeal>(`/admin/deals/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}