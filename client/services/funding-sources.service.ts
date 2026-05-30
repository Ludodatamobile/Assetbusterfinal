import type {
  ApiSuccessResponse,
  CreateFundingSourcePayload,
  FundingSourceFilters,
  FundingSourceListing,
  UpdateFundingSourcePayload,
} from "@/types/funding-service";

const rawBase =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:5000/api/v1";

const normalizedBase = rawBase.replace(/\/$/, "");
const API_BASE_URL = normalizedBase.endsWith("/api/v1")
  ? normalizedBase
  : `${normalizedBase}/api/v1`;

function toQuery(params: Record<string, unknown>) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });

  const text = query.toString();
  return text ? `?${text}` : "";
}

async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<ApiSuccessResponse<T>> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
    },
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok || payload?.success === false) {
    throw new Error(
      payload?.error ||
        payload?.message ||
        `Request failed with status ${response.status}`,
    );
  }

  return payload as ApiSuccessResponse<T>;
}

function authHeaders(accessToken?: string | null) {
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

export class FundingSourcesService {
  static getFundingSources(filters: FundingSourceFilters = {}) {
    const params = {
      ...filters,
      sortBy: filters.sortBy === "ticketMax" ? "askAmount" : filters.sortBy,
    };

    return apiRequest<FundingSourceListing[]>(
      `/funding-services${toQuery(params)}`,
    );
  }

  static getFundingSourceBySlug(slug: string) {
    return apiRequest<FundingSourceListing>(
      `/funding-services/${encodeURIComponent(slug)}`,
    );
  }

  static createFundingSource(
    accessToken: string | null | undefined,
    payload: CreateFundingSourcePayload,
  ) {
    return apiRequest<FundingSourceListing>("/funding-services", {
      method: "POST",
      headers: authHeaders(accessToken),
      body: JSON.stringify(payload),
    });
  }

  static updateFundingSource(
    accessToken: string | null | undefined,
    id: string,
    payload: UpdateFundingSourcePayload,
  ) {
    return apiRequest<FundingSourceListing>(`/funding-services/${id}`, {
      method: "PATCH",
      headers: authHeaders(accessToken),
      body: JSON.stringify(payload),
    });
  }

  static submitFundingSource(accessToken: string | null | undefined, id: string) {
    return apiRequest<FundingSourceListing>(`/funding-services/${id}/submit`, {
      method: "POST",
      headers: authHeaders(accessToken),
    });
  }

  static deleteFundingSource(accessToken: string | null | undefined, id: string) {
    return apiRequest<{ id: string }>(`/funding-services/${id}`, {
      method: "DELETE",
      headers: authHeaders(accessToken),
    });
  }

  /* Backwards-compatible method names. */
  static getFundingServices = FundingSourcesService.getFundingSources;
  static getFundingServiceBySlug = FundingSourcesService.getFundingSourceBySlug;
  static createFundingService = FundingSourcesService.createFundingSource;
  static updateFundingService = FundingSourcesService.updateFundingSource;
  static submitFundingService = FundingSourcesService.submitFundingSource;
  static deleteFundingService = FundingSourcesService.deleteFundingSource;
}