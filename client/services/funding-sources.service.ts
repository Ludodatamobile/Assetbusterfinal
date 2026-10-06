import {
  apiRequest,
  type ApiSuccessResponse,
} from "@/lib/api";

import type {
  CreateFundingSourcePayload,
  FundingSourceFilters,
  FundingSourceListing,
  UpdateFundingSourcePayload,
} from "@/types/funding-service";

import type { DealListItem } from "@/types/marketplace";

function toQuery(filters: FundingSourceFilters = {}) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });

  const query = params.toString();
  return query ? `?${query}` : "";
}

export class FundingSourcesService {
  static getFundingSources(filters: FundingSourceFilters = {}) {
    return apiRequest<ApiSuccessResponse<FundingSourceListing[]>>(
      `/funding-services${toQuery(filters)}`,
    );
  }

  static getFundingSourceBySlug(slug: string) {
    return apiRequest<ApiSuccessResponse<FundingSourceListing>>(
      `/funding-services/${encodeURIComponent(slug)}`,
    );
  }

  static createFundingSource(
    token: string | null | undefined,
    payload: CreateFundingSourcePayload,
  ) {
    return apiRequest<ApiSuccessResponse<FundingSourceListing>>(
      "/funding-services",
      {
        method: "POST",
        token,
        body: payload,
      },
    );
  }

  static updateFundingSource(
    token: string | null | undefined,
    id: string,
    payload: UpdateFundingSourcePayload,
  ) {
    return apiRequest<ApiSuccessResponse<FundingSourceListing>>(
      `/funding-services/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        token,
        body: payload,
      },
    );
  }

  static submitFundingSource(
    token: string | null | undefined,
    id: string,
  ) {
    return apiRequest<ApiSuccessResponse<FundingSourceListing>>(
      `/funding-services/${encodeURIComponent(id)}/submit`,
      {
        method: "POST",
        token,
      },
    );
  }

  static deleteFundingSource(
    token: string | null | undefined,
    id: string,
  ) {
    return apiRequest<ApiSuccessResponse<{ id: string }>>(
      `/funding-services/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
        token,
      },
    );
  }

  static enquire(
    token: string | null | undefined,
    fundingServiceId: string,
    message: string,
  ) {
    return apiRequest<ApiSuccessResponse<{ deal: DealListItem }>>(
      `/funding-services/${encodeURIComponent(fundingServiceId)}/enquire`,
      {
        method: "POST",
        token,
        body: { message },
      },
    );
  }

  // Compatibility aliases for code using the older names.
  static getFundingServices = FundingSourcesService.getFundingSources;
  static getFundingServiceBySlug =
    FundingSourcesService.getFundingSourceBySlug;
  static createFundingService =
    FundingSourcesService.createFundingSource;
  static updateFundingService =
    FundingSourcesService.updateFundingSource;
  static submitFundingService =
    FundingSourcesService.submitFundingSource;
  static deleteFundingService =
    FundingSourcesService.deleteFundingSource;
}

export const FundingServiceService = FundingSourcesService;