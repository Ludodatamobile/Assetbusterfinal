import { Router } from 'express'
import authRoutes from './modules/auth/auth.routes.js'
import userRoutes from './modules/users/user.routes.js'
import businessRoutes from './modules/businesses/business.routes.js'
import investorRoutes from './modules/investors/investor.routes.js'
import advisorRoutes from './modules/advisors/advisor.routes.js'
import dealRoutes from './modules/deals/deal.routes.js'
import messageRoutes from './modules/messaging/message.routes.js'
import matchingRoutes from './modules/matching/matching.routes.js'
import notifRoutes from './modules/notifications/notification.routes.js'
import documentRoutes from './modules/documents/document.routes.js'
import adminRoutes from './admin/admin.routes.js'
import fundraiserRoutes from './modules/fundraisers/fundraiser.routes.js'
import fundingServiceRoutes from './modules/funding-services/fundingService.routes.js'
import startupRoutes from './modules/startups/startup.routes.js'

export const rootRouter = Router()

rootRouter.use('/auth', authRoutes)
rootRouter.use('/users', userRoutes)
rootRouter.use('/businesses', businessRoutes)
rootRouter.use('/investors', investorRoutes)
rootRouter.use('/advisors', advisorRoutes)
rootRouter.use('/deals', dealRoutes)
rootRouter.use('/messages', messageRoutes)
rootRouter.use('/matching', matchingRoutes)
rootRouter.use('/notifications', notifRoutes)
rootRouter.use('/documents', documentRoutes)
rootRouter.use('/admin', adminRoutes)
rootRouter.use('/fundraisers', fundraiserRoutes)
rootRouter.use('/funding-services', fundingServiceRoutes)
rootRouter.use('/startups', startupRoutes)