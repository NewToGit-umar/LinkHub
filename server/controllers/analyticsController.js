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

    const match = { userId: Post && Post ? undefined : undefined }
    // Use mongoose aggregate directly on Analytics
    const pipeline = []
    pipeline.push({ $match: { userId: analyticsService && analyticsService ? { $exists: true } : {} } })

    // simpler approach: aggregate totals by platform and top posts
    const totals = await Analytics.aggregate([
      { $match: { userId: require('mongoose').Types.ObjectId(userId), recordedAt: { $gte: from ? new Date(from) : new Date(0), $lte: to ? new Date(to) : new Date() } } },
      { $group: { _id: '$platform', likes: { $sum: '$metrics.likes' }, shares: { $sum: '$metrics.shares' }, comments: { $sum: '$metrics.comments' }, reach: { $sum: '$metrics.reach' } } },
      { $project: { platform: '$_id', likes: 1, shares: 1, comments:1, reach:1, _id:0 } }
    ])

    // top posts by total engagement
    const topPosts = await Analytics.aggregate([
      { $match: { userId: require('mongoose').Types.ObjectId(userId), recordedAt: { $gte: from ? new Date(from) : new Date(0), $lte: to ? new Date(to) : new Date() } } },
      { $group: { _id: '$postId', likes: { $sum: '$metrics.likes' }, shares: { $sum: '$metrics.shares' }, comments: { $sum: '$metrics.comments' }, reach: { $sum: '$metrics.reach' } } },
      { $project: { postId: '$_id', score: { $add: ['$likes','$shares','$comments'] }, likes:1, shares:1, comments:1, reach:1, _id:0 } },
      { $sort: { score: -1 } },
      { $limit: limit ? parseInt(limit,10) : 5 }
    ])

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
