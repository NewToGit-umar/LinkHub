import express from 'express'
import * as postController from '../controllers/postController.js'
import auth from '../middleware/auth.js'

const router = express.Router()

// Create a post
router.post('/', auth, postController.createPost)

// List posts for current user
router.get('/', auth, postController.listPosts)

export default router
