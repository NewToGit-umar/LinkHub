import Comment from '../models/Comment.js'
import Post from '../models/Post.js'
import Team from '../models/Team.js'

// Create a comment
export async function createComment(req, res) {
  try {
    const userId = req.user?.id
    const { postId, content, parentId, mentions } = req.body

    if (!postId || !content) {
      return res.status(400).json({ message: 'Post ID and content are required' })
    }

    // Get post and verify team access
    const post = await Post.findById(postId)
    if (!post) return res.status(404).json({ message: 'Post not found' })

    // Get team (post should have teamId)
    const teamId = post.teamId
    if (teamId) {
      const team = await Team.findById(teamId)
      if (team && !team.isMember(userId)) {
        return res.status(403).json({ message: 'Not a team member' })
      }
    }

    // If this is a reply, verify parent exists
    if (parentId) {
      const parentComment = await Comment.findById(parentId)
      if (!parentComment || parentComment.isDeleted) {
        return res.status(404).json({ message: 'Parent comment not found' })
      }
    }

    const comment = await Comment.create({
      postId,
      teamId,
      userId,
      content,
      parentId: parentId || null,
      mentions: mentions || []
    })

    await comment.populate('userId', 'name email')
    await comment.populate('mentions', 'name')

    return res.status(201).json({ comment })
  } catch (err) {
    console.error('createComment error', err)
    return res.status(500).json({ message: 'Error creating comment', error: err.message })
  }
}

// Get comments for a post
export async function getPostComments(req, res) {
  try {
    const userId = req.user?.id
    const { postId } = req.params
    const { page = 1, limit = 20 } = req.query

    const post = await Post.findById(postId)
    if (!post) return res.status(404).json({ message: 'Post not found' })

    // Verify team access if applicable
    if (post.teamId) {
      const team = await Team.findById(post.teamId)
      if (team && !team.isMember(userId)) {
        return res.status(403).json({ message: 'Not a team member' })
      }
    }

    const result = await Comment.getPostComments(postId, { 
      page: parseInt(page), 
      limit: parseInt(limit) 
    })

    return res.status(200).json(result)
  } catch (err) {
    console.error('getPostComments error', err)
    return res.status(500).json({ message: 'Error fetching comments', error: err.message })
  }
}

// Get replies to a comment
export async function getReplies(req, res) {
  try {
    const { commentId } = req.params
    const { page = 1, limit = 10 } = req.query

    const result = await Comment.getReplies(commentId, { 
      page: parseInt(page), 
      limit: parseInt(limit) 
    })

    return res.status(200).json(result)
  } catch (err) {
    console.error('getReplies error', err)
    return res.status(500).json({ message: 'Error fetching replies', error: err.message })
  }
}

// Update a comment
export async function updateComment(req, res) {
  try {
    const userId = req.user?.id
    const { commentId } = req.params
    const { content } = req.body

    const comment = await Comment.findById(commentId)
    if (!comment || comment.isDeleted) {
      return res.status(404).json({ message: 'Comment not found' })
    }

    // Only author can edit
    if (String(comment.userId) !== String(userId)) {
      return res.status(403).json({ message: 'Not authorized to edit this comment' })
    }

    comment.content = content
    comment.isEdited = true
    comment.editedAt = new Date()
    await comment.save()

    await comment.populate('userId', 'name email')

    return res.status(200).json({ comment })
  } catch (err) {
    console.error('updateComment error', err)
    return res.status(500).json({ message: 'Error updating comment', error: err.message })
  }
}

// Delete a comment (soft delete)
export async function deleteComment(req, res) {
  try {
    const userId = req.user?.id
    const { commentId } = req.params

    const comment = await Comment.findById(commentId)
    if (!comment || comment.isDeleted) {
      return res.status(404).json({ message: 'Comment not found' })
    }

    // Author or team admin can delete
    let canDelete = String(comment.userId) === String(userId)
    
    if (!canDelete && comment.teamId) {
      const team = await Team.findById(comment.teamId)
      if (team) {
        const role = team.getMemberRole(userId)
        canDelete = role === 'owner' || role === 'admin'
      }
    }

    if (!canDelete) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' })
    }

    comment.isDeleted = true
    comment.content = '[Comment deleted]'
    await comment.save()

    return res.status(200).json({ message: 'Comment deleted' })
  } catch (err) {
    console.error('deleteComment error', err)
    return res.status(500).json({ message: 'Error deleting comment', error: err.message })
  }
}

// Add/remove reaction
export async function toggleReaction(req, res) {
  try {
    const userId = req.user?.id
    const { commentId } = req.params
    const { reaction } = req.body

    const validReactions = ['like', 'thumbsUp', 'thumbsDown', 'heart']
    if (!validReactions.includes(reaction)) {
      return res.status(400).json({ message: 'Invalid reaction type' })
    }

    const comment = await Comment.findById(commentId)
    if (!comment || comment.isDeleted) {
      return res.status(404).json({ message: 'Comment not found' })
    }

    await comment.addReaction(userId, reaction)

    return res.status(200).json({ 
      reactions: comment.reactions,
      userReaction: comment.reactedBy.find(r => String(r.userId) === String(userId))?.reaction || null
    })
  } catch (err) {
    console.error('toggleReaction error', err)
    return res.status(500).json({ message: 'Error updating reaction', error: err.message })
  }
}
