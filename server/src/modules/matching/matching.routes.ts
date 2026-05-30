import { Router } from 'express'
import * as controller          from './matching.controller.js'
import { authenticate, authenticateOptional } from '../../middleware/authenticate.js'
import { authorize }            from '../../middleware/authorize.js'

const router = Router()

// Recommended (public, but enhanced if logged in)
router.get('/recommended', authenticateOptional, controller.getRecommended)

// Investor: get matched businesses
router.get('/for-investor', authenticate, authorize(['INVESTOR', 'BUYER']), controller.getMatchesForInvestor)

// Seller: get matched investors for their listing
router.get('/for-business', authenticate, authorize(['SELLER']), controller.getMatchesForBusiness)

export default router