import SocialAccount from '../models/SocialAccount.js'
import { refreshAccountForUserProvider } from '../services/tokenRefresher.js'
import oauthService from '../services/oauthService.js'
import twitterProvider from '../services/providers/twitter.js'
import facebookProvider from '../services/providers/facebook.js'
import instagramProvider from '../services/providers/instagram.js'
import linkedinProvider from '../services/providers/linkedin.js'
import youtubeProvider from '../services/providers/youtube.js'
import tiktokProvider from '../services/providers/tiktok.js'

const providers = {
  twitter: twitterProvider,
  facebook: facebookProvider,
  instagram: instagramProvider,
  linkedin: linkedinProvider,
  youtube: youtubeProvider,
  tiktok: tiktokProvider
}

/**
 * Start OAuth flow - redirects user to provider's auth page
 */
export async function startOAuth(req, res) {
  try {
    const { provider } = req.params
    const userId = req.user?.id
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'
    
    if (!userId) {
      // If it's a browser redirect, redirect back with error
      if (req.query.redirect !== 'false') {
        return res.redirect(`${clientUrl}/accounts?error=unauthorized`)
      }
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const supportedProviders = ['twitter', 'facebook', 'instagram', 'linkedin', 'youtube', 'tiktok']
    if (!supportedProviders.includes(provider.toLowerCase())) {
      if (req.query.redirect !== 'false') {
        return res.redirect(`${clientUrl}/accounts?error=unsupported_provider`)
      }
      return res.status(400).json({ message: `Unsupported provider: ${provider}` })
    }

    const authUrl = await oauthService.generateAuthUrl(provider.toLowerCase(), userId)
    
    // Return URL for frontend to redirect, or redirect directly
    if (req.query.redirect === 'false') {
      return res.status(200).json({ authUrl })
    }
    
    return res.redirect(authUrl)
  } catch (err) {
    console.error('OAuth start error:', err)
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'
    // Redirect browser back with error message
    if (req.query.redirect !== 'false') {
      return res.redirect(`${clientUrl}/accounts?error=${encodeURIComponent(err.message)}`)
    }
    return res.status(500).json({ message: 'Failed to start OAuth flow', error: err.message })
  }
}

/**
 * OAuth callback handler - exchanges code for tokens and saves account
 */
export async function callback(req, res) {
  try {
    const { provider } = req.params
    const { code, state, error, error_description } = req.query
    
    // Handle OAuth errors from provider
    if (error) {
      console.error('OAuth error from provider:', error, error_description)
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/accounts?error=${encodeURIComponent(error_description || error)}`)
    }

    // Validate state and get userId
    const stateData = await oauthService.validateState(state)
    if (!stateData) {
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/accounts?error=invalid_state`)
    }

    const { userId } = stateData
    
    if (!code) {
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/accounts?error=no_code`)
    }

    // Exchange code for tokens (pass state for PKCE verification)
    let tokens
    try {
      tokens = await oauthService.exchangeCodeForTokens(provider.toLowerCase(), code, state)
    } catch (tokenError) {
      console.error('Token exchange failed:', tokenError.message)
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/accounts?error=${encodeURIComponent(tokenError.message)}`)
    }

    // Fetch user profile from provider
    let profile
    try {
      profile = await oauthService.fetchUserProfile(provider.toLowerCase(), tokens.accessToken)
      console.log('Profile fetched:', JSON.stringify(profile, null, 2))
    } catch (profileError) {
      console.error('Profile fetch failed:', profileError.message)
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/accounts?error=${encodeURIComponent(profileError.message)}`)
    }

    // Validate profile has required fields
    if (!profile || !profile.accountId) {
      console.error('Profile missing required fields:', profile)
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/accounts?error=${encodeURIComponent('Could not fetch account profile. Make sure you have a YouTube channel.')}`)
    }

    // Save or update social account
    const existing = await SocialAccount.findOne({ userId, platform: provider.toLowerCase() })
    
    if (existing) {
      existing.accessToken = tokens.accessToken
      existing.refreshToken = tokens.refreshToken || existing.refreshToken
      existing.tokenExpiresAt = tokens.expiresIn ? new Date(Date.now() + tokens.expiresIn * 1000) : existing.tokenExpiresAt
      existing.accountId = profile.accountId
      existing.accountHandle = profile.accountHandle || profile.accountId
      existing.accountName = profile.accountName
      existing.profileData = profile.profileData
      existing.isActive = true
      existing.isRevoked = false
      await existing.save()
    } else {
      await SocialAccount.create({
        userId,
        platform: provider.toLowerCase(),
        accountId: profile.accountId,
        accountHandle: profile.accountHandle || profile.accountId,
        accountName: profile.accountName,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenExpiresAt: tokens.expiresIn ? new Date(Date.now() + tokens.expiresIn * 1000) : undefined,
        profileData: profile.profileData
      })
    }

    // Redirect to frontend with success
    return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/accounts?connected=${provider}`)
  } catch (err) {
    console.error('OAuth callback error:', err)
    return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/accounts?error=callback_failed`)
  }
}

