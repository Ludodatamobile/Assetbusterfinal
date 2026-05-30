import { Router } from 'express'
import * as controller from './deal.controller.js'
import { authenticate } from '../../middleware/authenticate.js'
import { validateRequest } from '../../middleware/validateRequest.js'
import {
  createDealSchema,
  createInvestorDealSchema,
  updateDealStatusSchema,
  signNdaSchema,
} from './deal.schema.js'

const router = Router()

router.use(authenticate)

router.get('/', controller.getMyDeals)
router.post('/', validateRequest(createDealSchema), controller.createDeal)

router.post(
  '/investors/:investorProfileId',
  validateRequest(createInvestorDealSchema),
  controller.createInvestorDeal,
)

router.get('/:id', controller.getDealById)
router.patch('/:id/status', validateRequest(updateDealStatusSchema), controller.advanceDealStatus)
router.post('/:id/sign-nda', validateRequest(signNdaSchema), controller.signNda)
router.post('/:id/withdraw', controller.withdrawDeal)

export default router