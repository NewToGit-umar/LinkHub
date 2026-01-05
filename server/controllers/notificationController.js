import Notification from '../models/Notification.js'

// Get notifications for current user
export async function getNotifications(req, res) {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ message: 'Unauthorized' })

    const { page = 1, limit = 20, unreadOnly = false, type } = req.query

    const result = await Notification.getForUser(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      unreadOnly: unreadOnly === 'true',
      type
    })

    return res.status(200).json(result)
  } catch (err) {
    console.error('getNotifications error', err)
    return res.status(500).json({ message: 'Error fetching notifications', error: err.message })
  }
}

// Get unread count
export async function getUnreadCount(req, res) {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ message: 'Unauthorized' })

    const count = await Notification.getUnreadCount(userId)

    return res.status(200).json({ count })
  } catch (err) {
    console.error('getUnreadCount error', err)
    return res.status(500).json({ message: 'Error getting count', error: err.message })
  }
}

// Mark notification as read
export async function markAsRead(req, res) {
  try {
    const userId = req.user?.id
    const { id } = req.params

    const notification = await Notification.markAsRead(id, userId)
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' })
    }

    return res.status(200).json({ notification })
  } catch (err) {
    console.error('markAsRead error', err)
    return res.status(500).json({ message: 'Error marking as read', error: err.message })
  }
}

// Mark all as read
export async function markAllAsRead(req, res) {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ message: 'Unauthorized' })

    const result = await Notification.markAllAsRead(userId)

    return res.status(200).json({ message: 'All notifications marked as read', count: result.modifiedCount })
  } catch (err) {
    console.error('markAllAsRead error', err)
    return res.status(500).json({ message: 'Error marking all as read', error: err.message })
  }
}

// Delete notification
export async function deleteNotification(req, res) {
  try {
    const userId = req.user?.id
    const { id } = req.params

    const result = await Notification.deleteOne({ _id: id, userId })
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Notification not found' })
    }

    return res.status(200).json({ message: 'Notification deleted' })
  } catch (err) {
    console.error('deleteNotification error', err)
    return res.status(500).json({ message: 'Error deleting notification', error: err.message })
  }
}

// Clear all read notifications
export async function clearRead(req, res) {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ message: 'Unauthorized' })

    const result = await Notification.deleteMany({ userId, isRead: true })

    return res.status(200).json({ message: 'Read notifications cleared', count: result.deletedCount })
  } catch (err) {
    console.error('clearRead error', err)
    return res.status(500).json({ message: 'Error clearing notifications', error: err.message })
  }
}
