import { apiRequest, type ApiSuccessResponse } from "@/lib/api";

export type ImportedListing = {
  id: string;
  title: string;
  description: string | null;
  industry: string | null;
  country: string | null;
  city: string | null;
  currency: string;
  askingPrice: string | null;
  imageUrl: string | null;
  sourceUrl: string;
  sourceName: string;
  isFeatured: boolean;
  publishedAt: string | null;
  listingType: "IMPORTED";
};

type ImportedListingsResponse = ApiSuccessResponse<ImportedListing[]>;

export function getImportedListings(params: {
  page?: number;
  limit?: number;
  search?: string;
  industry?: string;
  country?: string;
} = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });

  const suffix = query.toString() ? `?${query.toString()}` : "";

  return apiRequest<ImportedListingsResponse>(
    `/catalog/imported-listings${suffix}`,
  );
}