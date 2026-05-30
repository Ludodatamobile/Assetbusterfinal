import { Router } from 'express'
import { AdminAuthController } from './adminAuth.controller.js'
import { validateRequest } from '../../middleware/validateRequest.js'
import { authenticateAdmin } from '../../middleware/authenticate.js'
import { requireSuperAdmin } from '../../middleware/authorize.js'
import {
  adminLoginSchema,
  adminRefreshTokenSchema,
  bootstrapSuperAdminSchema,
  createAdminSchema,
} from './adminAuth.schema.js'

const router = Router()

router.get('/bootstrap-status', AdminAuthController.bootstrapStatus)

router.post(
  '/bootstrap-super-admin',
  validateRequest(bootstrapSuperAdminSchema),
  AdminAuthController.bootstrapSuperAdmin
)

router.post('/login', validateRequest(adminLoginSchema), AdminAuthController.login)
router.post('/refresh-token', validateRequest(adminRefreshTokenSchema), AdminAuthController.refreshToken)

router.post('/logout', authenticateAdmin, AdminAuthController.logout)
router.get('/me', authenticateAdmin, AdminAuthController.getCurrentAdmin)

router.post(
  '/create-admin',
  authenticateAdmin,
  requireSuperAdmin,
  validateRequest(createAdminSchema),
  AdminAuthController.createAdmin
)

export default router