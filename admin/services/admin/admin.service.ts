// admin.service.ts
import { apiData, apiRequest } from "@/lib/api";
import { toQueryString } from "@/lib/utils";
import type {
  ActivityItem,
  AdminDeal,
  AdminListParams,
  AdminUser,
  AnalyticsOverview,
  ApiEnvelope,
  AuditLog,
  BusinessListing,
  DealStatus,
  StatsRecord,
} from "@/types/admin";

export async function getAnalyticsOverview() {
  return apiData<AnalyticsOverview>("/admin/analytics/overview");
}

export async function getRecentActivity() {
  return apiData<ActivityItem[]>("/admin/analytics/recent-activity");
}

export async function getUserStats() {
  return apiData<StatsRecord>("/admin/users/stats");
}

export async function getListingStats() {
  return apiData<StatsRecord>("/admin/listings/stats");
}

export async function getDealStats() {
  return apiData<StatsRecord>("/admin/deals/stats");
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

export async function listListings(params: AdminListParams = {}) {
  return apiRequest<BusinessListing[]>(`/admin/listings${toQueryString(params)}`);
}

export async function getListing(id: string) {
  return apiData<BusinessListing>(`/admin/listings/${id}`);
}

export async function approveListing(id: string) {
  return apiData<BusinessListing>(`/admin/listings/${id}/approve`, { method: "PATCH" });
}

export async function rejectListing(id: string) {
  return apiData<BusinessListing>(`/admin/listings/${id}/reject`, { method: "PATCH" });
}

export async function suspendListing(id: string) {
  return apiData<BusinessListing>(`/admin/listings/${id}/suspend`, { method: "PATCH" });
}

export async function featureListing(id: string) {
  return apiData<BusinessListing>(`/admin/listings/${id}/feature`, { method: "PATCH" });
}

export async function unfeatureListing(id: string) {
  return apiData<BusinessListing>(`/admin/listings/${id}/unfeature`, { method: "PATCH" });
}

export async function setPremiumListing(id: string, isPremium = true) {
  return apiData<BusinessListing>(`/admin/listings/${id}/set-premium`, {
    method: "PATCH",
    body: JSON.stringify({ isPremium }),
  });
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

export async function getListingsByIndustry() {
  return apiData<Array<{ industry: string; count: number }>>("/admin/analytics/listings-by-industry");
}

export async function getListingsByCountry() {
  return apiData<Array<{ country: string; count: number }>>("/admin/analytics/listings-by-country");
}

export async function getDealFunnel() {
  return apiData<Array<{ status: string; count: number }>>("/admin/analytics/deal-funnel");
}

export async function getUserGrowth() {
  return apiData<Array<{ date: string; count: number }>>("/admin/analytics/user-growth");
}

export async function getContentStats() {
  return apiData<StatsRecord>("/admin/content/stats");
}

export async function getFeaturedListings() {
  return apiData<BusinessListing[]>("/admin/content/featured-listings");
}

export async function getFeaturedInvestors() {
  return apiData<Array<Record<string, unknown>>>("/admin/content/featured-investors");
}

export async function sendBroadcast(payload: { title: string; body: string; type?: string }) {
  return apiData<{ sent: number }>("/admin/content/broadcast", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getAuditLogs(params: AdminListParams = {}) {
  return apiRequest<AuditLog[]>(`/admin/content/audit-logs${toQueryString(params)}`) as Promise<ApiEnvelope<AuditLog[]>>;
}