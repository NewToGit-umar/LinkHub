import express from 'express'
import { auth } from '../middleware/auth.js'
import {
  listTemplates,
  getTemplate,
  createTemplate,
  applyTemplate
} from '../controllers/templateController.js'

const router = express.Router()

// Public: list all templates (system + user if authenticated)
router.get('/', auth, listTemplates)

// Public: get template by slug
router.get('/:slug', getTemplate)

// Protected: create custom template
router.post('/', auth, createTemplate)

// Protected: apply template to bio page
router.post('/apply', auth, applyTemplate)

export default router
