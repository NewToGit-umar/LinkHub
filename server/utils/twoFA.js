/**
 * Two-Factor Authentication (2FA) Service
 * Handles OTP generation, verification, and backup codes
 */

const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');
const logger = require('./logger');

/**
 * Generate a new 2FA secret and QR code
 * @param {string} email - User email for QR code label
 * @param {string} appName - App name (default: LinkHub)
 * @returns {Promise<Object>} Secret, QR code URL, and backup codes
 */
exports.generateSecret = async (email, appName = 'LinkHub') => {
  try {
    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `${appName} (${email})`,
      issuer: appName,
      length: 32 // 256-bit secret
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    // Generate backup codes (10 codes)
    const backupCodes = Array.from({ length: 10 }, () =>
      crypto.randomBytes(4).toString('hex').toUpperCase()
    );

    logger.success(`2FA secret generated for ${email}`);

    return {
      secret: secret.base32,
      otpauthUrl: secret.otpauth_url,
      qrCodeUrl,
      backupCodes
    };
  } catch (error) {
    logger.error(`Failed to generate 2FA secret: ${error.message}`);
    throw new Error('Failed to generate 2FA secret');
  }
};

/**
 * Verify OTP token
 * @param {string} secret - User's 2FA secret
 * @param {string} token - OTP token to verify (6 digits)
 * @returns {boolean} True if token is valid
 */
exports.verifyToken = (secret, token) => {
  try {
    // Verify token with 1 step of tolerance (±30 seconds)
    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2 // Allow 30 seconds before/after
    });

    return verified;
  } catch (error) {
    logger.debug(`OTP verification failed: ${error.message}`);
    return false;
  }
};

/**
 * Verify backup code
 * @param {string} code - Backup code to verify
 * @param {Array<string>} backupCodes - User's backup codes (hashed)
 * @returns {Object} Result with verified status and remaining codes
 */
exports.verifyBackupCode = async (code, backupCodes) => {
  try {
    const codeHash = crypto.createHash('sha256').update(code).digest('hex');

    const codeIndex = backupCodes.findIndex(hashed => hashed === codeHash);

    if (codeIndex === -1) {
      return {
        verified: false,
        message: 'Invalid backup code'
      };
    }

    // Remove used backup code
    backupCodes.splice(codeIndex, 1);

    return {
      verified: true,
      message: 'Backup code verified',
      remainingCodes: backupCodes.length,
      updatedBackupCodes: backupCodes
    };
  } catch (error) {
    logger.error(`Backup code verification failed: ${error.message}`);
    return {
      verified: false,
      message: 'Backup code verification failed'
    };
  }
};

/**
 * Hash backup codes for storage
 * @param {Array<string>} codes - Plain text backup codes
 * @returns {Array<string>} Hashed backup codes
 */
exports.hashBackupCodes = (codes) => {
  return codes.map(code =>
    crypto.createHash('sha256').update(code).digest('hex')
  );
};

/**
 * Generate recovery codes
 * @param {number} count - Number of recovery codes (default: 10)
 * @returns {Array<string>} Recovery codes
 */
exports.generateRecoveryCodes = (count = 10) => {
  const codes = [];
  for (let i = 0; i < count; i++) {
    codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
  }
  return codes;
};

/**
 * Format backup codes for display
 * @param {Array<string>} codes - Backup codes
 * @returns {string} Formatted backup codes
 */
exports.formatBackupCodes = (codes) => {
  return codes.map((code, index) => {
    // Format as: XXXX-XXXX-XXXX or similar
    const parts = [];
    for (let i = 0; i < code.length; i += 4) {
      parts.push(code.substr(i, 4));
    }
    return `${index + 1}. ${parts.join('-')}`;
  }).join('\n');
};

module.exports = exports;
