import express from 'express'
import * as bioController from '../controllers/bioController.js'
import { auth } from '../middleware/auth.js'

const router = express.Router()

// Create a bio page (authenticated)
router.post('/pages', auth, bioController.createBioPage)

// Get user's bio pages (authenticated)
router.get('/pages/user', auth, bioController.getUserBioPages)

// Get bio page by slug (public)
router.get('/pages/:slug', bioController.getBioPage)

// Update bio page (authenticated, owner only)
router.patch('/pages/:id', auth, bioController.updateBioPage)

// Redirect and record click (public)
router.get('/r/:slug/:linkId', bioController.redirectLink)

export default router
