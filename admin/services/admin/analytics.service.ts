import { apiData } from "@/lib/api";
import type { ActivityItem, AnalyticsOverview } from "@/types/admin";

export async function getAnalyticsOverview() {
  return apiData<AnalyticsOverview>("/admin/analytics/overview");
}

export async function getRecentActivity() {
  return apiData<ActivityItem[]>("/admin/analytics/recent-activity");
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