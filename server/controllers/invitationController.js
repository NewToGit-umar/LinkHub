import TeamInvitation from '../models/TeamInvitation.js'
import Team from '../models/Team.js'
import User from '../models/User.js'
import * as socketService from '../services/socketService.js'

// Create invitation
export async function createInvitation(req, res) {
  try {
    const userId = req.user?.id
    const { slug } = req.params
    const { email, role = 'viewer', message } = req.body

    if (!email) return res.status(400).json({ message: 'Email is required' })

    const team = await Team.findBySlug(slug)
    if (!team) return res.status(404).json({ message: 'Team not found' })

    // Check permissions
    const permissions = team.getMemberPermissions(userId)
    if (!permissions?.canManageMembers) {
      return res.status(403).json({ message: 'Insufficient permissions' })
    }

    // Check if user is already a member
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser && team.isMember(existingUser._id)) {
      return res.status(400).json({ message: 'User is already a team member' })
    }

    // Check for existing pending invitation
    const existingInvite = await TeamInvitation.findOne({
      teamId: team._id,
      email: email.toLowerCase(),
      status: 'pending',
      expiresAt: { $gt: new Date() }
    })
    if (existingInvite) {
      return res.status(400).json({ message: 'An invitation is already pending for this email' })
    }

    // Create invitation
    const invitation = await TeamInvitation.create({
      teamId: team._id,
      email: email.toLowerCase(),
      role,
      invitedBy: userId,
      message
    })

    const inviteLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/invite/${invitation.token}`

    // Send real-time notification if user exists and is online
    if (existingUser) {
      socketService.notifyTeamInvitation(existingUser._id.toString(), {
        teamName: team.name,
        teamSlug: team.slug,
        role,
        inviteLink,
        token: invitation.token
      })
    }

    // In production, send email here
    // await sendInvitationEmail(email, invitation.token, team.name)

    return res.status(201).json({
      invitation,
      inviteLink
    })
  } catch (err) {
    console.error('createInvitation error', err)
    return res.status(500).json({ message: 'Error creating invitation', error: err.message })
  }
}

// Get pending invitations for a team
export async function getTeamInvitations(req, res) {
  try {
    const userId = req.user?.id
    const { slug } = req.params

    const team = await Team.findBySlug(slug)
    if (!team) return res.status(404).json({ message: 'Team not found' })

    const permissions = team.getMemberPermissions(userId)
    if (!permissions?.canManageMembers) {
      return res.status(403).json({ message: 'Insufficient permissions' })
    }

    const invitations = await TeamInvitation.findPendingByTeam(team._id)
    return res.status(200).json({ invitations })
  } catch (err) {
    console.error('getTeamInvitations error', err)
    return res.status(500).json({ message: 'Error fetching invitations', error: err.message })
  }
}

// Get invitations for current user (by email)
export async function getUserInvitations(req, res) {
  try {
    const userId = req.user?.id
    const user = await User.findById(userId)
    if (!user) return res.status(401).json({ message: 'Unauthorized' })

    const invitations = await TeamInvitation.findByEmail(user.email)
    return res.status(200).json({ invitations })
  } catch (err) {
    console.error('getUserInvitations error', err)
    return res.status(500).json({ message: 'Error fetching invitations', error: err.message })
  }
}

// Get invitation by token (public - for invite link)
export async function getInvitationByToken(req, res) {
  try {
    const { token } = req.params

    const invitation = await TeamInvitation.findByToken(token)
    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found or expired' })
    }

    return res.status(200).json({
      invitation: {
        teamName: invitation.teamId?.name,
        teamSlug: invitation.teamId?.slug,
        role: invitation.role,
        invitedBy: invitation.invitedBy?.name,
        message: invitation.message,
        expiresAt: invitation.expiresAt
      }
    })
  } catch (err) {
    console.error('getInvitationByToken error', err)
    return res.status(500).json({ message: 'Error fetching invitation', error: err.message })
  }
}

// Accept invitation
export async function acceptInvitation(req, res) {
  try {
    const userId = req.user?.id
    const { token } = req.params

    const invitation = await TeamInvitation.findByToken(token)
    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found or expired' })
    }

    // Verify user email matches invitation
    const user = await User.findById(userId)
    if (!user || user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      return res.status(403).json({ message: 'This invitation is not for your account' })
    }

    const team = await Team.findById(invitation.teamId)
    if (!team) {
      return res.status(404).json({ message: 'Team no longer exists' })
    }

    // Add user to team
    await team.addMember(userId, invitation.role, invitation.invitedBy)

    // Mark invitation as accepted
    await invitation.accept()

    // Send real-time notification to team members
    socketService.notifyTeamMemberJoined(team._id.toString(), {
      userId: user._id.toString(),
      username: user.username || user.name,
      email: user.email,
      role: invitation.role
    })

    return res.status(200).json({ message: 'Invitation accepted', team })
  } catch (err) {
    console.error('acceptInvitation error', err)
    return res.status(500).json({ message: err.message || 'Error accepting invitation' })
  }
}

// Decline invitation
export async function declineInvitation(req, res) {
  try {
    const userId = req.user?.id
    const { token } = req.params

    const invitation = await TeamInvitation.findByToken(token)
    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found or expired' })
    }

    // Verify user email matches invitation
    const user = await User.findById(userId)
    if (!user || user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      return res.status(403).json({ message: 'This invitation is not for your account' })
    }

    await invitation.decline()

    return res.status(200).json({ message: 'Invitation declined' })
  } catch (err) {
    console.error('declineInvitation error', err)
    return res.status(500).json({ message: 'Error declining invitation', error: err.message })
  }
}

// Revoke invitation (team admin)
export async function revokeInvitation(req, res) {
  try {
    const userId = req.user?.id
    const { slug, invitationId } = req.params

    const team = await Team.findBySlug(slug)
    if (!team) return res.status(404).json({ message: 'Team not found' })

    const permissions = team.getMemberPermissions(userId)
    if (!permissions?.canManageMembers) {
      return res.status(403).json({ message: 'Insufficient permissions' })
    }

    const invitation = await TeamInvitation.findById(invitationId)
    if (!invitation || String(invitation.teamId) !== String(team._id)) {
      return res.status(404).json({ message: 'Invitation not found' })
    }

    await invitation.revoke()

    return res.status(200).json({ message: 'Invitation revoked' })
  } catch (err) {
    console.error('revokeInvitation error', err)
    return res.status(500).json({ message: 'Error revoking invitation', error: err.message })
  }
}

// Resend invitation
export async function resendInvitation(req, res) {
  try {
    const userId = req.user?.id
    const { slug, invitationId } = req.params

    const team = await Team.findBySlug(slug)
    if (!team) return res.status(404).json({ message: 'Team not found' })

    const permissions = team.getMemberPermissions(userId)
    if (!permissions?.canManageMembers) {
      return res.status(403).json({ message: 'Insufficient permissions' })
    }

    const invitation = await TeamInvitation.findById(invitationId)
    if (!invitation || String(invitation.teamId) !== String(team._id)) {
      return res.status(404).json({ message: 'Invitation not found' })
    }

    // Reset expiration
    invitation.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    invitation.status = 'pending'
    await invitation.save()

    // In production, resend email here

    return res.status(200).json({
      message: 'Invitation resent',
      inviteLink: `${process.env.CLIENT_URL || 'http://localhost:5173'}/invite/${invitation.token}`
    })
  } catch (err) {
    console.error('resendInvitation error', err)
    return res.status(500).json({ message: 'Error resending invitation', error: err.message })
  }
}
