import { Router } from 'express'
import * as controller from './document.controller.js'
import { authenticate } from '../../middleware/authenticate.js'
import { upload } from '../../middleware/upload.js'

const router = Router()

router.use(authenticate)

router.get('/mine', controller.getMyDocuments)
router.get('/deals/:dealId', controller.getDealDocuments)
router.post('/upload', upload.single('file'), controller.uploadDocument)
router.delete('/:id', controller.deleteDocument)

export default router