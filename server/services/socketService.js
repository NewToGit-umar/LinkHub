import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'

let io = null
const userSockets = new Map() // userId -> Set of socket IDs

/**
 * Initialize Socket.IO server
 */
export function initializeSocketIO(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  })

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token
      
      if (!token) {
        return next(new Error('Authentication required'))
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'linkhub-secret')
      socket.userId = decoded.id || decoded.userId
      socket.user = decoded
      next()
    } catch (error) {
      console.error('Socket auth error:', error.message)
      next(new Error('Invalid token'))
    }
  })

  io.on('connection', (socket) => {
    const userId = socket.userId

    if (userId) {
      // Add socket to user's socket set
      if (!userSockets.has(userId)) {
        userSockets.set(userId, new Set())
      }
      userSockets.get(userId).add(socket.id)

      // Join user's personal room
      socket.join(`user:${userId}`)
      
      console.log(`🔌 User ${userId} connected (socket: ${socket.id})`)

      // Handle team room joins
      socket.on('join:team', (teamId) => {
        socket.join(`team:${teamId}`)
        console.log(`User ${userId} joined team room: ${teamId}`)
      })

      socket.on('leave:team', (teamId) => {
        socket.leave(`team:${teamId}`)
        console.log(`User ${userId} left team room: ${teamId}`)
      })

      // Handle typing indicators for team chat
      socket.on('typing:start', ({ teamId }) => {
        socket.to(`team:${teamId}`).emit('user:typing', {
          userId,
          username: socket.user?.username
        })
      })

      socket.on('typing:stop', ({ teamId }) => {
        socket.to(`team:${teamId}`).emit('user:stopped-typing', { userId })
      })

      // Handle disconnect
      socket.on('disconnect', () => {
        if (userSockets.has(userId)) {
          userSockets.get(userId).delete(socket.id)
          if (userSockets.get(userId).size === 0) {
            userSockets.delete(userId)
          }
        }
        console.log(`🔌 User ${userId} disconnected (socket: ${socket.id})`)
      })
    }
  })

  console.log('🔌 Socket.IO server initialized')
  return io
}

/**
 * Get Socket.IO instance
 */
export function getIO() {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call initializeSocketIO first.')
  }
  return io
}

/**
 * Check if user is online
 */
export function isUserOnline(userId) {
  return userSockets.has(userId) && userSockets.get(userId).size > 0
}

/**
 * Get online users count
 */
export function getOnlineUsersCount() {
  return userSockets.size
}

/**
 * Send notification to a specific user
 */
export function sendToUser(userId, event, data) {
  if (!io) return false

  try {
    io.to(`user:${userId}`).emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    })
    return true
  } catch (error) {
    console.error('Error sending to user:', error)
    return false
  }
}

/**
 * Send notification to a team
 */
export function sendToTeam(teamId, event, data) {
  if (!io) return false

  try {
    io.to(`team:${teamId}`).emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    })
    return true
  } catch (error) {
    console.error('Error sending to team:', error)
    return false
  }
}

/**
 * Broadcast to all connected users
 */
export function broadcast(event, data) {
  if (!io) return false

  try {
    io.emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    })
    return true
  } catch (error) {
    console.error('Error broadcasting:', error)
    return false
  }
}

// ==================== NOTIFICATION HELPERS ====================

/**
 * Notify user about a new notification
 */
export function notifyUser(userId, notification) {
  return sendToUser(userId, 'notification:new', notification)
}

/**
 * Notify about post published successfully
 */
export function notifyPostPublished(userId, postId, postTitle) {
  return sendToUser(userId, 'post:published', {
    type: 'post_published',
    postId,
    title: postTitle,
    message: `Your post "${postTitle}" has been published successfully!`
  })
}

/**
 * Notify about post failed
 */
export function notifyPostFailed(userId, postId, postTitle, error) {
  return sendToUser(userId, 'post:failed', {
    type: 'post_failed',
    postId,
    title: postTitle,
    error,
    message: `Failed to publish "${postTitle}": ${error}`
  })
}

/**
 * Notify about post scheduled
 */
export function notifyPostScheduled(userId, postId, postTitle, scheduledAt) {
  return sendToUser(userId, 'post:scheduled', {
    type: 'post_scheduled',
    postId,
    title: postTitle,
    scheduledAt,
    message: `Your post "${postTitle}" has been scheduled for ${new Date(scheduledAt).toLocaleString()}`
  })
}

/**
 * Notify team about new member
 */
export function notifyTeamMemberJoined(teamId, member) {
  return sendToTeam(teamId, 'team:member-joined', {
    type: 'member_joined',
    member,
    message: `${member.username || member.email} has joined the team`
  })
}

/**
 * Notify team about member left
 */
export function notifyTeamMemberLeft(teamId, member) {
  return sendToTeam(teamId, 'team:member-left', {
    type: 'member_left',
    member,
    message: `${member.username || member.email} has left the team`
  })
}

/**
 * Notify user about team invitation
 */
export function notifyTeamInvitation(userId, invitation) {
  return sendToUser(userId, 'team:invitation', {
    type: 'team_invitation',
    invitation,
    message: `You've been invited to join team "${invitation.teamName}"`
  })
}

/**
 * Notify about new comment on post
 */
export function notifyNewComment(userId, comment) {
  return sendToUser(userId, 'comment:new', {
    type: 'new_comment',
    comment,
    message: `New comment on your post from ${comment.authorName || 'someone'}`
  })
}

/**
 * Notify about analytics update
 */
export function notifyAnalyticsUpdate(userId, analytics) {
  return sendToUser(userId, 'analytics:update', {
    type: 'analytics_update',
    analytics,
    message: 'Your analytics have been updated'
  })
}

/**
 * Notify about social account status change
 */
export function notifySocialAccountStatus(userId, platform, status, error = null) {
  return sendToUser(userId, 'social:status', {
    type: 'social_account_status',
    platform,
    status,
    error,
    message: status === 'connected' 
      ? `${platform} account connected successfully`
      : `${platform} account: ${status}${error ? ` - ${error}` : ''}`
  })
}

/**
 * Notify about milestone achieved
 */
export function notifyMilestoneAchieved(userId, milestone) {
  return sendToUser(userId, 'milestone:achieved', {
    type: 'milestone_achieved',
    milestone,
    message: `Congratulations! You've achieved a new milestone: ${milestone.title}`
  })
}

export default {
  initializeSocketIO,
  getIO,
  isUserOnline,
  getOnlineUsersCount,
  sendToUser,
  sendToTeam,
  broadcast,
  notifyUser,
  notifyPostPublished,
  notifyPostFailed,
  notifyPostScheduled,
  notifyTeamMemberJoined,
  notifyTeamMemberLeft,
  notifyTeamInvitation,
  notifyNewComment,
  notifyAnalyticsUpdate,
  notifySocialAccountStatus,
  notifyMilestoneAchieved
}
