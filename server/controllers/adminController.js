import User from '../models/User.js'
import Post from '../models/Post.js'
import SocialAccount from '../models/SocialAccount.js'
import BioPage from '../models/BioPage.js'
import Team from '../models/Team.js'
import Analytics from '../models/Analytics.js'

/**
 * Get admin dashboard overview stats
 */
export async function getOverview(req, res) {
  try {
    const [
      totalUsers,
      totalPosts,
      totalAccounts,
      totalBioPages,
      totalTeams,
      recentUsers,
      recentPosts
    ] = await Promise.all([
      User.countDocuments(),
      Post.countDocuments(),
      SocialAccount.countDocuments({ isActive: true }),
      BioPage.countDocuments({ isPublished: true }),
      Team.countDocuments(),
      User.find().sort({ createdAt: -1 }).limit(5).select('name email createdAt role'),
      Post.find().sort({ createdAt: -1 }).limit(5).select('content status platforms createdAt userId')
        .populate('userId', 'name email')
    ])

    // Get growth stats (last 30 days vs previous 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)

    const [usersLast30, usersPrev30] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      User.countDocuments({ createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } })
    ])

    const userGrowth = usersPrev30 > 0 
      ? Math.round(((usersLast30 - usersPrev30) / usersPrev30) * 100) 
      : usersLast30 > 0 ? 100 : 0

    return res.status(200).json({
      stats: {
        totalUsers,
        totalPosts,
        totalAccounts,
        totalBioPages,
        totalTeams,
        userGrowth
      },
      recentUsers: recentUsers.map(u => ({
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt
      })),
      recentPosts: recentPosts.map(p => ({
        id: p._id,
        content: p.content?.substring(0, 100),
        status: p.status,
        platforms: p.platforms,
        createdAt: p.createdAt,
        user: p.userId ? { name: p.userId.name, email: p.userId.email } : null
      }))
    })
  } catch (err) {
    console.error('getOverview error:', err)
    return res.status(500).json({ message: 'Error fetching admin overview', error: err.message })
  }
}

/**
 * Get all users with pagination and search
 */
export async function getUsers(req, res) {
  try {
    const { page = 1, limit = 20, search, role } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const filter = {}
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }
    if (role) filter.role = role

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('-password'),
      User.countDocuments(filter)
    ])

    return res.status(200).json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    })
  } catch (err) {
    console.error('getUsers error:', err)
    return res.status(500).json({ message: 'Error fetching users', error: err.message })
  }
}

/**
 * Update user role
 */
export async function updateUserRole(req, res) {
  try {
    const { userId } = req.params
    const { role } = req.body

    if (!['user', 'moderator', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' })
    }

    // Prevent demoting self
    if (String(userId) === String(req.user.id) && role !== 'admin') {
      return res.status(400).json({ message: 'Cannot change your own role' })
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select('-password')

    if (!user) return res.status(404).json({ message: 'User not found' })

    return res.status(200).json({ message: 'Role updated', user })
  } catch (err) {
    console.error('updateUserRole error:', err)
    return res.status(500).json({ message: 'Error updating role', error: err.message })
  }
}

/**
 * Suspend/unsuspend a user
 */
export async function toggleUserSuspension(req, res) {
  try {
    const { userId } = req.params
    
    // Prevent self-suspension
    if (String(userId) === String(req.user.id)) {
      return res.status(400).json({ message: 'Cannot suspend yourself' })
    }

    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ message: 'User not found' })

    user.isSuspended = !user.isSuspended
    user.suspendedAt = user.isSuspended ? new Date() : null
    await user.save()

    return res.status(200).json({ 
      message: user.isSuspended ? 'User suspended' : 'User unsuspended',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isSuspended: user.isSuspended
      }
    })
  } catch (err) {
    console.error('toggleUserSuspension error:', err)
    return res.status(500).json({ message: 'Error toggling suspension', error: err.message })
  }
}

/**
 * Delete a user
 */
export async function deleteUser(req, res) {
  try {
    const { userId } = req.params
    
    // Prevent self-deletion
    if (String(userId) === String(req.user.id)) {
      return res.status(400).json({ message: 'Cannot delete yourself' })
    }

    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ message: 'User not found' })

    // Delete all user's data
    await Promise.all([
      Post.deleteMany({ userId }),
      SocialAccount.deleteMany({ userId }),
      BioPage.deleteMany({ userId }),
      User.findByIdAndDelete(userId)
    ])

    return res.status(200).json({ message: 'User and all associated data deleted' })
  } catch (err) {
    console.error('deleteUser error:', err)
    return res.status(500).json({ message: 'Error deleting user', error: err.message })
  }
}

/**
 * Get system-wide analytics
 */
export async function getSystemAnalytics(req, res) {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    // User registration trends (daily for last 30 days)
    const userTrends = await User.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ])

    // Post trends
    const postTrends = await Post.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ])

    // Platform distribution
    const platformStats = await SocialAccount.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$platform', count: { $sum: 1 } } }
    ])

    return res.status(200).json({
      userTrends: userTrends.map(t => ({ date: t._id, count: t.count })),
      postTrends: postTrends.map(t => ({ date: t._id, count: t.count })),
      platformDistribution: platformStats.map(p => ({ platform: p._id, count: p.count }))
    })
  } catch (err) {
    console.error('getSystemAnalytics error:', err)
    return res.status(500).json({ message: 'Error fetching analytics', error: err.message })
  }
}
