import mongoose from 'mongoose'

const { Schema, models } = mongoose

/**
 * SocialAccountSchema
 * Captures the metadata required to integrate external social profiles with LinkHub
 */
const SocialAccountSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    platform: {
      type: String,
      enum: ['twitter', 'instagram', 'facebook', 'linkedin', 'tiktok', 'youtube'],
      required: true,
      lowercase: true
    },
    accountId: {
      type: String,
      required: true
    },
    accountHandle: {
      type: String,
      required: true,
      lowercase: true
    },
    accountName: {
      type: String
    },
    accessToken: {
      type: String,
      required: true,
      select: false // Don't return by default for security
    },
    refreshToken: {
      type: String,
      select: false
    },
    tokenExpiresAt: {
      type: Date
    },
    profileData: {
      displayName: String,
      profilePicture: String,
      bio: String,
      followerCount: Number,
      followingCount: Number,
      postsCount: Number,
      url: String
    },
    permissions: [String],
    isActive: {
      type: Boolean,
      default: true
    },
    isRevoked: {
      type: Boolean,
      default: false
    },
    revokedAt: Date,
    lastSyncAt: Date,
    syncStatus: {
      type: String,
      enum: ['idle', 'syncing', 'failed'],
      default: 'idle'
    },
    syncError: String,
    metadata: {
      type: Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

// Indexes
SocialAccountSchema.index({ userId: 1, platform: 1 }, { unique: true })
SocialAccountSchema.index({ accountId: 1, platform: 1 })
SocialAccountSchema.index({ createdAt: -1 })

/**
 * Pre-save middleware - Validate token expiration
 */
SocialAccountSchema.pre('save', function (next) {
  if (this.isRevoked && !this.revokedAt) {
    this.revokedAt = Date.now()
  }
  next()
})

/**
 * Check if token is expired
 */
SocialAccountSchema.methods.isTokenExpired = function () {
  if (!this.tokenExpiresAt) return false
  return this.tokenExpiresAt < Date.now()
}

/**
 * Check if account is valid and accessible
 */
SocialAccountSchema.methods.isValid = function () {
  return this.isActive && !this.isRevoked && !this.isTokenExpired()
}

/**
 * Get public account data (safe to send to client)
 */
SocialAccountSchema.methods.toPublicJSON = function () {
  const account = this.toObject()
  delete account.accessToken
  delete account.refreshToken
  delete account.__v
  return account
}

/**
 * Revoke account access
 */
SocialAccountSchema.methods.revoke = async function () {
  this.isRevoked = true
  this.isActive = false
  this.revokedAt = Date.now()
  // Remove sensitive tokens from the stored record (use empty string since accessToken is required)
  this.accessToken = 'REVOKED'
  this.refreshToken = null
  this.tokenExpiresAt = null
  await this.save()
  return this
}

/**
 * Get valid accounts for user (active and not revoked)
 */
SocialAccountSchema.statics.findValidByUserId = function (userId) {
  return this.find({
    userId,
    isActive: true,
    isRevoked: false
  })
}

/**
 * Get account by user and platform
 */
SocialAccountSchema.statics.findByUserAndPlatform = function (userId, platform) {
  return this.findOne({
    userId,
    platform: platform.toLowerCase()
  })
}

/**
 * Count connected accounts for user
 */
SocialAccountSchema.statics.countByUserId = function (userId) {
  return this.countDocuments({
    userId,
    isActive: true,
    isRevoked: false
  })
}

const SocialAccount = models.SocialAccount || mongoose.model('SocialAccount', SocialAccountSchema)

export default SocialAccount
