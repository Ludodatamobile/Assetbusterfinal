import slugify from 'slugify'
import { v4 as uuid } from 'uuid'
import { prisma } from '../../config/prisma.js'
import { ApiError } from '../../utils/ApiError.js'
import {
  getPaginationParams,
  buildPaginationMeta,
} from '../../utils/pagination.js'
import type {
  CreateBusinessInput,
  UpdateBusinessInput,
  BusinessQueryInput,
} from './business.schema.js'

const makeSlug = (title: string) => {
  const base = slugify(title, { lower: true, strict: true }) || 'listing'
  return `${base}-${uuid().slice(0, 6)}`
}

const textOrUndefined = (value: unknown) => {
  if (value === undefined || value === null) return undefined
  if (typeof value !== 'string') return String(value)
  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

const numberOrUndefined = (value: unknown) => {
  if (value === undefined || value === null || value === '') return undefined
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : undefined
}

const intOrUndefined = (value: unknown) => {
  const numeric = numberOrUndefined(value)
  return numeric === undefined ? undefined : Math.trunc(numeric)
}

const booleanOrUndefined = (value: unknown) => {
  if (value === undefined || value === null || value === '') return undefined
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') return true
    if (value.toLowerCase() === 'false') return false
  }
  return Boolean(value)
}

const removeUndefined = <T extends Record<string, unknown>>(value: T) => {
  Object.keys(value).forEach((key) => {
    if (value[key] === undefined) delete value[key]
  })
  return value
}

const buildBusinessProfileData = (
  data: CreateBusinessInput | UpdateBusinessInput,
  defaults = false,
) => removeUndefined({
  profileType: data.profileType || (defaults ? 'SELL_BUSINESS' : undefined),
  title: textOrUndefined(data.title),
  description: textOrUndefined(data.description),
  industry: textOrUndefined(data.industry),
  country: textOrUndefined(data.country),
  city: textOrUndefined(data.city),
  dealType: data.dealType || (defaults ? 'FULL_SALE' : undefined),
  currency: data.currency ? String(data.currency).toUpperCase() : defaults ? 'USD' : undefined,
  askAmount: numberOrUndefined(data.askAmount),

  askPercent: numberOrUndefined(data.askPercent),
  askRate: numberOrUndefined(data.askRate),
  runSales: numberOrUndefined(data.runSales),
  ebitda: numberOrUndefined(data.ebitda),
  ebitdaMargin: numberOrUndefined(data.ebitdaMargin),
  employees: intOrUndefined(data.employees),
  established: intOrUndefined(data.established),
  outlets: intOrUndefined(data.outlets),

  businessName: textOrUndefined(data.businessName),
  legalEntityName: textOrUndefined(data.legalEntityName),
  website: textOrUndefined(data.website),
  headline: textOrUndefined(data.headline),
  shortSummary: textOrUndefined(data.shortSummary),

  grossRevenue: numberOrUndefined(data.grossRevenue),
  netProfit: numberOrUndefined(data.netProfit),
  monthlyRevenue: numberOrUndefined(data.monthlyRevenue),
  monthlyProfit: numberOrUndefined(data.monthlyProfit),
  inventoryValue: numberOrUndefined(data.inventoryValue),
  assetValue: numberOrUndefined(data.assetValue),
  realEstateValue: numberOrUndefined(data.realEstateValue),

  askingPriceReason: textOrUndefined(data.askingPriceReason),
  valuationMethod: textOrUndefined(data.valuationMethod),
  businessModel: textOrUndefined(data.businessModel),
  productsServices: textOrUndefined(data.productsServices),
  customerBase: textOrUndefined(data.customerBase),
  keyClients: textOrUndefined(data.keyClients),
  growthOpportunities: textOrUndefined(data.growthOpportunities),
  competitiveAdvantages: textOrUndefined(data.competitiveAdvantages),
  facilities: textOrUndefined(data.facilities),
  leaseTerms: textOrUndefined(data.leaseTerms),

  reasonForSelling: textOrUndefined(data.reasonForSelling),
  assetsIncluded: textOrUndefined(data.assetsIncluded),
  sellerFinancing: booleanOrUndefined(data.sellerFinancing) ?? (defaults ? false : undefined),
  transitionSupport: textOrUndefined(data.transitionSupport),
  trainingIncluded: booleanOrUndefined(data.trainingIncluded) ?? (defaults ? false : undefined),
  preferredBuyerType: textOrUndefined(data.preferredBuyerType),
  dealStructureNotes: textOrUndefined(data.dealStructureNotes),

  isConfidential: booleanOrUndefined(data.isConfidential) ?? (defaults ? true : undefined),
  ndaRequired: booleanOrUndefined(data.ndaRequired) ?? (defaults ? true : undefined),
  teaserSummary: textOrUndefined(data.teaserSummary),
  financialsAvailable: booleanOrUndefined(data.financialsAvailable) ?? (defaults ? false : undefined),
  dataRoomReady: booleanOrUndefined(data.dataRoomReady) ?? (defaults ? false : undefined),
})

