import { apiRequest, type ApiSuccessResponse } from "@/lib/api";
import type {
  CreateFundraiserPayload,
  FundraiserFilters,
  FundraiserListing,
} from "@/types/fundraiser";

function toQuery(filters: FundraiserFilters = {}) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });

  const query = params.toString();
  return query ? `?${query}` : "";
}

export const FundraiserService = {
  getFundraisers(filters?: FundraiserFilters) {
    return apiRequest<ApiSuccessResponse<FundraiserListing[]>>(
      `/fundraisers${toQuery(filters)}`
    );
  },

  getFundraiser(slug: string) {
    return apiRequest<ApiSuccessResponse<FundraiserListing>>(
      `/fundraisers/${slug}`
    );
  },

  createFundraiser(
    token: string | null | undefined,
    payload: CreateFundraiserPayload
  ) {
    return apiRequest<ApiSuccessResponse<FundraiserListing>>("/fundraisers", {
      method: "POST",
      token,
      body: payload,
    });
  },

  updateFundraiser(
    token: string | null | undefined,
    id: string,
    payload: Partial<CreateFundraiserPayload>
  ) {
    return apiRequest<ApiSuccessResponse<FundraiserListing>>(
      `/fundraisers/${id}`,
      {
        method: "PATCH",
        token,
        body: payload,
      }
    );
  },

  submitFundraiser(token: string | null | undefined, id: string) {
    return apiRequest<ApiSuccessResponse<FundraiserListing>>(
      `/fundraisers/${id}/submit`,
      {
        method: "POST",
        token,
      }
    );
  },

  deleteFundraiser(token: string | null | undefined, id: string) {
    return apiRequest<ApiSuccessResponse<{ id: string }>>(
      `/fundraisers/${id}`,
      {
        method: "DELETE",
        token,
      }
    );
  },
};