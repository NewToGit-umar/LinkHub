import express from 'express'
import { auth } from '../middleware/auth.js'
import {
  createInvitation,
  getTeamInvitations,
  getUserInvitations,
  getInvitationByToken,
  acceptInvitation,
  declineInvitation,
  revokeInvitation,
  resendInvitation
} from '../controllers/invitationController.js'

const router = express.Router()

// Get user's pending invitations
router.get('/me', auth, getUserInvitations)

// Get invitation by token (public for viewing invite details)
router.get('/token/:token', getInvitationByToken)

// Accept/Decline invitation (authenticated)
router.post('/accept/:token', auth, acceptInvitation)
router.post('/decline/:token', auth, declineInvitation)

// Team-specific invitation routes
router.get('/team/:slug', auth, getTeamInvitations)
router.post('/team/:slug', auth, createInvitation)
router.delete('/team/:slug/:invitationId', auth, revokeInvitation)
router.post('/team/:slug/:invitationId/resend', auth, resendInvitation)

export default router
