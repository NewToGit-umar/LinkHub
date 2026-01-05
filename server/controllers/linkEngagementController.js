import crypto from 'crypto'
import LinkClick from '../models/LinkClick.js'
import Link from '../models/Link.js'
import BioPage from '../models/BioPage.js'

// Helper to hash IP for privacy
function hashIP(ip) {
  if (!ip) return null
  return crypto.createHash('sha256').update(ip + process.env.IP_SALT || 'linkhub-salt').digest('hex').slice(0, 16)
}

// Helper to parse user agent for device type
function parseDevice(ua) {
  if (!ua) return 'unknown'
  const lowerUA = ua.toLowerCase()
  if (/mobile|android|iphone|ipad|ipod|blackberry|windows phone/i.test(lowerUA)) {
    if (/tablet|ipad/i.test(lowerUA)) return 'tablet'
    return 'mobile'
  }
  return 'desktop'
}

// Helper to parse browser from user agent
function parseBrowser(ua) {
  if (!ua) return null
  if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome'
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari'
  if (ua.includes('Firefox')) return 'Firefox'
  if (ua.includes('Edg')) return 'Edge'
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera'
  return 'Other'
}

// Helper to parse OS from user agent
function parseOS(ua) {
  if (!ua) return null
  if (ua.includes('Windows')) return 'Windows'
  if (ua.includes('Mac OS')) return 'macOS'
  if (ua.includes('Linux') && !ua.includes('Android')) return 'Linux'
  if (ua.includes('Android')) return 'Android'
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS'
  return 'Other'
}

// Track a link click
export async function trackClick(req, res) {
  try {
    const { linkId } = req.params
    const { visitorId, referer: bodyReferer } = req.body

    // Find the link
    const link = await Link.findById(linkId)
    if (!link) return res.status(404).json({ message: 'Link not found' })

    // Get visitor info
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress
    const userAgent = req.headers['user-agent']
    const referer = bodyReferer || req.headers.referer || null

    // Create click record
    const click = await LinkClick.create({
      linkId: link._id,
      bioPageId: link.bioPageId,
      userId: link.userId,
      visitorId: visitorId || null,
      ipHash: hashIP(ip),
      userAgent,
      referer,
      device: parseDevice(userAgent),
      browser: parseBrowser(userAgent),
      os: parseOS(userAgent)
    })

    // Increment click count on the link
    await Link.findByIdAndUpdate(linkId, { $inc: { clicks: 1 } })

    // Return the target URL for redirect
    return res.status(200).json({ 
      success: true, 
      url: link.url,
      clickId: click._id 
    })
  } catch (err) {
    console.error('trackClick error', err)
    return res.status(500).json({ message: 'Error tracking click', error: err.message })
  }
}

// Get click stats for a specific link
export async function getLinkStats(req, res) {
  try {
    const userId = req.user?.id
    const { linkId } = req.params
    const { startDate, endDate } = req.query

    const link = await Link.findById(linkId)
    if (!link) return res.status(404).json({ message: 'Link not found' })
    if (String(link.userId) !== String(userId)) return res.status(403).json({ message: 'Forbidden' })

    const totalClicks = await LinkClick.getClicksByLink(linkId, startDate, endDate)

    return res.status(200).json({
      linkId,
      totalClicks,
      link: {
        title: link.title,
        url: link.url,
        clicks: link.clicks
      }
    })
  } catch (err) {
    console.error('getLinkStats error', err)
    return res.status(500).json({ message: 'Error fetching link stats', error: err.message })
  }
}

// Get engagement stats for a bio page
export async function getBioPageEngagement(req, res) {
  try {
    const userId = req.user?.id
    const { bioPageId } = req.params
    const { startDate, endDate, interval = 'day', days = 30 } = req.query

    const page = await BioPage.findById(bioPageId)
    if (!page) return res.status(404).json({ message: 'Bio page not found' })
    if (String(page.userId) !== String(userId)) return res.status(403).json({ message: 'Forbidden' })

    const [linkStats, clicksOverTime, topCountries, deviceBreakdown] = await Promise.all([
      LinkClick.getBioPageStats(bioPageId, startDate, endDate),
      LinkClick.getClicksOverTime(bioPageId, interval, parseInt(days)),
      LinkClick.getTopCountries(bioPageId),
      LinkClick.getDeviceBreakdown(bioPageId)
    ])

    // Calculate totals
    const totalClicks = linkStats.reduce((sum, l) => sum + l.clicks, 0)
    const totalUniqueVisitors = linkStats.reduce((sum, l) => sum + l.uniqueVisitors, 0)

    return res.status(200).json({
      bioPageId,
      summary: {
        totalClicks,
        totalUniqueVisitors,
        topPerformingLinks: linkStats.slice(0, 5)
      },
      linkStats,
      clicksOverTime,
      topCountries,
      deviceBreakdown
    })
  } catch (err) {
    console.error('getBioPageEngagement error', err)
    return res.status(500).json({ message: 'Error fetching engagement', error: err.message })
  }
}

// Get all engagement stats for a user
export async function getUserEngagement(req, res) {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ message: 'Unauthorized' })

    const { days = 30 } = req.query
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(days))

    // Get all bio pages for user
    const bioPages = await BioPage.find({ userId })
    const bioPageIds = bioPages.map(p => p._id)

    // Get total clicks across all pages
    const totalClicks = await LinkClick.countDocuments({
      bioPageId: { $in: bioPageIds },
      clickedAt: { $gte: startDate }
    })

    // Get clicks by page
    const clicksByPage = await LinkClick.aggregate([
      {
        $match: {
          bioPageId: { $in: bioPageIds },
          clickedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$bioPageId',
          clicks: { $sum: 1 }
        }
      },
      { $sort: { clicks: -1 } }
    ])

    return res.status(200).json({
      totalClicks,
      totalPages: bioPages.length,
      clicksByPage: clicksByPage.map(c => ({
        bioPageId: c._id,
        clicks: c.clicks,
        page: bioPages.find(p => String(p._id) === String(c._id))
      }))
    })
  } catch (err) {
    console.error('getUserEngagement error', err)
    return res.status(500).json({ message: 'Error fetching engagement', error: err.message })
  }
}
