import Post from '../models/Post.js'
import SocialAccount from '../models/SocialAccount.js'
import Notification from '../models/Notification.js'

let publisherInterval = null

// Placeholder provider publishers. Real implementations call provider APIs.
const providerPublishers = {
  twitter: async (post, account) => ({ success: true, externalId: `tw-${post._id}` }),
  facebook: async (post, account) => ({ success: true, externalId: `fb-${post._id}` }),
  instagram: async (post, account) => ({ success: true, externalId: `ig-${post._id}` }),
  linkedin: async (post, account) => ({ success: true, externalId: `li-${post._id}` }),
  tiktok: async (post, account) => ({ success: true, externalId: `tt-${post._id}` }),
  youtube: async (post, account) => ({ success: true, externalId: `yt-${post._id}` }),
}

async function publishPost(post) {
  try {
    post.status = 'publishing'
    await post.save()

    // For simplicity, publish to each platform listed and collect results
    const results = {}
    for (const platform of post.platforms) {
      const publisher = providerPublishers[platform]
      const account = await SocialAccount.findOne({ userId: post.userId, platform })
      if (!publisher) {
        results[platform] = { success: false, error: 'No publisher configured' }
        continue
      }
      if (!account || !account.isValid()) {
        results[platform] = { success: false, error: 'No connected account or invalid token' }
        continue
      }

      // Call provider publisher (placeholder)
      try {
        const r = await publisher(post, account)
        results[platform] = { success: !!r?.success, data: r }
      } catch (err) {
        results[platform] = { success: false, error: err.message }
      }
    }

    const allSuccess = Object.values(results).every(r => r.success)
    if (allSuccess) {
      post.status = 'published'
      post.publishResult = results
      post.publishedAt = new Date()
      await post.save()

      // Send success notification
      await Notification.notifyPostPublished(
        post.userId,
        post._id,
        post.content?.substring(0, 50) || 'Untitled Post'
      )

      return true
    }

    // Partial or full failure: increment attempts, schedule retry or mark failed
    post.attempts = (post.attempts || 0) + 1
    post.lastError = JSON.stringify(results)
    if (post.attempts < 3) {
      post.status = 'scheduled'
      post.scheduledAt = new Date(Date.now() + 60 * 1000) // retry in 1 minute
    } else {
      post.status = 'failed'
      // Send failure notification
      await Notification.notifyPostFailed(
        post.userId,
        post._id,
        post.content?.substring(0, 50) || 'Untitled Post',
        post.lastError
      )
    }
    post.publishResult = results
    await post.save()
    return false
  } catch (err) {
    console.error('publishPost error', err)
    post.attempts = (post.attempts || 0) + 1
    post.lastError = err.message
    if (post.attempts < 3) {
      post.status = 'scheduled'
      post.scheduledAt = new Date(Date.now() + 60 * 1000)
    } else {
      post.status = 'failed'
      // Send failure notification
      await Notification.notifyPostFailed(
        post.userId,
        post._id,
        post.content?.substring(0, 50) || 'Untitled Post',
        err.message
      )
    }
    await post.save()
    return false
  }
}

async function processQueue() {
  try {
    // find posts queued for publishing
    const posts = await Post.find({ status: 'queued' }).sort({ scheduledAt: 1 }).limit(10)
    if (!posts || posts.length === 0) return

    for (const post of posts) {
      await publishPost(post)
    }
  } catch (err) {
    console.error('publisher processQueue error:', err)
  }
}

export function startPublisher() {
  if (publisherInterval) return
  // run every minute using setInterval
  publisherInterval = setInterval(processQueue, 60 * 1000)
  
  // also run immediately
  processQueue().catch(err => console.error('publisher startup error:', err))

  console.log('📤 Publisher service started (processing queued posts every minute)')
}

export function stopPublisher() {
  if (publisherInterval) {
    clearInterval(publisherInterval)
    publisherInterval = null
  }
}
