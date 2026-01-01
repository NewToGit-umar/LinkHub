import User from '../models/User.js'
import Post from '../models/Post.js'
import SocialAccount from '../models/SocialAccount.js'
import BioPage from '../models/BioPage.js'
import Team from '../models/Team.js'
import Notification from '../models/Notification.js'
import Analytics from '../models/Analytics.js'
import { auditLog } from '../utils/logger.js'

/**
 * Export all user data (GDPR compliant)
 */
export async function exportUserData(req, res) {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ message: 'Unauthorized' })

    // Log the data export request
    auditLog('DATA_EXPORT_REQUEST', userId, { ip: req.ip })

    // Fetch all user data (links are embedded in bioPages, not separate collection)
    const [
      user,
      posts,
      socialAccounts,
      bioPages,
      teams,
      notifications,
      analytics
    ] = await Promise.all([
      User.findById(userId).select('-password'),
      Post.find({ userId }),
      SocialAccount.find({ userId }).select('-accessToken -refreshToken'), // Exclude sensitive tokens
      BioPage.find({ userId }),
      Team.find({ 'members.userId': userId }),
      Notification.find({ userId }),
      Analytics.find({ userId })
    ])

    const exportData = {
      exportDate: new Date().toISOString(),
      exportVersion: '1.0',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        avatar: user.avatar,
        createdAt: user.createdAt
      },
      posts: posts.map(p => ({
        id: p._id,
        content: p.content,
        media: p.media,
        platforms: p.platforms,
        status: p.status,
        scheduledAt: p.scheduledAt,
        publishedAt: p.publishedAt,
        createdAt: p.createdAt
      })),
      socialAccounts: socialAccounts.map(a => ({
        id: a._id,
        platform: a.platform,
        accountId: a.accountId,
        accountHandle: a.accountHandle,
        accountName: a.accountName,
        isActive: a.isActive,
        connectedAt: a.createdAt
      })),
      bioPages: bioPages.map(b => ({
        id: b._id,
        title: b.title,
        slug: b.slug,
        description: b.description,
        isPublic: b.isPublic,
        views: b.views,
        links: (b.links || []).map(l => ({
          id: l._id,
          title: l.title,
          url: l.url,
          clicks: l.clicks,
          createdAt: l.createdAt
        })),
        createdAt: b.createdAt
      })),
      teamMemberships: teams.map(t => ({
        teamId: t._id,
        teamName: t.name,
        role: t.members.find(m => String(m.userId) === String(userId))?.role,
        joinedAt: t.members.find(m => String(m.userId) === String(userId))?.joinedAt
      })),
      notifications: notifications.map(n => ({
        id: n._id,
        type: n.type,
        title: n.title,
        message: n.message,
        isRead: n.isRead,
        createdAt: n.createdAt
      })),
      analytics: analytics.map(a => ({
        postId: a.postId,
        platform: a.platform,
        metrics: a.metrics,
        recordedAt: a.recordedAt
      }))
    }

    // Set headers for download
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Content-Disposition', `attachment; filename="linkhub-data-export-${Date.now()}.json"`)
    
    return res.status(200).json(exportData)
  } catch (err) {
    console.error('exportUserData error:', err)
    return res.status(500).json({ message: 'Error exporting data', error: err.message })
  }
}

/**
 * Delete all user data (GDPR right to be forgotten)
 */
export async function deleteAllUserData(req, res) {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ message: 'Unauthorized' })

    const { confirmDelete } = req.body
    if (confirmDelete !== 'DELETE MY ACCOUNT') {
      return res.status(400).json({ 
        message: 'Please confirm deletion by sending confirmDelete: "DELETE MY ACCOUNT"' 
      })
    }

    // Log the deletion request
    auditLog('ACCOUNT_DELETION_REQUEST', userId, { ip: req.ip })

    // Get user info before deletion for audit
    const user = await User.findById(userId).select('email name')
    
    // Delete all user data (links are embedded in BioPages, no separate Link collection)
    await Promise.all([
      Post.deleteMany({ userId }),
      SocialAccount.deleteMany({ userId }),
      BioPage.deleteMany({ userId }),
      Notification.deleteMany({ userId }),
      Analytics.deleteMany({ userId }),
      // Remove user from teams
      Team.updateMany(
        { 'members.userId': userId },
        { $pull: { members: { userId } } }
      )
    ])

    // Delete the user account
    await User.findByIdAndDelete(userId)

    // Log the successful deletion
    auditLog('ACCOUNT_DELETED', userId, { 
      email: user?.email,
      name: user?.name,
      ip: req.ip 
    })

    return res.status(200).json({ 
      message: 'Account and all associated data have been permanently deleted' 
    })
  } catch (err) {
    console.error('deleteAllUserData error:', err)
    return res.status(500).json({ message: 'Error deleting data', error: err.message })
  }
}

/**
 * Get privacy settings
 */
export async function getPrivacySettings(req, res) {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ message: 'Unauthorized' })

    const user = await User.findById(userId).select('privacySettings')
    
    // Default settings if not set
    const settings = user?.privacySettings || {
      profilePublic: true,
      showEmail: false,
      allowAnalytics: true,
      allowMarketing: false
    }

    return res.status(200).json({ settings })
  } catch (err) {
    console.error('getPrivacySettings error:', err)
    return res.status(500).json({ message: 'Error fetching privacy settings', error: err.message })
  }
}

/**
 * Update privacy settings
 */
export async function updatePrivacySettings(req, res) {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ message: 'Unauthorized' })

    const { profilePublic, showEmail, allowAnalytics, allowMarketing } = req.body

    const user = await User.findByIdAndUpdate(
      userId,
      {
        privacySettings: {
          profilePublic: profilePublic ?? true,
          showEmail: showEmail ?? false,
          allowAnalytics: allowAnalytics ?? true,
          allowMarketing: allowMarketing ?? false
        }
      },
      { new: true }
    ).select('privacySettings')

    auditLog('PRIVACY_SETTINGS_UPDATED', userId, { settings: user.privacySettings })

    return res.status(200).json({ 
      message: 'Privacy settings updated',
      settings: user.privacySettings 
    })
  } catch (err) {
    console.error('updatePrivacySettings error:', err)
    return res.status(500).json({ message: 'Error updating privacy settings', error: err.message })
  }
}
