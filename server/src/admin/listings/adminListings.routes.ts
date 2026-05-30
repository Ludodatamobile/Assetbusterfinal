import { Router } from 'express'
import { AdminListingsController } from './adminListings.controller.js'

const router = Router()

router.get('/',                   AdminListingsController.getAll)
router.get('/stats',              AdminListingsController.stats)
router.get('/:id',                AdminListingsController.getById)
router.patch('/:id/approve',      AdminListingsController.approve)
router.patch('/:id/reject',       AdminListingsController.reject)
router.patch('/:id/suspend',      AdminListingsController.suspend)
router.patch('/:id/feature',      AdminListingsController.feature)
router.patch('/:id/unfeature',    AdminListingsController.unfeature)
router.patch('/:id/set-premium',  AdminListingsController.setPremium)

export default router