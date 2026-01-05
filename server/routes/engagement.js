import express from 'express'
import { auth } from '../middleware/auth.js'
import {
  trackClick,
  getLinkStats,
  getBioPageEngagement,
  getUserEngagement
} from '../controllers/linkEngagementController.js'

const router = express.Router()

// Public: track a link click (used by bio page when links are clicked)
router.post('/click/:linkId', trackClick)

// Protected: get stats for a specific link
router.get('/link/:linkId', auth, getLinkStats)

// Protected: get engagement stats for a bio page
router.get('/page/:bioPageId', auth, getBioPageEngagement)

// Protected: get engagement stats for all user's pages
router.get('/user', auth, getUserEngagement)

export default router
