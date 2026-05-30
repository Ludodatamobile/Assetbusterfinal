import { apiRequest, apiUpload, type ApiSuccessResponse } from '@/lib/api'
import type { User } from '@/types/auth'
import type {
  BusinessListing,
  DashboardPayload,
  DealDetail,
  DealListItem,
  DealStatus,
  DealType,
  DocumentUploadPayload,
  MarketplaceConversation,
  MarketplaceMessage,
  ProfileType,
} from '@/types/marketplace'

export interface ProfileDraft {
  type: ProfileType
  title: string
  country: string
  industry: string
  investmentRange: string
  description: string

  city?: string
  dealType?: DealType
  currency?: string
  askAmount?: string | number
  askPercent?: string | number
  askRate?: string | number
  runSales?: string | number
  ebitda?: string | number
  ebitdaMargin?: string | number
  employees?: string | number
  established?: string | number
  outlets?: string | number

  businessName?: string
  legalEntityName?: string
  website?: string
  headline?: string
  shortSummary?: string

  grossRevenue?: string | number
  netProfit?: string | number
  monthlyRevenue?: string | number
  monthlyProfit?: string | number
  inventoryValue?: string | number
  assetValue?: string | number
  realEstateValue?: string | number

  askingPriceReason?: string
  valuationMethod?: string
  businessModel?: string
  productsServices?: string
  customerBase?: string
  keyClients?: string
  growthOpportunities?: string
  competitiveAdvantages?: string
  facilities?: string
  leaseTerms?: string

  reasonForSelling?: string
  assetsIncluded?: string
  sellerFinancing?: boolean
  transitionSupport?: string
  trainingIncluded?: boolean
  preferredBuyerType?: string
  dealStructureNotes?: string

  isConfidential?: boolean
  ndaRequired?: boolean
  teaserSummary?: string
  financialsAvailable?: boolean
  dataRoomReady?: boolean
}

export interface AccountUpdatePayload {
  firstName?: string
  lastName?: string
  phone?: string | null
  country?: string | null
}

export interface CreateDealPayload {
  businessId: string
  message: string
}

export interface UpdateDealStatusPayload {
  status: DealStatus
  notes?: string
}

const splitList = (value: string) =>
  value
    .split(/[,/]/)
    .map((item) => item.trim())
    .filter(Boolean)

const detectCurrency = (value: string) => {
  const upper = value.toUpperCase()
  if (upper.includes('NGN')) return 'NGN'
  if (upper.includes('GBP')) return 'GBP'
  if (upper.includes('EUR')) return 'EUR'
  if (upper.includes('USD') || value.includes('$')) return 'USD'
  return 'USD'
}

const amountTokenToNumber = (token: string) => {
  const clean = token.replace(/,/g, '').trim()
  const match = clean.match(/(\d+(?:\.\d+)?)\s*(BN|B|MN|M|K)?/i)
  if (!match) return 100000

  const value = Number(match[1])
  const suffix = match[2]?.toUpperCase()

  if (suffix === 'BN' || suffix === 'B') return value * 1_000_000_000
  if (suffix === 'MN' || suffix === 'M') return value * 1_000_000
  if (suffix === 'K') return value * 1_000
  return value
}

const parseRange = (range: string) => {
  const parts = range
    .split(/-|to/i)
    .map((part) => part.trim())
    .filter(Boolean)

  const min = amountTokenToNumber(parts[0] || range)
  const max = amountTokenToNumber(parts[1] || parts[0] || range)

  return {
    minTicket: Math.min(min, max),
    maxTicket: Math.max(min, max),
    askAmount: Math.max(min, max),
    currency: detectCurrency(range),
  }
}

const ensureDescription = (description: string, title: string) => {
  const trimmed = description.trim()
  if (trimmed.length >= 10) return trimmed
  return `${title} profile created from the user dashboard.`
}

