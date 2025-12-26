/**
 * Authentication Middleware
 * Handles JWT verification, user authentication, and role-based access control
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AppError, asyncHandler } = require('./errorHandler');
const logger = require('../utils/logger');
const constants = require('../config/constants');

/**
 * Extract JWT token from request headers or cookies
 * @param {Object} req - Express request object
 * @returns {string|null} JWT token or null
 */
const extractToken = (req) => {
  let token = null;

  // Check Authorization header first (preferred)
  if (req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
      token = parts[1];
    }
  }

  // Fall back to cookies
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  return token;
};

/**
 * Verify JWT token signature and expiration
 * @param {string} token - JWT token
 * @returns {Object} Decoded token payload
 * @throws {AppError} If token is invalid or expired
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Token has expired. Please log in again.', 401);
    }
    if (error.name === 'JsonWebTokenError') {
      throw new AppError('Invalid token signature. Authentication failed.', 401);
    }
    if (error.name === 'NotBeforeError') {
      throw new AppError('Token is not yet valid', 401);
    }
    throw new AppError('Token verification failed', 401);
  }
};

/**
 * Protect route - Verify user authentication
 * Validates JWT token, user existence, account status, and password changes
 */
exports.protect = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    throw new AppError('No authentication token provided. Please log in.', 401);
  }

  // Verify token
  const decoded = verifyToken(token);

  // Get user from database
  const user = await User.findById(decoded.id);

  if (!user) {
    throw new AppError('User associated with this token no longer exists', 404);
  }

  // Check account status
  if (!user.isActive) {
    throw new AppError('User account is inactive. Contact support.', 403);
  }

  if (user.isBlocked) {
    throw new AppError('User account has been blocked', 403);
  }

  // Check if user is locked out due to failed login attempts
  if (user.isLoginLocked()) {
    throw new AppError('Account temporarily locked due to multiple failed login attempts. Try again later.', 423);
  }

  // Verify password hasn't been changed after token was issued
  if (user.changedPasswordAfter(decoded.iat)) {
    throw new AppError('Password recently changed. Please log in again.', 401);
  }

  // Store user in request for downstream middleware/routes
  req.user = user;
  req.tokenIssuedAt = decoded.iat;

  next();
});

/**
 * Authorization middleware - Check if user has required role(s)
 * Must be used after protect middleware
 * @param {...string} roles - Required roles (at least one must match)
 * @returns {Function} Express middleware
 * @example authorize('admin', 'moderator')
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required before authorization check', 401));
    }

    if (!roles.includes(req.user.role)) {
      logger.warn(`Authorization failed: User ${req.user._id} with role '${req.user.role}' tried to access admin resource`);
      return next(
        new AppError(
          `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${req.user.role}`,
          403
        )
      );
    }

    next();
  };
};

/**
 * Optional Authentication
 * Attempts to extract and verify token, but doesn't fail if not present
 * Useful for routes that have different behavior for authenticated vs unauthenticated users
 */
exports.optionalAuth = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);

  if (token) {
    try {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id);

      if (user && user.isActive && !user.isBlocked) {
        req.user = user;
        req.tokenIssuedAt = decoded.iat;
      }
    } catch (error) {
      logger.debug(`Optional auth failed: ${error.message}`);
      // Continue without user - this is not a protected route
    }
  }

  next();
});

/**
 * Verify user is authenticated (convenience middleware)
 * Shorter alternative to using protect + authorize('user')
 */
exports.isAuthenticated = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    return next(new AppError('Authentication required to access this resource', 401));
  }
};

/**
 * Get user information from current request
 * Returns user data if authenticated
 */
exports.getMe = (req, res, next) => {
  if (req.user) {
    req.params.id = req.user._id;
  }
  next();
};

/**
 * Restrict to specific user (prevent users from modifying others' data)
 * Must be used after protect middleware
 */
exports.restrictToUser = (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }

  // Allow if user is admin or if accessing their own resource
  if (req.user.role === 'admin' || req.user._id.toString() === req.params.id) {
    return next();
  }

  return next(
    new AppError('You do not have permission to modify this resource', 403)
  );
};

/**
 * Middleware to check if 2FA is enabled
 * Used before 2FA verification endpoints
 */
exports.requires2FA = (req, res, next) => {
  if (!req.user || !req.user.twoFactorEnabled) {
    return next(
      new AppError('Two-factor authentication is not enabled for this account', 400)
    );
  }
  next();
};

/**
 * Rate limiting middleware for authentication endpoints
 * Prevents brute force attacks on login and registration
 */
const authLimiters = new Map();

exports.authRateLimit = (req, res, next) => {
  const key = req.ip || req.connection.remoteAddress;
  const windowMs = constants.RATE_LIMIT_WINDOW_MS;
  const maxRequests = constants.RATE_LIMIT_MAX_REQUESTS;

  if (!authLimiters.has(key)) {
    authLimiters.set(key, {
      count: 1,
      resetTime: Date.now() + windowMs
    });
    return next();
  }

  const limiter = authLimiters.get(key);

  if (Date.now() > limiter.resetTime) {
    // Window expired, reset counter
    authLimiters.set(key, {
      count: 1,
      resetTime: Date.now() + windowMs
    });
    return next();
  }

  limiter.count++;

  if (limiter.count > maxRequests) {
    return next(
      new AppError(
        `Too many authentication attempts. Please try again after ${Math.ceil((limiter.resetTime - Date.now()) / 1000 / 60)} minutes.`,
        429
      )
    );
  }

  next();
};

module.exports = exports;