const listingSelect = {
  id: true,
  userId: true,
  title: true,
  slug: true,
  profileType: true,
  description: true,
  industry: true,
  country: true,
  city: true,
  dealType: true,
  currency: true,
  askAmount: true,
  askPercent: true,
  askRate: true,
  runSales: true,
  ebitda: true,
  ebitdaMargin: true,
  employees: true,
  established: true,
  outlets: true,

  businessName: true,
  legalEntityName: true,
  website: true,
  headline: true,
  shortSummary: true,

  grossRevenue: true,
  netProfit: true,
  monthlyRevenue: true,
  monthlyProfit: true,
  inventoryValue: true,
  assetValue: true,
  realEstateValue: true,

  askingPriceReason: true,
  valuationMethod: true,
  businessModel: true,
  productsServices: true,
  customerBase: true,
  keyClients: true,
  growthOpportunities: true,
  competitiveAdvantages: true,
  facilities: true,
  leaseTerms: true,

  reasonForSelling: true,
  assetsIncluded: true,
  sellerFinancing: true,
  transitionSupport: true,
  trainingIncluded: true,
  preferredBuyerType: true,
  dealStructureNotes: true,

  isConfidential: true,
  ndaRequired: true,
  teaserSummary: true,
  financialsAvailable: true,
  dataRoomReady: true,

  isPremium: true,
  isFeatured: true,
  isVerified: true,
  rating: true,
  viewCount: true,
  enquiryCount: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      country: true,
      profileImage: true,
      verified: true,
    },
  },
} as const

const parseQuery = (query: BusinessQueryInput) => ({
  page: query.page,
  limit: query.limit,
  industry: query.industry?.trim(),
  country: query.country?.trim(),
  dealType: query.dealType?.trim(),
  profileType: query.profileType?.trim(),
  minAsk: query.minAsk,
  maxAsk: query.maxAsk,
  search: query.search?.trim(),
  verified: query.verified,
  premium: query.premium,
  featured: query.featured,
  sortBy: query.sortBy,
})

export const getPublicListings = async (rawQuery: BusinessQueryInput) => {
  const query = parseQuery(rawQuery)
  const { skip, take, page, limit } = getPaginationParams(
    query.page,
    query.limit,
  )

  const where: any = { status: 'ACTIVE' }

  if (query.industry)
    where.industry = { contains: query.industry, mode: 'insensitive' }
  if (query.country)
    where.country = { contains: query.country, mode: 'insensitive' }
  if (query.dealType) where.dealType = query.dealType
  if (query.profileType) where.profileType = query.profileType
  if (query.verified === 'true') where.isVerified = true
  if (query.premium === 'true') where.isPremium = true
  if (query.featured === 'true') where.isFeatured = true

  if (query.minAsk || query.maxAsk) {
    where.askAmount = {}
    if (query.minAsk) where.askAmount.gte = Number(query.minAsk)
    if (query.maxAsk) where.askAmount.lte = Number(query.maxAsk)
  }

  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: 'insensitive' } },
      { description: { contains: query.search, mode: 'insensitive' } },
      { industry: { contains: query.search, mode: 'insensitive' } },
      { country: { contains: query.search, mode: 'insensitive' } },
      { city: { contains: query.search, mode: 'insensitive' } },
      { businessName: { contains: query.search, mode: 'insensitive' } },
      { legalEntityName: { contains: query.search, mode: 'insensitive' } },
      { headline: { contains: query.search, mode: 'insensitive' } },
      { shortSummary: { contains: query.search, mode: 'insensitive' } },
      { productsServices: { contains: query.search, mode: 'insensitive' } },
      { customerBase: { contains: query.search, mode: 'insensitive' } },
      { growthOpportunities: { contains: query.search, mode: 'insensitive' } },
    ]
  }

  const orderBy: any =
    query.sortBy === 'rating'
      ? { rating: 'desc' }
      : query.sortBy === 'askAmount'
        ? { askAmount: 'asc' }
        : query.sortBy === 'featured'
          ? [{ isFeatured: 'desc' }, { updatedAt: 'desc' }]
          : { createdAt: 'desc' }

  const [listings, total] = await prisma.$transaction([
    prisma.businessProfile.findMany({
      where,
      skip,
      take,
      orderBy,
      select: listingSelect,
    }),
    prisma.businessProfile.count({ where }),
  ])

  return { listings, meta: buildPaginationMeta(total, page, limit) }
}

