/**
 * Admin middleware - checks if user has admin role
 */
export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' })
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' })
  }
  
  next()
}

/**
 * Moderator middleware - allows admin or moderator roles
 */
export function requireModerator(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' })
  }
  
  if (!['admin', 'moderator'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Moderator access required' })
  }
  
  next()
}
