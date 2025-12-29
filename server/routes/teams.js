import express from 'express'
import { auth } from '../middleware/auth.js'
import {
  createTeam,
  getUserTeams,
  getTeam,
  updateTeam,
  deleteTeam,
  addMember,
  removeMember,
  updateMemberRole,
  getMembers
} from '../controllers/teamController.js'

const router = express.Router()

// Team CRUD
router.post('/', auth, createTeam)
router.get('/', auth, getUserTeams)
router.get('/:slug', auth, getTeam)
router.patch('/:slug', auth, updateTeam)
router.delete('/:slug', auth, deleteTeam)

// Member management
router.get('/:slug/members', auth, getMembers)
router.post('/:slug/members', auth, addMember)
router.delete('/:slug/members/:memberId', auth, removeMember)
router.patch('/:slug/members/:memberId/role', auth, updateMemberRole)

export default router
