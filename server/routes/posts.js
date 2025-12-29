import express from 'express'
import * as postController from '../controllers/postController.js'
import auth from '../middleware/auth.js'

const router = express.Router()

// Create a post
router.post('/', auth, postController.createPost)

// List posts for current user
router.get('/', auth, postController.listPosts)

// Update a post
router.put('/:id', auth, postController.updatePost)

// Delete (cancel) a post
router.delete('/:id', auth, postController.deletePost)

export default router
