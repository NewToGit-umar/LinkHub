import Team from '../models/Team.js'
import User from '../models/User.js'

// Create a new team
export async function createTeam(req, res) {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ message: 'Unauthorized' })

    const { name, description } = req.body
    if (!name) return res.status(400).json({ message: 'Team name is required' })

    // Generate unique slug
    let slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').slice(0, 50)
    let existing = await Team.findOne({ slug })
    let suffix = 1
    while (existing) {
      slug = `${slug}-${suffix++}`
      existing = await Team.findOne({ slug })
    }

    const team = await Team.create({
      name,
      slug,
      description,
      ownerId: userId
    })

    return res.status(201).json({ team })
  } catch (err) {
    console.error('createTeam error', err)
    return res.status(500).json({ message: 'Error creating team', error: err.message })
  }
}

// Get user's teams
export async function getUserTeams(req, res) {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ message: 'Unauthorized' })

    const teams = await Team.findByUser(userId)
      .populate('ownerId', 'name email')
      .populate('members.userId', 'name email')

    return res.status(200).json({ teams })
  } catch (err) {
    console.error('getUserTeams error', err)
    return res.status(500).json({ message: 'Error fetching teams', error: err.message })
  }
}

// Get single team by slug
export async function getTeam(req, res) {
  try {
    const userId = req.user?.id
    const { slug } = req.params

    const team = await Team.findBySlug(slug)
      .populate('ownerId', 'name email')
      .populate('members.userId', 'name email')

    if (!team) return res.status(404).json({ message: 'Team not found' })
    if (!team.isMember(userId)) return res.status(403).json({ message: 'Not a team member' })

    const role = team.getMemberRole(userId)
    const permissions = team.getMemberPermissions(userId)

    return res.status(200).json({ team, role, permissions })
  } catch (err) {
    console.error('getTeam error', err)
    return res.status(500).json({ message: 'Error fetching team', error: err.message })
  }
}

// Update team settings
export async function updateTeam(req, res) {
  try {
    const userId = req.user?.id
    const { slug } = req.params
    const { name, description, settings } = req.body

    const team = await Team.findBySlug(slug)
    if (!team) return res.status(404).json({ message: 'Team not found' })

    const role = team.getMemberRole(userId)
    if (role !== 'owner' && role !== 'admin') {
      return res.status(403).json({ message: 'Insufficient permissions' })
    }

    if (name) team.name = name
    if (description !== undefined) team.description = description
    if (settings) team.settings = { ...team.settings, ...settings }
    team.lastActivityAt = new Date()

    await team.save()
    return res.status(200).json({ team })
  } catch (err) {
    console.error('updateTeam error', err)
    return res.status(500).json({ message: 'Error updating team', error: err.message })
  }
}

// Delete team (owner only)
export async function deleteTeam(req, res) {
  try {
    const userId = req.user?.id
    const { slug } = req.params

    const team = await Team.findBySlug(slug)
    if (!team) return res.status(404).json({ message: 'Team not found' })
    if (String(team.ownerId) !== String(userId)) {
      return res.status(403).json({ message: 'Only team owner can delete' })
    }

    team.isActive = false
    await team.save()

    return res.status(200).json({ message: 'Team deleted' })
  } catch (err) {
    console.error('deleteTeam error', err)
    return res.status(500).json({ message: 'Error deleting team', error: err.message })
  }
}

// Add member to team
export async function addMember(req, res) {
  try {
    const userId = req.user?.id
    const { slug } = req.params
    const { email, role = 'viewer' } = req.body

    const team = await Team.findBySlug(slug)
    if (!team) return res.status(404).json({ message: 'Team not found' })

    const permissions = team.getMemberPermissions(userId)
    if (!permissions?.canManageMembers) {
      return res.status(403).json({ message: 'Insufficient permissions' })
    }

    // Find user by email
    const userToAdd = await User.findOne({ email })
    if (!userToAdd) return res.status(404).json({ message: 'User not found' })

    await team.addMember(userToAdd._id, role, userId)

    return res.status(200).json({ message: 'Member added', team })
  } catch (err) {
    console.error('addMember error', err)
    return res.status(500).json({ message: err.message || 'Error adding member' })
  }
}

// Remove member from team
export async function removeMember(req, res) {
  try {
    const userId = req.user?.id
    const { slug, memberId } = req.params

    const team = await Team.findBySlug(slug)
    if (!team) return res.status(404).json({ message: 'Team not found' })

    const permissions = team.getMemberPermissions(userId)
    // Allow self-removal or require canManageMembers
    if (String(memberId) !== String(userId) && !permissions?.canManageMembers) {
      return res.status(403).json({ message: 'Insufficient permissions' })
    }

    await team.removeMember(memberId)

    return res.status(200).json({ message: 'Member removed', team })
  } catch (err) {
    console.error('removeMember error', err)
    return res.status(500).json({ message: err.message || 'Error removing member' })
  }
}

// Update member role
export async function updateMemberRole(req, res) {
  try {
    const userId = req.user?.id
    const { slug, memberId } = req.params
    const { role } = req.body

    const team = await Team.findBySlug(slug)
    if (!team) return res.status(404).json({ message: 'Team not found' })

    const permissions = team.getMemberPermissions(userId)
    if (!permissions?.canManageMembers) {
      return res.status(403).json({ message: 'Insufficient permissions' })
    }

    await team.updateMemberRole(memberId, role)

    return res.status(200).json({ message: 'Role updated', team })
  } catch (err) {
    console.error('updateMemberRole error', err)
    return res.status(500).json({ message: err.message || 'Error updating role' })
  }
}

// Get team members
export async function getMembers(req, res) {
  try {
    const userId = req.user?.id
    const { slug } = req.params

    const team = await Team.findBySlug(slug)
      .populate('ownerId', 'name email')
      .populate('members.userId', 'name email')

    if (!team) return res.status(404).json({ message: 'Team not found' })
    if (!team.isMember(userId)) return res.status(403).json({ message: 'Not a team member' })

    const members = [
      { user: team.ownerId, role: 'owner', permissions: team.getMemberPermissions(team.ownerId._id) },
      ...team.members.map(m => ({
        user: m.userId,
        role: m.role,
        permissions: m.permissions,
        joinedAt: m.joinedAt
      }))
    ]

    return res.status(200).json({ members })
  } catch (err) {
    console.error('getMembers error', err)
    return res.status(500).json({ message: 'Error fetching members', error: err.message })
  }
}
