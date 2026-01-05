import User from '../models/User.js'

/**
 * Admin middleware - checks if user has admin role
 * Fetches full user from database if only ID is available
 */
export async function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' })
  }
  
  try {
    // If we only have user ID, fetch the full user
    if (!req.user.role && req.user.id) {
      const user = await User.findById(req.user.id).select('role name email')
      if (!user) {
        return res.status(401).json({ message: 'User not found' })
      }
      req.user = { ...req.user, ...user.toObject(), _id: user._id }
    }
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' })
    }
    
    next()
  } catch (err) {
    console.error('requireAdmin error:', err)
    return res.status(500).json({ message: 'Error checking admin status' })
  }
}

/**
 * Moderator middleware - allows admin or moderator roles
 * Fetches full user from database if only ID is available
 */
export async function requireModerator(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' })
  }
  
  try {
    // If we only have user ID, fetch the full user
    if (!req.user.role && req.user.id) {
      const user = await User.findById(req.user.id).select('role name email')
      if (!user) {
        return res.status(401).json({ message: 'User not found' })
      }
      req.user = { ...req.user, ...user.toObject(), _id: user._id }
    }
    
    if (!['admin', 'moderator'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Moderator access required' })
    }
    
    next()
  } catch (err) {
    console.error('requireModerator error:', err)
    return res.status(500).json({ message: 'Error checking moderator status' })
  }
}
