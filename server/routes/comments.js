import express from 'express'
import { auth } from '../middleware/auth.js'
import {
  createComment,
  getPostComments,
  getReplies,
  updateComment,
  deleteComment,
  toggleReaction
} from '../controllers/commentController.js'

const router = express.Router()

// Create comment
router.post('/', auth, createComment)

// Get comments for a post
router.get('/post/:postId', auth, getPostComments)

// Get replies to a comment
router.get('/:commentId/replies', auth, getReplies)

// Update comment
router.patch('/:commentId', auth, updateComment)

// Delete comment
router.delete('/:commentId', auth, deleteComment)

// Toggle reaction
router.post('/:commentId/react', auth, toggleReaction)

export default router
