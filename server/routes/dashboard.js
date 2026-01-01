import express from 'express'
import { auth } from '../middleware/auth.js'
import Post from '../models/Post.js'
import SocialAccount from '../models/SocialAccount.js'
import Analytics from '../models/Analytics.js'

const router = express.Router()

// Real dashboard endpoint with actual data from database
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id

    // Get total posts count
    const totalPosts = await Post.countDocuments({ user: userId })

    // Get scheduled posts count
    const scheduledPosts = await Post.countDocuments({ 
      user: userId, 
      status: 'scheduled' 
    })

    // Get connected accounts count
    const connectedAccounts = await SocialAccount.countDocuments({ 
      user: userId 
    })

    // Get total engagement from analytics
    const analyticsData = await Analytics.find({ user: userId })
    const totalEngagement = analyticsData.reduce((sum, a) => {
      return sum + (a.likes || 0) + (a.comments || 0) + (a.shares || 0) + (a.impressions || 0)
    }, 0)

    // Get recent posts (last 5)
    const recentPosts = await Post.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('content status createdAt')
      .lean()

    // Calculate engagement per post from analytics
    const postsWithEngagement = await Promise.all(
      recentPosts.map(async (post) => {
        const postAnalytics = await Analytics.findOne({ post: post._id })
        const engagement = postAnalytics 
          ? (postAnalytics.likes || 0) + (postAnalytics.comments || 0) + (postAnalytics.shares || 0)
          : 0
        return {
          id: post._id,
          content: post.content?.substring(0, 100) || 'No content',
          status: post.status,
          engagement
        }
      })
    )

    const dashboardData = {
      stats: {
        totalPosts,
        scheduledPosts,
        connectedAccounts,
        totalEngagement
      },
      analytics: [],
      recentPosts: postsWithEngagement
    }

    res.status(200).json(dashboardData)
  } catch (err) {
    console.error('Dashboard error:', err)
    res.status(500).json({ message: 'Dashboard error', error: err.message })
  }
})

export default router
