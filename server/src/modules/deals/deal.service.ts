import { prisma } from '../../config/prisma.js'
import { ApiError } from '../../utils/ApiError.js'
import { getPaginationParams, buildPaginationMeta } from '../../utils/pagination.js'
import type { CreateDealInput, UpdateDealStatusInput } from './deal.schema.js'
import type { DealStatus } from '@prisma/client'

const ALLOWED_TRANSITIONS: Record<DealStatus, DealStatus[]> = {
  INQUIRY: ['NDA_SENT', 'WITHDRAWN'],
  NDA_SENT: ['NDA_SIGNED', 'WITHDRAWN'],
  NDA_SIGNED: ['NEGOTIATION', 'WITHDRAWN'],
  NEGOTIATION: ['DUE_DILIGENCE', 'WITHDRAWN'],
  DUE_DILIGENCE: ['CLOSED', 'WITHDRAWN'],
  CLOSED: [],
  WITHDRAWN: [],
}

const assertParty = (deal: { initiatorId: string; receiverId: string }, userId: string) => {
  if (deal.initiatorId !== userId && deal.receiverId !== userId) {
    throw ApiError.forbidden('You are not a party to this deal.')
  }
}

export const createDeal = async (initiatorId: string, data: CreateDealInput) => {
  const business = await prisma.businessProfile.findUnique({
    where: { id: data.businessId },
    include: {
      user: { select: { id: true, firstName: true, email: true } },
    },
  })

  if (!business) throw ApiError.notFound('Business listing not found.')
  if (business.status !== 'ACTIVE') throw ApiError.badRequest('This listing is not accepting enquiries.')
  if (business.userId === initiatorId) throw ApiError.badRequest('You cannot enquire on your own listing.')

  const existing = await prisma.deal.findFirst({
    where: {
      businessId: data.businessId,
      initiatorId,
      receiverId: business.userId,
      status: { notIn: ['CLOSED', 'WITHDRAWN'] },
    },
  })

  if (existing) throw ApiError.conflict('You already have an active enquiry on this listing.')

  return prisma.$transaction(async (tx) => {
    const deal = await tx.deal.create({
      data: {
        businessId: data.businessId,
        initiatorId,
        receiverId: business.userId,
        status: 'INQUIRY',
      },
    })

    await tx.message.create({
      data: {
        dealId: deal.id,
        senderId: initiatorId,
        content: data.message.trim(),
      },
    })

    await tx.businessProfile.update({
      where: { id: data.businessId },
      data: { enquiryCount: { increment: 1 } },
    })

    await tx.notification.create({
      data: {
        userId: business.userId,
        title: 'New enquiry received',
        body: `A buyer or investor sent an enquiry on ${business.title}.`,
        type: 'Enquiry',
        link: '/dashboard?tab=enquiries',
        meta: { dealId: deal.id, businessId: business.id },
      },
    })

    return deal
  })
}

export const createInvestorDeal = async (
  initiatorId: string,
  investorProfileId: string,
  data: CreateDealInput,
) => {
  const [business, investorProfile] = await Promise.all([
    prisma.businessProfile.findUnique({
      where: { id: data.businessId },
    }),
    prisma.investorProfile.findUnique({
      where: { id: investorProfileId },
      include: {
        user: { select: { id: true, firstName: true, email: true } },
      },
    }),
  ])

  if (!business) throw ApiError.notFound('Business listing not found.')
  if (!investorProfile) throw ApiError.notFound('Investor profile not found.')

  if (business.userId !== initiatorId) {
    throw ApiError.forbidden('You can only contact investors using a business profile you own.')
  }

  if (investorProfile.userId === initiatorId) {
    throw ApiError.badRequest('You cannot connect with your own investor profile.')
  }

  if (business.status === 'CLOSED') {
    throw ApiError.badRequest('Closed business profiles cannot start new investor conversations.')
  }

  const existing = await prisma.deal.findFirst({
    where: {
      businessId: data.businessId,
      initiatorId,
      receiverId: investorProfile.userId,
      status: { notIn: ['CLOSED', 'WITHDRAWN'] },
    },
  })

  if (existing) {
    throw ApiError.conflict('You already have an active conversation with this investor for this business.')
  }

  return prisma.$transaction(async (tx) => {
    const deal = await tx.deal.create({
      data: {
        businessId: data.businessId,
        initiatorId,
        receiverId: investorProfile.userId,
        status: 'INQUIRY',
      },
    })

    await tx.message.create({
      data: {
        dealId: deal.id,
        senderId: initiatorId,
        content: data.message.trim(),
      },
    })

    await tx.businessProfile.update({
      where: { id: data.businessId },
      data: { enquiryCount: { increment: 1 } },
    })

    await tx.notification.create({
      data: {
        userId: investorProfile.userId,
        title: 'New investor connection request',
        body: `A business owner sent you an enquiry for ${business.title}.`,
        type: 'Enquiry',
        link: '/dashboard?tab=enquiries',
        meta: { dealId: deal.id, businessId: business.id, investorProfileId },
      },
    })

    return deal
  })
}

