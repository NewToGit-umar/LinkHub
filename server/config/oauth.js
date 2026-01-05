// OAuth2 Configuration for Social Media Platforms
// Set these environment variables in your .env file
import dotenv from 'dotenv'

// Ensure environment variables are loaded
dotenv.config()

const BASE_URL = process.env.SERVER_URL || 'http://localhost:5001'

export const oauthConfig = {
  twitter: {
    clientId: process.env.TWITTER_CLIENT_ID,
    clientSecret: process.env.TWITTER_CLIENT_SECRET,
    callbackUrl: process.env.TWITTER_CALLBACK_URL || `${BASE_URL}/api/social/callback/twitter`,
    authUrl: 'https://twitter.com/i/oauth2/authorize',
    tokenUrl: 'https://api.twitter.com/2/oauth2/token',
    scopes: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
    apiBaseUrl: 'https://api.twitter.com/2'
  },
  facebook: {
    clientId: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackUrl: process.env.FACEBOOK_CALLBACK_URL || `${BASE_URL}/api/social/callback/facebook`,
    authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
    scopes: ['public_profile', 'email', 'pages_manage_posts', 'pages_read_engagement', 'pages_show_list'],
    apiBaseUrl: 'https://graph.facebook.com/v18.0'
  },
  instagram: {
    // Instagram uses Facebook's API for business accounts
    clientId: process.env.INSTAGRAM_CLIENT_ID || process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.INSTAGRAM_CLIENT_SECRET || process.env.FACEBOOK_APP_SECRET,
    callbackUrl: process.env.INSTAGRAM_CALLBACK_URL || `${BASE_URL}/api/social/callback/instagram`,
    authUrl: 'https://api.instagram.com/oauth/authorize',
    tokenUrl: 'https://api.instagram.com/oauth/access_token',
    scopes: ['user_profile', 'user_media'],
    apiBaseUrl: 'https://graph.instagram.com'
  },
  linkedin: {
    clientId: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    callbackUrl: process.env.LINKEDIN_CALLBACK_URL || `${BASE_URL}/api/social/callback/linkedin`,
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
    // Using OpenID Connect + Community Management API
    scopes: ['openid', 'profile', 'email', 'w_member_social'],
    apiBaseUrl: 'https://api.linkedin.com/v2'
  },
  youtube: {
    clientId: process.env.YOUTUBE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.YOUTUBE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl: process.env.YOUTUBE_CALLBACK_URL || `${BASE_URL}/api/social/callback/youtube`,
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scopes: ['https://www.googleapis.com/auth/youtube.readonly', 'https://www.googleapis.com/auth/youtube.upload'],
    apiBaseUrl: 'https://www.googleapis.com/youtube/v3'
  },
  tiktok: {
    clientId: process.env.TIKTOK_CLIENT_KEY,
    clientSecret: process.env.TIKTOK_CLIENT_SECRET,
    callbackUrl: process.env.TIKTOK_CALLBACK_URL || `${BASE_URL}/api/social/callback/tiktok`,
    authUrl: 'https://www.tiktok.com/v2/auth/authorize',
    tokenUrl: 'https://open.tiktokapis.com/v2/oauth/token/',
    scopes: ['user.info.basic', 'video.list', 'video.upload'],
    apiBaseUrl: 'https://open.tiktokapis.com/v2'
  }
}

// Check if a provider is configured
export function isProviderConfigured(provider) {
  const config = oauthConfig[provider]
  if (!config) return false
  return !!(config.clientId && config.clientSecret)
}

// Get configured providers
export function getConfiguredProviders() {
  return Object.keys(oauthConfig).filter(isProviderConfigured)
}

export default oauthConfig
