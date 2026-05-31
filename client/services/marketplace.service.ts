import { apiRequest, type ApiSuccessResponse } from '@/lib/api'
import type {
  AdvisorProfile,
  BusinessListing,
  DealListItem,
  InvestorProfile,
} from '@/types/marketplace'

type QueryValue = string | number | boolean | undefined | null

const buildQuery = (params: Record<string, QueryValue>) => {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value))
    }
  })

  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

export const MarketplaceService = {
  getBusinesses(params: Record<string, QueryValue> = {}) {
    return apiRequest<ApiSuccessResponse<BusinessListing[]>>(
      `/businesses${buildQuery({
        limit: 12,
        sortBy: 'featured',
        ...params,
      })}`,
    )
  },

  getBusinessById(id: string) {
    return apiRequest<ApiSuccessResponse<{ listing: BusinessListing } | { business: BusinessListing } | BusinessListing>>(
      `/businesses/${id}`,
    )
  },

  getBusinessBySlug(slug: string) {
    return apiRequest<ApiSuccessResponse<{ listing: BusinessListing } | { business: BusinessListing } | BusinessListing>>(
      `/businesses/slug/${slug}`,
    )
  },

  getSimilarBusinesses(id: string) {
    return apiRequest<ApiSuccessResponse<BusinessListing[]>>(
      `/businesses/${id}/similar`,
    )
  },

  getFranchises(params: Record<string, QueryValue> = {}) {
    return apiRequest<ApiSuccessResponse<BusinessListing[]>>(
      `/businesses${buildQuery({
        limit: 12,
        sortBy: 'featured',
        profileType: 'FRANCHISE_BRAND',
        ...params,
      })}`,
    )
  },

  getCapitalRaises(params: Record<string, QueryValue> = {}) {
    return apiRequest<ApiSuccessResponse<BusinessListing[]>>(
      `/businesses${buildQuery({
        limit: 12,
        sortBy: 'featured',
        profileType: 'RAISE_CAPITAL',
        ...params,
      })}`,
    )
  },

  getInvestors(params: Record<string, QueryValue> = {}) {
    return apiRequest<ApiSuccessResponse<InvestorProfile[]>>(
      `/investors${buildQuery({
        limit: 12,
        ...params,
      })}`,
    )
  },

  getInvestorById(id: string) {
    return apiRequest<ApiSuccessResponse<{ investor: InvestorProfile }>>(
      `/investors/${id}`,
    )
  },

  getInvestorBySlug(slug: string) {
    return apiRequest<ApiSuccessResponse<{ investor: InvestorProfile }>>(
      `/investors/${slug}`,
    )
  },

  getAdvisors(params: Record<string, QueryValue> = {}) {
    return apiRequest<ApiSuccessResponse<AdvisorProfile[]>>(
      `/advisors${buildQuery({
        limit: 12,
        ...params,
      })}`,
    )
  },

  getAdvisorById(id: string) {
    return apiRequest<ApiSuccessResponse<{ advisor: AdvisorProfile }>>(
      `/advisors/${id}`,
    )
  },

  enquire(token: string | null | undefined, businessId: string, message: string) {
    return apiRequest<ApiSuccessResponse<{ deal: DealListItem }>>('/deals', {
      method: 'POST',
      token,
      body: {
        businessId,
        message,
      },
    })
  },

  enquireInvestor(
    token: string | null | undefined,
    investorProfileId: string,
    message: string,
    businessId?: string,
  ) {
    return apiRequest<ApiSuccessResponse<{ deal: DealListItem }>>(
      `/deals/investors/${investorProfileId}`,
      {
        method: 'POST',
        token,
        body: {
          businessId,
          message,
        },
      },
    )
  },

  contactInvestor(
    token: string | null | undefined,
    investorProfileId: string,
    businessId: string,
    message: string,
  ) {
    return apiRequest<ApiSuccessResponse<{ deal: DealListItem }>>(
      `/deals/investors/${investorProfileId}`,
      {
        method: 'POST',
        token,
        body: {
          businessId,
          message,
        },
      },
    )
  },

  saveBusiness(token: string | null | undefined, businessId: string) {
    return apiRequest<ApiSuccessResponse<{ saved: boolean }>>(
      `/users/me/saved/${businessId}`,
      {
        method: 'POST',
        token,
      },
    )
  },
}