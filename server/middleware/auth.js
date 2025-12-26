/**
 * Authentication Middleware
 * Handles JWT verification and user authentication
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AppError } = require('./errorHandler');
const logger = require('../utils/logger');

/**
 * Protect route - Check if user is authenticated
 * Verifies JWT token and populates req.user
 */
exports.protect = async (req, res, next) => {
  let token;

  // Get token from header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  // Check if token exists
  if (!token) {
    return next(new AppError('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return next(new AppError('User not found', 404));
    }

    if (!req.user.isActive || req.user.isBlocked) {
      return next(new AppError('User account is inactive', 403));
    }

    // Check if password was changed after token was issued
    if (req.user.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError('Password recently changed. Please log in again.', 401)
      );
    }

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token has expired', 401));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token', 401));
    }
    logger.error('Authentication error:', error.message);
    return next(new AppError('Authentication failed', 401));
  }
};

/**
 * Authorize - Check if user has required role(s)
 * @param  {...string} roles - Required roles
 * @returns {Function} Express middleware
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(`User role '${req.user.role}' is not authorized`, 403)
      );
    }
    next();
  };
};

/**
 * Optional Authentication
 * Attempts to get user from token but doesn't fail if not present
 */
exports.optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);
    } catch (error) {
      logger.debug('Optional auth failed:', error.message);
    }
  }

  next();
};

/**
 * Check if user is authenticated (for client-side usage)
 */
exports.isAuthenticated = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    return next(new AppError('User is not authenticated', 401));
  }
};

module.exports = exports;
