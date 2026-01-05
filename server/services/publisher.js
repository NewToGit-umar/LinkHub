import Post from '../models/Post.js'
import SocialAccount from '../models/SocialAccount.js'
import Notification from '../models/Notification.js'
import twitterProvider from './providers/twitter.js'
import facebookProvider from './providers/facebook.js'
import instagramProvider from './providers/instagram.js'
import linkedinProvider from './providers/linkedin.js'
import * as youtubeProvider from './providers/youtube.js'
import tiktokProvider from './providers/tiktok.js'
import * as socketService from './socketService.js'
import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let publisherInterval = null

/**
 * Fetch video buffer from URL or local file
 */
async function getVideoBuffer(videoUrl) {
  try {
    // Check if it's a local file URL
    if (videoUrl.includes('/uploads/videos/')) {
      const filename = videoUrl.split('/uploads/videos/').pop()
      const filepath = path.join(__dirname, '../uploads/videos', filename)
      if (fs.existsSync(filepath)) {
        return fs.readFileSync(filepath)
      }
    }
    
    // Otherwise fetch from URL
    const response = await axios.get(videoUrl, {
      responseType: 'arraybuffer',
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    })
    return Buffer.from(response.data)
  } catch (error) {
    console.error('Error fetching video buffer:', error.message)
    throw new Error(`Failed to fetch video: ${error.message}`)
  }
}

/**
 * Real provider publishers that call actual platform APIs
 */
