import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import {
  exportUserData,
  deleteAllUserData,
  getPrivacySettings,
  updatePrivacySettings
} from '../controllers/privacyController.js'

const router = Router()

// All routes require authentication
router.use(authMiddleware)

// Data export (GDPR Article 20)
router.get('/export', exportUserData)

// Account deletion (GDPR Article 17 - Right to be forgotten)
router.post('/delete-account', deleteAllUserData)

// Privacy settings
router.get('/settings', getPrivacySettings)
router.patch('/settings', updatePrivacySettings)

export default router
