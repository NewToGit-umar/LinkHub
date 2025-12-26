const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

/**
 * Public Routes
 * No authentication required
 */

// Register - Create new user account
router.post('/register', 
  authMiddleware.authRateLimit,
  authController.register
);

// Login - Authenticate user with email/password
router.post('/login', 
  authMiddleware.authRateLimit,
  authController.login
);

// OAuth Authentication
router.post('/google', authController.googleAuth);
router.post('/facebook', authController.facebookAuth);

// Forgot Password - Request password reset email
router.post(
  '/forgot-password',
  authMiddleware.authRateLimit,
  authController.forgotPassword
);

// Reset Password - Reset password with token
router.patch(
  '/reset-password/:token',
  authController.resetPassword
);

// Verify Reset Token - Check if reset token is valid
router.post(
  '/verify-reset-token',
  authController.verifyResetToken
);

// 2FA Verification (without full authentication)
router.post(
  '/2fa/verify-otp',
  authMiddleware.authRateLimit,
  authController.verify2FAOTP
);

router.post(
  '/2fa/verify-backup',
  authMiddleware.authRateLimit,
  authController.verify2FABackupCode
);

// Logout - Clear user session
router.post('/logout', authController.logout);

/**
 * Protected Routes
 * Require valid JWT token
 */

// Get current authenticated user
router.get(
  '/me',
  authMiddleware.protect,
  authController.getMe
);

// Verify authentication (for client-side checks)
router.get(
  '/verify',
  authMiddleware.protect,
  (req, res) => {
    res.status(200).json({
      success: true,
      user: req.user.toPublicJSON()
    });
  }
);

// Refresh access token
router.post(
  '/refresh-token',
  authMiddleware.protect,
  authController.refreshToken
);

// Update password
router.patch(
  '/update-password',
  authMiddleware.protect,
  authController.updatePassword
);

// Link OAuth account to existing user
router.post(
  '/link-oauth',
  authMiddleware.protect,
  authController.linkOAuthAccount
);

// Unlink OAuth account from existing user
router.post(
  '/unlink-oauth',
  authMiddleware.protect,
  authController.unlinkOAuthAccount
);

/**
 * 2FA Routes - Require authentication
 */

// Setup 2FA - Generate secret and QR code
router.post(
  '/2fa/setup',
  authMiddleware.protect,
  authController.setup2FA
);

// Verify and enable 2FA
router.post(
  '/2fa/enable',
  authMiddleware.protect,
  authController.verify2FA
);

// Disable 2FA
router.delete(
  '/2fa/disable',
  authMiddleware.protect,
  authController.disable2FA
);

module.exports = router;

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
