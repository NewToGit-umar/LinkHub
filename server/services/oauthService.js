import crypto from 'crypto'
import axios from 'axios'
import { oauthConfig, isProviderConfigured } from '../config/oauth.js'
import OAuthState from '../models/OAuthState.js'

/**
 * Generate OAuth authorization URL
 */
export async function generateAuthUrl(provider, userId) {
  if (!isProviderConfigured(provider)) {
    throw new Error(`${provider.charAt(0).toUpperCase() + provider.slice(1)} is not configured. Please add API credentials in the server .env file.`)
  }

  const config = oauthConfig[provider]
  const state = crypto.randomBytes(32).toString('hex')
  
  // Store state in MongoDB (expires in 10 minutes)
  await OAuthState.create({
    state,
    userId,
    provider,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000)
  })

  // Clean up old states periodically
  cleanupStates()

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.callbackUrl,
    response_type: 'code',
    scope: config.scopes.join(' '),
    state
  })

  // Provider-specific params
  if (provider === 'twitter') {
    params.set('code_challenge', generateCodeChallenge(state))
    params.set('code_challenge_method', 'S256')
  }

  if (provider === 'linkedin') {
    params.set('scope', config.scopes.join('%20'))
  }
  
  // For Google/YouTube, add access_type=offline to get refresh token
  if (provider === 'youtube') {
    params.set('access_type', 'offline')
    params.set('prompt', 'consent')
  }

  return `${config.authUrl}?${params.toString()}`
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(provider, code, state) {
  const stateData = await OAuthState.findOne({ state })
  if (!stateData || stateData.expiresAt < new Date()) {
    if (stateData) await OAuthState.deleteOne({ state })
    throw new Error('Invalid or expired state')
  }

  const config = oauthConfig[provider]
  
  const tokenParams = {
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code,
    redirect_uri: config.callbackUrl,
    grant_type: 'authorization_code'
  }

  // Provider-specific token exchange
  if (provider === 'twitter') {
    tokenParams.code_verifier = state // PKCE
  }

  try {
    const response = await axios.post(config.tokenUrl, 
      new URLSearchParams(tokenParams).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        }
      }
    )

    const tokens = response.data
    
    // Remove used state
    await OAuthState.deleteOne({ state })

    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresIn: tokens.expires_in,
      tokenType: tokens.token_type,
      scope: tokens.scope,
      userId: stateData.userId
    }
  } catch (error) {
    console.error('Token exchange error:', error.response?.data || error.message)
    throw new Error(`Failed to exchange code: ${error.response?.data?.error_description || error.message}`)
  }
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(provider, refreshToken) {
  if (!isProviderConfigured(provider)) {
    throw new Error(`Provider ${provider} is not configured`)
  }

  const config = oauthConfig[provider]

  try {
    const response = await axios.post(config.tokenUrl,
      new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        }
      }
    )

    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token || refreshToken,
      expiresIn: response.data.expires_in
    }
  } catch (error) {
    console.error('Token refresh error:', error.response?.data || error.message)
    throw new Error(`Failed to refresh token: ${error.response?.data?.error_description || error.message}`)
  }
}

/**
 * Fetch user profile from provider
 */
