import Team from '../models/Team.js'
import User from '../models/User.js'
import crypto from 'crypto'
import * as socketService from '../services/socketService.js'

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

    // Send real-time notification to team
    socketService.notifyTeamMemberJoined(team._id.toString(), {
      userId: userToAdd._id.toString(),
      username: userToAdd.username || userToAdd.name,
      email: userToAdd.email,
      role
    })

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

    // Get member info before removing
    const memberToRemove = team.members.find(m => String(m.userId) === String(memberId)) || 
                          (String(team.ownerId) === String(memberId) ? { userId: team.ownerId, role: 'owner' } : null)

    await team.removeMember(memberId)

    // Send real-time notification to team
    if (memberToRemove) {
      const user = await User.findById(memberId)
      socketService.notifyTeamMemberLeft(team._id.toString(), {
        userId: memberId,
        username: user?.username || user?.name,
        email: user?.email
      })
    }

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

// Generate shareable team invite link
export async function generateInviteLink(req, res) {
  try {
    const userId = req.user?.id
    const { slug } = req.params
    const { role = 'viewer', expiresIn = 7 } = req.body // expiresIn is days

    const team = await Team.findBySlug(slug)
    if (!team) return res.status(404).json({ message: 'Team not found' })

    const permissions = team.getMemberPermissions(userId)
    if (!permissions?.canManageMembers) {
      return res.status(403).json({ message: 'Insufficient permissions' })
    }

    // Generate unique invite code
    const inviteCode = crypto.randomBytes(16).toString('hex')
    const expiresAt = new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000)

    // Store invite link in team settings
    if (!team.settings) team.settings = {}
    if (!team.settings.inviteLinks) team.settings.inviteLinks = []

    team.settings.inviteLinks.push({
      code: inviteCode,
      role,
      createdBy: userId,
      createdAt: new Date(),
      expiresAt,
      usageCount: 0,
      maxUses: req.body.maxUses || null // null = unlimited
    })

    await team.save()

    const inviteLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/join/${slug}/${inviteCode}`

    return res.status(200).json({
      inviteLink,
      code: inviteCode,
      role,
      expiresAt
    })
  } catch (err) {
    console.error('generateInviteLink error', err)
    return res.status(500).json({ message: 'Error generating invite link', error: err.message })
  }
}

// Get all invite links for a team
export async function getInviteLinks(req, res) {
  try {
    const userId = req.user?.id
    const { slug } = req.params

    const team = await Team.findBySlug(slug)
    if (!team) return res.status(404).json({ message: 'Team not found' })

    const permissions = team.getMemberPermissions(userId)
    if (!permissions?.canManageMembers) {
      return res.status(403).json({ message: 'Insufficient permissions' })
    }

    const inviteLinks = (team.settings?.inviteLinks || [])
      .filter(link => link.expiresAt > new Date())
      .map(link => ({
        code: link.code,
        role: link.role,
        createdAt: link.createdAt,
        expiresAt: link.expiresAt,
        usageCount: link.usageCount,
        maxUses: link.maxUses,
        link: `${process.env.CLIENT_URL || 'http://localhost:5173'}/join/${slug}/${link.code}`
      }))

    return res.status(200).json({ inviteLinks })
  } catch (err) {
    console.error('getInviteLinks error', err)
    return res.status(500).json({ message: 'Error fetching invite links', error: err.message })
  }
}

// Revoke invite link
export async function revokeInviteLink(req, res) {
  try {
    const userId = req.user?.id
    const { slug, code } = req.params

    const team = await Team.findBySlug(slug)
    if (!team) return res.status(404).json({ message: 'Team not found' })

    const permissions = team.getMemberPermissions(userId)
    if (!permissions?.canManageMembers) {
      return res.status(403).json({ message: 'Insufficient permissions' })
    }

    if (team.settings?.inviteLinks) {
      team.settings.inviteLinks = team.settings.inviteLinks.filter(
        link => link.code !== code
      )
      await team.save()
    }

    return res.status(200).json({ message: 'Invite link revoked' })
  } catch (err) {
    console.error('revokeInviteLink error', err)
    return res.status(500).json({ message: 'Error revoking invite link', error: err.message })
  }
}

// Join team via invite link (public with auth)
export async function joinViaInviteLink(req, res) {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ message: 'Unauthorized' })

    const { slug, code } = req.params

    const team = await Team.findBySlug(slug)
    if (!team) return res.status(404).json({ message: 'Team not found' })

    // Check if already a member
    if (team.isMember(userId)) {
      return res.status(400).json({ message: 'Already a member of this team' })
    }

    // Validate invite code
    const inviteLink = team.settings?.inviteLinks?.find(
      link => link.code === code && link.expiresAt > new Date()
    )

    if (!inviteLink) {
      return res.status(404).json({ message: 'Invalid or expired invite link' })
    }

    // Check max uses
    if (inviteLink.maxUses && inviteLink.usageCount >= inviteLink.maxUses) {
      return res.status(400).json({ message: 'This invite link has reached its maximum uses' })
    }

    // Add user to team
    await team.addMember(userId, inviteLink.role, inviteLink.createdBy)

    // Increment usage count
    inviteLink.usageCount = (inviteLink.usageCount || 0) + 1
    await team.save()

    // Get user info for notification
    const user = await User.findById(userId)

    // Send real-time notification to team
    socketService.notifyTeamMemberJoined(team._id.toString(), {
      userId: user._id.toString(),
      username: user.username || user.name,
      email: user.email,
      role: inviteLink.role
    })

    return res.status(200).json({
      message: 'Successfully joined team',
      team: {
        name: team.name,
        slug: team.slug,
        description: team.description
      },
      role: inviteLink.role
    })
  } catch (err) {
    console.error('joinViaInviteLink error', err)
    return res.status(500).json({ message: 'Error joining team', error: err.message })
  }
}

// Get team info by invite link (public - for preview)
export async function getTeamByInviteLink(req, res) {
  try {
    const { slug, code } = req.params

    const team = await Team.findBySlug(slug)
    if (!team) return res.status(404).json({ message: 'Team not found' })

    // Validate invite code
    const inviteLink = team.settings?.inviteLinks?.find(
      link => link.code === code && link.expiresAt > new Date()
    )

    if (!inviteLink) {
      return res.status(404).json({ message: 'Invalid or expired invite link' })
    }

    // Check max uses
    if (inviteLink.maxUses && inviteLink.usageCount >= inviteLink.maxUses) {
      return res.status(400).json({ message: 'This invite link has reached its maximum uses' })
    }

    return res.status(200).json({
      team: {
        name: team.name,
        slug: team.slug,
        description: team.description,
        memberCount: (team.members?.length || 0) + 1
      },
      role: inviteLink.role,
      expiresAt: inviteLink.expiresAt
    })
  } catch (err) {
    console.error('getTeamByInviteLink error', err)
    return res.status(500).json({ message: 'Error fetching team info', error: err.message })
  }
}
