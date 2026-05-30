import { prisma } from '../../config/prisma.js'
import { ApiError } from '../../utils/ApiError.js'
import {
  getPaginationParams,
  createPaginationResult,
} from '../../utils/pagination.js'
import { AdminAuthService } from '../auth/adminAuth.service.js'
import type { ListingStatus, ProfileType } from '@prisma/client'

const actionFor = (profileType: ProfileType, action: 'APPROVE' | 'REJECT' | 'SUSPEND') => {
  if (profileType === 'RAISE_CAPITAL') return `${action}_FUNDRAISER`
  if (profileType === 'FUNDING_SERVICE') return `${action}_FUNDING_SERVICE`
  if (profileType === 'STARTUP') return `${action}_STARTUP`
  return `${action}_LISTING`
}

export class AdminListingsService {
  static async getAllListings(query: {
    page?: string
    limit?: string
    status?: string
    profileType?: string
    industry?: string
    country?: string
    search?: string
    startupCategory?: string
    startupStage?: string
    fundingServiceType?: string
  }) {
    const { skip, page, limit } = getPaginationParams({
      page: Number(query.page),
      limit: Number(query.limit),
    })

    const where: any = {}

    if (query.status) where.status = query.status as ListingStatus
    if (query.profileType) where.profileType = query.profileType as ProfileType
    if (query.industry) where.industry = { contains: query.industry, mode: 'insensitive' }
    if (query.country) where.country = { contains: query.country, mode: 'insensitive' }
    if (query.startupCategory) where.startupCategory = query.startupCategory
    if (query.startupStage) where.startupStage = query.startupStage
    if (query.fundingServiceType) {
      where.fundingServiceType = { contains: query.fundingServiceType, mode: 'insensitive' }
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { industry: { contains: query.search, mode: 'insensitive' } },
        { country: { contains: query.search, mode: 'insensitive' } },
        { city: { contains: query.search, mode: 'insensitive' } },
        { startupType: { contains: query.search, mode: 'insensitive' } },
        { startupCategory: { contains: query.search, mode: 'insensitive' } },
        { startupStage: { contains: query.search, mode: 'insensitive' } },
        { problemStatement: { contains: query.search, mode: 'insensitive' } },
        { solutionStatement: { contains: query.search, mode: 'insensitive' } },
        { fundingServiceType: { contains: query.search, mode: 'insensitive' } },
        { capitalProviderType: { contains: query.search, mode: 'insensitive' } },
      ]
    }

