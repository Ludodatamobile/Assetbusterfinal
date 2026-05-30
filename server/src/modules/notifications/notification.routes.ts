import { Router } from 'express'
import { NotificationController } from './notification.controller.js'
import { authenticate } from '../../middleware/authenticate.js'

const router = Router()

router.use(authenticate)

router.get('/', NotificationController.getNotifications)
router.get('/unread-count', NotificationController.getUnreadCount)
router.patch('/read-all', NotificationController.markAllRead)
router.patch('/:id/read', NotificationController.markOneRead)
router.delete('/:id', NotificationController.deleteNotification)

export default router