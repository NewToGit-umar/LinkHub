import axios from 'axios'

const API_BASE = 'https://graph.instagram.com'
const FACEBOOK_API = 'https://graph.facebook.com/v18.0'

/**
 * Post to Instagram (via Facebook Graph API for Business accounts)
 * Instagram posting requires a Business/Creator account connected to a Facebook Page
 */
export async function postMedia(accessToken, igUserId, mediaUrl, caption, mediaType = 'IMAGE') {
  try {
    // Step 1: Create media container
    const containerEndpoint = `${FACEBOOK_API}/${igUserId}/media`
    const containerParams = {
      access_token: accessToken,
      caption
    }

    if (mediaType === 'VIDEO' || mediaType === 'REELS') {
      containerParams.video_url = mediaUrl
      containerParams.media_type = mediaType
    } else if (mediaType === 'CAROUSEL') {
      // For carousel, mediaUrl should be an array of image URLs
      containerParams.media_type = 'CAROUSEL'
      containerParams.children = mediaUrl // Array of container IDs
    } else {
      containerParams.image_url = mediaUrl
    }

    const containerResponse = await axios.post(containerEndpoint, null, { params: containerParams })
    const containerId = containerResponse.data.id

    // Step 2: Wait for container to be ready (for videos)
    if (mediaType === 'VIDEO' || mediaType === 'REELS') {
      await waitForContainerReady(accessToken, containerId)
    }

    // Step 3: Publish the container
    const publishEndpoint = `${FACEBOOK_API}/${igUserId}/media_publish`
    const publishResponse = await axios.post(publishEndpoint, null, {
      params: {
        access_token: accessToken,
        creation_id: containerId
      }
    })

    return {
      success: true,
      externalId: publishResponse.data.id,
      url: `https://instagram.com/p/${publishResponse.data.id}`
    }
  } catch (error) {
    console.error('Instagram post error:', error.response?.data || error.message)
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message
    }
  }
}

/**
 * Wait for media container to be ready
 */
async function waitForContainerReady(accessToken, containerId, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await axios.get(`${FACEBOOK_API}/${containerId}`, {
        params: {
          access_token: accessToken,
          fields: 'status_code'
        }
      })

      if (response.data.status_code === 'FINISHED') {
        return true
      }

      if (response.data.status_code === 'ERROR') {
        throw new Error('Media processing failed')
      }

      // Wait 2 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 2000))
    } catch (error) {
      throw error
    }
  }

  throw new Error('Media processing timeout')
}

/**
 * Get Instagram Business Account ID from Facebook Page
 */
export async function getIGBusinessAccount(accessToken, pageId) {
  try {
    const response = await axios.get(`${FACEBOOK_API}/${pageId}`, {
      params: {
        access_token: accessToken,
        fields: 'instagram_business_account'
      }
    })

    return {
      success: true,
      igUserId: response.data.instagram_business_account?.id
    }
  } catch (error) {
    console.error('Get IG business account error:', error.response?.data || error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Get user's media (for basic display API)
 */
export async function getUserMedia(accessToken, limit = 10) {
  try {
    const response = await axios.get(`${API_BASE}/me/media`, {
      params: {
        access_token: accessToken,
        fields: 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count',
        limit
      }
    })

    return {
      success: true,
      media: response.data.data || []
    }
  } catch (error) {
    console.error('Instagram get media error:', error.response?.data || error.message)
    return { success: false, media: [], error: error.message }
  }
}

/**
 * Get insights for Instagram Business account
 */
export async function getAccountInsights(accessToken, igUserId, metrics = ['impressions', 'reach', 'profile_views']) {
  try {
    const response = await axios.get(`${FACEBOOK_API}/${igUserId}/insights`, {
      params: {
        access_token: accessToken,
        metric: metrics.join(','),
        period: 'day'
      }
    })

    return {
      success: true,
      insights: response.data.data || []
    }
  } catch (error) {
    console.error('Instagram insights error:', error.response?.data || error.message)
    return { success: false, insights: [], error: error.message }
  }
}

/**
 * Get media insights
 */
export async function getMediaInsights(accessToken, mediaId) {
  try {
    const response = await axios.get(`${FACEBOOK_API}/${mediaId}/insights`, {
      params: {
        access_token: accessToken,
        metric: 'engagement,impressions,reach,saved'
      }
    })

    const metrics = {}
    for (const insight of (response.data.data || [])) {
      metrics[insight.name] = insight.values?.[0]?.value || 0
    }

    return {
      success: true,
      metrics
    }
  } catch (error) {
    console.error('Instagram media insights error:', error.response?.data || error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Fetch analytics for account
 */
export async function fetchAnalytics(account) {
  try {
    const accessToken = account.accessToken
    if (!accessToken) {
      console.error('No access token for Instagram account')
      return []
    }

    // Try to get media with engagement data
    const mediaResult = await getUserMedia(accessToken, 20)
    
    if (!mediaResult.success || !mediaResult.media.length) {
      return []
    }

    // Transform to analytics format
    return mediaResult.media.map(media => ({
      postId: media.id,
      externalId: media.id,
      metrics: {
        likes: media.like_count || 0,
        comments: media.comments_count || 0,
        shares: 0,
        impressions: 0,
        reach: 0
      },
      recordedAt: new Date(media.timestamp)
    }))
  } catch (error) {
    console.error('Instagram fetchAnalytics error:', error)
    return []
  }
}

/**
 * Get user profile
 */
export async function getUserProfile(accessToken) {
  try {
    const response = await axios.get(`${API_BASE}/me`, {
      params: {
        access_token: accessToken,
        fields: 'id,username,account_type,media_count'
      }
    })

    return {
      success: true,
      profile: response.data
    }
  } catch (error) {
    console.error('Instagram profile error:', error.response?.data || error.message)
    return { success: false, error: error.message }
  }
}

export default {
  postMedia,
  getIGBusinessAccount,
  getUserMedia,
  getAccountInsights,
  getMediaInsights,
  fetchAnalytics,
  getUserProfile
}
