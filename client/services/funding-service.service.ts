import { apiRequest, type ApiSuccessResponse } from "@/lib/api";
import type {
  CreateFundingServicePayload,
  FundingServiceFilters,
  FundingServiceListing,
} from "@/types/funding-service";
import type { DealListItem } from "@/types/marketplace";

function toQuery(filters: FundingServiceFilters = {}) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });

  const query = params.toString();
  return query ? `?${query}` : "";
}

export const FundingServiceService = {
  getFundingServices(filters?: FundingServiceFilters) {
    return apiRequest<ApiSuccessResponse<FundingServiceListing[]>>(
      `/funding-services${toQuery(filters)}`
    );
  },

  getFundingService(slug: string) {
    return apiRequest<ApiSuccessResponse<FundingServiceListing>>(
      `/funding-services/${slug}`
    );
  },

  createFundingService(
    token: string | null | undefined,
    payload: CreateFundingServicePayload
  ) {
    return apiRequest<ApiSuccessResponse<FundingServiceListing>>(
      "/funding-services",
      {
        method: "POST",
        token,
        body: payload,
      }
    );
  },

  submitFundingService(token: string | null | undefined, id: string) {
    return apiRequest<ApiSuccessResponse<FundingServiceListing>>(
      `/funding-services/${id}/submit`,
      {
        method: "POST",
        token,
      }
    );
  },

  deleteFundingService(token: string | null | undefined, id: string) {
    return apiRequest<ApiSuccessResponse<{ id: string }>>(
      `/funding-services/${id}`,
      {
        method: "DELETE",
        token,
      }
    );
  },

  enquire(token: string | null | undefined, fundingServiceId: string, message: string) {
    return apiRequest<ApiSuccessResponse<{ deal: DealListItem }>>(
      `/funding-services/${fundingServiceId}/enquire`,
      {
        method: "POST",
        token,
        body: { message },
      }
    );
  },
};