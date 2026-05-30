import { Router } from 'express'
import * as controller from './user.controller.js'
import { authenticate } from '../../middleware/authenticate.js'
import { validateRequest } from '../../middleware/validateRequest.js'
import { updateProfileSchema, updateAvatarSchema } from './user.schema.js'

const router = Router()

router.use(authenticate)

router.get('/me', controller.getMyProfile)
router.patch('/me', validateRequest(updateProfileSchema), controller.updateProfile)
router.patch('/me/avatar', validateRequest(updateAvatarSchema), controller.updateAvatar)
router.delete('/me', controller.deleteMyAccount)
router.get('/me/dashboard-stats', controller.getDashboardStats)
router.get('/me/profile-score', controller.getProfileScore)
router.get('/me/saved', controller.getSavedBusinesses)
router.post('/me/saved/:businessId', controller.toggleSaveBusiness)

export default router