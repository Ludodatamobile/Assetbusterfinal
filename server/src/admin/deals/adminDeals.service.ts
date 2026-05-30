import { prisma } from '../../config/prisma.js'
import { ApiError } from '../../utils/ApiError.js'
import {
  getPaginationParams,
  createPaginationResult,
} from '../../utils/pagination.js'
import { AdminAuthService } from '../auth/adminAuth.service.js'
import type { DealStatus } from '@prisma/client'

export class AdminDealsService {

  static async getAllDeals(query: {
    page?:   string
    limit?:  string
    status?: string
    search?: string
  }) {
    const { skip, page, limit } = getPaginationParams({
      page: Number(query.page),
      limit: Number(query.limit),
    })

    const where: any = {}
    if (query.status) where.status = query.status as DealStatus
    if (query.search) {
      where.OR = [
        { business: { title: { contains: query.search, mode: 'insensitive' } } },
        { initiator: { email: { contains: query.search, mode: 'insensitive' } } },
      ]
    }

    const [deals, total] = await prisma.$transaction([
      prisma.deal.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          business:  { select: { id: true, title: true, industry: true, country: true, currency: true, askAmount: true } },
          initiator: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
          receiver:  { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
          _count:    { select: { messages: true, documents: true } },
        },
      }),
      prisma.deal.count({ where }),
    ])

    return createPaginationResult(deals, total, page, limit)
  }

  static async getDealById(id: string) {
    const deal = await prisma.deal.findUnique({
      where: { id },
      include: {
        business:  true,
        initiator: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
        receiver:  { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: { sender: { select: { id: true, firstName: true, lastName: true } } },
        },
        documents: true,
      },
    })
    if (!deal) throw ApiError.notFound('Deal not found')
    return deal
  }

  static async updateDealStatus(dealId: string, adminId: string, status: DealStatus, notes?: string) {
    const deal = await prisma.deal.findUnique({ where: { id: dealId } })
    if (!deal) throw ApiError.notFound('Deal not found')

    const data: any = { status }
    if (notes)               data.notes    = notes
    if (status === 'CLOSED') data.closedAt = new Date()

    await prisma.deal.update({ where: { id: dealId }, data })

    await AdminAuthService.logActivity({
      adminId,
      action:   'UPDATE_DEAL_STATUS',
      entity:   'Deal',
      entityId: dealId,
      meta:     { from: deal.status, to: status, notes },
    })
  }

  static async getDealStats() {
    const [total, active, closed, dueDiligence, byStatus] = await prisma.$transaction([
      prisma.deal.count(),
      prisma.deal.count({
        where: { status: { in: ['INQUIRY', 'NDA_SENT', 'NDA_SIGNED', 'NEGOTIATION', 'DUE_DILIGENCE'] } },
      }),
      prisma.deal.count({ where: { status: 'CLOSED' } }),
      prisma.deal.count({ where: { status: 'DUE_DILIGENCE' } }),
      prisma.deal.groupBy({ by: ['status'], _count: { id: true } }),
    ])

    return {
      total,
      active,
      closed,
      dueDiligence,
      byStatus: byStatus.reduce((acc: any, d) => {
        acc[d.status] = d._count.id
        return acc
      }, {}),
    }
  }
}