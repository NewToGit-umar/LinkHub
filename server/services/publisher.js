import cron from 'node-cron'
import Post from '../models/Post.js'
import SocialAccount from '../models/SocialAccount.js'

let job = null

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
  if (job) return job
  // run every minute
  job = cron.schedule('* * * * *', async () => {
    await processQueue()
  })

  // also run immediately
  processQueue().catch(err => console.error('publisher startup error:', err))

  console.log('✅ Publisher started (processing queued posts every minute)')
  return job
}

export function stopPublisher() {
  if (job) job.stop()
}
