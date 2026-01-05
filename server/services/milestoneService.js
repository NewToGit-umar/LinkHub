import UserAnalytics from '../models/UserAnalytics.js'
import Post from '../models/Post.js'
import BioPage from '../models/BioPage.js'
import LinkClick from '../models/LinkClick.js'
import Notification from '../models/Notification.js'

// Milestone thresholds for different metrics
const MILESTONES = {
  totalClicks: [100, 500, 1000, 5000, 10000, 50000, 100000],
  totalPosts: [10, 50, 100, 500, 1000],
  totalPageViews: [100, 500, 1000, 5000, 10000, 50000],
  followers: [100, 500, 1000, 5000, 10000, 50000, 100000],
  engagementRate: [5, 10, 25, 50] // percentages
}

// Track which milestones have been achieved (stored in user analytics)
const milestonesAchievedKey = 'milestonesAchieved'

/**
 * Get the next milestone threshold for a metric
 */
function getNextMilestone(metricName, currentValue) {
  const thresholds = MILESTONES[metricName]
  if (!thresholds) return null
  
  for (const threshold of thresholds) {
    if (currentValue >= threshold) continue
    return threshold
  }
  return null // All milestones achieved
}

/**
 * Get the most recently achieved milestone for a metric
 */
function getAchievedMilestone(metricName, currentValue) {
  const thresholds = MILESTONES[metricName]
  if (!thresholds) return null
  
  let achieved = null
  for (const threshold of thresholds) {
    if (currentValue >= threshold) {
      achieved = threshold
    } else {
      break
    }
  }
  return achieved
}

/**
 * Check and notify milestones for a user
 */
export async function checkMilestones(userId) {
  try {
    // Get or create user's analytics record
    const analytics = await UserAnalytics.getOrCreate(userId)
    const milestonesAchieved = analytics.milestonesAchieved || {}
    const newMilestones = []

    // Calculate current metrics
    const metrics = await calculateUserMetrics(userId)

    // Check each metric for new milestones
    for (const [metricName, currentValue] of Object.entries(metrics)) {
      const achievedMilestone = getAchievedMilestone(metricName, currentValue)
      const previousMilestone = milestonesAchieved[metricName] || 0

      if (achievedMilestone && achievedMilestone > previousMilestone) {
        // New milestone achieved!
        newMilestones.push({
          metric: metricName,
          value: achievedMilestone,
          currentValue
        })
        
        // Update tracked milestones
        milestonesAchieved[metricName] = achievedMilestone
      }
    }

    // Save updated milestones
    if (newMilestones.length > 0) {
      analytics.milestonesAchieved = milestonesAchieved
      await analytics.save()

      // Send notifications for each new milestone
      for (const milestone of newMilestones) {
        await Notification.notifyMilestone(
          userId,
          milestone.metric,
          milestone.value
        )
        console.log(`🎉 User ${userId} achieved ${milestone.metric} milestone: ${milestone.value}`)
      }
    }

    return newMilestones
  } catch (err) {
    console.error('checkMilestones error:', err)
    return []
  }
}

/**
 * Calculate user metrics for milestone checking
 */
async function calculateUserMetrics(userId) {
  const metrics = {
    totalClicks: 0,
    totalPosts: 0,
    totalPageViews: 0
  }

  try {
    // Count total link clicks
    const clickCount = await LinkClick.countDocuments({ userId })
    metrics.totalClicks = clickCount

    // Count total posts
    const postCount = await Post.countDocuments({ userId })
    metrics.totalPosts = postCount

    // Count bio page views
    const bioPages = await BioPage.find({ userId }).select('views')
    metrics.totalPageViews = bioPages.reduce((sum, page) => sum + (page.views || 0), 0)

  } catch (err) {
    console.error('calculateUserMetrics error:', err)
  }

  return metrics
}

/**
 * Get milestone progress for a user (for dashboard display)
 */
export async function getMilestoneProgress(userId) {
  try {
    const metrics = await calculateUserMetrics(userId)
    const analytics = await UserAnalytics.getOrCreate(userId)
    const milestonesAchieved = analytics.milestonesAchieved || {}

    const progress = {}

    for (const metricName of Object.keys(MILESTONES)) {
      const currentValue = metrics[metricName] || 0
      const nextMilestone = getNextMilestone(metricName, currentValue)
      const lastAchieved = milestonesAchieved[metricName] || 0

      progress[metricName] = {
        current: currentValue,
        lastAchieved,
        nextMilestone,
        progress: nextMilestone 
          ? Math.min(100, Math.round((currentValue / nextMilestone) * 100))
          : 100
      }
    }

    return progress
  } catch (err) {
    console.error('getMilestoneProgress error:', err)
    return {}
  }
}

/**
 * Format metric name for display
 */
export function formatMetricName(metricName) {
  const names = {
    totalClicks: 'Total Link Clicks',
    totalPosts: 'Total Posts',
    totalPageViews: 'Bio Page Views',
    followers: 'Followers',
    engagementRate: 'Engagement Rate'
  }
  return names[metricName] || metricName
}

// Background job to check milestones periodically
let milestoneCheckInterval = null

export function startMilestoneChecker() {
  if (milestoneCheckInterval) return

  // Run every hour
  milestoneCheckInterval = setInterval(async () => {
    try {
      // Get all users with analytics data
      const analyticsRecords = await UserAnalytics.find().select('userId')
      
      for (const record of analyticsRecords) {
        await checkMilestones(record.userId)
      }
    } catch (err) {
      console.error('Milestone checker error:', err)
    }
  }, 60 * 60 * 1000) // 1 hour

  console.log('✅ Milestone checker started (running hourly)')
  return milestoneCheckInterval
}

export function stopMilestoneChecker() {
  if (milestoneCheckInterval) {
    clearInterval(milestoneCheckInterval)
    milestoneCheckInterval = null
  }
}
