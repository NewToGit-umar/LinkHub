import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import { logger } from '../utils/logger.js'

// Ensure environment variables are loaded
dotenv.config()

// Create transporter - using environment variables for configuration
const createTransporter = () => {
  // For development, you can use Ethereal (fake SMTP service) or configure a real service
  // For production, configure with real SMTP credentials (Gmail, SendGrid, etc.)
  
  // Support both SMTP_USER/SMTP_PASS and EMAIL_USER/EMAIL_PASS for backward compatibility
  const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  
  console.log(`📧 Email Config: User=${smtpUser ? smtpUser.substring(0, 5) + '***' : 'NOT SET'}, Pass=${smtpPass ? '***SET***' : 'NOT SET'}`);
  
  const config = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  }

  // If no SMTP credentials, create a test account for development
  if (!smtpUser || !smtpPass || smtpUser === 'your-email@gmail.com') {
    logger.warn('No SMTP credentials found. Email sending will be simulated in development mode.')
    return null
  }

  return nodemailer.createTransport(config)
}

let transporter = null

// Initialize transporter
const getTransporter = async () => {
  if (transporter) return transporter
  
  transporter = createTransporter()
  
  if (transporter) {
    try {
      await transporter.verify()
      logger.info('✅ Email transporter verified successfully')
      console.log('✅ Email transporter verified successfully - emails will be sent!')
    } catch (error) {
      logger.error('❌ Email transporter verification failed:', error.message)
      console.error('❌ Email transporter verification failed:', error.message)
      console.error('💡 For Gmail, you need to use an App Password, not your regular password.')
      console.error('💡 Create one at: https://myaccount.google.com/apppasswords')
      transporter = null
    }
  }
  
  return transporter
}

// Generate 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Generate secure token for password reset
export const generateResetToken = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}

// Send OTP email for registration verification
export const sendOTPEmail = async (email, otp, name = 'User') => {
  const transport = await getTransporter()
  const fromEmail = process.env.SMTP_USER || process.env.EMAIL_USER || 'noreply@linkhub.com';
  
  const mailOptions = {
    from: `"LinkHub" <${fromEmail}>`,
    to: email,
    subject: 'Verify Your Email - LinkHub',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-radius: 16px; padding: 40px; border: 1px solid #334155;">
            <!-- Logo -->
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="display: inline-block; background: linear-gradient(135deg, #10b981, #84cc16); padding: 12px 24px; border-radius: 12px;">
                <span style="color: white; font-size: 24px; font-weight: bold;">LinkHub</span>
              </div>
            </div>
            
            <!-- Greeting -->
            <h1 style="color: #f1f5f9; font-size: 24px; text-align: center; margin-bottom: 20px;">
              Verify Your Email Address
            </h1>
            
            <p style="color: #94a3b8; font-size: 16px; text-align: center; margin-bottom: 30px;">
              Hi ${name},<br><br>
              Thank you for signing up for LinkHub! Please use the verification code below to complete your registration.
            </p>
            
            <!-- OTP Box -->
            <div style="background: linear-gradient(135deg, #10b981, #84cc16); border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
              <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 2px;">
                Your Verification Code
              </p>
              <div style="font-size: 36px; font-weight: bold; color: white; letter-spacing: 8px; font-family: monospace;">
                ${otp}
              </div>
            </div>
            
            <!-- Expiry Notice -->
            <p style="color: #f97316; font-size: 14px; text-align: center; margin-bottom: 20px;">
              ⏰ This code will expire in 10 minutes
            </p>
            
            <!-- Security Notice -->
            <div style="background: #1e293b; border-radius: 8px; padding: 16px; margin-top: 30px;">
              <p style="color: #64748b; font-size: 13px; margin: 0; text-align: center;">
                🔒 If you didn't request this code, please ignore this email. Never share this code with anyone.
              </p>
            </div>
            
            <!-- Footer -->
            <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #334155;">
              <p style="color: #64748b; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} LinkHub. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Hi ${name},\n\nYour LinkHub verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, please ignore this email.\n\n© ${new Date().getFullYear()} LinkHub`
  }

  if (transport) {
    try {
      const info = await transport.sendMail(mailOptions)
      logger.info(`OTP email sent to ${email}: ${info.messageId}`)
      return { success: true, messageId: info.messageId }
    } catch (error) {
      logger.error(`Failed to send OTP email to ${email}:`, error.message)
      throw new Error('Failed to send verification email')
    }
  } else {
    // Development mode - log OTP to console
    logger.info(`[DEV MODE] OTP for ${email}: ${otp}`)
    console.log('\n' + '='.repeat(50))
    console.log(`📧 EMAIL SIMULATION (No SMTP configured)`)
    console.log(`To: ${email}`)
    console.log(`Subject: Verify Your Email - LinkHub`)
    console.log(`OTP Code: ${otp}`)
    console.log('='.repeat(50) + '\n')
    return { success: true, messageId: 'dev-mode-simulated' }
  }
}

