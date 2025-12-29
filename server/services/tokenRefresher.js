import SocialAccount from '../models/SocialAccount.js'

const REFRESH_WINDOW_MS = (24 * 60 * 60 * 1000) // 24 hours before expiry

// Placeholder provider refreshers map. Real implementations should call provider token endpoints.
const providerRefreshers = {
  // example: twitter: async (account) => { /* exchange refresh token */ }
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
      const candidates = await findAccountsToRefresh()
      if (!candidates || candidates.length === 0) return

      for (const acc of candidates) {
        await refreshAccount(acc)
      }
    } catch (err) {
      console.error('tokenRefresher error:', err)
    }
  })

  // Run once at startup
  ;(async () => {
    try {
      const candidates = await findAccountsToRefresh()
      for (const acc of candidates) await refreshAccount(acc)
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
