import Post from '../models/Post.js'
import Notification from '../models/Notification.js'

let schedulerInterval = null

async function processDuePosts() {
  try {
    const now = new Date()
    const due = await Post.findDuePosts(now)
    if (!due || due.length === 0) return

    for (const post of due) {
      try {
        await post.markQueued()
        console.log(`Queued post ${post._id} for publishing`)
      } catch (err) {
        console.error(`Failed to queue post ${post._id}:`, err)
      }
    }
  } catch (err) {
    console.error('Scheduler processDuePosts error:', err)
  }
}

export function startScheduler() {
  if (schedulerInterval) return

  // run every minute using setInterval
  schedulerInterval = setInterval(processDuePosts, 60 * 1000)

  // run immediately at startup
  processDuePosts().catch(err => console.error('Scheduler startup error:', err))

  console.log('✅ Scheduler started (running every minute)')
  return schedulerInterval
}

export function stopScheduler() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval)
    schedulerInterval = null
  }
}

// Notification for scheduled post (call this when creating a scheduled post)
export async function notifyPostScheduled(userId, postId, scheduledAt, postTitle) {
  const scheduleDate = new Date(scheduledAt)
  const formatted = scheduleDate.toLocaleString()
  
  return Notification.notify(
    userId,
    'post_scheduled',
    'Post Scheduled',
    `Your post "${postTitle || 'Untitled'}" has been scheduled for ${formatted}.`,
    {
      reference: { type: 'post', id: postId },
      actionUrl: `/posts`
    }
  )
}
