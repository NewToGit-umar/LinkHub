import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'post_published',
      'post_failed',
      'post_scheduled',
      'token_expiring',
      'token_expired',
      'team_invite',
      'team_joined',
      'team_removed',
      'comment_added',
      'comment_reply',
      'mention',
      'milestone',
      'analytics_report',
      'system'
    ],
    index: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },
  // Reference to related entity
  reference: {
    type: {
      type: String,
      enum: ['post', 'team', 'account', 'comment', 'biopage', 'user']
    },
    id: mongoose.Schema.Types.ObjectId
  },
  // Additional data
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  // Status
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  },
  // Priority
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  // Action URL
  actionUrl: {
    type: String,
    default: null
  },
  // Expiration (for time-sensitive notifications)
  expiresAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
})

// Indexes
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 })
notificationSchema.index({ userId: 1, type: 1 })
notificationSchema.index({ createdAt: -1 })

// Virtual to check if expired
notificationSchema.virtual('isExpired').get(function() {
  return this.expiresAt && this.expiresAt < new Date()
})

// Static method to create notification
notificationSchema.statics.notify = async function(userId, type, title, message, options = {}) {
  const { reference, data, priority, actionUrl, expiresAt } = options
  
  return this.create({
    userId,
    type,
    title,
    message,
    reference,
    data,
    priority: priority || 'normal',
    actionUrl,
    expiresAt
  })
}

// Static method to get unread count
notificationSchema.statics.getUnreadCount = async function(userId) {
  return this.countDocuments({ userId, isRead: false })
}

// Static method to get notifications for user
notificationSchema.statics.getForUser = async function(userId, options = {}) {
  const { page = 1, limit = 20, unreadOnly = false, type } = options
  const skip = (page - 1) * limit

  const query = { userId }
  if (unreadOnly) query.isRead = false
  if (type) query.type = type

  const notifications = await this.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()

  const total = await this.countDocuments(query)
  const unreadCount = await this.countDocuments({ userId, isRead: false })

  return {
    notifications,
    total,
    unreadCount,
    page,
    limit,
    hasMore: skip + notifications.length < total
  }
}

// Static method to mark as read
notificationSchema.statics.markAsRead = async function(notificationId, userId) {
  return this.findOneAndUpdate(
    { _id: notificationId, userId },
    { isRead: true, readAt: new Date() },
    { new: true }
  )
}

// Static method to mark all as read
notificationSchema.statics.markAllAsRead = async function(userId) {
  return this.updateMany(
    { userId, isRead: false },
    { isRead: true, readAt: new Date() }
  )
}

// Static method to delete old notifications
notificationSchema.statics.deleteOld = async function(daysOld = 30) {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - daysOld)
  
  return this.deleteMany({
    createdAt: { $lt: cutoff },
    isRead: true
  })
}

// Notification helper functions
notificationSchema.statics.notifyPostPublished = async function(userId, postId, postTitle) {
  return this.notify(
    userId,
    'post_published',
    'Post Published',
    `Your post "${postTitle}" has been published successfully.`,
    {
      reference: { type: 'post', id: postId },
      actionUrl: `/posts/${postId}`
    }
  )
}

notificationSchema.statics.notifyPostFailed = async function(userId, postId, postTitle, error) {
  return this.notify(
    userId,
    'post_failed',
    'Post Failed',
    `Failed to publish "${postTitle}": ${error}`,
    {
      reference: { type: 'post', id: postId },
      priority: 'high',
      actionUrl: `/posts/${postId}`
    }
  )
}

notificationSchema.statics.notifyTokenExpiring = async function(userId, accountId, provider, expiresIn) {
  return this.notify(
    userId,
    'token_expiring',
    'Account Token Expiring',
    `Your ${provider} account token will expire in ${expiresIn}. Please reconnect to continue posting.`,
    {
      reference: { type: 'account', id: accountId },
      priority: 'high',
      actionUrl: `/accounts`
    }
  )
}

notificationSchema.statics.notifyTeamInvite = async function(userId, teamId, teamName, invitedBy) {
  return this.notify(
    userId,
    'team_invite',
    'Team Invitation',
    `${invitedBy} invited you to join "${teamName}".`,
    {
      reference: { type: 'team', id: teamId },
      actionUrl: `/teams`
    }
  )
}

notificationSchema.statics.notifyMilestone = async function(userId, milestone, message) {
  return this.notify(
    userId,
    'milestone',
    'Milestone Reached! 🎉',
    message,
    {
      data: { milestone },
      priority: 'low'
    }
  )
}

const Notification = mongoose.model('Notification', notificationSchema)

export default Notification
