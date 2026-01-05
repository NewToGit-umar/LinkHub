import mongoose from 'mongoose'

const { Schema } = mongoose

const PasswordResetSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  used: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

// Index for automatic deletion of expired tokens
PasswordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

// Static method to create reset token
PasswordResetSchema.statics.createResetToken = async function(userId, email, token, expiresInHours = 1) {
  // Delete any existing reset tokens for this user
  await this.deleteMany({ userId })
  
  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000)
  
  return this.create({
    userId,
    email: email.toLowerCase(),
    token,
    expiresAt
  })
}

// Static method to find valid token
PasswordResetSchema.statics.findValidToken = async function(email, token) {
  return this.findOne({
    email: email.toLowerCase(),
    token,
    used: false,
    expiresAt: { $gt: new Date() }
  }).populate('userId', 'name email')
}

// Static method to mark token as used
PasswordResetSchema.statics.markAsUsed = async function(tokenId) {
  return this.findByIdAndUpdate(
    tokenId,
    { used: true },
    { new: true }
  )
}

const PasswordReset = mongoose.model('PasswordReset', PasswordResetSchema)

export default PasswordReset
