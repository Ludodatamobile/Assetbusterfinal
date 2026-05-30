import { prisma } from '../../config/prisma.js'
import { ApiError } from '../../utils/ApiError.js'

// ─── Match businesses to an investor's preferences ────────────────────────────

export const getMatchesForInvestor = async (userId: string) => {
  const profile = await prisma.investorProfile.findUnique({ where: { userId } })
  if (!profile) throw ApiError.notFound('Investor profile not found. Create one first.')

  const where: any = {
    status: 'ACTIVE',
    AND:    [],
  }

  // Industry overlap
  if (profile.industries.length > 0) {
    where.AND.push({ industry: { in: profile.industries } })
  }

  // Country overlap
  if (profile.countries.length > 0) {
    where.AND.push({ country: { in: profile.countries } })
  }

  // Deal type overlap
  if (profile.dealTypes.length > 0) {
    where.AND.push({ dealType: { in: profile.dealTypes } })
  }

  // Ticket size filter — listing ask must be within investor's range
  if (profile.minTicket) {
    where.AND.push({ askAmount: { lte: profile.maxTicket } })
  }

  const matches = await prisma.businessProfile.findMany({
    where,
    orderBy: [{ isFeatured: 'desc' }, { rating: 'desc' }, { createdAt: 'desc' }],
    take:    20,
    select: {
      id: true, title: true, slug: true, description: true,
      industry: true, country: true, city: true,
      dealType: true, askAmount: true, askPercent: true,
      runSales: true, ebitdaMargin: true, isPremium: true,
      isFeatured: true, rating: true, established: true, createdAt: true,
      user: { select: { id: true, firstName: true, country: true } },
    },
  })

  return _scoreMatches(matches, profile)
}

// ─── Match investors to a business listing ────────────────────────────────────

export const getMatchesForBusiness = async (userId: string) => {
  const business = await prisma.businessProfile.findUnique({ where: { userId } })
  if (!business) throw ApiError.notFound('No business listing found. Create one first.')

  const investors = await prisma.investorProfile.findMany({
    where: {
      OR: [
        { industries: { has: business.industry } },
        { countries:  { has: business.country  } },
        { dealTypes:  { has: business.dealType  } },
      ],
      // Ticket size: max must cover the ask amount
      maxTicket: { gte: business.askAmount },
    },
    orderBy: [{ isPremium: 'desc' }, { dealsCount: 'desc' }],
    take:    20,
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, country: true, avatarUrl: true },
      },
    },
  })

  return investors
}

// ─── Scoring algorithm ────────────────────────────────────────────────────────

const _scoreMatches = (listings: any[], profile: any) => {
  return listings
    .map((listing) => {
      let score = 0
      if (profile.industries.includes(listing.industry)) score += 40
      if (profile.countries.includes(listing.country))   score += 30
      if (profile.dealTypes.includes(listing.dealType))  score += 20
      if (listing.isPremium)   score += 5
      if (listing.isFeatured)  score += 5
      return { ...listing, matchScore: score }
    })
    .sort((a, b) => b.matchScore - a.matchScore)
}

// ─── Recommended listings for any user (homepage / dashboard) ─────────────────

export const getRecommendedListings = async (userId?: string) => {
  // If no userId, return featured + premium listings
  if (!userId) {
    return prisma.businessProfile.findMany({
      where:   { status: 'ACTIVE' },
      orderBy: [{ isFeatured: 'desc' }, { isPremium: 'desc' }, { rating: 'desc' }],
      take:    12,
      select:  {
        id: true, title: true, slug: true, industry: true, country: true,
        dealType: true, askAmount: true, rating: true, isPremium: true, isFeatured: true,
      },
    })
  }

  const user = await prisma.user.findUnique({
    where:   { id: userId },
    include: { investorProfile: true },
  })

  if (user?.investorProfile) {
    return getMatchesForInvestor(userId)
  }

  // Fallback — recently added active listings
  return prisma.businessProfile.findMany({
    where:   { status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
    take:    12,
    select:  {
      id: true, title: true, slug: true, industry: true, country: true,
      dealType: true, askAmount: true, rating: true, isPremium: true, isFeatured: true,
    },
  })
}