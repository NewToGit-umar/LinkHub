import mongoose from 'mongoose'

const commentSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
    index: true
  },
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  // For threaded replies
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  // Mentions (user IDs)
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Reactions (like/emoji counts)
  reactions: {
    like: { type: Number, default: 0 },
    thumbsUp: { type: Number, default: 0 },
    thumbsDown: { type: Number, default: 0 },
    heart: { type: Number, default: 0 }
  },
  // Track who reacted
  reactedBy: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reaction: { type: String, enum: ['like', 'thumbsUp', 'thumbsDown', 'heart'] }
  }],
  // Status
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date,
    default: null
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

// Indexes
commentSchema.index({ postId: 1, createdAt: -1 })
commentSchema.index({ teamId: 1, postId: 1 })
commentSchema.index({ parentId: 1 })

// Virtual for reply count
commentSchema.virtual('replyCount', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parentId',
  count: true
})

// Static method to get comments for a post
commentSchema.statics.getPostComments = async function(postId, options = {}) {
  const { page = 1, limit = 20, includeReplies = true } = options
  const skip = (page - 1) * limit

  // Get top-level comments
  const query = { 
    postId: new mongoose.Types.ObjectId(postId), 
    parentId: null,
    isDeleted: false
  }

  const comments = await this.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('userId', 'name email')
    .populate('mentions', 'name')
    .lean()

  // Get reply counts
  if (includeReplies) {
    const commentIds = comments.map(c => c._id)
    const replyCounts = await this.aggregate([
      { $match: { parentId: { $in: commentIds }, isDeleted: false } },
      { $group: { _id: '$parentId', count: { $sum: 1 } } }
    ])
    const replyMap = Object.fromEntries(replyCounts.map(r => [String(r._id), r.count]))
    comments.forEach(c => {
      c.replyCount = replyMap[String(c._id)] || 0
    })
  }

  const total = await this.countDocuments(query)

  return { comments, total, page, limit, hasMore: skip + comments.length < total }
}

// Static method to get replies
commentSchema.statics.getReplies = async function(parentId, options = {}) {
  const { page = 1, limit = 10 } = options
  const skip = (page - 1) * limit

  const replies = await this.find({ parentId, isDeleted: false })
    .sort({ createdAt: 1 })
    .skip(skip)
    .limit(limit)
    .populate('userId', 'name email')
    .lean()

  const total = await this.countDocuments({ parentId, isDeleted: false })

  return { replies, total, page, limit, hasMore: skip + replies.length < total }
}

// Instance method to add reaction
commentSchema.methods.addReaction = async function(userId, reaction) {
  const existingIdx = this.reactedBy.findIndex(
    r => String(r.userId) === String(userId) && r.reaction === reaction
  )

  if (existingIdx >= 0) {
    // Remove reaction
    this.reactedBy.splice(existingIdx, 1)
    this.reactions[reaction] = Math.max(0, (this.reactions[reaction] || 0) - 1)
  } else {
    // Remove any existing reaction from this user
    const anyExisting = this.reactedBy.findIndex(r => String(r.userId) === String(userId))
    if (anyExisting >= 0) {
      const oldReaction = this.reactedBy[anyExisting].reaction
      this.reactions[oldReaction] = Math.max(0, (this.reactions[oldReaction] || 0) - 1)
      this.reactedBy.splice(anyExisting, 1)
    }
    // Add new reaction
    this.reactedBy.push({ userId, reaction })
    this.reactions[reaction] = (this.reactions[reaction] || 0) + 1
  }

  return this.save()
}

const Comment = mongoose.model('Comment', commentSchema)

export default Comment
