import { apiData, apiRequest } from "@/lib/api";
import { toQueryString } from "@/lib/utils";
import type {
  AdminListParams,
  ApiEnvelope,
  AuditLog,
  BusinessListing,
  StatsRecord,
} from "@/types/admin";

export interface BroadcastCampaign {
  id: string;
  title: string;
  subject: string;
  body: string;
  audience: string;
  status:
    | "DRAFT"
    | "SCHEDULED"
    | "SENDING"
    | "SENT"
    | "FAILED"
    | "CANCELLED";
  scheduledAt?: string | null;
  sentAt?: string | null;
  recipientCount: number;
  failedCount: number;
  createdAt: string;
  admin?: {
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface CreateCampaignPayload {
  title: string;
  subject: string;
  body: string;
  audience: string;
  scheduledAt?: string;
}

export async function getContentStats() {
  return apiData<StatsRecord>("/admin/content/stats");
}

export async function getFeaturedListings() {
  return apiData<BusinessListing[]>(
    "/admin/content/featured-listings",
  );
}

export async function getFeaturedInvestors() {
  return apiData<Array<Record<string, unknown>>>(
    "/admin/content/featured-investors",
  );
}

export async function sendBroadcast(payload: {
  title: string;
  body: string;
  type?: string;
}) {
  return apiData<{ sent: number }>("/admin/content/broadcast", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getAuditLogs(
  params: AdminListParams = {},
) {
  return apiRequest<AuditLog[]>(
    `/admin/content/audit-logs${toQueryString(params)}`,
  ) as Promise<ApiEnvelope<AuditLog[]>>;
}

export async function createCampaign(
  payload: CreateCampaignPayload,
) {
  return apiData<BroadcastCampaign>(
    "/admin/content/campaigns",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function listCampaigns(
  params: AdminListParams = {},
) {
  return apiRequest<BroadcastCampaign[]>(
    `/admin/content/campaigns${toQueryString(params)}`,
  );
}

export async function cancelCampaign(id: string) {
  return apiData<null>(
    `/admin/content/campaigns/${id}`,
    {
      method: "DELETE",
    },
  );
}