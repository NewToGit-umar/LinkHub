import { Router } from 'express'
import User from '../models/User.js'
import SocialAccount from '../models/SocialAccount.js'
import UserAnalytics from '../models/UserAnalytics.js'
import BioPage from '../models/BioPage.js'
import Post from '../models/Post.js'

const router = Router()

// Generate username from email if not set
const generateUsername = (email) => {
  return email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '')
}

// Get public profile by username or user ID
router.get('/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params
    
    let user
    
    // Try to find by username first (generated from email)
    // or by ID if it looks like a MongoDB ObjectId
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier)
    
    if (isObjectId) {
      user = await User.findById(identifier).select('-password -googleId')
    } else {
      // Find user where username matches (derived from email)
      const users = await User.find().select('-password -googleId')
      user = users.find(u => generateUsername(u.email) === identifier.toLowerCase())
    }
    
    if (!user) {
      return res.status(404).json({ message: 'Profile not found' })
    }
    
    // Check if profile is public
    if (!user.privacySettings?.profilePublic) {
      return res.status(403).json({ message: 'This profile is private' })
    }
    
    // Get social accounts (only public info, no tokens)
    const socialAccounts = await SocialAccount.find({ 
      userId: user._id, 
      isActive: true 
    }).select('platform accountHandle accountName profileData.displayName profileData.profilePicture profileData.followerCount profileData.url')
    
    // Get user analytics
    const analytics = await UserAnalytics.findOne({ userId: user._id })
    
    // Get user's bio pages (only public ones)
    const bioPages = await BioPage.find({ 
      userId: user._id, 
      isPublic: true 
    }).select('title slug avatar links settings views')
    
    // Collect all links from bio pages
    const allLinks = []
    let totalClicks = 0
    bioPages.forEach(page => {
      if (page.links && page.links.length > 0) {
        page.links.forEach(link => {
          allLinks.push({
            id: link._id,
            title: link.title,
            url: link.url,
            clicks: link.clicks || 0,
            icon: link.metadata?.icon,
            category: link.metadata?.category,
            bioPage: page.title
          })
          totalClicks += (link.clicks || 0)
        })
      }
    })
    
    // Get total page views from bio pages
    const totalPageViews = bioPages.reduce((sum, page) => sum + (page.views || 0), 0) + (analytics?.totalStats?.pageViews || 0)
    
    // Get post count
    const postCount = await Post.countDocuments({ userId: user._id })
    
    // Build response
    // Platform URL patterns
    const getPlatformUrl = (platform, handle, savedUrl) => {
      if (savedUrl) return savedUrl
      const urls = {
        twitter: `https://twitter.com/${handle}`,
        instagram: `https://instagram.com/${handle}`,
        facebook: `https://facebook.com/${handle}`,
        linkedin: `https://linkedin.com/in/${handle}`,
        youtube: `https://youtube.com/@${handle}`,
        tiktok: `https://tiktok.com/@${handle}`
      }
      return urls[platform] || `https://${platform}.com/${handle}`
    }

    const profileData = {
      id: user._id,
      name: user.name,
      username: generateUsername(user.email),
      avatar: user.avatar,
      bio: user.bio,
      location: user.location,
      website: user.website,
      joinedAt: user.createdAt,
      isVerified: user.isVerified,
      socialAccounts: socialAccounts.map(acc => ({
        platform: acc.platform,
        handle: acc.accountHandle,
        name: acc.accountName || acc.profileData?.displayName,
        profilePicture: acc.profileData?.profilePicture,
        followers: acc.profileData?.followerCount || 0,
        postsCount: acc.profileData?.postsCount || 0,
        url: getPlatformUrl(acc.platform, acc.accountHandle, acc.profileData?.url)
      })),
      stats: {
        totalClicks: totalClicks + (analytics?.totalStats?.clicks || 0),
        totalPageViews: totalPageViews,
        totalPosts: postCount,
        totalLinks: allLinks.length,
        totalFollowers: socialAccounts.reduce((sum, acc) => sum + (acc.profileData?.followerCount || 0), 0)
      },
      bioPages: bioPages.map(page => ({
        title: page.title,
        slug: page.slug,
        avatar: page.avatar,
        linkCount: page.links?.length || 0
      })),
      links: allLinks
    }
    
    res.json({ profile: profileData })
  } catch (err) {
    console.error('Error fetching public profile:', err)
    res.status(500).json({ message: 'Error fetching profile', error: err.message })
  }
})

// Track profile view
router.post('/:identifier/view', async (req, res) => {
  try {
    const { identifier } = req.params
    const { visitorId, referer } = req.body
    
    let user
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier)
    
    if (isObjectId) {
      user = await User.findById(identifier)
    } else {
      const users = await User.find()
      user = users.find(u => generateUsername(u.email) === identifier.toLowerCase())
    }
    
    if (!user) {
      return res.status(404).json({ message: 'Profile not found' })
    }
    
    // Increment page views in analytics
    let analytics = await UserAnalytics.findOne({ userId: user._id })
    if (!analytics) {
      analytics = await UserAnalytics.create({ userId: user._id })
    }
    
    analytics.totalStats.pageViews = (analytics.totalStats.pageViews || 0) + 1
    await analytics.save()
    
    res.json({ success: true, views: analytics.totalStats.pageViews })
  } catch (err) {
    console.error('Error tracking profile view:', err)
    res.status(500).json({ message: 'Error tracking view', error: err.message })
  }
})

// Track link click from public profile
router.post('/:identifier/click/:linkId', async (req, res) => {
  try {
    const { identifier, linkId } = req.params
    
    // Find user first
    let user
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier)
    
    if (isObjectId) {
      user = await User.findById(identifier)
    } else {
      const users = await User.find()
      user = users.find(u => generateUsername(u.email) === identifier.toLowerCase())
    }
    
    if (!user) {
      return res.status(404).json({ message: 'Profile not found' })
    }
    
    // Find the bio page with this link and update click count
    const bioPage = await BioPage.findOne({
      userId: user._id,
      'links._id': linkId
    })
    
    if (!bioPage) {
      return res.status(404).json({ message: 'Link not found' })
    }
    
    // Increment click count using the model method
    await bioPage.recordClick(linkId)
    
    // Also update user analytics
    const analytics = await UserAnalytics.findOne({ userId: user._id })
    if (analytics) {
      analytics.totalStats.clicks = (analytics.totalStats.clicks || 0) + 1
      await analytics.save()
    }
    
    const link = bioPage.links.id(linkId)
    res.json({ success: true, clicks: link?.clicks || 0 })
  } catch (err) {
    console.error('Error tracking click:', err)
    res.status(500).json({ message: 'Error tracking click', error: err.message })
  }
})

// Get username availability / lookup
router.get('/check/:username', async (req, res) => {
  try {
    const { username } = req.params
    const users = await User.find().select('email')
    const exists = users.some(u => generateUsername(u.email) === username.toLowerCase())
    
    res.json({ available: !exists, exists })
  } catch (err) {
    res.status(500).json({ message: 'Error checking username', error: err.message })
  }
})

export default router
