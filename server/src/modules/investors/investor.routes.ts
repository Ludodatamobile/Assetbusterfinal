import { Router } from 'express'
import * as controller from './investor.controller.js'
import { authenticate } from '../../middleware/authenticate.js'
import { validateRequest } from '../../middleware/validateRequest.js'
import { createInvestorProfileSchema, updateInvestorProfileSchema } from './investor.schema.js'

const router = Router()

router.get('/', controller.getInvestors)
router.get('/mine', authenticate, controller.getMyProfiles)
router.get('/:id', controller.getInvestorById)

router.post('/', authenticate, validateRequest(createInvestorProfileSchema), controller.createProfile)
router.patch('/:id', authenticate, validateRequest(updateInvestorProfileSchema), controller.updateProfile)

export default router