export const getListingBySlug = async (slug: string, _viewerId?: string) => {
  const listing = await prisma.businessProfile.findUnique({
    where: { slug },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          country: true,
          profileImage: true,
          verified: true,
        },
      },
      documents: {
        where: { access: 'PUBLIC_TEASER', status: 'VERIFIED' },
        orderBy: { createdAt: 'desc' },
      },
      _count: { select: { deals: true, savedBy: true, documents: true } },
    },
  })

  if (!listing || listing.status !== 'ACTIVE')
    throw ApiError.notFound('Listing not found.')

  prisma.businessProfile
    .update({
      where: { id: listing.id },
      data: { viewCount: { increment: 1 } },
    })
    .catch(() => undefined)

  return listing
}

export const createListing = async (
  userId: string,
  data: CreateBusinessInput,
) => {
  const slug = makeSlug(data.title)
  const payload = buildBusinessProfileData(data, true)

  const listing = await prisma.businessProfile.create({
    data: {
      ...payload,
      userId,
      slug,
      status: 'DRAFT',
    } as any,
  })

  await prisma.notification.create({
    data: {
      userId,
      title: 'Profile created',
      body: `${listing.title} has been saved as a draft.`,
      type: 'Profile',
      link:
        listing.profileType === 'RAISE_CAPITAL'
          ? '/dashboard?tab=fundraisers'
          : '/dashboard?tab=profiles',
    },
  })

  return listing
}

export const updateListing = async (
  userId: string,
  listingId: string,
  data: UpdateBusinessInput,
) => {
  const listing = await prisma.businessProfile.findUnique({
    where: { id: listingId },
  })

  if (!listing) throw ApiError.notFound('Listing not found.')
  if (listing.userId !== userId)
    throw ApiError.forbidden('You do not own this listing.')
  if (listing.status === 'CLOSED')
    throw ApiError.badRequest('Cannot update a closed listing.')

  return prisma.businessProfile.update({
    where: { id: listingId },
    data: buildBusinessProfileData(data) as any,
  })
}

export const deleteListing = async (userId: string, listingId: string) => {
  const listing = await prisma.businessProfile.findUnique({
    where: { id: listingId },
  })

  if (!listing) throw ApiError.notFound('Listing not found.')
  if (listing.userId !== userId)
    throw ApiError.forbidden('You do not own this listing.')

  await prisma.businessProfile.delete({ where: { id: listingId } })
}

export const getMyListings = async (userId: string) => {
  return prisma.businessProfile.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    include: {
      _count: { select: { deals: true, savedBy: true, documents: true } },
    },
  })
}

export const submitForReview = async (userId: string, listingId: string) => {
  const listing = await prisma.businessProfile.findUnique({
    where: { id: listingId },
  })

  if (!listing) throw ApiError.notFound('Listing not found.')
  if (listing.userId !== userId)
    throw ApiError.forbidden('You do not own this listing.')
  if (!['DRAFT', 'REJECTED'].includes(listing.status)) {
    throw ApiError.badRequest(
      'Only draft or rejected listings can be submitted for review.',
    )
  }

  return prisma.businessProfile.update({
    where: { id: listingId },
    data: { status: 'PENDING_REVIEW' },
  })
}

export const getSimilarListings = async (listingId: string) => {
  const ref = await prisma.businessProfile.findUnique({
    where: { id: listingId },
    select: { industry: true, country: true, profileType: true },
  })

  if (!ref) return []

  return prisma.businessProfile.findMany({
    where: {
      id: { not: listingId },
      status: 'ACTIVE',
      OR: [
        { industry: ref.industry },
        { country: ref.country },
        { profileType: ref.profileType },
      ],
    },
    take: 6,
    orderBy: [{ isFeatured: 'desc' }, { rating: 'desc' }],
    select: {
      id: true,
      title: true,
      slug: true,
      profileType: true,
      industry: true,
      country: true,
      city: true,
      currency: true,
      askAmount: true,
      dealType: true,
      isPremium: true,
      rating: true,
      headline: true,
      shortSummary: true,
      runSales: true,
      ebitda: true,
      netProfit: true,
      established: true,
      employees: true,
    },
  })
}