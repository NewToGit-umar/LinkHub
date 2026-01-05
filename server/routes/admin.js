import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { requireAdmin } from '../middleware/admin.js'
import {
  getOverview,
  getUsers,
  updateUserRole,
  toggleUserSuspension,
  deleteUser,
  getSystemAnalytics
} from '../controllers/adminController.js'

const router = Router()

// All routes require authentication and admin role
router.use(authMiddleware)
router.use(requireAdmin)

// Dashboard overview
router.get('/overview', getOverview)

// User management
router.get('/users', getUsers)
router.patch('/users/:userId/role', updateUserRole)
router.post('/users/:userId/suspend', toggleUserSuspension)
router.delete('/users/:userId', deleteUser)

// System analytics
router.get('/analytics', getSystemAnalytics)

export default router
