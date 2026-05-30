import { apiRequest, type ApiSuccessResponse } from "@/lib/api";
import type {
  CreateStartupPayload,
  StartupFilters,
  StartupListing,
} from "@/types/startup";

type QueryValue = string | number | boolean | undefined | null;

const buildQuery = (params: Record<string, QueryValue>) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

export const StartupService = {
  getStartups(params: StartupFilters = {}) {
    return apiRequest<ApiSuccessResponse<StartupListing[]>>(
      `/startups${buildQuery({
        limit: 12,
        sortBy: "featured",
        ...params,
      })}`,
    );
  },

  getStartupBySlug(slug: string) {
    return apiRequest<ApiSuccessResponse<StartupListing>>(`/startups/${slug}`);
  },

  createStartup(token: string | null | undefined, payload: CreateStartupPayload) {
    return apiRequest<ApiSuccessResponse<StartupListing>>("/startups", {
      method: "POST",
      token,
      body: payload,
    });
  },

  updateStartup(
    token: string | null | undefined,
    id: string,
    payload: Partial<CreateStartupPayload>,
  ) {
    return apiRequest<ApiSuccessResponse<StartupListing>>(`/startups/${id}`, {
      method: "PATCH",
      token,
      body: payload,
    });
  },

  submitStartup(token: string | null | undefined, id: string) {
    return apiRequest<ApiSuccessResponse<StartupListing>>(
      `/startups/${id}/submit`,
      {
        method: "POST",
        token,
      },
    );
  },

  deleteStartup(token: string | null | undefined, id: string) {
    return apiRequest<ApiSuccessResponse<{ id: string }>>(`/startups/${id}`, {
      method: "DELETE",
      token,
    });
  },
};