export async function fetchUserProfile(provider, accessToken) {
  const config = oauthConfig[provider]

  try {
    let profile = {}

    switch (provider) {
      case 'twitter': {
        const response = await axios.get(`${config.apiBaseUrl}/users/me`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: { 'user.fields': 'id,name,username,profile_image_url,description,public_metrics' }
        })
        const data = response.data.data
        profile = {
          accountId: data.id,
          accountHandle: data.username,
          accountName: data.name,
          profileData: {
            displayName: data.name,
            profilePicture: data.profile_image_url,
            bio: data.description,
            followerCount: data.public_metrics?.followers_count || 0,
            followingCount: data.public_metrics?.following_count || 0,
            postsCount: data.public_metrics?.tweet_count || 0,
            url: `https://twitter.com/${data.username}`
          }
        }
        break
      }

      case 'facebook': {
        const response = await axios.get(`${config.apiBaseUrl}/me`, {
          params: {
            access_token: accessToken,
            fields: 'id,name,email,picture.type(large)'
          }
        })
        const data = response.data
        profile = {
          accountId: data.id,
          accountHandle: data.id,
          accountName: data.name,
          profileData: {
            displayName: data.name,
            profilePicture: data.picture?.data?.url,
            email: data.email,
            url: `https://facebook.com/${data.id}`
          }
        }
        
        // Get pages if available
        try {
          const pagesResponse = await axios.get(`${config.apiBaseUrl}/me/accounts`, {
            params: { access_token: accessToken }
          })
          profile.pages = pagesResponse.data.data
        } catch (e) {
          // Pages might not be available
        }
        break
      }

      case 'instagram': {
        const response = await axios.get(`${config.apiBaseUrl}/me`, {
          params: {
            access_token: accessToken,
            fields: 'id,username,account_type,media_count'
          }
        })
        const data = response.data
        profile = {
          accountId: data.id,
          accountHandle: data.username,
          accountName: data.username,
          profileData: {
            displayName: data.username,
            postsCount: data.media_count,
            accountType: data.account_type,
            url: `https://instagram.com/${data.username}`
          }
        }
        break
      }

      case 'linkedin': {
        // Use OpenID Connect userinfo endpoint
        const response = await axios.get('https://api.linkedin.com/v2/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` }
        })
        const data = response.data
        console.log('LinkedIn userinfo response:', JSON.stringify(data, null, 2))
        profile = {
          accountId: data.sub,
          accountHandle: data.name?.replace(/\s+/g, '_').toLowerCase() || data.sub,
          accountName: data.name,
          profileData: {
            displayName: data.name,
            profilePicture: data.picture,
            email: data.email,
            url: `https://linkedin.com/in/${data.sub}`
          }
        }
        break
      }

      case 'youtube': {
        console.log('Fetching YouTube channel with token:', accessToken.substring(0, 20) + '...')
        const response = await axios.get(`${config.apiBaseUrl}/channels`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: {
            part: 'snippet,statistics',
            mine: true
          }
        })
        console.log('YouTube API response:', JSON.stringify(response.data, null, 2))
        const channel = response.data.items?.[0]
        if (channel) {
          profile = {
            accountId: channel.id,
            accountHandle: channel.snippet.customUrl || channel.snippet.title || channel.id,
            accountName: channel.snippet.title,
            profileData: {
              displayName: channel.snippet.title,
              profilePicture: channel.snippet.thumbnails?.default?.url,
              bio: channel.snippet.description,
              followerCount: parseInt(channel.statistics?.subscriberCount) || 0,
              postsCount: parseInt(channel.statistics?.videoCount) || 0,
              url: `https://youtube.com/channel/${channel.id}`
            }
          }
        } else {
          throw new Error('No YouTube channel found. Please create a YouTube channel first.')
        }
        break
      }

      case 'tiktok': {
        const response = await axios.get(`${config.apiBaseUrl}/user/info/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: { fields: 'open_id,union_id,avatar_url,display_name,follower_count,following_count,video_count' }
        })
        const data = response.data.data.user
        profile = {
          accountId: data.open_id,
          accountHandle: data.display_name,
          accountName: data.display_name,
          profileData: {
            displayName: data.display_name,
            profilePicture: data.avatar_url,
            followerCount: data.follower_count || 0,
            followingCount: data.following_count || 0,
            postsCount: data.video_count || 0,
            url: `https://tiktok.com/@${data.display_name}`
          }
        }
        break
      }
    }

    return profile
  } catch (error) {
    console.error('Fetch profile error:', error.response?.data || error.message)
    throw new Error(`Failed to fetch profile: ${error.message}`)
  }
}

/**
 * Validate state
 */
export async function validateState(state) {
  const stateData = await OAuthState.findOne({ state })
  if (!stateData) return null
  if (stateData.expiresAt < new Date()) {
    await OAuthState.deleteOne({ state })
    return null
  }
  return {
    userId: stateData.userId,
    provider: stateData.provider
  }
}

// Helper functions
function generateCodeChallenge(verifier) {
  return crypto.createHash('sha256').update(verifier).digest('base64url')
}

async function cleanupStates() {
  // MongoDB TTL index handles this automatically, but we can manually clean up too
  try {
    await OAuthState.deleteMany({ expiresAt: { $lt: new Date() } })
  } catch (err) {
    console.error('Error cleaning up OAuth states:', err.message)
  }
}

export default {
  generateAuthUrl,
  exchangeCodeForTokens,
  refreshAccessToken,
  fetchUserProfile,
  validateState
}
