// src/admin/admin.routes.ts
import { Router } from 'express'
import { Role } from '@prisma/client'

import { authenticateAdmin } from '../middleware/authenticate.js'
import { authorizeAdmin } from '../middleware/authorize.js'

import adminAuthRoutes from './auth/adminAuth.routes.js'
import adminUserRoutes from './users/adminUsers.routes.js'
import adminListingRoutes from './listings/adminListings.routes.js'
import adminDealRoutes from './deals/adminDeals.routes.js'
import adminAnalytics from './analytics/adminAnalytics.routes.js'
import adminContent from './content/adminContent.routes.js'

const router = Router()

// Auth routes — no protection needed
router.use('/auth', adminAuthRoutes)

// All other admin routes — protected
const adminGuard = [
  authenticateAdmin,
  authorizeAdmin([Role.ADMIN, Role.SUPER_ADMIN]),
]

router.use('/users',     adminGuard, adminUserRoutes)
router.use('/listings',  adminGuard, adminListingRoutes)
router.use('/deals',     adminGuard, adminDealRoutes)
router.use('/analytics', adminGuard, adminAnalytics)
router.use('/content',   adminGuard, adminContent)

export default router