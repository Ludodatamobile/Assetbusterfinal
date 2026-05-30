import { Router } from 'express'
import * as controller  from './valuation.controller.js'
import { authenticate } from '../../middleware/authenticate.js'
import { authorize }    from '../../middleware/authorize.js'

const router = Router()

router.use(authenticate)

// Free estimate tool (any logged-in user)
router.post('/estimate', controller.estimateValuation)

// Owner-specific routes
router.post('/',                         authorize(['SELLER']), controller.runValuation)
router.get('/business/:businessId',      authorize(['SELLER']), controller.getValuations)
router.delete('/:id',                    authorize(['SELLER']), controller.deleteValuation)

export default router