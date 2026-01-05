import express from 'express'
import * as analyticsController from '../controllers/analyticsController.js'
import auth from '../middleware/auth.js'

const router = express.Router()

// Trigger fetch and ingest analytics from connected providers (placeholder)
router.post('/fetch', auth, analyticsController.fetchAndIngest)

// Get aggregated analytics summary
router.get('/summary', auth, analyticsController.summary)

// Aggregate metrics and top posts
router.get('/aggregate', auth, analyticsController.aggregateMetrics)

export default router
