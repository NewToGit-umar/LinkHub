import mongoose from 'mongoose'

const { Schema } = mongoose

const OTPSchema = new Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  otp: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['registration', 'password_reset', 'email_change'],
    default: 'registration'
  },
  attempts: {
    type: Number,
    default: 0
  },
  maxAttempts: {
    type: Number,
    default: 5
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

// Index for automatic deletion of expired OTPs
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

// Static method to create OTP
OTPSchema.statics.createOTP = async function(email, otp, type = 'registration', expiresInMinutes = 10) {
  // Delete any existing OTPs for this email and type
  await this.deleteMany({ email: email.toLowerCase(), type })
  
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000)
  
  return this.create({
    email: email.toLowerCase(),
    otp,
    type,
    expiresAt
  })
}

// Static method to verify OTP
OTPSchema.statics.verifyOTP = async function(email, otp, type = 'registration') {
  const otpRecord = await this.findOne({
    email: email.toLowerCase(),
    type,
    expiresAt: { $gt: new Date() }
  })
  
  if (!otpRecord) {
    return { valid: false, message: 'OTP expired or not found. Please request a new one.' }
  }
  
  if (otpRecord.attempts >= otpRecord.maxAttempts) {
    await otpRecord.deleteOne()
    return { valid: false, message: 'Too many failed attempts. Please request a new OTP.' }
  }
  
  if (otpRecord.otp !== otp) {
    otpRecord.attempts += 1
    await otpRecord.save()
    const remaining = otpRecord.maxAttempts - otpRecord.attempts
    return { valid: false, message: `Invalid OTP. ${remaining} attempts remaining.` }
  }
  
  // OTP is valid - mark as verified and return success
  otpRecord.verified = true
  await otpRecord.save()
  
  return { valid: true, message: 'OTP verified successfully' }
}

// Static method to check if email has verified OTP
OTPSchema.statics.isEmailVerified = async function(email, type = 'registration') {
  const otpRecord = await this.findOne({
    email: email.toLowerCase(),
    type,
    verified: true,
    expiresAt: { $gt: new Date() }
  })
  
  return !!otpRecord
}

// Static method to clean up verified OTP after use
OTPSchema.statics.consumeVerifiedOTP = async function(email, type = 'registration') {
  await this.deleteMany({ email: email.toLowerCase(), type })
}

const OTP = mongoose.model('OTP', OTPSchema)

export default OTP
