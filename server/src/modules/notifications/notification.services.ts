import { prisma } from '../../config/prisma.js'
import { ApiError } from '../../utils/ApiError.js'
import { getPaginationParams, buildPaginationMeta } from '../../utils/pagination.js'

export class NotificationService {
  static async getNotifications(userId: string, page?: string, limit?: string, unreadOnly = false) {
    const { skip, take, page: p, limit: l } = getPaginationParams(page, limit)
    const where: any = { userId }

    if (unreadOnly) where.isRead = false

    const [notifications, total] = await prisma.$transaction([
      prisma.notification.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where }),
    ])

    return { notifications, meta: buildPaginationMeta(total, p, l) }
  }

  static async markOneRead(notificationId: string, userId: string) {
    const notification = await prisma.notification.findUnique({ where: { id: notificationId } })
    if (!notification) throw ApiError.notFound('Notification not found.')
    if (notification.userId !== userId) throw ApiError.forbidden('Access denied.')

    return prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true, readAt: new Date() },
    })
  }

  static async markAllRead(userId: string) {
    const { count } = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    })

    return { updatedCount: count }
  }

  static async deleteNotification(notificationId: string, userId: string) {
    const notification = await prisma.notification.findUnique({ where: { id: notificationId } })
    if (!notification) throw ApiError.notFound('Notification not found.')
    if (notification.userId !== userId) throw ApiError.forbidden('Access denied.')

    await prisma.notification.delete({ where: { id: notificationId } })
  }

  static async getUnreadCount(userId: string) {
    return prisma.notification.count({
      where: { userId, isRead: false },
    })
  }

  static async createNotification(data: {
    userId: string
    title: string
    body: string
    type?: string
    link?: string
    meta?: Record<string, unknown>
  }) {
    return prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        body: data.body,
        type: data.type || 'GENERAL',
        link: data.link,
        meta: data.meta,
      },
    })
  }
}