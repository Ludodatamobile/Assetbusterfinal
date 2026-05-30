import { apiData, apiRequest } from "@/lib/api";
import { toQueryString } from "@/lib/utils";
import type { AdminListParams, AdminUser, StatsRecord } from "@/types/admin";

export async function getUserStats() {
  return apiData<StatsRecord>("/admin/users/stats");
}

export async function listUsers(params: AdminListParams = {}) {
  return apiRequest<AdminUser[]>(`/admin/users${toQueryString(params)}`);
}

export async function getUser(id: string) {
  return apiData<AdminUser>(`/admin/users/${id}`);
}

export async function suspendUser(id: string) {
  return apiData<AdminUser>(`/admin/users/${id}/suspend`, { method: "PATCH" });
}

export async function reactivateUser(id: string) {
  return apiData<AdminUser>(`/admin/users/${id}/reactivate`, { method: "PATCH" });
}

export async function verifyUser(id: string) {
  return apiData<AdminUser>(`/admin/users/${id}/verify`, { method: "PATCH" });
}

export async function removeUser(id: string) {
  return apiRequest(`/admin/users/${id}`, { method: "DELETE" });
}