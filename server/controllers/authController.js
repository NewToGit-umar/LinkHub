const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Generate JWT Token
 * @param {string} id - User ID
 * @returns {string} JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

/**
 * Create JWT Token and send it in response
 * @param {Object} user - User document
 * @param {number} statusCode - HTTP status code
 * @param {Object} res - Response object
 */
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = generateToken(user._id);

  // Cookie options
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_EXPIRE * 24 * 60 * 60 * 1000 || 7 * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' // Only sent over HTTPS in production
  };

  // Remove password from output
  user.password = undefined;

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      status: 'success',
      token,
      data: {
        user: user.toPublicJSON()
      }
    });
};

/**
 * Register User
 * POST /api/auth/register
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next
 */
exports.register = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, email, password, passwordConfirm } = req.body;

  // Validation
  if (!firstName || !lastName || !email || !password || !passwordConfirm) {
    return next(new AppError('Please provide all required fields', 400));
  }

  // Check if passwords match
  if (password !== passwordConfirm) {
    return next(new AppError('Passwords do not match', 400));
  }

  // Check if password is strong enough
  if (password.length < 6) {
    return next(new AppError('Password must be at least 6 characters', 400));
  }

  // Check if user already exists
  let user = await User.findOne({ email });
  if (user) {
    return next(new AppError('Email already registered', 409));
  }

  // Create user
  user = await User.create({
    firstName,
    lastName,
    email,
    password,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });

  logger.success(`✅ User registered: ${email}`);

  // Send token response
  sendTokenResponse(user, 201, res);
});

/**
 * Login User
 * POST /api/auth/login
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next
 */
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // Check if user exists and password matches
  const user = await User.findByEmailWithPassword(email);

  if (!user || !(await user.comparePassword(password))) {
    // Increment failed login attempts
    if (user) {
      await user.incrementLoginAttempts();
    }
    return next(new AppError('Invalid email or password', 401));
  }

  // Check if account is locked
  if (user.isLoginLocked()) {
    return next(
      new AppError(
        'Account is temporarily locked due to too many failed login attempts. Try again later.',
        423
      )
    );
  }

  // Check if account is active
  if (!user.isActive || user.isBlocked) {
    return next(new AppError('Account is inactive or blocked', 403));
  }

  // Reset login attempts on successful login
  await user.resetLoginAttempts();

  // Update last login
  user.lastLoginAt = Date.now();
  await user.save({ validateBeforeSave: false });

  logger.success(`✅ User logged in: ${email}`);

  // Send token response
  sendTokenResponse(user, 200, res);
});

/**
 * Logout User
 * POST /api/auth/logout
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
exports.logout = asyncHandler(async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully'
  });
});

/**
 * Get Current User
 * GET /api/auth/me
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    status: 'success',
    data: {
      user: user.toPublicJSON()
    }
  });
});

/**
 * Update User Password
 * PATCH /api/auth/update-password
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next
 */
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword, passwordConfirm } = req.body;

  // Validation
  if (!currentPassword || !newPassword || !passwordConfirm) {
    return next(new AppError('Please provide all password fields', 400));
  }

  if (newPassword !== passwordConfirm) {
    return next(new AppError('New passwords do not match', 400));
  }

  if (newPassword.length < 6) {
    return next(new AppError('New password must be at least 6 characters', 400));
  }

  // Get user with password
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  if (!(await user.comparePassword(currentPassword))) {
    return next(new AppError('Current password is incorrect', 401));
  }

  // Update password
  user.password = newPassword;
  await user.save();

  logger.success(`✅ Password updated for user: ${user.email}`);

  // Send token response
  sendTokenResponse(user, 200, res);
});

/**
 * Refresh Token
 * POST /api/auth/refresh-token
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
exports.refreshToken = asyncHandler(async (req, res) => {
  const token = generateToken(req.user.id);

  res.status(200).json({
    status: 'success',
    token
  });
});

/**
 * Google OAuth Callback
 * POST /api/auth/google
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next
 */
exports.googleAuth = asyncHandler(async (req, res, next) => {
  const { googleId, email, firstName, lastName, avatar } = req.body;

  if (!googleId || !email) {
    return next(new AppError('Google ID and email are required', 400));
  }

  // Check if user exists
  let user = await User.findOne({ $or: [{ googleId }, { email }] });

  if (user) {
    // Update google ID if not set
    if (!user.googleId) {
      user.googleId = googleId;
      await user.save({ validateBeforeSave: false });
    }
    logger.success(`✅ User logged in via Google: ${email}`);
    return sendTokenResponse(user, 200, res);
  }

  // Create new user
  user = await User.create({
    googleId,
    email,
    firstName: firstName || email.split('@')[0],
    lastName: lastName || '',
    avatar,
    isEmailVerified: true, // Google email is verified
    isActive: true
  });

  logger.success(`✅ New user created via Google: ${email}`);
  sendTokenResponse(user, 201, res);
});

/**
 * Facebook OAuth Callback
 * POST /api/auth/facebook
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next
 */
