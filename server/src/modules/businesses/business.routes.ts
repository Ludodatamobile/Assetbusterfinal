import { Router } from 'express'
import * as controller from './business.controller.js'
import { authenticate, authenticateOptional } from '../../middleware/authenticate.js'
import { validateRequest } from '../../middleware/validateRequest.js'
import { createBusinessSchema, updateBusinessSchema } from './business.schema.js'

const router = Router()

router.get('/', authenticateOptional, controller.getListings)
router.get('/mine', authenticate, controller.getMyListings)
router.get('/slug/:slug', authenticateOptional, controller.getListingBySlug)
router.get('/:id/similar', controller.getSimilarListings)

router.post('/', authenticate, validateRequest(createBusinessSchema), controller.createListing)
router.patch('/:id', authenticate, validateRequest(updateBusinessSchema), controller.updateListing)
router.delete('/:id', authenticate, controller.deleteListing)
router.post('/:id/submit-for-review', authenticate, controller.submitForReview)

export default router