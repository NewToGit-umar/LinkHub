import Post from '../models/Post.js'
import Analytics from '../models/Analytics.js'
import SocialAccount from '../models/SocialAccount.js'
import Analytics from '../models/Analytics.js'
import SocialAccount from '../models/SocialAccount.js'

// Placeholder analytics fetcher service.
// Real provider integrations should replace the per-provider stubs below.

function randomMetrics() {
  return {
    likes: Math.floor(Math.random() * 50),
    shares: Math.floor(Math.random() * 10),
    comments: Math.floor(Math.random() * 8),
    impressions: Math.floor(Math.random() * 1000),
    reach: Math.floor(Math.random() * 800)
  }
}

async function fetchForTwitter(account) {
  // Placeholder: fetch recent posts for this user/platform and synthesize metrics
  const recent = await Post.find({ userId: account.userId, platforms: 'twitter' }).sort({ publishedAt: -1 }).limit(10)
  return recent.map(p => ({ postId: p._id, metrics: randomMetrics(), recordedAt: p.publishedAt || new Date() }))
}

async function fetchForFacebook(account) {
  const recent = await Post.find({ userId: account.userId, platforms: 'facebook' }).sort({ publishedAt: -1 }).limit(10)
  return recent.map(p => ({ postId: p._id, metrics: randomMetrics(), recordedAt: p.publishedAt || new Date() }))
}

async function fetchForInstagram(account) {
  const recent = await Post.find({ userId: account.userId, platforms: 'instagram' }).sort({ publishedAt: -1 }).limit(10)
  return recent.map(p => ({ postId: p._id, metrics: randomMetrics(), recordedAt: p.publishedAt || new Date() }))
}

async function fetchForLinkedin(account) {
  const recent = await Post.find({ userId: account.userId, platforms: 'linkedin' }).sort({ publishedAt: -1 }).limit(10)
  return recent.map(p => ({ postId: p._1d, metrics: randomMetrics(), recordedAt: p.publishedAt || new Date() }))
}

async function fetchForTiktok(account) {
  const recent = await Post.find({ userId: account.userId, platforms: 'tiktok' }).sort({ publishedAt: -1 }).limit(10)
  return recent.map(p => ({ postId: p._id, metrics: randomMetrics(), recordedAt: p.publishedAt || new Date() }))
}

async function fetchForYoutube(account) {
  const recent = await Post.find({ userId: account.userId, platforms: 'youtube' }).sort({ publishedAt: -1 }).limit(10)
  return recent.map(p => ({ postId: p._id, metrics: randomMetrics(), recordedAt: p.publishedAt || new Date() }))
}

export async function fetchAnalyticsForAccount(account) {
  const platform = account.platform
  try {
    switch (platform) {
      case 'twitter': return await fetchForTwitter(account)
      case 'facebook': return await fetchForFacebook(account)
      case 'instagram': return await fetchForInstagram(account)
      case 'linkedin': return await fetchForLinkedin(account)
      case 'tiktok': return await fetchForTiktok(account)
      case 'youtube': return await fetchForYoutube(account)
      default: return []
    }
  } catch (err) {
    console.error('analyticsService.fetchAnalyticsForAccount error', err)
    return []
  }
}

export default { fetchAnalyticsForAccount }

export async function ingestForUser(userId) {
  const accounts = await SocialAccount.find({ userId })
  let ingested = 0
  for (const acc of accounts) {
    const providerData = await fetchAnalyticsForAccount(acc)
    if (!providerData || providerData.length === 0) {
      // fallback: zeroed metrics for recent posts
      const recent = await Post.find({ userId, platforms: acc.platform }).sort({ publishedAt: -1 }).limit(10)
      for (const p of recent) {
        await Analytics.create({ postId: p._id, userId, platform: acc.platform, metrics: { likes:0, shares:0, comments:0, impressions:0, reach:0 }, recordedAt: new Date() })
        ingested++
      }
      continue
    }

    for (const item of providerData) {
      await Analytics.create({ postId: item.postId || null, userId, platform: acc.platform, metrics: item.metrics || {}, recordedAt: item.recordedAt ? new Date(item.recordedAt) : new Date() })
      ingested++
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

export async function ingestForUser(userId) {
  const accounts = await SocialAccount.find({ userId })
  let ingested = 0

  for (const acc of accounts) {
    const providerData = await fetchAnalyticsForAccount(acc)
    if (!providerData || providerData.length === 0) {
      const recentPosts = await Post.find({ userId, platforms: acc.platform }).sort({ publishedAt: -1 }).limit(10)
      for (const p of recentPosts) {
        await Analytics.create({ postId: p._id, userId, platform: acc.platform, metrics: { likes:0, shares:0, comments:0, impressions:0, reach:0 }, recordedAt: new Date() })
        ingested++
      }
      continue
    }

    for (const item of providerData) {
      await Analytics.create({ postId: item.postId || null, userId, platform: acc.platform, metrics: item.metrics || {}, recordedAt: item.recordedAt ? new Date(item.recordedAt) : new Date() })
      ingested++
    }
  }

  return ingested
}

export async function ingestForAllUsers() {
  const accounts = await SocialAccount.find({})
  const byUser = {}
  for (const a of accounts) {
    byUser[a.userId] = true
  }
  let total = 0
  for (const userId of Object.keys(byUser)) {
    // eslint-disable-next-line no-await-in-loop
    total += await ingestForUser(userId)
  }
  return total
}