exports.facebookAuth = asyncHandler(async (req, res, next) => {
  const { facebookId, email, firstName, lastName, avatar } = req.body;

  if (!facebookId || !email) {
    return next(new AppError('Facebook ID and email are required', 400));
  }

  // Check if user exists
  let user = await User.findOne({ $or: [{ facebookId }, { email }] });

  if (user) {
    // Update facebook ID if not set
    if (!user.facebookId) {
      user.facebookId = facebookId;
      await user.save({ validateBeforeSave: false });
    }
    logger.success(`✅ User logged in via Facebook: ${email}`);
    return sendTokenResponse(user, 200, res);
  }

  // Create new user
  user = await User.create({
    facebookId,
    email,
    firstName: firstName || email.split('@')[0],
    lastName: lastName || '',
    avatar,
    isEmailVerified: true, // Facebook email is verified
    isActive: true
  });

  logger.success(`✅ New user created via Facebook: ${email}`);
  sendTokenResponse(user, 201, res);
});

/**
 * Link OAuth Account to Existing User
 * POST /api/auth/link-oauth
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next
 */
exports.linkOAuthAccount = asyncHandler(async (req, res, next) => {
  const { provider, providerId } = req.body;

  if (!provider || !providerId) {
    return next(new AppError('Provider and provider ID are required', 400));
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Update user with OAuth ID
  const oauthField = `${provider}Id`;
  if (!user[oauthField]) {
    user[oauthField] = providerId;
    await user.save({ validateBeforeSave: false });
    logger.success(`✅ OAuth account linked: ${provider} for user ${user.email}`);
  }

  res.status(200).json({
    status: 'success',
    message: `${provider} account linked successfully`,
    data: { user: user.toPublicJSON() }
  });
});

/**
 * Unlink OAuth Account
 * POST /api/auth/unlink-oauth
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next
 */
exports.unlinkOAuthAccount = asyncHandler(async (req, res, next) => {
  const { provider } = req.body;

  if (!provider) {
    return next(new AppError('Provider is required', 400));
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  const oauthField = `${provider}Id`;
  
  // Check if user has password (can't remove only auth method)
  if (!user.password && ['google', 'facebook', 'twitter', 'linkedin', 'instagram'].filter(p => user[`${p}Id`]).length === 1) {
    return next(new AppError('Cannot unlink the only authentication method', 400));
  }

  user[oauthField] = undefined;
  await user.save({ validateBeforeSave: false });

  logger.success(`✅ OAuth account unlinked: ${provider} for user ${user.email}`);

  res.status(200).json({
    status: 'success',
    message: `${provider} account unlinked successfully`,
    data: { user: user.toPublicJSON() }
  });
});

/**
 * Forgot Password - Generate reset token and send email
 * @route POST /api/v1/auth/forgot-password
 * @access Public
 */
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  // Validate email
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new AppError('Please provide a valid email address', 400);
  }

  // Find user by email
  const user = await User.findOne({ email });

  if (!user) {
    // Don't reveal if user exists (security best practice)
    return res.status(200).json({
      status: 'success',
      message: 'If an account exists with that email, you will receive a password reset link'
    });
  }

  // Check if user is blocked
  if (user.isBlocked) {
    throw new AppError('Your account has been blocked. Contact support.', 403);
  }

  // Generate reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // Create reset URL
  const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;

  try {
    // Send email
    const emailService = require('../utils/email');
    await emailService.sendPasswordResetEmail(user.email, resetToken, resetUrl);

    logger.success(`Password reset email sent to ${user.email}`);

    res.status(200).json({
      status: 'success',
      message: 'Password reset link has been sent to your email'
    });
  } catch (error) {
    // Clear reset token if email fails
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    logger.error(`Password reset email failed: ${error.message}`);
    throw new AppError('Email could not be sent. Please try again later.', 500);
  }
});

/**
 * Reset Password - Verify token and update password
 * @route PATCH /api/v1/auth/reset-password/:token
 * @access Public
 */
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const { password, passwordConfirm } = req.body;
  const { token } = req.params;

  // Validate inputs
  if (!password || !passwordConfirm) {
    throw new AppError('Please provide password and password confirmation', 400);
  }

  if (password !== passwordConfirm) {
    throw new AppError('Passwords do not match', 400);
  }

  if (password.length < 8) {
    throw new AppError('Password must be at least 8 characters long', 400);
  }

  // Hash token and find user
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    throw new AppError('Password reset token is invalid or has expired', 400);
  }

  // Check if user is blocked
  if (user.isBlocked) {
    throw new AppError('Your account has been blocked. Contact support.', 403);
  }

  // Update password
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.passwordChangedAt = Date.now();
  user.loginAttempts = 0; // Reset login attempts
  await user.save();

  logger.success(`Password reset successfully for user ${user.email}`);

  // Send user a token and log them in
  sendTokenResponse(user, 200, res);
});

/**
 * Verify Password Reset Token - Check if token is valid
 * @route POST /api/v1/auth/verify-reset-token
 * @access Public
 */
exports.verifyResetToken = asyncHandler(async (req, res, next) => {
  const { token } = req.body;

  if (!token) {
    throw new AppError('Password reset token is required', 400);
  }

  // Hash token and find user
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({
      status: 'error',
      message: 'Password reset token is invalid or has expired'
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Token is valid',
    valid: true
  });
});

module.exports = exports;
