import mongoose from 'mongoose'

const memberSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['owner', 'admin', 'editor', 'viewer'],
    default: 'viewer'
  },
  permissions: {
    canManageMembers: { type: Boolean, default: false },
    canManagePosts: { type: Boolean, default: true },
    canManageAccounts: { type: Boolean, default: false },
    canViewAnalytics: { type: Boolean, default: true },
    canManageBioPages: { type: Boolean, default: false },
    canPublish: { type: Boolean, default: false }
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { _id: true })

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  description: {
    type: String,
    maxlength: 500,
    default: ''
  },
  avatar: {
    type: String,
    default: null
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  members: [memberSchema],
  // Team settings
  settings: {
    requireApproval: { type: Boolean, default: false }, // posts need approval
    allowMemberInvites: { type: Boolean, default: false }, // can members invite others
    defaultMemberRole: { type: String, enum: ['editor', 'viewer'], default: 'viewer' }
  },
  // Linked social accounts (shared with team)
  sharedAccounts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SocialAccount'
  }],
  // Team plan/limits
  plan: {
    type: String,
    enum: ['free', 'pro', 'enterprise'],
    default: 'free'
  },
  limits: {
    maxMembers: { type: Number, default: 5 },
    maxPosts: { type: Number, default: 50 },
    maxAccounts: { type: Number, default: 3 }
  },
  // Activity tracking
  lastActivityAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Pre-save hook to generate slug
teamSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .slice(0, 50)
  }
  next()
})

// Indexes
teamSchema.index({ ownerId: 1 })
teamSchema.index({ 'members.userId': 1 })
teamSchema.index({ slug: 1 }, { unique: true })

// Static methods
teamSchema.statics.findByUser = function(userId) {
  return this.find({
    $or: [
      { ownerId: userId },
      { 'members.userId': userId }
    ],
    isActive: true
  }).sort({ lastActivityAt: -1 })
}

teamSchema.statics.findBySlug = function(slug) {
  return this.findOne({ slug, isActive: true })
}

// Instance methods
teamSchema.methods.isMember = function(userId) {
  const userIdStr = String(userId)
  if (String(this.ownerId) === userIdStr) return true
  return this.members.some(m => String(m.userId) === userIdStr)
}

teamSchema.methods.getMemberRole = function(userId) {
  const userIdStr = String(userId)
  if (String(this.ownerId) === userIdStr) return 'owner'
  const member = this.members.find(m => String(m.userId) === userIdStr)
  return member ? member.role : null
}

teamSchema.methods.getMemberPermissions = function(userId) {
  const role = this.getMemberRole(userId)
  if (!role) return null
  
  if (role === 'owner') {
    return {
      canManageMembers: true,
      canManagePosts: true,
      canManageAccounts: true,
      canViewAnalytics: true,
      canManageBioPages: true,
      canPublish: true
    }
  }
  
  if (role === 'admin') {
    return {
      canManageMembers: true,
      canManagePosts: true,
      canManageAccounts: true,
      canViewAnalytics: true,
      canManageBioPages: true,
      canPublish: true
    }
  }
  
  const member = this.members.find(m => String(m.userId) === String(userId))
  return member?.permissions || null
}

teamSchema.methods.addMember = async function(userId, role = 'viewer', invitedBy = null) {
  if (this.isMember(userId)) {
    throw new Error('User is already a team member')
  }
  
  if (this.members.length >= this.limits.maxMembers) {
    throw new Error('Team member limit reached')
  }
  
  const defaultPerms = {
    viewer: { canManageMembers: false, canManagePosts: false, canManageAccounts: false, canViewAnalytics: true, canManageBioPages: false, canPublish: false },
    editor: { canManageMembers: false, canManagePosts: true, canManageAccounts: false, canViewAnalytics: true, canManageBioPages: false, canPublish: true },
    admin: { canManageMembers: true, canManagePosts: true, canManageAccounts: true, canViewAnalytics: true, canManageBioPages: true, canPublish: true }
  }
  
  this.members.push({
    userId,
    role,
    permissions: defaultPerms[role] || defaultPerms.viewer,
    invitedBy
  })
  
  this.lastActivityAt = new Date()
  return this.save()
}

teamSchema.methods.removeMember = async function(userId) {
  const userIdStr = String(userId)
  if (String(this.ownerId) === userIdStr) {
    throw new Error('Cannot remove team owner')
  }
  
  this.members = this.members.filter(m => String(m.userId) !== userIdStr)
  this.lastActivityAt = new Date()
  return this.save()
}

teamSchema.methods.updateMemberRole = async function(userId, newRole) {
  const member = this.members.find(m => String(m.userId) === String(userId))
  if (!member) throw new Error('Member not found')
  
  member.role = newRole
  this.lastActivityAt = new Date()
  return this.save()
}

const Team = mongoose.model('Team', teamSchema)

export default Team
