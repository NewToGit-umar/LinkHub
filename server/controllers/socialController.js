import SocialAccount from '../models/SocialAccount.js'
import { refreshAccountForUserProvider } from '../services/tokenRefresher.js'

/**
 * Start OAuth flow (scaffold)
 * For real providers, this should redirect to provider's auth URL.
 */
export async function startOAuth(req, res) {
  const { provider } = req.params
  // Placeholder: in production generate provider-specific auth URL
  if (!process.env[`OAUTH_${provider?.toUpperCase()}_AUTH_URL`]) {
    return res.status(400).json({ message: `No OAuth configuration for provider: ${provider}` })
  }

  const authUrl = process.env[`OAUTH_${provider.toUpperCase()}_AUTH_URL`]
  // Redirect developer to provider auth if configured
  return res.redirect(authUrl)
}

/**
 * Callback handler
 * Accepts provider and either `code` (to exchange) or direct tokens in body (dev mode).
 */
export async function callback(req, res) {
  try {
    const { provider } = req.params
    const userId = req.user && req.user.id
    if (!userId) return res.status(401).json({ message: 'Unauthorized' })

    // Support developer/testing flow: tokens provided directly
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
    console.error('social callback error', err)
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

