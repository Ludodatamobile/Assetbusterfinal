import { Router } from 'express'
import { AdminDealsController } from './adminDeals.controller.js'

const router = Router()

router.get('/',               AdminDealsController.getAll)
router.get('/stats',          AdminDealsController.stats)
router.get('/:id',            AdminDealsController.getById)
router.patch('/:id/status',   AdminDealsController.updateStatus)

export default router