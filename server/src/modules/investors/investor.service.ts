import { prisma } from '../../config/prisma.js'
import { ApiError } from '../../utils/ApiError.js'
import { getPaginationParams, buildPaginationMeta } from '../../utils/pagination.js'
import type {
  CreateInvestorProfileInput,
  UpdateInvestorProfileInput,
  InvestorQueryInput,
} from './investor.schema.js'

export const getPublicInvestors = async (query: InvestorQueryInput) => {
  const { skip, take, page, limit } = getPaginationParams(query.page, query.limit)

  const where: any = {}
  if (query.investorType) where.investorType = query.investorType
  if (query.industry) where.industries = { has: query.industry }
  if (query.country) where.countries = { has: query.country }
  if (query.dealType) where.dealTypes = { has: query.dealType }
  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: 'insensitive' } },
      { firmName: { contains: query.search, mode: 'insensitive' } },
      { bio: { contains: query.search, mode: 'insensitive' } },
      { user: { firstName: { contains: query.search, mode: 'insensitive' } } },
      { user: { lastName: { contains: query.search, mode: 'insensitive' } } },
    ]
  }

  const [investors, total] = await prisma.$transaction([
    prisma.investorProfile.findMany({
      where,
      skip,
      take,
      orderBy: [{ isVerified: 'desc' }, { createdAt: 'desc' }],
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
      },
    }),
    prisma.investorProfile.count({ where }),
  ])

  return { investors, meta: buildPaginationMeta(total, page, limit) }
}

export const getInvestorById = async (id: string) => {
  const investor = await prisma.investorProfile.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, country: true, profileImage: true, verified: true },
      },
    },
  })

  if (!investor) throw ApiError.notFound('Investor profile not found.')
  return investor
}

export const getMyInvestorProfiles = async (userId: string) => {
  return prisma.investorProfile.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
  })
}

export const createInvestorProfile = async (userId: string, data: CreateInvestorProfileInput) => {
  const profile = await prisma.investorProfile.create({
    data: { userId, ...data },
  })

  await prisma.notification.create({
    data: {
      userId,
      title: 'Investor profile created',
      body: `${profile.title} has been added to your workspace.`,
      type: 'Profile',
      link: '/dashboard?tab=profiles',
    },
  })

  return profile
}

export const updateInvestorProfile = async (
  userId: string,
  profileId: string,
  data: UpdateInvestorProfileInput
) => {
  const profile = await prisma.investorProfile.findUnique({ where: { id: profileId } })
  if (!profile) throw ApiError.notFound('Investor profile not found.')
  if (profile.userId !== userId) throw ApiError.forbidden('You do not own this investor profile.')

  return prisma.investorProfile.update({
    where: { id: profileId },
    data,
  })
}