const providerPublishers = {
  twitter: async (post, account) => {
    try {
      // Check if post has media
      let mediaIds = []
      if (post.media && post.media.length > 0) {
        // Upload each media file
        for (const mediaItem of post.media) {
          const uploadResult = await twitterProvider.uploadMedia(
            account.accessToken,
            mediaItem.url,
            mediaItem.type || 'image'
          )
          if (uploadResult.success && uploadResult.mediaId) {
            mediaIds.push(uploadResult.mediaId)
          }
        }
      }

      const result = await twitterProvider.postTweet(
        account.accessToken,
        post.content,
        mediaIds.length > 0 ? mediaIds : undefined
      )

      return {
        success: result.success,
        externalId: result.tweetId,
        url: result.url,
        error: result.error
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  facebook: async (post, account) => {
    try {
      // Check if user has pages and wants to post to page
      const pageId = post.targetPageId || account.profileData?.pages?.[0]?.id

      let result
      if (pageId) {
        // Post to Facebook Page
        result = await facebookProvider.postToPage(
          account.accessToken,
          pageId,
          post.content,
          post.media?.[0]?.url
        )
      } else {
        // Post to personal feed
        result = await facebookProvider.postToFeed(
          account.accessToken,
          account.accountId,
          post.content,
          post.media?.[0]?.url
        )
      }

      return {
        success: result.success,
        externalId: result.postId,
        url: result.url,
        error: result.error
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  instagram: async (post, account) => {
    try {
      // Instagram requires a Business account and media URL
      if (!post.media || post.media.length === 0) {
        return { success: false, error: 'Instagram requires media to post' }
      }

      const igUserId = account.profileData?.igUserId || account.accountId

      // Determine media type
      let mediaType = 'IMAGE'
      if (post.media[0].type === 'video') {
        mediaType = post.mediaType === 'reels' ? 'REELS' : 'VIDEO'
      } else if (post.media.length > 1) {
        mediaType = 'CAROUSEL'
      }

      const result = await instagramProvider.postMedia(
        account.accessToken,
        igUserId,
        post.media[0].url,
        post.content,
        mediaType
      )

      return {
        success: result.success,
        externalId: result.externalId,
        url: result.url,
        error: result.error
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  linkedin: async (post, account) => {
    try {
      // Get user URN
      const urnResult = await linkedinProvider.getUserUrn(account.accessToken)
      if (!urnResult.success) {
        return { success: false, error: 'Failed to get LinkedIn user URN' }
      }

      let result
      if (post.media && post.media.length > 0 && post.media[0].type === 'image') {
        // Upload image first, then post with media
        // Note: For real implementation, you'd need to handle image upload
        result = await linkedinProvider.createPost(
          account.accessToken,
          urnResult.urn,
          post.content,
          post.visibility || 'PUBLIC'
        )
      } else {
        // Text-only post
        result = await linkedinProvider.createPost(
          account.accessToken,
          urnResult.urn,
          post.content,
          post.visibility || 'PUBLIC'
        )
      }

      return {
        success: result.success,
        externalId: result.externalId,
        url: result.url,
        error: result.error
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  youtube: async (post, account) => {
    try {
      // YouTube requires video content
      if (!post.media || post.media.length === 0 || post.media[0].type !== 'video') {
        return { success: false, error: 'YouTube requires video content' }
      }

      // Fetch the video buffer from URL
      console.log('Fetching video buffer from:', post.media[0].url)
      const videoBuffer = await getVideoBuffer(post.media[0].url)
      console.log('Video buffer size:', videoBuffer.length, 'bytes')

      // Upload to YouTube
      const result = await youtubeProvider.uploadVideo(
        account.accessToken,
        videoBuffer,
        {
          title: post.title || post.content?.substring(0, 100) || 'Untitled Video',
          description: post.content || '',
          tags: post.tags || [],
          privacyStatus: post.visibility || 'private',
          categoryId: post.categoryId || '22'
        }
      )

      return {
        success: result.success,
        externalId: result.videoId,
        url: result.url,
        error: result.error
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  tiktok: async (post, account) => {
    try {
      // TikTok requires video content
      if (!post.media || post.media.length === 0 || post.media[0].type !== 'video') {
        return { success: false, error: 'TikTok requires video content' }
      }

      const result = await tiktokProvider.uploadVideo(
        account.accessToken,
        post.media[0].buffer, // Would need to fetch/provide buffer
        {
          title: post.content.substring(0, 150),
          privacyLevel: post.visibility || 'SELF_ONLY'
        }
      )

      return {
        success: result.success,
        externalId: result.videoId,
        url: result.url,
        error: result.error
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
}

async function publishPost(post) {
  try {
    post.status = 'publishing'
    await post.save()

    // For simplicity, publish to each platform listed and collect results
    const results = {}
    for (const platform of post.platforms) {
      const publisher = providerPublishers[platform]
      // Use select('+accessToken') to get the hidden accessToken field
      const account = await SocialAccount.findOne({ userId: post.userId, platform }).select('+accessToken +refreshToken')
      if (!publisher) {
        results[platform] = { success: false, error: 'No publisher configured' }
        continue
      }
      if (!account || !account.isValid()) {
        results[platform] = { success: false, error: 'No connected account or invalid token' }
        continue
      }

      // Call provider publisher
      try {
        console.log(`Publishing to ${platform} for user ${post.userId}`)
        const r = await publisher(post, account)
        results[platform] = { success: !!r?.success, data: r }
        if (r?.success) {
          console.log(`Successfully published to ${platform}:`, r.url || r.externalId)
        } else {
          console.log(`Failed to publish to ${platform}:`, r?.error)
        }
      } catch (err) {
        console.error(`Error publishing to ${platform}:`, err)
        results[platform] = { success: false, error: err.message }
      }
    }

    const allSuccess = Object.values(results).every(r => r.success)
    if (allSuccess) {
      post.status = 'published'
      post.publishResult = results
      post.publishedAt = new Date()
      await post.save()

      // Send success notification (database)
      await Notification.notifyPostPublished(
        post.userId,
        post._id,
        post.content?.substring(0, 50) || 'Untitled Post'
      )

      // Send real-time WebSocket notification
      socketService.notifyPostPublished(
        post.userId.toString(),
        post._id.toString(),
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
      // Send failure notification (database)
      await Notification.notifyPostFailed(
        post.userId,
        post._id,
        post.content?.substring(0, 50) || 'Untitled Post',
        post.lastError
      )

      // Send real-time WebSocket notification
      socketService.notifyPostFailed(
        post.userId.toString(),
        post._id.toString(),
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
