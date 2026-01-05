import express from 'express'
import { auth } from '../middleware/auth.js'
import { 
  requireTeamMember, 
  requirePermission, 
  requireOwner, 
  requireAdmin 
} from '../middleware/rbac.js'
import {
  createTeam,
  getUserTeams,
  getTeam,
  updateTeam,
  deleteTeam,
  addMember,
  removeMember,
  updateMemberRole,
  getMembers,
  generateInviteLink,
  getInviteLinks,
  revokeInviteLink,
  joinViaInviteLink,
  getTeamByInviteLink
} from '../controllers/teamController.js'

const router = express.Router()

// Team CRUD
router.post('/', auth, createTeam)
router.get('/', auth, getUserTeams)
router.get('/:slug', auth, requireTeamMember({ teamParam: 'slug' }), getTeam)
router.patch('/:slug', auth, requireTeamMember({ teamParam: 'slug' }), requireAdmin, updateTeam)
router.delete('/:slug', auth, requireTeamMember({ teamParam: 'slug' }), requireOwner, deleteTeam)

// Member management
router.get('/:slug/members', auth, requireTeamMember({ teamParam: 'slug' }), getMembers)
router.post('/:slug/members', auth, requireTeamMember({ teamParam: 'slug' }), requirePermission('canManageMembers'), addMember)
router.delete('/:slug/members/:memberId', auth, requireTeamMember({ teamParam: 'slug' }), requirePermission('canManageMembers'), removeMember)
router.patch('/:slug/members/:memberId/role', auth, requireTeamMember({ teamParam: 'slug' }), requireAdmin, updateMemberRole)

// Shareable invite links
router.post('/:slug/invite-links', auth, requireTeamMember({ teamParam: 'slug' }), requirePermission('canManageMembers'), generateInviteLink)
router.get('/:slug/invite-links', auth, requireTeamMember({ teamParam: 'slug' }), requirePermission('canManageMembers'), getInviteLinks)
router.delete('/:slug/invite-links/:code', auth, requireTeamMember({ teamParam: 'slug' }), requirePermission('canManageMembers'), revokeInviteLink)

// Public join via invite link (preview and join)
router.get('/join/:slug/:code', getTeamByInviteLink)
router.post('/join/:slug/:code', auth, joinViaInviteLink)

export default router
