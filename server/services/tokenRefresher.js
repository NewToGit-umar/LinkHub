import SocialAccount from '../models/SocialAccount.js'
import Notification from '../models/Notification.js'
import oauthService from './oauthService.js'

const REFRESH_WINDOW_MS = (24 * 60 * 60 * 1000) // 24 hours before expiry
const EXPIRY_ALERT_WINDOW_MS = (3 * 24 * 60 * 60 * 1000) // Alert 3 days before expiry

// Provider token refreshers using oauthService
const providerRefreshers = {
  youtube: async (account) => {
    if (!account.refreshToken) return null
    const result = await oauthService.refreshAccessToken('youtube', account.refreshToken)
    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      tokenExpiresAt: Date.now() + (result.expiresIn * 1000)
    }
  },
  twitter: async (account) => {
    if (!account.refreshToken) return null
    const result = await oauthService.refreshAccessToken('twitter', account.refreshToken)
    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      tokenExpiresAt: Date.now() + (result.expiresIn * 1000)
    }
  },
  facebook: async (account) => {
    if (!account.refreshToken) return null
    const result = await oauthService.refreshAccessToken('facebook', account.refreshToken)
    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      tokenExpiresAt: Date.now() + (result.expiresIn * 1000)
    }
  },
  linkedin: async (account) => {
    if (!account.refreshToken) return null
    const result = await oauthService.refreshAccessToken('linkedin', account.refreshToken)
    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      tokenExpiresAt: Date.now() + (result.expiresIn * 1000)
    }
  }
}

async function refreshAccount(account) {
  const provider = account.platform
  const refresher = providerRefreshers[provider]
  try {
    if (!refresher) {
      // No provider integration yet — mark as needs manual refresh
      account.syncStatus = 'failed'
      account.syncError = `No refresher configured for provider: ${provider}`
      await account.save()
      
      // Notify user that they need to manually reconnect
      await Notification.notifyTokenExpiring(
        account.userId,
        account._id,
        account.platform,
        account.tokenExpiresAt
      )
      
      return false
    }

    const result = await refresher(account)
    if (result && result.accessToken) {
      account.accessToken = result.accessToken
      if (result.refreshToken) account.refreshToken = result.refreshToken
      if (result.tokenExpiresAt) account.tokenExpiresAt = new Date(result.tokenExpiresAt)
      account.syncStatus = 'idle'
      account.syncError = undefined
      account.lastSyncAt = new Date()
      await account.save()
      return true
    }

    account.syncStatus = 'failed'
    account.syncError = 'Refresher returned no tokens'
    await account.save()
    return false
  } catch (err) {
    account.syncStatus = 'failed'
    account.syncError = err.message
    await account.save()
    return false
  }
}

export async function refreshAccountForUserProvider({ userId, provider }) {
  const acct = await SocialAccount.findOne({ userId, platform: provider.toLowerCase() })
  if (!acct) throw new Error('Social account not found')
  return refreshAccount(acct)
}

async function findAccountsToRefresh() {
  const now = new Date()
  const windowAt = new Date(Date.now() + REFRESH_WINDOW_MS)

  return SocialAccount.find({
    isActive: true,
    isRevoked: false,
    tokenExpiresAt: { $exists: true, $lte: windowAt }
  })
}

// Find accounts that will expire soon (for alerts)
async function findAccountsExpiringSoon() {
  const alertWindow = new Date(Date.now() + EXPIRY_ALERT_WINDOW_MS)
  
  return SocialAccount.find({
    isActive: true,
    isRevoked: false,
    tokenExpiresAt: { $exists: true, $lte: alertWindow }
  })
}

// Send expiry alerts for accounts expiring soon
async function sendExpiryAlerts() {
  try {
    const candidates = await findAccountsExpiringSoon()
    if (!candidates || candidates.length === 0) return

    for (const account of candidates) {
      // Check if we've already sent a notification recently (within 24 hours)
      const recentNotification = await Notification.findOne({
        userId: account.userId,
        type: 'token_expiring',
        'data.reference.id': account._id,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      })

      if (!recentNotification) {
        await Notification.notifyTokenExpiring(
          account.userId,
          account._id,
          account.platform,
          account.tokenExpiresAt
        )
        console.log(`Sent token expiry alert for ${account.platform} account ${account._id}`)
      }
    }
  } catch (err) {
    console.error('sendExpiryAlerts error:', err)
  }
}

let job = null

function createHourlyJob(fn) {
  const intervalMs = 60 * 60 * 1000 // 1 hour
  const id = setInterval(fn, intervalMs)
  return {
    stop: () => clearInterval(id)
  }
}

export function startTokenRefresher() {
  if (job) return job

  job = createHourlyJob(async () => {
    try {
      // Refresh tokens that are about to expire
      const candidates = await findAccountsToRefresh()
      if (candidates && candidates.length > 0) {
        for (const acc of candidates) {
          await refreshAccount(acc)
        }
      }
      
      // Send expiry alerts for tokens expiring in 3 days
      await sendExpiryAlerts()
    } catch (err) {
      console.error('tokenRefresher error:', err)
    }
  })

  // Run once at startup
  ;(async () => {
    try {
      const candidates = await findAccountsToRefresh()
      for (const acc of candidates) await refreshAccount(acc)
      
      // Also send alerts at startup
      await sendExpiryAlerts()
    } catch (err) {
      console.error('tokenRefresher startup error:', err)
    }
  })()

  console.log('✅ Token refresher started (hourly via setInterval)')
  return job
}

export function stopTokenRefresher() {
  if (job) job.stop()
}