    const [listings, total] = await prisma.$transaction([
      prisma.businessProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              country: true,
            },
          },
          _count: {
            select: {
              deals: true,
              documents: true,
              savedBy: true,
            },
          },
        },
      }),
      prisma.businessProfile.count({ where }),
    ])

    return createPaginationResult(listings, total, page, limit)
  }

  static async getListingById(id: string) {
    const listing = await prisma.businessProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            country: true,
          },
        },
        deals: {
          select: {
            id: true,
            status: true,
            createdAt: true,
          },
        },
        documents: {
          select: {
            id: true,
            name: true,
            fileType: true,
            createdAt: true,
          },
        },
        valuations: true,
        _count: {
          select: {
            deals: true,
            savedBy: true,
            documents: true,
          },
        },
      },
    })

    if (!listing) throw ApiError.notFound('Listing not found')
    return listing
  }

  static async approveListing(listingId: string, adminId: string) {
    const listing = await prisma.businessProfile.findUnique({
      where: { id: listingId },
    })
    if (!listing) throw ApiError.notFound('Listing not found')

    await prisma.businessProfile.update({
      where: { id: listingId },
      data: { status: 'ACTIVE' },
    })

    await AdminAuthService.logActivity({
      adminId,
      action: actionFor(listing.profileType, 'APPROVE'),
      entity: 'BusinessProfile',
      entityId: listingId,
      meta: { title: listing.title, profileType: listing.profileType },
    })
  }

  static async rejectListing(listingId: string, adminId: string, reason?: string) {
    const listing = await prisma.businessProfile.findUnique({
      where: { id: listingId },
    })
    if (!listing) throw ApiError.notFound('Listing not found')

    await prisma.businessProfile.update({
      where: { id: listingId },
      data: { status: 'REJECTED' },
    })

    await AdminAuthService.logActivity({
      adminId,
      action: actionFor(listing.profileType, 'REJECT'),
      entity: 'BusinessProfile',
      entityId: listingId,
      meta: { title: listing.title, profileType: listing.profileType, reason },
    })
  }

  static async suspendListing(listingId: string, adminId: string) {
    const listing = await prisma.businessProfile.findUnique({
      where: { id: listingId },
    })
    if (!listing) throw ApiError.notFound('Listing not found')

    await prisma.businessProfile.update({
      where: { id: listingId },
      data: { status: 'CLOSED' },
    })

    await AdminAuthService.logActivity({
      adminId,
      action: actionFor(listing.profileType, 'SUSPEND'),
      entity: 'BusinessProfile',
      entityId: listingId,
      meta: { title: listing.title, profileType: listing.profileType },
    })
  }

  static async featureListing(listingId: string, adminId: string, featured: boolean) {
    const listing = await prisma.businessProfile.findUnique({
      where: { id: listingId },
    })
    if (!listing) throw ApiError.notFound('Listing not found')

    await prisma.businessProfile.update({
      where: { id: listingId },
      data: { isFeatured: featured },
    })

    await AdminAuthService.logActivity({
      adminId,
      action: featured ? 'FEATURE_LISTING' : 'UNFEATURE_LISTING',
      entity: 'BusinessProfile',
      entityId: listingId,
      meta: { title: listing.title, profileType: listing.profileType },
    })
  }

  static async setPremium(listingId: string, adminId: string, isPremium: boolean) {
    const listing = await prisma.businessProfile.findUnique({
      where: { id: listingId },
    })
    if (!listing) throw ApiError.notFound('Listing not found')

    await prisma.businessProfile.update({
      where: { id: listingId },
      data: { isPremium },
    })

    await AdminAuthService.logActivity({
      adminId,
      action: isPremium ? 'SET_PREMIUM' : 'REMOVE_PREMIUM',
      entity: 'BusinessProfile',
      entityId: listingId,
      meta: { title: listing.title, profileType: listing.profileType },
    })
  }

  static async getListingStats() {
    const [
      total,
      active,
      pending,
      rejected,
      fundraisers,
      activeFundraisers,
      pendingFundraisers,
      fundingServices,
      activeFundingServices,
      pendingFundingServices,
      startups,
      activeStartups,
      pendingStartups,
      byStatus,
      byProfileType,
    ] = await prisma.$transaction([
      prisma.businessProfile.count(),
      prisma.businessProfile.count({ where: { status: 'ACTIVE' } }),
      prisma.businessProfile.count({ where: { status: 'PENDING_REVIEW' } }),
      prisma.businessProfile.count({ where: { status: 'REJECTED' } }),

      prisma.businessProfile.count({ where: { profileType: 'RAISE_CAPITAL' } }),
      prisma.businessProfile.count({ where: { profileType: 'RAISE_CAPITAL', status: 'ACTIVE' } }),
      prisma.businessProfile.count({ where: { profileType: 'RAISE_CAPITAL', status: 'PENDING_REVIEW' } }),

      prisma.businessProfile.count({ where: { profileType: 'FUNDING_SERVICE' } }),
      prisma.businessProfile.count({ where: { profileType: 'FUNDING_SERVICE', status: 'ACTIVE' } }),
      prisma.businessProfile.count({ where: { profileType: 'FUNDING_SERVICE', status: 'PENDING_REVIEW' } }),

      prisma.businessProfile.count({ where: { profileType: 'STARTUP' } }),
      prisma.businessProfile.count({ where: { profileType: 'STARTUP', status: 'ACTIVE' } }),
      prisma.businessProfile.count({ where: { profileType: 'STARTUP', status: 'PENDING_REVIEW' } }),

      prisma.businessProfile.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      prisma.businessProfile.groupBy({
        by: ['profileType'],
        _count: { id: true },
      }),
    ])

    return {
      total,
      active,
      pending,
      rejected,

      fundraisers,
      activeFundraisers,
      pendingFundraisers,

      fundingServices,
      activeFundingServices,
      pendingFundingServices,

      startups,
      activeStartups,
      pendingStartups,

      byStatus: byStatus.reduce((acc: any, s) => {
        acc[s.status] = s._count.id
        return acc
      }, {}),

      byProfileType: byProfileType.reduce((acc: any, s) => {
        acc[s.profileType] = s._count.id
        return acc
      }, {}),
    }
  }
}