const optionalText = (value?: string | null) => {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

const optionalNumber = (value?: string | number | null) => {
  if (value === undefined || value === null || value === '') return undefined
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : undefined
}

const cleanPayload = <T extends Record<string, unknown>>(payload: T) => {
  Object.keys(payload).forEach((key) => {
    const value = payload[key]
    if (value === undefined || value === '') delete payload[key]
  })
  return payload
}

const defaultDealType = (type: ProfileType): DealType => {
  if (type === 'RAISE_CAPITAL') return 'INVESTMENT'
  if (type === 'FRANCHISE_BRAND') return 'INVESTMENT'
  return 'FULL_SALE'
}

export const DashboardService = {
  getDashboard(token?: string | null) {
    return apiRequest<ApiSuccessResponse<DashboardPayload>>('/users/me/dashboard-stats', {
      token,
    })
  },

  updateAccount(token: string | null | undefined, payload: AccountUpdatePayload) {
    return apiRequest<ApiSuccessResponse<User>>('/users/me', {
      method: 'PATCH',
      token,
      body: payload,
    })
  },

  createProfile(token: string | null | undefined, draft: ProfileDraft) {
    const range = parseRange(draft.investmentRange)
    const countries = splitList(draft.country).length
      ? splitList(draft.country)
      : [draft.country]
    const industries = splitList(draft.industry).length
      ? splitList(draft.industry)
      : [draft.industry]

    if (draft.type === 'BUY_BUSINESS' || draft.type === 'INVEST') {
      return apiRequest<ApiSuccessResponse<{ profile: unknown }>>('/investors', {
        method: 'POST',
        token,
        body: {
          profileType: draft.type,
          title: draft.title,
          investorType:
            draft.type === 'BUY_BUSINESS' ? 'Strategic Buyer' : 'Angel Investor',
          bio: ensureDescription(draft.description, draft.title),
          currency: optionalText(draft.currency) || range.currency,
          minTicket: range.minTicket,
          maxTicket: range.maxTicket,
          industries,
          countries,
          dealTypes:
            draft.type === 'BUY_BUSINESS'
              ? ['FULL_SALE', 'PARTIAL_STAKE']
              : ['INVESTMENT'],
        },
      })
    }

    if (draft.type === 'ADVISOR') {
      return apiRequest<ApiSuccessResponse<{ profile: unknown }>>('/advisors', {
        method: 'POST',
        token,
        body: {
          title: draft.title,
          firmName: optionalText(draft.businessName) || draft.title,
          specialties: industries,
          countries,
          bio: ensureDescription(draft.description, draft.title),
        },
      })
    }

    const askAmount = optionalNumber(draft.askAmount) ?? range.askAmount
    const currency = (optionalText(draft.currency) || range.currency || 'USD').toUpperCase()

    return apiRequest<ApiSuccessResponse<{ listing: BusinessListing }>>('/businesses', {
      method: 'POST',
      token,
      body: cleanPayload({
        profileType: draft.type,
        title: draft.title,
        description: ensureDescription(draft.description, draft.title),
        industry: draft.industry,
        country: countries[0] || draft.country,
        city: optionalText(draft.city),
        dealType: draft.dealType || defaultDealType(draft.type),
        currency,
        askAmount,

        askPercent: optionalNumber(draft.askPercent),
        askRate: optionalNumber(draft.askRate),
        runSales: optionalNumber(draft.runSales),
        ebitda: optionalNumber(draft.ebitda),
        ebitdaMargin: optionalNumber(draft.ebitdaMargin),
        employees: optionalNumber(draft.employees),
        established: optionalNumber(draft.established),
        outlets: optionalNumber(draft.outlets),

        businessName: optionalText(draft.businessName),
        legalEntityName: optionalText(draft.legalEntityName),
        website: optionalText(draft.website),
        headline: optionalText(draft.headline),
        shortSummary: optionalText(draft.shortSummary),

        grossRevenue: optionalNumber(draft.grossRevenue),
        netProfit: optionalNumber(draft.netProfit),
        monthlyRevenue: optionalNumber(draft.monthlyRevenue),
        monthlyProfit: optionalNumber(draft.monthlyProfit),
        inventoryValue: optionalNumber(draft.inventoryValue),
        assetValue: optionalNumber(draft.assetValue),
        realEstateValue: optionalNumber(draft.realEstateValue),

        askingPriceReason: optionalText(draft.askingPriceReason),
        valuationMethod: optionalText(draft.valuationMethod),
        businessModel: optionalText(draft.businessModel),
        productsServices: optionalText(draft.productsServices),
        customerBase: optionalText(draft.customerBase),
        keyClients: optionalText(draft.keyClients),
        growthOpportunities: optionalText(draft.growthOpportunities),
        competitiveAdvantages: optionalText(draft.competitiveAdvantages),
        facilities: optionalText(draft.facilities),
        leaseTerms: optionalText(draft.leaseTerms),

        reasonForSelling: optionalText(draft.reasonForSelling),
        assetsIncluded: optionalText(draft.assetsIncluded),
        sellerFinancing: Boolean(draft.sellerFinancing),
        transitionSupport: optionalText(draft.transitionSupport),
        trainingIncluded: Boolean(draft.trainingIncluded),
        preferredBuyerType: optionalText(draft.preferredBuyerType),
        dealStructureNotes: optionalText(draft.dealStructureNotes),

        isConfidential: draft.isConfidential ?? true,
        ndaRequired: draft.ndaRequired ?? true,
        teaserSummary: optionalText(draft.teaserSummary),
        financialsAvailable: Boolean(draft.financialsAvailable),
        dataRoomReady: Boolean(draft.dataRoomReady),
      }),
    })
  },

  getMyListings(token?: string | null) {
    return apiRequest<ApiSuccessResponse<BusinessListing[]>>('/businesses/mine', {
      token,
    })
  },

  submitListingForReview(token: string | null | undefined, listingId: string) {
    return apiRequest<ApiSuccessResponse<{ listing: BusinessListing }>>(
      `/businesses/${listingId}/submit-for-review`,
      {
        method: 'POST',
        token,
      },
    )
  },

  deleteListing(token: string | null | undefined, listingId: string) {
    return apiRequest<void>(`/businesses/${listingId}`, {
      method: 'DELETE',
      token,
    })
  },

  createDeal(token: string | null | undefined, payload: CreateDealPayload) {
    return apiRequest<ApiSuccessResponse<{ deal: DealListItem }>>('/deals', {
      method: 'POST',
      token,
      body: payload,
    })
  },

  getMyDeals(token?: string | null) {
    return apiRequest<ApiSuccessResponse<DealListItem[]>>('/deals', {
      token,
    })
  },

  getDealById(token: string | null | undefined, dealId: string) {
    return apiRequest<ApiSuccessResponse<{ deal: DealDetail }>>(`/deals/${dealId}`, {
      token,
    })
  },

  updateDealStatus(
    token: string | null | undefined,
    dealId: string,
    payload: UpdateDealStatusPayload,
  ) {
    return apiRequest<ApiSuccessResponse<{ deal: DealListItem }>>(
      `/deals/${dealId}/status`,
      {
        method: 'PATCH',
        token,
        body: payload,
      },
    )
  },

  signNda(token: string | null | undefined, dealId: string) {
    return apiRequest<ApiSuccessResponse<{ deal: DealListItem }>>(
      `/deals/${dealId}/sign-nda`,
      {
        method: 'POST',
        token,
        body: { agreed: true },
      },
    )
  },

  withdrawDeal(token: string | null | undefined, dealId: string) {
    return apiRequest<ApiSuccessResponse<{ deal: DealListItem }>>(
      `/deals/${dealId}/withdraw`,
      {
        method: 'POST',
        token,
      },
    )
  },

  getConversations(token?: string | null) {
    return apiRequest<ApiSuccessResponse<MarketplaceConversation[]>>(
      '/messages/conversations',
      {
        token,
      },
    )
  },

  getDealMessages(token: string | null | undefined, dealId: string) {
    return apiRequest<ApiSuccessResponse<MarketplaceMessage[]>>(
      `/messages/deals/${dealId}`,
      {
        token,
      },
    )
  },

  sendMessage(token: string | null | undefined, dealId: string, content: string) {
    return apiRequest<ApiSuccessResponse<{ message: MarketplaceMessage }>>(
      `/messages/deals/${dealId}`,
      {
        method: 'POST',
        token,
        body: { content },
      },
    )
  },

  markMessagesRead(token: string | null | undefined, dealId: string) {
    return apiRequest<ApiSuccessResponse<null>>(`/messages/deals/${dealId}/read`, {
      method: 'PATCH',
      token,
    })
  },

  getUnreadMessageCount(token?: string | null) {
    return apiRequest<ApiSuccessResponse<{ unreadCount: number }>>(
      '/messages/unread-count',
      {
        token,
      },
    )
  },

  getMyDocuments(token?: string | null) {
    return apiRequest<ApiSuccessResponse<DocumentUploadPayload[]>>('/documents/mine', {
      token,
    })
  },

  uploadDocument(
    token: string | null | undefined,
    payload: {
      file: File
      businessId?: string
      dealId?: string
      type?: string
      access?: 'PUBLIC_TEASER' | 'DATA_ROOM' | 'RESTRICTED'
      isNda?: boolean
    },
  ) {
    const formData = new FormData()
    formData.append('file', payload.file)

    if (payload.businessId) formData.append('businessId', payload.businessId)
    if (payload.dealId) formData.append('dealId', payload.dealId)
    if (payload.type) formData.append('type', payload.type)
    if (payload.access) formData.append('access', payload.access)
    if (payload.isNda !== undefined) formData.append('isNda', String(payload.isNda))

    return apiUpload<ApiSuccessResponse<{ document: DocumentUploadPayload }>>(
      '/documents/upload',
      formData,
      token,
    )
  },

  deleteDocument(token: string | null | undefined, documentId: string) {
    return apiRequest<void>(`/documents/${documentId}`, {
      method: 'DELETE',
      token,
    })
  },
}