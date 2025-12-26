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

module.exports = exports;
