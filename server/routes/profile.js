import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import User from '../models/User.js'
import multer from 'multer'
import path from 'path'
import fs from 'fs'

const router = Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/avatars'
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, `avatar-${req.user.id}-${uniqueSuffix}${path.extname(file.originalname)}`)
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
    cb(new Error('Only image files are allowed!'))
  }
})

// All routes require authentication
router.use(authMiddleware)

// Get user profile
router.get('/', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    res.json({ user })
  } catch (err) {
    res.status(500).json({ message: 'Error fetching profile', error: err.message })
  }
})

// Update user profile
router.patch('/', async (req, res) => {
  try {
    const { name, bio, location, website, phone } = req.body
    
    const updateData = {}
    if (name) updateData.name = name
    if (bio !== undefined) updateData.bio = bio
    if (location !== undefined) updateData.location = location
    if (website !== undefined) updateData.website = website
    if (phone !== undefined) updateData.phone = phone

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true }
    ).select('-password')

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({ message: 'Profile updated successfully', user })
  } catch (err) {
    res.status(500).json({ message: 'Error updating profile', error: err.message })
  }
})

// Upload avatar
router.post('/avatar', upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`
    
    // Delete old avatar if exists
    const user = await User.findById(req.user.id)
    if (user.avatar && user.avatar.startsWith('/uploads/')) {
      const oldPath = `.${user.avatar}`
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath)
      }
    }

    // Update user with new avatar
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { avatar: avatarUrl } },
      { new: true }
    ).select('-password')

    res.json({ message: 'Avatar uploaded successfully', user: updatedUser, avatarUrl })
  } catch (err) {
    res.status(500).json({ message: 'Error uploading avatar', error: err.message })
  }
})

// Delete avatar
router.delete('/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    
    if (user.avatar && user.avatar.startsWith('/uploads/')) {
      const avatarPath = `.${user.avatar}`
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath)
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { avatar: null } },
      { new: true }
    ).select('-password')

    res.json({ message: 'Avatar deleted successfully', user: updatedUser })
  } catch (err) {
    res.status(500).json({ message: 'Error deleting avatar', error: err.message })
  }
})

// Change password
router.post('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required' })
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters' })
    }

    const user = await User.findById(req.user.id)
    const isMatch = await user.comparePassword(currentPassword)
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' })
    }

    user.password = newPassword
    await user.save()

    res.json({ message: 'Password changed successfully' })
  } catch (err) {
    res.status(500).json({ message: 'Error changing password', error: err.message })
  }
})

export default router
