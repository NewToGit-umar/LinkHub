import express from 'express'
import jwt from 'jsonwebtoken'
import * as socialController from '../controllers/socialController.js'
import auth from '../middleware/auth.js'

const router = express.Router()

// Middleware to authenticate via query token (for redirects) or header
function tokenAuth(req, res, next) {
  // Check for token in query params first (for browser redirects)
  let token = req.query.token
  
  // Fall back to Authorization header
  if (!token) {
    const auth = req.headers.authorization || req.headers.Authorization
    if (auth && auth.startsWith('Bearer ')) {
      token = auth.split(' ')[1]
    }
  }
  
  if (!token) {
    return res.status(401).json({ message: 'Missing authentication token' })
  }
  
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.user = { id: payload.userId }
    return next()
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}

// Start OAuth flow (redirect) — provider-specific auth must be configured via env
router.get('/start/:provider', tokenAuth, socialController.startOAuth)

// OAuth callback endpoint — handles real provider callbacks (GET from OAuth redirect)
router.get('/callback/:provider', socialController.callback)

// Manual callback endpoint — accepts tokens directly (for dev/testing)
router.post('/callback/:provider', auth, socialController.manualCallback)

// List connected accounts for current user
router.get('/', auth, socialController.listAccounts)

// Disconnect account
router.post('/disconnect/:provider', auth, socialController.disconnect)

// Manual sync/refresh tokens for a provider
router.post('/refresh/:provider', auth, socialController.sync)

export default router

