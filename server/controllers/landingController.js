import LandingProfile from '../models/LandingProfile.js'

/**
 * Get landing page profile (public)
 */
export async function getLandingProfile(req, res) {
  try {
    const profile = await LandingProfile.getSingleton()
    return res.status(200).json({ profile })
  } catch (err) {
    console.error('getLandingProfile error:', err)
    return res.status(500).json({ message: 'Error fetching landing profile', error: err.message })
  }
}

/**
 * Update landing page profile (admin only)
 */
export async function updateLandingProfile(req, res) {
  try {
    const { name, username, bio, avatar, avatarPosition, avatarScale, links, stats, socials } = req.body

    let profile = await LandingProfile.findOne()
    
    if (!profile) {
      profile = new LandingProfile({})
    }

    // Update fields if provided
    if (name !== undefined) profile.name = name
    if (username !== undefined) profile.username = username
    if (bio !== undefined) profile.bio = bio
    if (avatar !== undefined) profile.avatar = avatar
    if (avatarPosition !== undefined) profile.avatarPosition = avatarPosition
    if (avatarScale !== undefined) profile.avatarScale = avatarScale
    if (links !== undefined) profile.links = links
    if (stats !== undefined) profile.stats = stats
    if (socials !== undefined) profile.socials = socials
    
    profile.updatedBy = req.user.id || req.user._id
    profile.updatedAt = new Date()

    await profile.save()

    return res.status(200).json({ 
      message: 'Landing profile updated successfully',
      profile 
    })
  } catch (err) {
    console.error('updateLandingProfile error:', err)
    return res.status(500).json({ message: 'Error updating landing profile', error: err.message })
  }
}

/**
 * Upload avatar for landing profile (admin only)
 */
export async function uploadLandingAvatar(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    const avatarPath = `/uploads/landing/${req.file.filename}`
    
    let profile = await LandingProfile.findOne()
    if (!profile) {
      profile = await LandingProfile.getSingleton()
    }
    
    profile.avatar = avatarPath
    profile.updatedBy = req.user.id || req.user._id
    await profile.save()

    return res.status(200).json({ 
      message: 'Avatar uploaded successfully',
      avatar: avatarPath,
      profile
    })
  } catch (err) {
    console.error('uploadLandingAvatar error:', err)
    return res.status(500).json({ message: 'Error uploading avatar', error: err.message })
  }
}
