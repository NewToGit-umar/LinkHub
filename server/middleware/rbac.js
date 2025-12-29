import Team from '../models/Team.js'

/**
 * Role-Based Access Control (RBAC) Middleware
 * Checks team membership and permissions for protected routes
 */

// Permission levels by role
const ROLE_PERMISSIONS = {
  owner: {
    canManageMembers: true,
    canManagePosts: true,
    canManageAccounts: true,
    canViewAnalytics: true,
    canManageBioPages: true,
    canPublish: true,
    canDeleteTeam: true,
    canManageSettings: true
  },
  admin: {
    canManageMembers: true,
    canManagePosts: true,
    canManageAccounts: true,
    canViewAnalytics: true,
    canManageBioPages: true,
    canPublish: true,
    canDeleteTeam: false,
    canManageSettings: true
  },
  editor: {
    canManageMembers: false,
    canManagePosts: true,
    canManageAccounts: false,
    canViewAnalytics: true,
    canManageBioPages: false,
    canPublish: true,
    canDeleteTeam: false,
    canManageSettings: false
  },
  viewer: {
    canManageMembers: false,
    canManagePosts: false,
    canManageAccounts: false,
    canViewAnalytics: true,
    canManageBioPages: false,
    canPublish: false,
    canDeleteTeam: false,
    canManageSettings: false
  }
}

/**
 * Get permissions for a role
 */
export function getRolePermissions(role) {
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.viewer
}

/**
 * Middleware factory - requires team membership
 * Attaches team and role to request
 */
export function requireTeamMember(options = {}) {
  const { teamParam = 'teamSlug' } = options

  return async (req, res, next) => {
    try {
      const userId = req.user?.id
      if (!userId) {
        return res.status(401).json({ message: 'Authentication required' })
      }

      // Get team slug from params, query, or body
      const teamSlug = req.params[teamParam] || req.query.team || req.body.teamSlug
      if (!teamSlug) {
        return res.status(400).json({ message: 'Team identifier required' })
      }

      const team = await Team.findBySlug(teamSlug)
      if (!team) {
        return res.status(404).json({ message: 'Team not found' })
      }

      if (!team.isMember(userId)) {
        return res.status(403).json({ message: 'Not a team member' })
      }

      // Attach team info to request
      req.team = team
      req.teamRole = team.getMemberRole(userId)
      req.teamPermissions = team.getMemberPermissions(userId)

      next()
    } catch (err) {
      console.error('requireTeamMember error', err)
      return res.status(500).json({ message: 'Authorization error', error: err.message })
    }
  }
}

/**
 * Middleware factory - requires specific permission
 */
export function requirePermission(permission) {
  return (req, res, next) => {
    // Must be used after requireTeamMember
    if (!req.teamPermissions) {
      return res.status(500).json({ message: 'Permission check requires team context' })
    }

    if (!req.teamPermissions[permission]) {
      return res.status(403).json({ 
        message: 'Insufficient permissions',
        required: permission,
        role: req.teamRole
      })
    }

    next()
  }
}

/**
 * Middleware factory - requires specific role(s)
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    // Must be used after requireTeamMember
    if (!req.teamRole) {
      return res.status(500).json({ message: 'Role check requires team context' })
    }

    if (!allowedRoles.includes(req.teamRole)) {
      return res.status(403).json({ 
        message: 'Role not authorized',
        required: allowedRoles,
        current: req.teamRole
      })
    }

    next()
  }
}

/**
 * Middleware - requires owner role
 */
export function requireOwner(req, res, next) {
  if (!req.teamRole) {
    return res.status(500).json({ message: 'Owner check requires team context' })
  }

  if (req.teamRole !== 'owner') {
    return res.status(403).json({ message: 'Owner access required' })
  }

  next()
}

/**
 * Middleware - requires admin or owner role
 */
export function requireAdmin(req, res, next) {
  if (!req.teamRole) {
    return res.status(500).json({ message: 'Admin check requires team context' })
  }

  if (req.teamRole !== 'owner' && req.teamRole !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' })
  }

  next()
}

/**
 * Middleware - requires editor, admin, or owner role
 */
export function requireEditor(req, res, next) {
  if (!req.teamRole) {
    return res.status(500).json({ message: 'Editor check requires team context' })
  }

  if (!['owner', 'admin', 'editor'].includes(req.teamRole)) {
    return res.status(403).json({ message: 'Editor access required' })
  }

  next()
}

/**
 * Combined middleware - auth + team member + permission
 */
export function teamAuth(permission = null) {
  const middlewares = [requireTeamMember()]
  if (permission) {
    middlewares.push(requirePermission(permission))
  }

  return (req, res, next) => {
    // Run middlewares in sequence
    const runMiddleware = (index) => {
      if (index >= middlewares.length) return next()
      middlewares[index](req, res, (err) => {
        if (err) return next(err)
        runMiddleware(index + 1)
      })
    }
    runMiddleware(0)
  }
}

/**
 * Utility - check if user has permission (for use in controllers)
 */
export function hasPermission(req, permission) {
  return req.teamPermissions?.[permission] === true
}

/**
 * Utility - check if user has role (for use in controllers)
 */
export function hasRole(req, ...roles) {
  return roles.includes(req.teamRole)
}

export default {
  requireTeamMember,
  requirePermission,
  requireRole,
  requireOwner,
  requireAdmin,
  requireEditor,
  teamAuth,
  hasPermission,
  hasRole,
  getRolePermissions
}
