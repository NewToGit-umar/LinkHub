import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const { Schema } = mongoose

const UserSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'moderator', 'admin'], default: 'user' },
  isVerified: { type: Boolean, default: false },
  isSuspended: { type: Boolean, default: false },
  suspendedAt: { type: Date, default: null },
  avatar: { type: String, default: null },
  privacySettings: {
    profilePublic: { type: Boolean, default: true },
    showEmail: { type: Boolean, default: false },
    allowAnalytics: { type: Boolean, default: true },
    allowMarketing: { type: Boolean, default: false }
  },
  createdAt: { type: Date, default: Date.now }
})

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    return next()
  } catch (err) {
    return next(err)
  }
})

// Instance method to compare password
UserSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

const User = mongoose.models.User || mongoose.model('User', UserSchema)
export default User
