import { prisma } from '../../config/prisma.js'
import { ApiError } from '../../utils/ApiError.js'
import { getPaginationParams, buildPaginationMeta } from '../../utils/pagination.js'
import type { UpdateProfileInput } from './user.schema.js'

const safeUser = (user: any) => {
  const {
    password,
    emailVerificationToken,
    emailVerificationExpires,
    passwordResetToken,
    passwordResetExpires,
    refreshTokens,
    ...safe
  } = user

  return safe
}

const toNumber = (value: unknown): number => {
  if (value === null || value === undefined) return 0
  return Number(value)
}

const formatMoney = (value: unknown, currency = 'USD') => {
  const amount = toNumber(value)
  if (!amount) return 'Not disclosed'

  const abs = Math.abs(amount)
  const suffix =
    abs >= 1_000_000_000 ? 'B' :
    abs >= 1_000_000 ? 'M' :
    abs >= 1_000 ? 'K' :
    ''

  const divisor =
    suffix === 'B' ? 1_000_000_000 :
    suffix === 'M' ? 1_000_000 :
    suffix === 'K' ? 1_000 :
    1

  const compact = amount / divisor
  const display = Number.isInteger(compact) ? compact.toFixed(0) : compact.toFixed(1)
  return `${currency} ${display}${suffix}`
}

const relativeTime = (date?: Date | string | null) => {
  if (!date) return 'Not available'

  const then = new Date(date).getTime()
  const diffMs = Date.now() - then
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diffMs < minute) return 'Just now'
  if (diffMs < hour) return `${Math.floor(diffMs / minute)}m ago`
  if (diffMs < day) return `${Math.floor(diffMs / hour)}h ago`
  return `${Math.floor(diffMs / day)}d ago`
}

const mapListingStatus = (status: string) => {
  if (status === 'ACTIVE') return 'Live'
  if (status === 'PENDING_REVIEW') return 'In Review'
  return 'Draft'
}

const completionFromFields = (fields: Array<unknown>) => {
  const completed = fields.filter((field) => {
    if (Array.isArray(field)) return field.length > 0
    return field !== null && field !== undefined && field !== ''
  }).length

  return Math.max(20, Math.round((completed / fields.length) * 100))
}

const profileTypeLabel = (type: string) =>
  type
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ')

const mapBusinessProfile = (profile: any) => ({
  id: profile.id,
  type: profile.profileType,
  title: profile.title,
  focus: profile.industry,
  country: [profile.city, profile.country].filter(Boolean).join(', ') || profile.country,
  status: mapListingStatus(profile.status),
  completion: completionFromFields([
    profile.title,
    profile.description,
    profile.industry,
    profile.country,
    profile.askAmount,
    profile.runSales,
    profile.ebitda ?? profile.ebitdaMargin,
    profile.employees,
  ]),
  enquiries: profile.enquiryCount ?? profile._count?.deals ?? 0,
  listings: 1,
  dealValue: formatMoney(profile.askAmount, profile.currency),
  lastActivity: relativeTime(profile.updatedAt),
  description: profile.description,
})

const mapInvestorProfile = (profile: any) => ({
  id: profile.id,
  type: profile.profileType,
  title: profile.title || profile.firmName || profile.investorType,
  focus: profile.industries?.join(', ') || profile.investorType,
  country: profile.countries?.join(' / ') || 'Global',
  status: profile.isVerified ? 'Live' : 'Draft',
  completion: completionFromFields([
    profile.title,
    profile.investorType,
    profile.bio,
    profile.minTicket,
    profile.maxTicket,
    profile.industries,
    profile.countries,
    profile.dealTypes,
  ]),
  enquiries: profile.dealsCount ?? 0,
  listings: 0,
  dealValue: `${formatMoney(profile.minTicket, profile.currency)} - ${formatMoney(profile.maxTicket, profile.currency)}`,
  lastActivity: relativeTime(profile.updatedAt),
  description: profile.bio || `${profile.investorType} mandate for ${profile.industries?.join(', ') || 'selected sectors'}.`,
})

const mapAdvisorProfile = (profile: any) => ({
  id: profile.id,
  type: 'ADVISOR',
  title: profile.title || profile.firmName || 'Advisor profile',
  focus: profile.specialties?.join(', ') || 'Advisory services',
  country: profile.countries?.join(' / ') || 'Global',
  status: profile.isVerified ? 'Live' : 'Draft',
  completion: completionFromFields([
    profile.title,
    profile.firmName,
    profile.bio,
    profile.specialties,
    profile.countries,
  ]),
  enquiries: profile.dealsCount ?? 0,
  listings: 0,
  dealValue: 'Advisory',
  lastActivity: relativeTime(profile.updatedAt),
  description: profile.bio || 'Advisory profile for M&A, valuation, due diligence, and transaction support.',
})

