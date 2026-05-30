import { Router } from 'express'
import { Role } from '@prisma/client'
import { AdminContentController } from './adminContent.controller.js'
import { authorizeAdmin } from '../../middleware/authorize.js'

const router = Router()

// Stats
router.get('/stats', AdminContentController.stats)

// Featured
router.get('/featured-listings',       AdminContentController.getFeaturedListings)
router.get('/featured-investors',      AdminContentController.getFeaturedInvestors)
router.patch('/listings/:id/feature',  AdminContentController.featureListing)
router.patch('/listings/:id/unfeature',AdminContentController.unfeatureListing)
router.patch('/listings/:id/premium',  AdminContentController.setPremiumListing)
router.patch('/investors/:id/premium', AdminContentController.setPremiumInvestor)

// Audit logs
router.get('/audit-logs', AdminContentController.getAuditLogs)

// Campaigns
router.get(
  '/campaigns',
  AdminContentController.listCampaigns,
)
router.post(
  '/campaigns',
  authorizeAdmin([Role.SUPER_ADMIN, Role.ADMIN]),
  AdminContentController.createCampaign,
)
router.delete(
  '/campaigns/:id',
  authorizeAdmin([Role.SUPER_ADMIN, Role.ADMIN]),
  AdminContentController.cancelCampaign,
)

export default router