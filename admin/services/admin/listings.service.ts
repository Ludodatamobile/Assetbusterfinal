import { apiData, apiRequest } from "@/lib/api";
import { toQueryString } from "@/lib/utils";
import type { AdminListParams, BusinessListing, StatsRecord } from "@/types/admin";

type AdminListingParams = AdminListParams & {
  profileType?: string;
  startupCategory?: string;
  startupStage?: string;
  fundingServiceType?: string;
};

export async function getListingStats() {
  return apiData<StatsRecord>("/admin/listings/stats");
}

export async function listListings(params: AdminListingParams = {}) {
  return apiRequest<BusinessListing[]>(`/admin/listings${toQueryString(params)}`);
}

export async function listFundraisers(params: AdminListParams = {}) {
  return listListings({ ...params, profileType: "RAISE_CAPITAL" });
}

export async function listStartups(params: AdminListingParams = {}) {
  return listListings({ ...params, profileType: "STARTUP" });
}

export async function getListing(id: string) {
  return apiData<BusinessListing>(`/admin/listings/${id}`);
}

export async function approveListing(id: string) {
  return apiData<BusinessListing | null>(`/admin/listings/${id}/approve`, { method: "PATCH" });
}

export async function rejectListing(id: string, reason?: string) {
  return apiData<BusinessListing | null>(`/admin/listings/${id}/reject`, {
    method: "PATCH",
    body: reason ? JSON.stringify({ reason }) : undefined,
  });
}

export async function suspendListing(id: string) {
  return apiData<BusinessListing | null>(`/admin/listings/${id}/suspend`, { method: "PATCH" });
}

export async function featureListing(id: string) {
  return apiData<BusinessListing | null>(`/admin/listings/${id}/feature`, { method: "PATCH" });
}

export async function unfeatureListing(id: string) {
  return apiData<BusinessListing | null>(`/admin/listings/${id}/unfeature`, { method: "PATCH" });
}

export async function setPremiumListing(id: string, isPremium = true) {
  return apiData<BusinessListing | null>(`/admin/listings/${id}/set-premium`, {
    method: "PATCH",
    body: JSON.stringify({ isPremium }),
  });
}