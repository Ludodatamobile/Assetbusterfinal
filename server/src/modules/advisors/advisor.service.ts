import { prisma } from '../../config/prisma.js'
import { ApiError } from '../../utils/ApiError.js'
import { getPaginationParams, buildPaginationMeta } from '../../utils/pagination.js'
import type { CreateAdvisorInput, UpdateAdvisorInput, AdvisorQuery } from './advisor.schema.js'

export const getPublicAdvisors = async (query: AdvisorQuery) => {
  const { skip, take, page, limit } = getPaginationParams(query.page, query.limit)

  const where: any = {}
  if (query.specialty) where.specialties = { has: query.specialty }
  if (query.country) where.countries = { has: query.country }
  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: 'insensitive' } },
      { firmName: { contains: query.search, mode: 'insensitive' } },
      { bio: { contains: query.search, mode: 'insensitive' } },
      { user: { firstName: { contains: query.search, mode: 'insensitive' } } },
      { user: { lastName: { contains: query.search, mode: 'insensitive' } } },
    ]
  }

  const [advisors, total] = await prisma.$transaction([
    prisma.advisorProfile.findMany({
      where,
      skip,
      take,
      orderBy: [{ isVerified: 'desc' }, { rating: 'desc' }, { createdAt: 'desc' }],
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
    prisma.advisorProfile.count({ where }),
  ])

  return { advisors, meta: buildPaginationMeta(total, page, limit) }
}

export const getAdvisorById = async (id: string) => {
  const advisor = await prisma.advisorProfile.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, country: true, profileImage: true, verified: true },
      },
    },
  })

  if (!advisor) throw ApiError.notFound('Advisor profile not found.')
  return advisor
}

export const getMyAdvisorProfiles = async (userId: string) => {
  return prisma.advisorProfile.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
  })
}

export const createAdvisorProfile = async (userId: string, data: CreateAdvisorInput) => {
  const profile = await prisma.advisorProfile.create({ data: { userId, ...data } })

  await prisma.notification.create({
    data: {
      userId,
      title: 'Advisor profile created',
      body: `${profile.title} has been added to your workspace.`,
      type: 'Profile',
      link: '/dashboard?tab=profiles',
    },
  })

  return profile
}

export const updateAdvisorProfile = async (userId: string, profileId: string, data: UpdateAdvisorInput) => {
  const profile = await prisma.advisorProfile.findUnique({ where: { id: profileId } })
  if (!profile) throw ApiError.notFound('Advisor profile not found.')
  if (profile.userId !== userId) throw ApiError.forbidden('You do not own this advisor profile.')

  return prisma.advisorProfile.update({
    where: { id: profileId },
    data,
  })
}