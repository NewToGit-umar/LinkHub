import Post from '../models/Post.js'
import { notifyPostScheduled } from '../services/scheduler.js'

const ALLOWED_PLATFORMS = ['twitter', 'instagram', 'facebook', 'linkedin', 'tiktok', 'youtube']

export async function createPost(req, res) {
  try {
    const userId = req.user && req.user.id
    if (!userId) return res.status(401).json({ message: 'Unauthorized' })

    const { 
      content, 
      media = [], 
      platforms = [], 
      scheduledAt,
      // YouTube-specific fields
      title,
      tags,
      visibility,
      categoryId
    } = req.body

    if (!Array.isArray(platforms) || platforms.length === 0) {
      return res.status(400).json({ message: 'At least one platform is required' })
    }

    const invalid = platforms.filter(p => !ALLOWED_PLATFORMS.includes(p))
    if (invalid.length > 0) {
      return res.status(400).json({ message: 'Invalid platforms', invalid })
    }

    // YouTube requires video content and title
    if (platforms.includes('youtube')) {
      const hasVideo = media.some(m => m.type === 'video')
      if (!hasVideo) {
        return res.status(400).json({ message: 'YouTube requires video content' })
      }
      if (!title || title.trim().length === 0) {
        return res.status(400).json({ message: 'YouTube requires a video title' })
      }
    }

    const postData = {
      userId,
      content: content || '',
      media,
      platforms,
      title,
      tags: tags || [],
      visibility: visibility || 'public',
      categoryId: categoryId || '22'
    }

    if (scheduledAt) {
      const dt = new Date(scheduledAt)
      if (isNaN(dt.getTime())) return res.status(400).json({ message: 'Invalid scheduledAt' })
      postData.scheduledAt = dt
      postData.status = 'scheduled'
    }

    const post = await Post.create(postData)

    // Send notification for scheduled posts
    if (post.scheduledAt) {
      const postTitle = post.title || (post.content ? post.content.substring(0, 50) : 'Untitled')
      await notifyPostScheduled(userId, post._id, post.scheduledAt, postTitle)
    }

    return res.status(201).json({ message: 'Post created', post })
  } catch (err) {
    console.error('createPost error', err)
    return res.status(500).json({ message: 'Error creating post', error: err.message })
  }
}

export async function listPosts(req, res) {
  try {
    const userId = req.user && req.user.id
    if (!userId) return res.status(401).json({ message: 'Unauthorized' })

    const posts = await Post.find({ userId }).sort({ createdAt: -1 }).limit(100)
    return res.status(200).json({ posts })
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching posts', error: err.message })
  }
}

export async function updatePost(req, res) {
  try {
    const userId = req.user && req.user.id
    if (!userId) return res.status(401).json({ message: 'Unauthorized' })

    const { id } = req.params
    const post = await Post.findById(id)
    if (!post) return res.status(404).json({ message: 'Post not found' })
    if (String(post.userId) !== String(userId)) return res.status(403).json({ message: 'Forbidden' })

    // Prevent edits once publishing/published/queued
    if (['publishing', 'published', 'queued'].includes(post.status)) {
      return res.status(400).json({ message: 'Cannot edit a post that is publishing, queued, or already published' })
    }

    const { content, media, platforms, scheduledAt } = req.body
    if (content !== undefined) post.content = content
    if (Array.isArray(media)) post.media = media
    if (Array.isArray(platforms) && platforms.length > 0) post.platforms = platforms
    if (scheduledAt !== undefined) {
      const dt = scheduledAt ? new Date(scheduledAt) : null
      if (dt && isNaN(dt.getTime())) return res.status(400).json({ message: 'Invalid scheduledAt' })
      post.scheduledAt = dt
      post.status = dt ? 'scheduled' : 'draft'
    }

    await post.save()
    return res.status(200).json({ message: 'Post updated', post })
  } catch (err) {
    console.error('updatePost error', err)
    return res.status(500).json({ message: 'Error updating post', error: err.message })
  }
}

export async function deletePost(req, res) {
  try {
    const userId = req.user && req.user.id
    if (!userId) return res.status(401).json({ message: 'Unauthorized' })

    const { id } = req.params
    const post = await Post.findById(id)
    if (!post) return res.status(404).json({ message: 'Post not found' })
    if (String(post.userId) !== String(userId)) return res.status(403).json({ message: 'Forbidden' })

    if (['publishing', 'published'].includes(post.status)) {
      return res.status(400).json({ message: 'Cannot delete a post that is publishing or already published' })
    }

    // Soft-cancel the post for auditability
    post.status = 'cancelled'
    post.cancelledAt = new Date()
    await post.save()
    return res.status(200).json({ message: 'Post cancelled' })
  } catch (err) {
    console.error('deletePost error', err)
    return res.status(500).json({ message: 'Error deleting post', error: err.message })
  }
}

export async function publishPost(req, res) {
  try {
    const userId = req.user && req.user.id
    if (!userId) return res.status(401).json({ message: 'Unauthorized' })

    const { id } = req.params
    const post = await Post.findById(id)
    if (!post) return res.status(404).json({ message: 'Post not found' })
    if (String(post.userId) !== String(userId)) return res.status(403).json({ message: 'Forbidden' })

    // Do not allow publishing cancelled/published/already publishing posts
    if (['cancelled', 'published', 'publishing'].includes(post.status)) {
      return res.status(400).json({ message: 'Cannot publish this post' })
    }

    // Mark as queued so the publisher service picks it up immediately
    post.status = 'queued'
    post.queuedAt = new Date()
    await post.save()

    return res.status(200).json({ message: 'Post queued for publishing', post })
  } catch (err) {
    console.error('publishPost error', err)
    return res.status(500).json({ message: 'Error queuing post', error: err.message })
  }
}
