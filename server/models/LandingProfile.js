import mongoose from 'mongoose'

const { Schema } = mongoose

const LandingLinkSchema = new Schema({
  title: { type: String, required: true },
  url: { type: String, default: '#' },
  clicks: { type: Number, default: 0 },
  icon: { type: String, default: 'Globe' } // Icon name as string
})

const LandingProfileSchema = new Schema({
  name: { type: String, required: true, default: 'Umar Farooq' },
  username: { type: String, required: true, default: 'umarfarooq' },
  bio: { type: String, default: 'Digital Creator | Marketing Expert | Helping brands grow online 🚀' },
  avatar: { type: String, default: '/umar-profile.png' },
  avatarPosition: {
    x: { type: Number, default: 50 },
    y: { type: Number, default: 30 }
  },
  avatarScale: { type: Number, default: 100 },
  links: [LandingLinkSchema],
  stats: {
    totalViews: { type: Number, default: 45892 },
    totalClicks: { type: Number, default: 12847 },
    followers: { type: Number, default: 28500 }
  },
  socials: [{
    platform: { type: String },
    followers: { type: String },
    url: { type: String }
  }],
  isActive: { type: Boolean, default: true },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true })

// Ensure only one landing profile exists
LandingProfileSchema.statics.getSingleton = async function() {
  let profile = await this.findOne()
  if (!profile) {
    // Create default profile
    profile = await this.create({
      name: 'Umar Farooq',
      username: 'umarfarooq',
      bio: 'Digital Creator | Marketing Expert | Helping brands grow online 🚀',
      avatar: '/umar-profile.png',
      links: [
        { title: 'My Portfolio', url: '#', clicks: 2847, icon: 'Globe' },
        { title: 'Latest Blog Post', url: '#', clicks: 1523, icon: 'Link2' },
        { title: 'Book a Consultation', url: '#', clicks: 892, icon: 'Calendar' },
        { title: 'Free Marketing Guide', url: '#', clicks: 3201, icon: 'Zap' }
      ],
      stats: {
        totalViews: 45892,
        totalClicks: 12847,
        followers: 28500
      },
      socials: [
        { platform: 'twitter', followers: '12.5K' },
        { platform: 'instagram', followers: '28.3K' },
        { platform: 'youtube', followers: '8.2K' }
      ]
    })
  }
  return profile
}

const LandingProfile = mongoose.models.LandingProfile || mongoose.model('LandingProfile', LandingProfileSchema)
export default LandingProfile
