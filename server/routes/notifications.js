import express from 'express'
import { auth } from '../middleware/auth.js'
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearRead
} from '../controllers/notificationController.js'

const router = express.Router()

// Get notifications
router.get('/', auth, getNotifications)

// Get unread count
router.get('/unread-count', auth, getUnreadCount)

// Mark all as read
router.post('/read-all', auth, markAllAsRead)

// Clear read notifications
router.delete('/clear-read', auth, clearRead)

// Mark single as read
router.post('/:id/read', auth, markAsRead)

// Delete notification
router.delete('/:id', auth, deleteNotification)

export default router
