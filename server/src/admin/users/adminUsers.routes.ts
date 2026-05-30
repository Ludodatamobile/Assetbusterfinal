import { Router } from 'express'
import { AdminUsersController } from './adminUsers.controller.js'

const router = Router()

router.get('/',                 AdminUsersController.getAll)
router.get('/stats',            AdminUsersController.stats)
router.get('/:id',              AdminUsersController.getById)
router.patch('/:id/suspend',    AdminUsersController.suspend)
router.patch('/:id/reactivate', AdminUsersController.reactivate)
router.patch('/:id/verify',     AdminUsersController.verify)
router.delete('/:id',           AdminUsersController.remove)

export default router