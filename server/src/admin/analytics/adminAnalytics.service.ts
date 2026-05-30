import { prisma } from '../../config/prisma.js'

interface ActivityItem {
  id: string
  type: string
  title: string
  description?: string
  actor?: string
  createdAt: string
}

export class AdminAnalyticsService {

  static async getPlatformOverview() {
    const [
      totalUsers,
      activeUsers,
      totalListings,
      activeListings,
      pendingListings,
      totalDeals,
      closedDeals,
      totalMessages,
    ] = await prisma.$transaction([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.businessProfile.count(),
      prisma.businessProfile.count({ where: { status: 'ACTIVE' } }),
      prisma.businessProfile.count({ where: { status: 'PENDING_REVIEW' } }),
      prisma.deal.count(),
      prisma.deal.count({ where: { status: 'CLOSED' } }),
      prisma.message.count(),
    ])

    return {
      users:    { total: totalUsers,    active: activeUsers },
      listings: { total: totalListings, active: activeListings, pending: pendingListings },
      deals:    { total: totalDeals,    closed: closedDeals },
      messages: { total: totalMessages },
    }
  }

  static async getUserGrowth(days = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    const users = await prisma.user.findMany({
      where:   { createdAt: { gte: since } },
      select:  { createdAt: true },
      orderBy: { createdAt: 'asc' },
    })

    const grouped: Record<string, number> = {}
    users.forEach((u) => {
      const day = u.createdAt.toISOString().split('T')[0]
      grouped[day] = (grouped[day] ?? 0) + 1
    })

    return Object.entries(grouped).map(([date, count]) => ({ date, count }))
  }

  static async getListingsByIndustry() {
    const rows = await prisma.businessProfile.groupBy({
      by:      ['industry'],
      _count:  { id: true },
      orderBy: { _count: { id: 'desc' } },
    })
    return rows.map((r) => ({ industry: r.industry, count: r._count.id }))
  }

  static async getListingsByCountry() {
    const rows = await prisma.businessProfile.groupBy({
      by:      ['country'],
      _count:  { id: true },
      orderBy: { _count: { id: 'desc' } },
      take:    20,
    })
    return rows.map((r) => ({ country: r.country, count: r._count.id }))
  }

  static async getDealFunnel() {
    const statuses = [
      'INQUIRY', 'NDA_SENT', 'NDA_SIGNED',
      'NEGOTIATION', 'DUE_DILIGENCE', 'CLOSED', 'WITHDRAWN',
    ]
    const counts = await prisma.deal.groupBy({
      by:     ['status'],
      _count: { id: true },
    })
    const map = counts.reduce((acc: any, c) => {
      acc[c.status] = c._count.id
      return acc
    }, {})
    return statuses.map((s) => ({ status: s, count: map[s] ?? 0 }))
  }

  static async getRecentActivity(): Promise<ActivityItem[]> {
    const [recentUsers, recentListings, recentDeals] = await prisma.$transaction([
      prisma.user.findMany({
        take:    5,
        orderBy: { createdAt: 'desc' },
        select:  { id: true, firstName: true, lastName: true, email: true, createdAt: true },
      }),
      prisma.businessProfile.findMany({
        take:    5,
        orderBy: { createdAt: 'desc' },
        select:  { id: true, title: true, industry: true, status: true, createdAt: true },
      }),
      prisma.deal.findMany({
        take:    5,
        orderBy: { createdAt: 'desc' },
        select: {
          id:        true,
          status:    true,
          createdAt: true,
          business:  { select: { title: true } },
        },
      }),
    ])

    const items: ActivityItem[] = [
      ...recentUsers.map((u) => ({
        id:          u.id,
        type:        'USER_JOINED',
        title:       `New user: ${u.firstName} ${u.lastName}`,
        description: u.email,
        createdAt:   u.createdAt.toISOString(),
      })),
      ...recentListings.map((l) => ({
        id:          l.id,
        type:        'LISTING_CREATED',
        title:       l.title,
        description: `${l.industry} · ${l.status}`,
        createdAt:   l.createdAt.toISOString(),
      })),
      ...recentDeals.map((d) => ({
        id:          d.id,
        type:        'DEAL_UPDATED',
        title:       `Deal: ${d.business?.title ?? 'Unknown'}`,
        description: d.status,
        createdAt:   d.createdAt.toISOString(),
      })),
    ]

    return items
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
  }
}