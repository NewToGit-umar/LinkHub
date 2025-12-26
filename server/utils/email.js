/**
 * Email Service Utility
 * Handles sending emails for verification, password reset, and notifications
 */

const nodemailer = require('nodemailer');
const logger = require('./logger');

// Create transporter
let transporter;

// Initialize transporter based on environment
if (process.env.NODE_ENV === 'production') {
  // Production: Use SendGrid or Gmail with app password
  if (process.env.EMAIL_SERVICE === 'sendgrid') {
    transporter = nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    });
  } else {
    // Default to Gmail
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }
} else {
  // Development: Use Ethereal (test email service)
  const createTestAccount = async () => {
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  };

  // Initialize async
  (async () => {
    if (!transporter) {
      transporter = await createTestAccount();
    }
  })();
}

/**
 * Send email with error handling
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} [options.text] - Plain text content
 * @returns {Promise<Object>} Send result
 */
const sendEmail = async (options) => {
  try {
    // Wait for transporter to initialize
    if (!transporter) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@linkhub.app',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || ''
    };

    const info = await transporter.sendMail(mailOptions);

    logger.success(`Email sent to ${options.to}`);

    // Log preview URL in development
    if (process.env.NODE_ENV === 'development') {
      logger.info(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }

    return info;
  } catch (error) {
    logger.error(`Failed to send email to ${options.to}: ${error.message}`);
    throw new Error(`Email sending failed: ${error.message}`);
  }
};

/**
 * Send password reset email
 * @param {string} email - User email
 * @param {string} resetToken - Reset token
 * @param {string} resetUrl - Frontend reset URL
 */
exports.sendPasswordResetEmail = async (email, resetToken, resetUrl) => {
  const message = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Password Reset Request</h2>
      <p>You requested a password reset for your LinkHub account.</p>
      <p style="margin: 30px 0;">
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px;">
          Reset Password
        </a>
      </p>
      <p style="color: #666; font-size: 14px;">Or copy this link: <code>${resetUrl}</code></p>
      <p style="color: #999; font-size: 12px;">This link will expire in 1 hour.</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">
        If you didn't request this password reset, please ignore this email.
      </p>
      <p style="color: #999; font-size: 12px;">
        © ${new Date().getFullYear()} LinkHub. All rights reserved.
      </p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'Password Reset Request - LinkHub',
    html: message
  });
};

/**
 * Send email verification email
 * @param {string} email - User email
 * @param {string} verificationToken - Verification token
 * @param {string} verificationUrl - Frontend verification URL
 */
exports.sendEmailVerificationEmail = async (email, verificationToken, verificationUrl) => {
  const message = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Verify Your Email</h2>
      <p>Welcome to LinkHub! Please verify your email address to activate your account.</p>
      <p style="margin: 30px 0;">
        <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #28a745; color: white; text-decoration: none; border-radius: 4px;">
          Verify Email
        </a>
      </p>
      <p style="color: #666; font-size: 14px;">Or copy this link: <code>${verificationUrl}</code></p>
      <p style="color: #999; font-size: 12px;">This link will expire in 24 hours.</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">
        If you didn't create this account, please ignore this email.
      </p>
      <p style="color: #999; font-size: 12px;">
        © ${new Date().getFullYear()} LinkHub. All rights reserved.
      </p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'Email Verification - LinkHub',
    html: message
  });
};

/**
 * Send 2FA setup email
 * @param {string} email - User email
 * @param {string} backupCodes - Backup codes
 */
exports.send2FASetupEmail = async (email, backupCodes) => {
  const codes = backupCodes.join(', ');
  const message = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Two-Factor Authentication Enabled</h2>
      <p>Two-factor authentication has been successfully enabled on your LinkHub account.</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; margin: 20px 0;">
        <p style="margin: 0; font-weight: bold; margin-bottom: 10px;">Backup Codes (Save in a secure location)</p>
        <code style="display: block; line-height: 1.8; word-break: break-all;">${codes}</code>
      </div>
      <p style="color: #d9534f;">Important: Save these backup codes in a secure location. You can use them to access your account if you lose access to your authenticator app.</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">
        © ${new Date().getFullYear()} LinkHub. All rights reserved.
      </p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'Two-Factor Authentication Enabled - LinkHub',
    html: message
  });
};

/**
 * Send welcome email
 * @param {string} email - User email
 * @param {string} firstName - User first name
 */
exports.sendWelcomeEmail = async (email, firstName) => {
  const message = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #007bff;">Welcome to LinkHub!</h1>
      <p>Hi ${firstName},</p>
      <p>Your account has been successfully created. You can now start managing your social media across all platforms from one convenient dashboard.</p>
      <h3>Getting Started:</h3>
      <ul>
        <li>Connect your social media accounts</li>
        <li>Schedule posts across multiple platforms</li>
        <li>Monitor analytics and engagement</li>
        <li>Collaborate with your team</li>
      </ul>
      <p style="margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL || 'https://linkhub.app'}/dashboard" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px;">
          Go to Dashboard
        </a>
      </p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">
        Questions? Check out our <a href="${process.env.FRONTEND_URL || 'https://linkhub.app'}/help" style="color: #007bff;">help center</a>.
      </p>
      <p style="color: #999; font-size: 12px;">
        © ${new Date().getFullYear()} LinkHub. All rights reserved.
      </p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'Welcome to LinkHub!',
    html: message
  });
};

/**
 * Send account locked notification
 * @param {string} email - User email
 * @param {number} minutesUntilUnlock - Minutes until account is unlocked
 */
exports.sendAccountLockedEmail = async (email, minutesUntilUnlock) => {
  const message = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #d9534f;">Account Temporarily Locked</h2>
      <p>Your LinkHub account has been temporarily locked due to multiple failed login attempts.</p>
      <p style="color: #666;">Your account will be automatically unlocked in ${minutesUntilUnlock} minutes.</p>
      <p>If this wasn't you, please secure your account by changing your password.</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">
        © ${new Date().getFullYear()} LinkHub. All rights reserved.
      </p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'Account Temporarily Locked - LinkHub',
    html: message
  });
};

module.exports = {
  sendEmail,
  sendPasswordResetEmail: exports.sendPasswordResetEmail,
  sendEmailVerificationEmail: exports.sendEmailVerificationEmail,
  send2FASetupEmail: exports.send2FASetupEmail,
  sendWelcomeEmail: exports.sendWelcomeEmail,
  sendAccountLockedEmail: exports.sendAccountLockedEmail
};
