import axios from 'axios'
import FormData from 'form-data'

const API_BASE = 'https://www.googleapis.com/youtube/v3'
const UPLOAD_API = 'https://www.googleapis.com/upload/youtube/v3'

/**
 * Get authenticated headers
 */
function getHeaders(accessToken) {
  return {
    'Authorization': `Bearer ${accessToken}`,
    'Accept': 'application/json'
  }
}

/**
 * Get user's YouTube channel
 */
export async function getChannel(accessToken) {
  try {
    const response = await axios.get(`${API_BASE}/channels`, {
      headers: getHeaders(accessToken),
      params: {
        part: 'snippet,contentDetails,statistics',
        mine: true
      }
    })

    if (!response.data.items || response.data.items.length === 0) {
      return { success: false, error: 'No channel found' }
    }

    return {
      success: true,
      channel: response.data.items[0]
    }
  } catch (error) {
    console.error('YouTube get channel error:', error.response?.data || error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Upload a video to YouTube
 */
export async function uploadVideo(accessToken, videoBuffer, metadata) {
  try {
    const { title, description, tags = [], privacyStatus = 'private', categoryId = '22' } = metadata

    // Create the video resource
    const videoMetadata = {
      snippet: {
        title,
        description,
        tags,
        categoryId
      },
      status: {
        privacyStatus, // 'public', 'private', or 'unlisted'
        selfDeclaredMadeForKids: false
      }
    }

    // Upload using resumable upload
    const initResponse = await axios.post(
      `${UPLOAD_API}/videos?uploadType=resumable&part=snippet,status`,
      videoMetadata,
      {
        headers: {
          ...getHeaders(accessToken),
          'Content-Type': 'application/json',
          'X-Upload-Content-Type': 'video/*'
        }
      }
    )

    const uploadUrl = initResponse.headers.location

    // Upload the video binary
    const uploadResponse = await axios.put(uploadUrl, videoBuffer, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'video/*'
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    })

    return {
      success: true,
      videoId: uploadResponse.data.id,
      url: `https://www.youtube.com/watch?v=${uploadResponse.data.id}`
    }
  } catch (error) {
    console.error('YouTube upload video error:', error.response?.data || error.message)
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message
    }
  }
}

/**
 * Update video metadata
 */
export async function updateVideo(accessToken, videoId, metadata) {
  try {
    const { title, description, tags, categoryId, privacyStatus } = metadata

    const updateBody = {
      id: videoId,
      snippet: {
        title,
        description,
        tags,
        categoryId
      }
    }

    if (privacyStatus) {
      updateBody.status = { privacyStatus }
    }

    const response = await axios.put(
      `${API_BASE}/videos?part=snippet,status`,
      updateBody,
      { headers: getHeaders(accessToken) }
    )

    return {
      success: true,
      video: response.data
    }
  } catch (error) {
    console.error('YouTube update video error:', error.response?.data || error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Delete a video
 */
export async function deleteVideo(accessToken, videoId) {
  try {
    await axios.delete(`${API_BASE}/videos`, {
      headers: getHeaders(accessToken),
      params: { id: videoId }
    })

    return { success: true }
  } catch (error) {
    console.error('YouTube delete video error:', error.response?.data || error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Get video analytics
 */
export async function getVideoAnalytics(accessToken, videoId) {
  try {
    const response = await axios.get(`${API_BASE}/videos`, {
      headers: getHeaders(accessToken),
      params: {
        part: 'statistics,snippet',
        id: videoId
      }
    })

    if (!response.data.items || response.data.items.length === 0) {
      return { success: false, error: 'Video not found' }
    }

    const video = response.data.items[0]

    return {
      success: true,
      analytics: {
        viewCount: parseInt(video.statistics.viewCount || 0),
        likeCount: parseInt(video.statistics.likeCount || 0),
        commentCount: parseInt(video.statistics.commentCount || 0),
        favoriteCount: parseInt(video.statistics.favoriteCount || 0)
      }
    }
  } catch (error) {
    console.error('YouTube video analytics error:', error.response?.data || error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Get channel analytics using YouTube Analytics API
 */
export async function getChannelAnalytics(accessToken, channelId, startDate, endDate) {
  try {
    const response = await axios.get('https://youtubeanalytics.googleapis.com/v2/reports', {
      headers: getHeaders(accessToken),
      params: {
        ids: `channel==${channelId}`,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        metrics: 'views,likes,comments,subscribersGained,subscribersLost,estimatedMinutesWatched',
        dimensions: 'day'
      }
    })

    return {
      success: true,
      analytics: response.data.rows || []
    }
  } catch (error) {
    console.error('YouTube channel analytics error:', error.response?.data || error.message)
    return { success: false, analytics: [], error: error.message }
  }
}

/**
 * Get user's uploaded videos
 */
export async function getUploadedVideos(accessToken, maxResults = 10) {
  try {
    // First get the channel's uploads playlist
    const channelResult = await getChannel(accessToken)
    if (!channelResult.success) {
      return { success: false, videos: [], error: channelResult.error }
    }

    const uploadsPlaylistId = channelResult.channel.contentDetails.relatedPlaylists.uploads

    // Get videos from the uploads playlist
    const response = await axios.get(`${API_BASE}/playlistItems`, {
      headers: getHeaders(accessToken),
      params: {
        part: 'snippet,contentDetails',
        playlistId: uploadsPlaylistId,
        maxResults
      }
    })

    // Get video IDs
    const videoIds = response.data.items.map(item => item.contentDetails.videoId).join(',')

    // Get detailed video info with statistics
    const videosResponse = await axios.get(`${API_BASE}/videos`, {
      headers: getHeaders(accessToken),
      params: {
        part: 'snippet,statistics',
        id: videoIds
      }
    })

    return {
      success: true,
      videos: videosResponse.data.items || []
    }
  } catch (error) {
    console.error('YouTube get videos error:', error.response?.data || error.message)
    return { success: false, videos: [], error: error.message }
  }
}

/**
 * Create a community post (YouTube shorts community feature)
 */
export async function createCommunityPost(accessToken, channelId, text, imageUrl = null) {
  // Note: YouTube Data API doesn't officially support community posts
  // This would require using undocumented APIs or YouTube Studio
  console.warn('Community posts are not supported via the official YouTube API')
  return {
    success: false,
    error: 'Community posts require YouTube Studio access'
  }
}

/**
 * Fetch analytics for account
 */
export async function fetchAnalytics(account) {
  try {
    const accessToken = account.accessToken
    if (!accessToken) {
      // Use console.log instead of console.error to prevent PowerShell stderr issues
      console.log('No access token available for YouTube analytics')
      return []
    }

    // Get uploaded videos with statistics
    const videosResult = await getUploadedVideos(accessToken, 20)
    if (!videosResult.success || !videosResult.videos.length) {
      return []
    }

    // Transform to analytics format
    return videosResult.videos.map(video => ({
      postId: video.id,
      externalId: video.id,
      metrics: {
        views: parseInt(video.statistics.viewCount || 0),
        likes: parseInt(video.statistics.likeCount || 0),
        comments: parseInt(video.statistics.commentCount || 0),
        shares: 0,
        impressions: 0,
        reach: 0
      },
      recordedAt: new Date(video.snippet.publishedAt)
    }))
  } catch (error) {
    console.error('YouTube fetchAnalytics error:', error)
    return []
  }
}

/**
 * Get user profile
 */
export async function getUserProfile(accessToken) {
  try {
    const channelResult = await getChannel(accessToken)
    if (!channelResult.success) {
      return { success: false, error: channelResult.error }
    }

    return {
      success: true,
      profile: {
        id: channelResult.channel.id,
        title: channelResult.channel.snippet.title,
        description: channelResult.channel.snippet.description,
        thumbnail: channelResult.channel.snippet.thumbnails?.default?.url,
        subscriberCount: channelResult.channel.statistics.subscriberCount,
        videoCount: channelResult.channel.statistics.videoCount,
        viewCount: channelResult.channel.statistics.viewCount
      }
    }
  } catch (error) {
    console.error('YouTube profile error:', error.response?.data || error.message)
    return { success: false, error: error.message }
  }
}

export default {
  getChannel,
  uploadVideo,
  updateVideo,
  deleteVideo,
  getVideoAnalytics,
  getChannelAnalytics,
  getUploadedVideos,
  createCommunityPost,
  fetchAnalytics,
  getUserProfile
}