export const getMyDeals = async (userId: string, page?: string, limit?: string) => {
  const { skip, take, page: p, limit: l } = getPaginationParams(page, limit)

  const where = {
    OR: [{ initiatorId: userId }, { receiverId: userId }],
  }

  const [deals, total] = await prisma.$transaction([
    prisma.deal.findMany({
      where,
      skip,
      take,
      orderBy: { updatedAt: 'desc' },
      include: {
        business: {
          select: {
            id: true,
            title: true,
            slug: true,
            industry: true,
            country: true,
            city: true,
            currency: true,
            askAmount: true,
            runSales: true,
            ebitda: true,
            ebitdaMargin: true,
          },
        },
        initiator: {
          select: { id: true, firstName: true, lastName: true, profileImage: true, role: true },
        },
        receiver: {
          select: { id: true, firstName: true, lastName: true, profileImage: true, role: true },
        },
        _count: { select: { messages: true, documents: true } },
      },
    }),
    prisma.deal.count({ where }),
  ])

  return { deals, meta: buildPaginationMeta(total, p, l) }
}

export const getDealById = async (dealId: string, userId: string) => {
  const deal = await prisma.deal.findUnique({
    where: { id: dealId },
    include: {
      business: true,
      initiator: {
        select: { id: true, firstName: true, lastName: true, profileImage: true, role: true },
      },
      receiver: {
        select: { id: true, firstName: true, lastName: true, profileImage: true, role: true },
      },
      messages: {
        orderBy: { createdAt: 'asc' },
        include: {
          sender: { select: { id: true, firstName: true, lastName: true, profileImage: true } },
        },
      },
      documents: true,
    },
  })

  if (!deal) throw ApiError.notFound('Deal not found.')
  assertParty(deal, userId)

  return deal
}

export const advanceDealStatus = async (
  dealId: string,
  userId: string,
  input: UpdateDealStatusInput,
) => {
  const deal = await prisma.deal.findUnique({ where: { id: dealId } })
  if (!deal) throw ApiError.notFound('Deal not found.')
  assertParty(deal, userId)

  const allowed = ALLOWED_TRANSITIONS[deal.status]
  if (!allowed.includes(input.status)) {
    throw ApiError.badRequest(
      `Cannot move from ${deal.status} to ${input.status}. Valid next states: ${allowed.join(', ') || 'none'}.`,
    )
  }

  const updateData: any = { status: input.status }
  if (input.notes) updateData.notes = input.notes
  if (input.status === 'CLOSED') updateData.closedAt = new Date()
  if (input.status === 'NDA_SIGNED') {
    updateData.ndaSigned = true
    updateData.ndaSignedAt = new Date()
  }

  const updated = await prisma.deal.update({
    where: { id: dealId },
    data: updateData,
  })

  const recipientId = deal.initiatorId === userId ? deal.receiverId : deal.initiatorId
  await prisma.notification.create({
    data: {
      userId: recipientId,
      title: 'Deal status updated',
      body: `A deal moved to ${input.status.replaceAll('_', ' ')}.`,
      type: 'Deal',
      link: '/dashboard?tab=pipeline',
      meta: { dealId },
    },
  })

  return updated
}

export const signNda = async (dealId: string, userId: string) => {
  const deal = await prisma.deal.findUnique({ where: { id: dealId } })
  if (!deal) throw ApiError.notFound('Deal not found.')
  assertParty(deal, userId)

  if (deal.status !== 'NDA_SENT') {
    throw ApiError.badRequest('NDA has not been sent yet.')
  }

  return prisma.deal.update({
    where: { id: dealId },
    data: {
      ndaSigned: true,
      ndaSignedAt: new Date(),
      status: 'NDA_SIGNED',
    },
  })
}

export const withdrawDeal = async (dealId: string, userId: string) => {
  const deal = await prisma.deal.findUnique({ where: { id: dealId } })
  if (!deal) throw ApiError.notFound('Deal not found.')
  assertParty(deal, userId)

  if (['CLOSED', 'WITHDRAWN'].includes(deal.status)) {
    throw ApiError.badRequest('This deal is already finalised.')
  }

  return prisma.deal.update({
    where: { id: dealId },
    data: { status: 'WITHDRAWN' },
  })
}