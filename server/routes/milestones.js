import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { getProgress, triggerCheck } from '../controllers/milestoneController.js'

const router = Router()

// Get milestone progress for authenticated user
router.get('/', authMiddleware, getProgress)

// Manually trigger milestone check (for testing)
router.post('/check', authMiddleware, triggerCheck)

export default router
