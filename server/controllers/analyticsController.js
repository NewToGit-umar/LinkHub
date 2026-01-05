import Analytics from '../models/Analytics.js'
import SocialAccount from '../models/SocialAccount.js'
import Post from '../models/Post.js'
import analyticsService from '../services/analyticsService.js'

export async function fetchAndIngest(req, res) {
  try {
    const userId = req.user && req.user.id
    if (!userId) return res.status(401).json({ message: 'Unauthorized' })
    const ingested = await analyticsService.ingestForUser(userId)
    return res.status(200).json({ message: 'Analytics ingested (user)', ingested })
  } catch (err) {
    console.error('fetchAndIngest error', err)
    return res.status(500).json({ message: 'Error fetching analytics', error: err.message })
  }
}

export async function aggregateMetrics(req, res) {
  try {
    const userId = req.user && req.user.id
    if (!userId) return res.status(401).json({ message: 'Unauthorized' })

    const { from, to, limit } = req.query
    
    // Get platform-specific analytics from the raw collection (for external accounts like YouTube)
    const mongoose = await import('mongoose')
    const platformAnalytics = await mongoose.default.connection.db
      .collection('useranalytics')
      .find({ userId: new mongoose.default.Types.ObjectId(userId), platform: { $exists: true } })
      .toArray()
    
    // Also get from Analytics model (for posts made through LinkHub)
    const postAnalytics = await Analytics.aggregateByPlatform(userId, from, to)
    
    // Merge the two sources
    const totalsMap = new Map()
    
    // Add platform analytics (external)
    for (const pa of platformAnalytics) {
      totalsMap.set(pa.platform, {
        platform: pa.platform,
        likes: pa.totalLikes || 0,
        shares: pa.totalShares || 0,
        comments: pa.totalComments || 0,
        impressions: pa.totalImpressions || 0,
        reach: pa.totalReach || 0,
        views: pa.totalViews || 0
      })
    }
    
    // Add/merge post analytics
    for (const pa of postAnalytics) {
      const existing = totalsMap.get(pa.platform)
      if (existing) {
        existing.likes += pa.likes || 0
        existing.shares += pa.shares || 0
        existing.comments += pa.comments || 0
        existing.impressions += pa.impressions || 0
        existing.reach += pa.reach || 0
      } else {
        totalsMap.set(pa.platform, pa)
      }
    }
    
    const totals = Array.from(totalsMap.values())
    const topPosts = await Analytics.topPosts(userId, from, to, limit ? parseInt(limit, 10) : 5)

    return res.status(200).json({ totals, topPosts })
  } catch (err) {
    console.error('aggregateMetrics error', err)
    return res.status(500).json({ message: 'Error aggregating metrics', error: err.message })
  }
}

export async function summary(req, res) {
  try {
    const userId = req.user && req.user.id
    if (!userId) return res.status(401).json({ message: 'Unauthorized' })

    const { from, to, months } = req.query

    const byPlatform = await Analytics.aggregateByPlatform(userId, from, to)
    const monthly = await Analytics.monthlyCounts(userId, months ? parseInt(months, 10) : 6)

    return res.status(200).json({ byPlatform, monthly })
  } catch (err) {
    console.error('analytics summary error', err)
    return res.status(500).json({ message: 'Error fetching analytics summary', error: err.message })
  }
}
