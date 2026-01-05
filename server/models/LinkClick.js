import mongoose from 'mongoose'

const linkClickSchema = new mongoose.Schema({
  linkId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Link',
    required: true,
    index: true
  },
  bioPageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BioPage',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  // Visitor info
  visitorId: {
    type: String, // anonymous identifier (from cookie/fingerprint)
    default: null
  },
  ipHash: {
    type: String, // hashed IP for privacy
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  referer: {
    type: String,
    default: null
  },
  // Geo info (optional - could be populated via IP lookup)
  country: {
    type: String,
    default: null
  },
  city: {
    type: String,
    default: null
  },
  // Device info (parsed from user agent)
  device: {
    type: String,
    enum: ['mobile', 'tablet', 'desktop', 'unknown'],
    default: 'unknown'
  },
  browser: {
    type: String,
    default: null
  },
  os: {
    type: String,
    default: null
  },
  // Click metadata
  clickedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
})

// Compound indexes for analytics queries
linkClickSchema.index({ linkId: 1, clickedAt: -1 })
linkClickSchema.index({ bioPageId: 1, clickedAt: -1 })
linkClickSchema.index({ userId: 1, clickedAt: -1 })
linkClickSchema.index({ linkId: 1, country: 1, clickedAt: -1 })

// Static method to get click counts by link
linkClickSchema.statics.getClicksByLink = async function(linkId, startDate, endDate) {
  const match = { linkId: new mongoose.Types.ObjectId(linkId) }
  if (startDate || endDate) {
    match.clickedAt = {}
    if (startDate) match.clickedAt.$gte = new Date(startDate)
    if (endDate) match.clickedAt.$lte = new Date(endDate)
  }
  return this.countDocuments(match)
}

// Static method to get click stats for a bio page
linkClickSchema.statics.getBioPageStats = async function(bioPageId, startDate, endDate) {
  const match = { bioPageId: new mongoose.Types.ObjectId(bioPageId) }
  if (startDate || endDate) {
    match.clickedAt = {}
    if (startDate) match.clickedAt.$gte = new Date(startDate)
    if (endDate) match.clickedAt.$lte = new Date(endDate)
  }

  const pipeline = [
    { $match: match },
    {
      $group: {
        _id: '$linkId',
        clicks: { $sum: 1 },
        uniqueVisitors: { $addToSet: '$visitorId' },
        devices: { $push: '$device' },
        lastClick: { $max: '$clickedAt' }
      }
    },
    {
      $project: {
        linkId: '$_id',
        clicks: 1,
        uniqueVisitors: { $size: '$uniqueVisitors' },
        devices: 1,
        lastClick: 1
      }
    },
    { $sort: { clicks: -1 } }
  ]

  return this.aggregate(pipeline)
}

// Static method to get clicks over time (for charts)
linkClickSchema.statics.getClicksOverTime = async function(bioPageId, interval = 'day', days = 30) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const dateFormat = interval === 'hour' 
    ? { $dateToString: { format: '%Y-%m-%d %H:00', date: '$clickedAt' } }
    : { $dateToString: { format: '%Y-%m-%d', date: '$clickedAt' } }

  const pipeline = [
    {
      $match: {
        bioPageId: new mongoose.Types.ObjectId(bioPageId),
        clickedAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: dateFormat,
        clicks: { $sum: 1 },
        uniqueVisitors: { $addToSet: '$visitorId' }
      }
    },
    {
      $project: {
        date: '$_id',
        clicks: 1,
        uniqueVisitors: { $size: '$uniqueVisitors' }
      }
    },
    { $sort: { date: 1 } }
  ]

  return this.aggregate(pipeline)
}

// Static method to get top countries
linkClickSchema.statics.getTopCountries = async function(bioPageId, limit = 10) {
  const pipeline = [
    {
      $match: {
        bioPageId: new mongoose.Types.ObjectId(bioPageId),
        country: { $ne: null }
      }
    },
    {
      $group: {
        _id: '$country',
        clicks: { $sum: 1 }
      }
    },
    { $sort: { clicks: -1 } },
    { $limit: limit },
    {
      $project: {
        country: '$_id',
        clicks: 1,
        _id: 0
      }
    }
  ]

  return this.aggregate(pipeline)
}

// Static method to get device breakdown
linkClickSchema.statics.getDeviceBreakdown = async function(bioPageId) {
  const pipeline = [
    {
      $match: {
        bioPageId: new mongoose.Types.ObjectId(bioPageId)
      }
    },
    {
      $group: {
        _id: '$device',
        clicks: { $sum: 1 }
      }
    },
    {
      $project: {
        device: '$_id',
        clicks: 1,
        _id: 0
      }
    },
    { $sort: { clicks: -1 } }
  ]

  return this.aggregate(pipeline)
}

const LinkClick = mongoose.model('LinkClick', linkClickSchema)

export default LinkClick
