import { Router } from 'express'
import * as controller from './advisor.controller.js'
import { authenticate } from '../../middleware/authenticate.js'
import { validateRequest } from '../../middleware/validateRequest.js'
import { createAdvisorProfileSchema, updateAdvisorProfileSchema } from './advisor.schema.js'

const router = Router()

router.get('/', controller.getAdvisors)
router.get('/mine', authenticate, controller.getMyProfiles)
router.get('/:id', controller.getAdvisorById)

router.post('/', authenticate, validateRequest(createAdvisorProfileSchema), controller.createProfile)
router.patch('/:id', authenticate, validateRequest(updateAdvisorProfileSchema), controller.updateProfile)

export default router