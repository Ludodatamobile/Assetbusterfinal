import type { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { ApiResponse } from '../../utils/ApiResponse.js'
import { NotificationService } from './notification.services.js'

export class NotificationController {
  static getNotifications = asyncHandler(async (req: Request, res: Response) => {
    const unreadOnly = req.query.unread === 'true'
    const result = await NotificationService.getNotifications(
      req.user!.id,
      req.query.page as string,
      req.query.limit as string,
      unreadOnly
    )

    return ApiResponse.success(res, result.notifications, 'Notifications retrieved.', 200, result.meta)
  })

  static getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
    const count = await NotificationService.getUnreadCount(req.user!.id)
    return ApiResponse.success(res, { unreadCount: count })
  })

  static markOneRead = asyncHandler(async (req: Request, res: Response) => {
    const notification = await NotificationService.markOneRead(req.params.id, req.user!.id)
    return ApiResponse.success(res, { notification }, 'Notification marked as read.')
  })

  static markAllRead = asyncHandler(async (req: Request, res: Response) => {
    const result = await NotificationService.markAllRead(req.user!.id)
    return ApiResponse.success(res, result, `${result.updatedCount} notifications marked as read.`)
  })

  static deleteNotification = asyncHandler(async (req: Request, res: Response) => {
    await NotificationService.deleteNotification(req.params.id, req.user!.id)
    return ApiResponse.noContent(res)
  })
}