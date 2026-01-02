import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { getLandingProfile, updateLandingProfile, uploadLandingAvatar } from '../controllers/landingController.js'
import { auth } from '../middleware/auth.js'
import { requireAdmin } from '../middleware/admin.js'

const router = express.Router()

// Ensure upload directory exists
const uploadDir = 'uploads/landing'
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// Configure multer for landing avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, 'landing-avatar-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)
    if (extname && mimetype) {
      return cb(null, true)
    }
    cb(new Error('Only image files are allowed'))
  }
})

// Public route - get landing profile
router.get('/profile', getLandingProfile)

// Admin routes
router.put('/profile', auth, requireAdmin, updateLandingProfile)
router.post('/avatar', auth, requireAdmin, upload.single('avatar'), uploadLandingAvatar)

export default router