// Send password reset email
export const sendPasswordResetEmail = async (email, resetUrl, name = 'User') => {
  const transport = await getTransporter()
  const fromEmail = process.env.SMTP_USER || process.env.EMAIL_USER || 'noreply@linkhub.com';
  
  const mailOptions = {
    from: `"LinkHub" <${fromEmail}>`,
    to: email,
    subject: 'Reset Your Password - LinkHub',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-radius: 16px; padding: 40px; border: 1px solid #334155;">
            <!-- Logo -->
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="display: inline-block; background: linear-gradient(135deg, #10b981, #84cc16); padding: 12px 24px; border-radius: 12px;">
                <span style="color: white; font-size: 24px; font-weight: bold;">LinkHub</span>
              </div>
            </div>
            
            <!-- Greeting -->
            <h1 style="color: #f1f5f9; font-size: 24px; text-align: center; margin-bottom: 20px;">
              Reset Your Password
            </h1>
            
            <p style="color: #94a3b8; font-size: 16px; text-align: center; margin-bottom: 30px;">
              Hi ${name},<br><br>
              We received a request to reset your password. Click the button below to create a new password.
            </p>
            
            <!-- Reset Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #10b981, #84cc16); color: white; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 16px; font-weight: bold;">
                Reset Password
              </a>
            </div>
            
            <!-- Alternative Link -->
            <p style="color: #64748b; font-size: 13px; text-align: center; margin: 20px 0;">
              Or copy and paste this link in your browser:<br>
              <a href="${resetUrl}" style="color: #10b981; word-break: break-all;">${resetUrl}</a>
            </p>
            
            <!-- Expiry Notice -->
            <p style="color: #f97316; font-size: 14px; text-align: center; margin-bottom: 20px;">
              ⏰ This link will expire in 1 hour
            </p>
            
            <!-- Security Notice -->
            <div style="background: #1e293b; border-radius: 8px; padding: 16px; margin-top: 30px;">
              <p style="color: #64748b; font-size: 13px; margin: 0; text-align: center;">
                🔒 If you didn't request a password reset, please ignore this email or contact support if you have concerns.
              </p>
            </div>
            
            <!-- Footer -->
            <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #334155;">
              <p style="color: #64748b; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} LinkHub. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Hi ${name},\n\nWe received a request to reset your password.\n\nClick this link to reset your password: ${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.\n\n© ${new Date().getFullYear()} LinkHub`
  }

  if (transport) {
    try {
      const info = await transport.sendMail(mailOptions)
      logger.info(`Password reset email sent to ${email}: ${info.messageId}`)
      return { success: true, messageId: info.messageId }
    } catch (error) {
      logger.error(`Failed to send password reset email to ${email}:`, error.message)
      throw new Error('Failed to send password reset email')
    }
  } else {
    // Development mode - log reset link to console
    logger.info(`[DEV MODE] Password reset link for ${email}: ${resetUrl}`)
    console.log('\n' + '='.repeat(50))
    console.log(`📧 EMAIL SIMULATION (No SMTP configured)`)
    console.log(`To: ${email}`)
    console.log(`Subject: Reset Your Password - LinkHub`)
    console.log(`Reset Link: ${resetUrl}`)
    console.log('='.repeat(50) + '\n')
    return { success: true, messageId: 'dev-mode-simulated' }
  }
}

export default {
  generateOTP,
  generateResetToken,
  sendOTPEmail,
  sendPasswordResetEmail
}
