import mongoose from 'mongoose'

const { Schema } = mongoose

const AnalyticsSchema = new Schema({
  postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  platform: { type: String, enum: ['twitter','instagram','facebook','linkedin','tiktok','youtube'], required: true },
  metrics: {
    likes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    impressions: { type: Number, default: 0 },
    reach: { type: Number, default: 0 }
  },
  recordedAt: { type: Date, default: Date.now }
}, { timestamps: true })

// Indexes to speed up common aggregations
AnalyticsSchema.index({ userId: 1 })
AnalyticsSchema.index({ postId: 1 })
AnalyticsSchema.index({ platform: 1 })
AnalyticsSchema.index({ recordedAt: 1 })

// Aggregation helpers
AnalyticsSchema.statics.aggregateByPlatform = function(userId, from, to) {
  const match = { userId: mongoose.Types.ObjectId(userId) }
  if (from) match.recordedAt = { $gte: new Date(from) }
  if (to) match.recordedAt = match.recordedAt ? { ...match.recordedAt, $lte: new Date(to) } : { $lte: new Date(to) }

  return this.aggregate([
    { $match: match },
    { $group: {
      _id: '$platform',
      likes: { $sum: '$metrics.likes' },
      shares: { $sum: '$metrics.shares' },
      comments: { $sum: '$metrics.comments' },
      impressions: { $sum: '$metrics.impressions' },
      reach: { $sum: '$metrics.reach' }
    } },
    { $project: { platform: '$_id', likes: 1, shares: 1, comments:1, impressions:1, reach:1, _id:0 } }
  ])
}

AnalyticsSchema.statics.monthlyCounts = function(userId, months = 6) {
  const start = new Date()
  start.setMonth(start.getMonth() - (months - 1))
  start.setDate(1)
  start.setHours(0,0,0,0)

  return this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId), recordedAt: { $gte: start } } },
    { $group: {
      _id: { year: { $year: '$recordedAt' }, month: { $month: '$recordedAt' } },
      likes: { $sum: '$metrics.likes' },
      shares: { $sum: '$metrics.shares' },
      comments: { $sum: '$metrics.comments' },
      reach: { $sum: '$metrics.reach' }
    } },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ])
}

export default mongoose.model('Analytics', AnalyticsSchema)
