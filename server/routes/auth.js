import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import OTP from '../models/OTP.js';
import PasswordReset from '../models/PasswordReset.js';
import { sendOTPEmail, sendPasswordResetEmail, generateOTP, generateResetToken } from '../services/emailService.js';

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Send OTP to email for verification (before registration)
router.post('/send-otp', async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if user already exists with this email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Generate and save OTP
    const otp = generateOTP();
    await OTP.createOTP(email, otp);

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp, name || 'User');

    if (emailSent) {
      res.status(200).json({ 
        message: 'OTP sent successfully to your email',
        email: email
      });
    } else {
      res.status(500).json({ message: 'Failed to send OTP email' });
    }
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Error sending OTP', error: error.message });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const result = await OTP.verifyOTP(email, otp);

    if (result.valid) {
      res.status(200).json({ 
        message: 'Email verified successfully',
        verified: true
      });
    } else {
      res.status(400).json({ 
        message: result.message,
        verified: false,
        attemptsRemaining: result.attemptsRemaining
      });
    }
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Error verifying OTP', error: error.message });
  }
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Generate new OTP (this will invalidate old one)
    const otp = generateOTP();
    await OTP.createOTP(email, otp);

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp, name || 'User');

    if (emailSent) {
      res.status(200).json({ message: 'New OTP sent successfully' });
    } else {
      res.status(500).json({ message: 'Failed to resend OTP' });
    }
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Error resending OTP', error: error.message });
  }
});

// Register (requires verified email)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if email is verified
    const isVerified = await OTP.isEmailVerified(email);
    if (!isVerified) {
      return res.status(400).json({
        message: 'Please verify your email first'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists with this email'
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      isEmailVerified: true // Email was verified via OTP
    });

    // Clean up the OTP record
    await OTP.consumeVerifiedOTP(email);

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error creating user',
      error: error.message
    });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        isEmailVerified: user.isEmailVerified,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Login error', error: error.message });
  }
});

// Forgot password - send reset email
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    
    // Don't reveal if user exists for security
    if (!user) {
      return res.status(200).json({ 
        message: 'If an account exists with this email, you will receive a password reset link' 
      });
    }

    // Generate reset token
    const resetToken = generateResetToken();
    await PasswordReset.createResetToken(user._id, email, resetToken);

    // Create reset URL (frontend URL)
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    // Send password reset email
    const emailSent = await sendPasswordResetEmail(email, resetUrl, user.name);

    res.status(200).json({ 
      message: 'If an account exists with this email, you will receive a password reset link'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Error processing request', error: error.message });
  }
});

// Reset password with token
router.post('/reset-password', async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      return res.status(400).json({ message: 'Email, token, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Find valid reset token
    const resetRecord = await PasswordReset.findValidToken(email, token);
    if (!resetRecord) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Find user and update password
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Update password (the User model should hash it in pre-save hook)
    user.password = newPassword;
    await user.save();

    // Mark token as used
    await PasswordReset.markAsUsed(resetRecord._id);

    res.status(200).json({ message: 'Password reset successfully. You can now login with your new password.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
});

// Verify reset token is valid (for frontend validation)
router.get('/verify-reset-token', async (req, res) => {
  try {
    const { email, token } = req.query;

    if (!email || !token) {
      return res.status(400).json({ valid: false, message: 'Email and token are required' });
    }

    const resetRecord = await PasswordReset.findValidToken(email, token);
    
    if (resetRecord) {
      res.status(200).json({ valid: true });
    } else {
      res.status(400).json({ valid: false, message: 'Invalid or expired reset token' });
    }
  } catch (error) {
    console.error('Verify reset token error:', error);
    res.status(500).json({ valid: false, message: 'Error verifying token' });
  }
});

// Google OAuth - Continue with Google
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: 'Google credential is required' });
    }

    // Verify the Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    if (!email) {
      return res.status(400).json({ message: 'Email not provided by Google' });
    }

    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      // User exists - update Google info if not set
      if (!user.googleId) {
        user.googleId = googleId;
        user.isEmailVerified = true;
        if (!user.avatar && picture) {
          user.avatar = picture;
        }
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        name,
        email,
        googleId,
        avatar: picture,
        isEmailVerified: true,
        // Generate a random password for Google users (they won't use it)
        password: Math.random().toString(36).slice(-16) + Math.random().toString(36).slice(-16),
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(200).json({
      message: 'Google authentication successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        isEmailVerified: user.isEmailVerified,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ message: 'Google authentication failed', error: error.message });
  }
});

export default router;