import mongoose from 'mongoose'
import crypto from 'crypto'

const teamInvitationSchema = new mongoose.Schema({
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'editor', 'viewer'],
    default: 'viewer'
  },
  token: {
    type: String,
    unique: true,
    index: true
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'expired', 'revoked'],
    default: 'pending'
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  },
  acceptedAt: {
    type: Date,
    default: null
  },
  message: {
    type: String,
    maxlength: 500,
    default: ''
  }
}, {
  timestamps: true
})

// Generate unique token before saving
teamInvitationSchema.pre('save', function(next) {
  if (!this.token) {
    this.token = crypto.randomBytes(32).toString('hex')
  }
  next()
})

// Compound index
teamInvitationSchema.index({ teamId: 1, email: 1 })
teamInvitationSchema.index({ token: 1 })
teamInvitationSchema.index({ status: 1, expiresAt: 1 })

// Check if invitation is still valid
teamInvitationSchema.methods.isValid = function() {
  return this.status === 'pending' && this.expiresAt > new Date()
}

// Static method to find pending invitation by token
teamInvitationSchema.statics.findByToken = function(token) {
  return this.findOne({
    token,
    status: 'pending',
    expiresAt: { $gt: new Date() }
  }).populate('teamId').populate('invitedBy', 'name email')
}

// Static method to find pending invitations for a team
teamInvitationSchema.statics.findPendingByTeam = function(teamId) {
  return this.find({
    teamId,
    status: 'pending',
    expiresAt: { $gt: new Date() }
  }).populate('invitedBy', 'name email')
}

// Static method to find invitations for an email
teamInvitationSchema.statics.findByEmail = function(email) {
  return this.find({
    email: email.toLowerCase(),
    status: 'pending',
    expiresAt: { $gt: new Date() }
  }).populate('teamId').populate('invitedBy', 'name email')
}

// Accept invitation
teamInvitationSchema.methods.accept = async function() {
  this.status = 'accepted'
  this.acceptedAt = new Date()
  return this.save()
}

// Decline invitation
teamInvitationSchema.methods.decline = async function() {
  this.status = 'declined'
  return this.save()
}

// Revoke invitation
teamInvitationSchema.methods.revoke = async function() {
  this.status = 'revoked'
  return this.save()
}

const TeamInvitation = mongoose.model('TeamInvitation', teamInvitationSchema)

export default TeamInvitation
