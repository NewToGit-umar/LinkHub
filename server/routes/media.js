import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = Router()

// Configure multer for video uploads
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/videos')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, `video-${req.user.id}-${uniqueSuffix}${path.extname(file.originalname)}`)
  }
})

// Configure multer for image uploads
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/images')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, `image-${req.user.id}-${uniqueSuffix}${path.extname(file.originalname)}`)
  }
})

const uploadVideo = multer({
  storage: videoStorage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit for videos
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp4|mov|avi|mkv|webm|m4v/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = /video/.test(file.mimetype)
    if (extname && mimetype) {
      return cb(null, true)
    }
    cb(new Error('Only video files are allowed!'))
  }
})

const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit per image
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = /image/.test(file.mimetype)
    if (extname && mimetype) {
      return cb(null, true)
    }
    cb(new Error('Only image files are allowed (JPEG, PNG, GIF, WebP)!'))
  }
})

// All routes require authentication
router.use(authMiddleware)

// Upload video
router.post('/', uploadVideo.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No video file uploaded' })
    }

    const serverUrl = process.env.SERVER_URL || 'http://localhost:5001'
    const videoUrl = `${serverUrl}/uploads/videos/${req.file.filename}`

    res.json({
      message: 'Video uploaded successfully',
      video: {
        url: videoUrl,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    })
  } catch (err) {
    console.error('Video upload error:', err)
    res.status(500).json({ message: 'Error uploading video', error: err.message })
  }
})

// Upload single image
router.post('/image', uploadImage.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' })
    }

    const serverUrl = process.env.SERVER_URL || 'http://localhost:5001'
    const imageUrl = `${serverUrl}/uploads/images/${req.file.filename}`

    res.json({
      message: 'Image uploaded successfully',
      image: {
        url: imageUrl,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    })
  } catch (err) {
    console.error('Image upload error:', err)
    res.status(500).json({ message: 'Error uploading image', error: err.message })
  }
})

// Upload multiple images (up to 4)
router.post('/images', uploadImage.array('images', 4), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No image files uploaded' })
    }

    const serverUrl = process.env.SERVER_URL || 'http://localhost:5001'
    const images = req.files.map(file => ({
      url: `${serverUrl}/uploads/images/${file.filename}`,
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype
    }))

    res.json({
      message: `${images.length} image(s) uploaded successfully`,
      images
    })
  } catch (err) {
    console.error('Images upload error:', err)
    res.status(500).json({ message: 'Error uploading images', error: err.message })
  }
})

// Delete video
router.delete('/:filename', async (req, res) => {
  try {
    const { filename } = req.params
    const filepath = path.join(__dirname, '../uploads/videos', filename)
    
    // Verify the file belongs to this user (filename contains user id)
    if (!filename.includes(req.user.id)) {
      return res.status(403).json({ message: 'Forbidden' })
    }

    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath)
    }

    res.json({ message: 'Video deleted successfully' })
  } catch (err) {
    console.error('Video delete error:', err)
    res.status(500).json({ message: 'Error deleting video', error: err.message })
  }
})

// Delete image
router.delete('/image/:filename', async (req, res) => {
  try {
    const { filename } = req.params
    const filepath = path.join(__dirname, '../uploads/images', filename)
    
    // Verify the file belongs to this user (filename contains user id)
    if (!filename.includes(req.user.id)) {
      return res.status(403).json({ message: 'Forbidden' })
    }

    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath)
    }

    res.json({ message: 'Image deleted successfully' })
  } catch (err) {
    console.error('Image delete error:', err)
    res.status(500).json({ message: 'Error deleting image', error: err.message })
  }
})

export default router
