import mongoose from 'mongoose'

const { Schema } = mongoose

const UserAnalyticsSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  
  // Milestone tracking
  milestonesAchieved: {
    totalClicks: { type: Number, default: 0 },
    totalPosts: { type: Number, default: 0 },
    totalPageViews: { type: Number, default: 0 },
    followers: { type: Number, default: 0 },
    engagementRate: { type: Number, default: 0 }
  },
  
  // Aggregate stats (cached for quick access)
  totalStats: {
    clicks: { type: Number, default: 0 },
    posts: { type: Number, default: 0 },
    pageViews: { type: Number, default: 0 },
    followers: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    comments: { type: Number, default: 0 }
  },
  
  // Last calculated timestamp
  lastCalculatedAt: { type: Date, default: Date.now }
}, { timestamps: true })

// Indexes
UserAnalyticsSchema.index({ userId: 1 })

// Static method to get or create user analytics
UserAnalyticsSchema.statics.getOrCreate = async function(userId) {
  let analytics = await this.findOne({ userId })
  if (!analytics) {
    analytics = await this.create({ userId })
  }
  return analytics
}

// Update milestone for a metric
UserAnalyticsSchema.methods.updateMilestone = async function(metricName, value) {
  this.milestonesAchieved[metricName] = value
  return this.save()
}

// Update total stats
UserAnalyticsSchema.methods.updateStats = async function(stats) {
  Object.assign(this.totalStats, stats)
  this.lastCalculatedAt = new Date()
  return this.save()
}

const UserAnalytics = mongoose.model('UserAnalytics', UserAnalyticsSchema)
export default UserAnalytics
