import mongoose from 'mongoose'

const { Schema, models } = mongoose

const MediaSchema = new Schema({
  url: { type: String, required: true },
  type: { type: String, enum: ['image', 'video', 'link', 'other'], default: 'image' },
  meta: { type: Schema.Types.Mixed }
}, { _id: false })

const PostSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  socialAccountId: { type: Schema.Types.ObjectId, ref: 'SocialAccount' },
  content: { type: String, trim: true, maxlength: 5000 },
  media: { type: [MediaSchema], default: [] },
  platforms: {
    type: [String],
    enum: ['twitter', 'instagram', 'facebook', 'linkedin', 'tiktok', 'youtube'],
    required: true,
    index: true
  },
  scheduledAt: { type: Date, index: true },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'queued', 'publishing', 'published', 'failed', 'cancelled'],
    default: 'draft',
    index: true
  },
  publishResult: { type: Schema.Types.Mixed },
  attempts: { type: Number, default: 0 },
  lastError: { type: String },
  metadata: { type: Schema.Types.Mixed, default: {} }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Simple static to find posts ready to be published
PostSchema.statics.findDuePosts = function (now = new Date()) {
  return this.find({
    status: 'scheduled',
    scheduledAt: { $lte: now }
  }).sort({ scheduledAt: 1 })
}

// Mark as queued before publishing
PostSchema.methods.markQueued = function () {
  this.status = 'queued'
  return this.save()
}

const Post = models.Post || mongoose.model('Post', PostSchema)
export default Post
