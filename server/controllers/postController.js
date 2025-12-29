import Post from '../models/Post.js'

const ALLOWED_PLATFORMS = ['twitter', 'instagram', 'facebook', 'linkedin', 'tiktok', 'youtube']

export async function createPost(req, res) {
  try {
    const userId = req.user && req.user.id
    if (!userId) return res.status(401).json({ message: 'Unauthorized' })

    const { content, media = [], platforms = [], scheduledAt } = req.body

    if (!Array.isArray(platforms) || platforms.length === 0) {
      return res.status(400).json({ message: 'At least one platform is required' })
    }

    const invalid = platforms.filter(p => !ALLOWED_PLATFORMS.includes(p))
    if (invalid.length > 0) {
      return res.status(400).json({ message: 'Invalid platforms', invalid })
    }

    const postData = {
      userId,
      content: content || '',
      media,
      platforms,
    }

    if (scheduledAt) {
      const dt = new Date(scheduledAt)
      if (isNaN(dt.getTime())) return res.status(400).json({ message: 'Invalid scheduledAt' })
      postData.scheduledAt = dt
      postData.status = 'scheduled'
    }

    const post = await Post.create(postData)

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