const dealProbability = (status: string) => {
  const map: Record<string, number> = {
    INQUIRY: 18,
    NDA_SENT: 30,
    NDA_SIGNED: 45,
    NEGOTIATION: 62,
    DUE_DILIGENCE: 78,
    CLOSED: 100,
    WITHDRAWN: 0,
  }

  return map[status] ?? 20
}

const mapDeal = (deal: any, userId: string) => {
  const counterparty = deal.initiatorId === userId ? deal.receiver : deal.initiator

  return {
    id: deal.id,
    company: deal.business?.title || 'Confidential business',
    sector: deal.business?.industry || 'Unknown',
    location: [deal.business?.city, deal.business?.country].filter(Boolean).join(', ') || 'Global',
    revenue: formatMoney(deal.business?.runSales, deal.business?.currency),
    ebitda: deal.business?.ebitda
      ? formatMoney(deal.business.ebitda, deal.business.currency)
      : deal.business?.ebitdaMargin
        ? `${deal.business.ebitdaMargin}%`
        : 'Not disclosed',
    valuation: formatMoney(deal.business?.askAmount, deal.business?.currency),
    stage: profileTypeLabel(deal.status),
    owner: [counterparty?.firstName, counterparty?.lastName].filter(Boolean).join(' ') || 'Counterparty',
    probability: dealProbability(deal.status),
    status: deal.status === 'DUE_DILIGENCE' || deal.status === 'NEGOTIATION' ? 'priority' : deal.status === 'WITHDRAWN' ? 'watch' : 'active',
    updated: relativeTime(deal.updatedAt),
  }
}

const mapNotificationActivity = (notification: any) => ({
  time: relativeTime(notification.createdAt),
  title: notification.title,
  detail: notification.body,
  type: notification.type || 'Activity',
})

const mapDocument = (doc: any) => ({
  id: doc.id,
  name: doc.name,
  type: doc.type,
  access: doc.access?.replaceAll('_', ' ') || 'Data Room',
  status: doc.status === 'VERIFIED' ? 'Verified' : 'Pending',
  url: doc.url,
  createdAt: doc.createdAt,
})

const mapPosting = (listing: any) => ({
  id: listing.id,
  title: listing.title,
  location: [listing.city, listing.country].filter(Boolean).join(', ') || listing.country,
  sector: listing.industry,
  value: formatMoney(listing.askAmount, listing.currency),
  tag:
    listing.profileType === 'FRANCHISE_BRAND' ? 'Franchise' :
    listing.profileType === 'RAISE_CAPITAL' ? 'Capital Raise' :
    listing.dealType === 'FULL_SALE' ? 'Sell-side' :
    'Marketplace',
  slug: listing.slug,
})

export const getMyProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      businessProfiles: {
        select: { id: true, title: true, status: true, slug: true, isPremium: true, profileType: true },
        orderBy: { updatedAt: 'desc' },
      },
      investorProfiles: {
        select: { id: true, title: true, firmName: true, investorType: true, isPremium: true, profileType: true },
        orderBy: { updatedAt: 'desc' },
      },
      advisorProfiles: {
        select: { id: true, title: true, firmName: true, specialties: true },
        orderBy: { updatedAt: 'desc' },
      },
      _count: {
        select: {
          dealsAsInitiator: true,
          dealsAsReceiver: true,
          savedBusinesses: true,
          notifications: true,
        },
      },
    },
  })

  if (!user) throw ApiError.notFound('User not found.')
  return safeUser(user)
}

export const updateProfile = async (userId: string, data: UpdateProfileInput) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data,
  })

  return safeUser(user)
}

export const updateAvatar = async (userId: string, avatarUrl: string) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { profileImage: avatarUrl },
  })

  return safeUser(user)
}

export const deleteMyAccount = async (userId: string) => {
  await prisma.user.delete({ where: { id: userId } })
}

export const getSavedBusinesses = async (userId: string, page?: string, limit?: string) => {
  const { skip, take, page: p, limit: l } = getPaginationParams(page, limit)

  const [items, total] = await prisma.$transaction([
    prisma.savedBusiness.findMany({
      where: { userId },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        business: {
          select: {
            id: true,
            title: true,
            slug: true,
            industry: true,
            country: true,
            city: true,
            askAmount: true,
            currency: true,
            dealType: true,
            status: true,
            isPremium: true,
            isFeatured: true,
            rating: true,
          },
        },
      },
    }),
    prisma.savedBusiness.count({ where: { userId } }),
  ])

  return { items, meta: buildPaginationMeta(total, p, l) }
}

