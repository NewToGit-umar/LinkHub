const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const { Schema } = mongoose;

/**
 * User Schema
 * Stores user account information, authentication details, and profile data
 */
const UserSchema = new Schema(
  {
    // Personal Information
    firstName: {
      type: String,
      required: [true, 'Please provide a first name'],
      trim: true,
      maxlength: [50, 'First name cannot be more than 50 characters']
    },
    lastName: {
      type: String,
      required: [true, 'Please provide a last name'],
      trim: true,
      maxlength: [50, 'Last name cannot be more than 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    phone: {
      type: String,
      trim: true,
      default: null
    },

    // Authentication
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false // Don't return password by default in queries
    },
    passwordChangedAt: {
      type: Date,
      select: false
    },
    passwordResetToken: {
      type: String,
      select: false
    },
    passwordResetExpires: {
      type: Date,
      select: false
    },

    // OAuth Authentication
    googleId: {
      type: String,
      unique: true,
      sparse: true
    },
    facebookId: {
      type: String,
      unique: true,
      sparse: true
    },
    twitterId: {
      type: String,
      unique: true,
      sparse: true
    },
    linkedinId: {
      type: String,
      unique: true,
      sparse: true
    },
    instagramId: {
      type: String,
      unique: true,
      sparse: true
    },

    // Profile
    avatar: {
      type: String,
      default: null
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot be more than 500 characters'],
      default: ''
    },
    website: {
      type: String,
      default: null
    },
    location: {
      type: String,
      default: null
    },

    // Account Status
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationToken: {
      type: String,
      select: false
    },
    emailVerificationExpires: {
      type: Date,
      select: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isBlocked: {
      type: Boolean,
      default: false
    },

    // Two Factor Authentication
    twoFactorEnabled: {
      type: Boolean,
      default: false
    },
    twoFactorSecret: {
      type: String,
      select: false,
      default: null
    },
    twoFactorVerified: {
      type: Boolean,
      default: false
    },
    backupCodes: [{
      type: String,
      select: false
    }],

    // Roles and Permissions
    role: {
      type: String,
      enum: ['user', 'admin', 'moderator'],
      default: 'user'
    },
    permissions: {
      type: [String],
      default: []
    },

    // Preferences
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    },
    language: {
      type: String,
      default: 'en'
    },
    emailNotifications: {
      type: Boolean,
      default: true
    },
    pushNotifications: {
      type: Boolean,
      default: true
    },

    // Account Activity
    lastLoginAt: {
      type: Date,
      default: null
    },
    loginAttempts: {
      type: Number,
      default: 0,
      select: false
    },
    loginLockedUntil: {
      type: Date,
      select: false
    },

    // Metadata
    ip: String,
    userAgent: String,
    deletedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true // Adds createdAt and updatedAt
  }
);

// Indexes for better query performance
UserSchema.index({ email: 1 });
UserSchema.index({ googleId: 1 });
UserSchema.index({ facebookId: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ isActive: 1 });

// ==================== MIDDLEWARE ====================

/**
 * Hash password before saving
 */
UserSchema.pre('save', async function (next) {
  // Only hash password if it has been modified
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Update passwordChangedAt when password is modified
 */
UserSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000; // Subtract 1 second to ensure token issued after password change is valid
  next();
});

/**
 * Exclude deleted users from queries by default
 */
UserSchema.pre(/^find/, function (next) {
  // 'this' points to the current query
  this.find({ deletedAt: { $eq: null } });
  next();
});

// ==================== METHODS ====================

/**
 * Compare password with hashed password
 * @param {string} candidatePassword - Password to compare
 * @returns {Promise<boolean>} True if passwords match
 */
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Get user's full name
 * @returns {string} Full name
 */
UserSchema.methods.getFullName = function () {
  return `${this.firstName} ${this.lastName}`.trim();
};

/**
 * Get user's avatar URL or gravatar
 * @returns {string} Avatar URL
 */
UserSchema.methods.getAvatar = function () {
  if (this.avatar) return this.avatar;
  // Return gravatar if no avatar
  const crypto = require('crypto');
  const hash = crypto.createHash('md5').update(this.email).digest('hex');
  return `https://www.gravatar.com/avatar/${hash}?d=identicon`;
};

/**
 * Check if password was changed after JWT was issued
 * @param {number} JWTTimestamp - JWT issued timestamp
 * @returns {boolean} True if password was changed after token issued
 */
UserSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

/**
 * Check if account is locked due to too many login attempts
 * @returns {boolean} True if account is locked
 */
UserSchema.methods.isLoginLocked = function () {
  return this.loginLockedUntil && this.loginLockedUntil > Date.now();
};

/**
 * Increment login attempts
 */
UserSchema.methods.incrementLoginAttempts = async function () {
  // If previous lock has expired, restart at 1
  if (this.loginLockedUntil && this.loginLockedUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { loginLockedUntil: 1 }
    });
  }

  // Otherwise increment
  const updates = { $inc: { loginAttempts: 1 } };
  const maxAttempts = 5;
  const lockTime = 15 * 60 * 1000; // 15 minutes

  // Lock if max attempts exceeded
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLoginLocked()) {
    updates.$set = { loginLockedUntil: Date.now() + lockTime };
  }

  return this.updateOne(updates);
};

/**
 * Reset login attempts
 */
UserSchema.methods.resetLoginAttempts = async function () {
  return this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { loginLockedUntil: 1 }
  });
};

/**
 * Get public user data (safe to send to client)
 * @returns {Object} Public user data
 */
UserSchema.methods.toPublicJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.passwordResetToken;
  delete user.passwordResetExpires;
  delete user.emailVerificationToken;
  delete user.emailVerificationExpires;
  delete user.twoFactorSecret;
  delete user.backupCodes;
  delete user.loginAttempts;
  delete user.loginLockedUntil;
  delete user.__v;
  return user;
};

/**
 * Create password reset token
 * @returns {string} Reset token (unhashed)
 */
UserSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Hash token before saving
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Token expires in 1 hour
  this.passwordResetExpires = Date.now() + 60 * 60 * 1000;

  return resetToken;
};

/**
 * Create email verification token
 * @returns {string} Verification token (unhashed)
 */
UserSchema.methods.createEmailVerificationToken = function () {
  const verificationToken = crypto.randomBytes(32).toString('hex');

  // Hash token before saving
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  // Token expires in 24 hours
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;

  return verificationToken;
};

// ==================== STATICS ====================

/**
 * Find by email and select password
 * @param {string} email - User email
 * @returns {Promise<Object>} User document with password selected
 */
UserSchema.statics.findByEmailWithPassword = function (email) {
  return this.findOne({ email }).select('+password');
};

/**
 * Find active users
 * @returns {Promise<Array>} Active users
 */
UserSchema.statics.findActive = function () {
  return this.find({ isActive: true, isBlocked: false });
};

module.exports = mongoose.model('User', UserSchema);