/**
 * Manual callback for development/testing - accepts tokens directly
 */
export async function manualCallback(req, res) {
  try {
    const { provider } = req.params
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ message: 'Unauthorized' })

    const {
      accessToken,
      refreshToken,
      tokenExpiresAt,
      accountId,
      accountHandle,
      accountName,
      profileData
    } = req.body

    if (!accessToken || !accountId || !accountHandle) {
      return res.status(400).json({ message: 'Missing required token/account data' })
    }

    const existing = await SocialAccount.findOne({ userId, platform: provider.toLowerCase() })
    if (existing) {
      existing.accessToken = accessToken
      existing.refreshToken = refreshToken || existing.refreshToken
      existing.tokenExpiresAt = tokenExpiresAt ? new Date(tokenExpiresAt) : existing.tokenExpiresAt
      existing.accountId = accountId
      existing.accountHandle = accountHandle
      existing.accountName = accountName || existing.accountName
      existing.profileData = profileData || existing.profileData
      existing.isActive = true
      existing.isRevoked = false
      await existing.save()
      return res.status(200).json({ message: 'Social account updated', account: existing.toPublicJSON() })
    }

    const account = await SocialAccount.create({
      userId,
      platform: provider.toLowerCase(),
      accountId,
      accountHandle,
      accountName,
      accessToken,
      refreshToken,
      tokenExpiresAt: tokenExpiresAt ? new Date(tokenExpiresAt) : undefined,
      profileData
    })

    return res.status(201).json({ message: 'Social account connected', account: account.toPublicJSON() })
  } catch (err) {
    console.error('Manual callback error:', err)
    return res.status(500).json({ message: 'Social callback error', error: err.message })
  }
}

export async function listAccounts(req, res) {
  try {
    const userId = req.user && req.user.id
    if (!userId) return res.status(401).json({ message: 'Unauthorized' })

    const accounts = await SocialAccount.findValidByUserId(userId)
    const publicAccounts = accounts.map(a => a.toPublicJSON())
    return res.status(200).json({ accounts: publicAccounts })
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching accounts', error: err.message })
  }
}

export async function disconnect(req, res) {
  try {
    const userId = req.user && req.user.id
    const { provider } = req.params
    if (!userId) return res.status(401).json({ message: 'Unauthorized' })

    const account = await SocialAccount.findByUserAndPlatform(userId, provider)
    if (!account) return res.status(404).json({ message: 'Account not found' })

    await account.revoke()
    return res.status(200).json({ message: 'Account disconnected' })
  } catch (err) {
    return res.status(500).json({ message: 'Error disconnecting account', error: err.message })
  }
}

export async function sync(req, res) {
  try {
    const userId = req.user && req.user.id
    const { provider } = req.params
    if (!userId) return res.status(401).json({ message: 'Unauthorized' })

    await refreshAccountForUserProvider({ userId, provider })
    return res.status(200).json({ message: 'Sync started' })
  } catch (err) {
    return res.status(500).json({ message: 'Error syncing account', error: err.message })
  }
}