export const saveBusinessToggle = async (userId: string, businessId: string) => {
  const business = await prisma.businessProfile.findUnique({ where: { id: businessId }, select: { id: true } })
  if (!business) throw ApiError.notFound('Business listing not found.')

  const existing = await prisma.savedBusiness.findUnique({
    where: { userId_businessId: { userId, businessId } },
  })

  if (existing) {
    await prisma.savedBusiness.delete({
      where: { userId_businessId: { userId, businessId } },
    })
    return { saved: false }
  }

  await prisma.savedBusiness.create({ data: { userId, businessId } })
  return { saved: true }
}

export const recalcProfileScore = async (userId: string): Promise<number> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      businessProfiles: true,
      investorProfiles: true,
      advisorProfiles: true,
      documents: true,
    },
  })

  if (!user) return 0

  let score = 0
  if (user.firstName && user.lastName) score += 15
  if (user.email && user.isEmailVerified) score += 20
  if (user.phone) score += 10
  if (user.country) score += 10
  if (user.profileImage) score += 10
  if (user.businessProfiles.length || user.investorProfiles.length || user.advisorProfiles.length) score += 20
  if (user.documents.length) score += 10
  if (user.verified) score += 5

  const finalScore = Math.min(score, 100)
  await prisma.user.update({ where: { id: userId }, data: { profileScore: finalScore } })
  return finalScore
}

export const getDashboardStats = async (userId: string) => {
  const [
    businessProfiles,
    investorProfiles,
    advisorProfiles,
    deals,
    notifications,
    documents,
    marketplacePostings,
    saved,
    unread,
  ] = await Promise.all([
    prisma.businessProfile.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: { _count: { select: { deals: true } } },
    }),
    prisma.investorProfile.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.advisorProfile.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.deal.findMany({
      where: { OR: [{ initiatorId: userId }, { receiverId: userId }] },
      take: 12,
      orderBy: { updatedAt: 'desc' },
      include: {
        business: true,
        initiator: { select: { id: true, firstName: true, lastName: true, role: true, profileImage: true } },
        receiver: { select: { id: true, firstName: true, lastName: true, role: true, profileImage: true } },
        _count: { select: { messages: true } },
      },
    }),
    prisma.notification.findMany({
      where: { userId },
      take: 8,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.document.findMany({
      where: { userId },
      take: 8,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.businessProfile.findMany({
      where: { status: 'ACTIVE' },
      take: 4,
      orderBy: [{ isFeatured: 'desc' }, { updatedAt: 'desc' }],
    }),
    prisma.savedBusiness.count({ where: { userId } }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ])

  const profiles = [
    ...businessProfiles.map(mapBusinessProfile),
    ...investorProfiles.map(mapInvestorProfile),
    ...advisorProfiles.map(mapAdvisorProfile),
  ].sort((a, b) => (a.lastActivity > b.lastActivity ? 1 : -1))

  const profileViews = businessProfiles.reduce((sum, profile) => sum + profile.viewCount, 0)
  const enquiriesReceived = businessProfiles.reduce((sum, profile) => sum + profile.enquiryCount, 0)
  const activeListings = businessProfiles.filter((profile) => profile.status === 'ACTIVE').length

  const pipelineBase = [
    { key: 'INQUIRY', label: 'Inquiry', color: '#8896a8' },
    { key: 'NDA_SENT', label: 'NDA Sent', color: '#1A56DB' },
    { key: 'NDA_SIGNED', label: 'NDA Signed', color: '#10B981' },
    { key: 'NEGOTIATION', label: 'Negotiation', color: '#F5A623' },
    { key: 'DUE_DILIGENCE', label: 'Due Diligence', color: '#7C3AED' },
    { key: 'CLOSED', label: 'Closed', color: '#059669' },
    { key: 'WITHDRAWN', label: 'Withdrawn', color: '#D42B2B' },
  ]

  const pipeline = pipelineBase.map((stage) => {
    const stageDeals = deals.filter((deal) => deal.status === stage.key)
    const value = stageDeals.reduce((sum, deal) => sum + toNumber(deal.business?.askAmount), 0)

    return {
      label: stage.label,
      count: stageDeals.length,
      value: formatMoney(value || null, stageDeals[0]?.business?.currency || 'USD'),
      color: stage.color,
    }
  })

  return {
    stats: {
      profileViews,
      activeListings,
      enquiriesReceived,
      savedBusinesses: saved,
      unreadNotifications: unread,
      totalProfiles: profiles.length,
      documents: documents.length,
    },
    profiles,
    deals: deals.map((deal) => mapDeal(deal, userId)),
    pipeline,
    latestActivity: notifications.map(mapNotificationActivity),
    documents: documents.map(mapDocument),
    marketPostings: marketplacePostings.map(mapPosting),
  }
}