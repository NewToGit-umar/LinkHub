import Post from '../models/Post.js'
import Analytics from '../models/Analytics.js'
import SocialAccount from '../models/SocialAccount.js'
import twitterProvider from './providers/twitter.js'
import facebookProvider from './providers/facebook.js'
import instagramProvider from './providers/instagram.js'
import linkedinProvider from './providers/linkedin.js'
import youtubeProvider from './providers/youtube.js'
import tiktokProvider from './providers/tiktok.js'
import * as socketService from './socketService.js'

// Real analytics fetcher service using actual provider APIs

async function fetchForTwitter(account) {
  try {
    const r = await twitterProvider.fetchAnalytics(account)
    if (r && r.length) return r
  } catch (err) {
    console.error('twitterProvider error', err)
  }
  return []
}

async function fetchForFacebook(account) {
  try {
    const r = await facebookProvider.fetchAnalytics(account)
    if (r && r.length) return r
  } catch (err) {
    console.error('facebookProvider error', err)
  }
  return []
}

async function fetchForInstagram(account) {
  try {
    const r = await instagramProvider.fetchAnalytics(account)
    if (r && r.length) return r
  } catch (err) {
    console.error('instagramProvider error', err)
  }
  return []
}

async function fetchForLinkedIn(account) {
  try {
    const r = await linkedinProvider.fetchAnalytics(account)
    if (r && r.length) return r
  } catch (err) {
    console.error('linkedinProvider error', err)
  }
  return []
}

async function fetchForYouTube(account) {
  try {
    const r = await youtubeProvider.fetchAnalytics(account)
    if (r && r.length) return r
  } catch (err) {
    console.error('youtubeProvider error', err)
  }
  return []
}

async function fetchForTikTok(account) {
  try {
    const r = await tiktokProvider.fetchAnalytics(account)
    if (r && r.length) return r
  } catch (err) {
    console.error('tiktokProvider error', err)
  }
  return []
}

export async function fetchAnalyticsForAccount(account) {
  const platform = account.platform
  try {
    switch (platform) {
      case 'twitter': return await fetchForTwitter(account)
      case 'facebook': return await fetchForFacebook(account)
      case 'instagram': return await fetchForInstagram(account)
      case 'linkedin': return await fetchForLinkedIn(account)
      case 'youtube': return await fetchForYouTube(account)
      case 'tiktok': return await fetchForTikTok(account)
      default: return []
    }
  } catch (err) {
    console.error('analyticsService.fetchAnalyticsForAccount error', err)
    return []
  }
}


export async function ingestForUser(userId) {
  const accounts = await SocialAccount.find({ userId })
  let ingested = 0
  for (const acc of accounts) {
    // Skip if account token is not valid
    if (!acc.isValid || !acc.isValid()) continue

    const providerData = await fetchAnalyticsForAccount(acc)
    if (!providerData || providerData.length === 0) {
      continue
    }

    for (const item of providerData) {
      await Analytics.create({ 
        postId: item.postId || null, 
        externalId: item.externalId || null,
        userId, 
        platform: acc.platform, 
        metrics: item.metrics || {}, 
        recordedAt: item.recordedAt ? new Date(item.recordedAt) : new Date() 
      })
      ingested++
    }
  }

  // Send real-time notification if analytics were ingested
  if (ingested > 0) {
    try {
      socketService.notifyAnalyticsUpdate(userId.toString(), { ingested })
    } catch (err) {
      // Socket might not be initialized yet
    }
  }

  return ingested
}

export async function ingestForAllUsers() {
  const accounts = await SocialAccount.find({})
  const byUser = {}
  for (const a of accounts) {
    byUser[a.userId] = byUser[a.userId] || []
    byUser[a.userId].push(a)
  }
  let total = 0
  for (const userId of Object.keys(byUser)) {
    total += await ingestForUser(userId)
  }
  return total
}

export default { fetchAnalyticsForAccount, ingestForUser, ingestForAllUsers }

