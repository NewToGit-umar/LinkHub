import express from 'express'
import * as socialController from '../controllers/socialController.js'
import auth from '../middleware/auth.js'

const router = express.Router()

// Start OAuth flow (redirect) — provider-specific auth must be configured via env
router.get('/start/:provider', auth, socialController.startOAuth)

// Callback endpoint — accepts tokens (dev) or handles real provider callbacks
router.post('/callback/:provider', auth, socialController.callback)

// List connected accounts for current user
router.get('/', auth, socialController.listAccounts)

// Disconnect account
router.post('/disconnect/:provider', auth, socialController.disconnect)

export default router
const express = require('express');
const socialController = require('../controllers/socialController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware.protect);

/**
 * Social Accounts Routes
 */

// Get all connected social accounts
router.get('/accounts', socialController.getSocialAccounts);

// Get accounts summary
router.get('/summary', socialController.getSocialSummary);

// Connect new social account
router.post('/accounts', socialController.connectAccount);

// Get single social account
router.get('/accounts/:id', socialController.getSocialAccount);

// Update social account
router.patch('/accounts/:id', socialController.updateSocialAccount);

// Get account statistics
router.get('/accounts/:id/stats', socialController.getAccountStats);

// Refresh account token
router.post('/accounts/:id/refresh-token', socialController.refreshAccountToken);

// Disconnect social account
router.delete('/accounts/:id', socialController.disconnectAccount);

module.exports = router;
