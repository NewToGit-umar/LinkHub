import axios from 'axios'
import FormData from 'form-data'

const API_BASE = 'https://open.tiktokapis.com/v2'

/**
 * Get authenticated headers
 */
function getHeaders(accessToken) {
  return {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
}

/**
 * Get user profile info
 */
export async function getUserInfo(accessToken) {
  try {
    const response = await axios.get(`${API_BASE}/user/info/`, {
      headers: getHeaders(accessToken),
      params: {
        fields: 'open_id,union_id,avatar_url,avatar_url_100,avatar_large_url,display_name,bio_description,profile_deep_link,is_verified,follower_count,following_count,likes_count,video_count'
      }
    })

    return {
      success: true,
      user: response.data.data.user
    }
  } catch (error) {
    console.error('TikTok get user error:', error.response?.data || error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Get user's videos
 */
export async function getUserVideos(accessToken, maxCount = 20, cursor = null) {
  try {
    const params = {
      fields: 'id,create_time,cover_image_url,share_url,video_description,duration,title,like_count,comment_count,share_count,view_count'
    }

    if (cursor) {
      params.cursor = cursor
    }

    const response = await axios.post(
      `${API_BASE}/video/list/`,
      { max_count: maxCount },
      {
        headers: getHeaders(accessToken),
        params
      }
    )

    return {
      success: true,
      videos: response.data.data.videos || [],
      cursor: response.data.data.cursor,
      hasMore: response.data.data.has_more
    }
  } catch (error) {
    console.error('TikTok get videos error:', error.response?.data || error.message)
    return { success: false, videos: [], error: error.message }
  }
}

/**
 * Initialize video upload (Direct Post API)
 * Requires partner-level access
 */
export async function initializeVideoUpload(accessToken, videoInfo) {
  try {
    const response = await axios.post(
      `${API_BASE}/post/publish/video/init/`,
      {
        post_info: {
          title: videoInfo.title,
          privacy_level: videoInfo.privacyLevel || 'SELF_ONLY', // SELF_ONLY, MUTUAL_FOLLOW_FRIENDS, FOLLOWER_OF_CREATOR, PUBLIC_TO_EVERYONE
          disable_duet: videoInfo.disableDuet || false,
          disable_comment: videoInfo.disableComment || false,
          disable_stitch: videoInfo.disableStitch || false
        },
        source_info: {
          source: 'FILE_UPLOAD',
          video_size: videoInfo.fileSize,
          chunk_size: videoInfo.chunkSize || videoInfo.fileSize,
          total_chunk_count: 1
        }
      },
      { headers: getHeaders(accessToken) }
    )

    return {
      success: true,
      publishId: response.data.data.publish_id,
      uploadUrl: response.data.data.upload_url
    }
  } catch (error) {
    console.error('TikTok init upload error:', error.response?.data || error.message)
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message
    }
  }
}

/**
 * Upload video chunk
 */
export async function uploadVideoChunk(uploadUrl, videoBuffer, chunkIndex = 0) {
  try {
    const response = await axios.put(uploadUrl, videoBuffer, {
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Range': `bytes 0-${videoBuffer.length - 1}/${videoBuffer.length}`
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    })

    return { success: true }
  } catch (error) {
    console.error('TikTok upload chunk error:', error.response?.data || error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Check publish status
 */
export async function getPublishStatus(accessToken, publishId) {
  try {
    const response = await axios.post(
      `${API_BASE}/post/publish/status/fetch/`,
      { publish_id: publishId },
      { headers: getHeaders(accessToken) }
    )

    return {
      success: true,
      status: response.data.data.status,
      publiclyAvailablePostId: response.data.data.publicly_available_post_id
    }
  } catch (error) {
    console.error('TikTok publish status error:', error.response?.data || error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Full video upload and publish flow
 */
export async function uploadVideo(accessToken, videoBuffer, metadata) {
  try {
    // Step 1: Initialize upload
    const initResult = await initializeVideoUpload(accessToken, {
      title: metadata.title || '',
      fileSize: videoBuffer.length,
      privacyLevel: metadata.privacyLevel || 'SELF_ONLY',
      disableDuet: metadata.disableDuet,
      disableComment: metadata.disableComment,
      disableStitch: metadata.disableStitch
    })

    if (!initResult.success) {
      return initResult
    }

    // Step 2: Upload the video
    const uploadResult = await uploadVideoChunk(initResult.uploadUrl, videoBuffer)
    if (!uploadResult.success) {
      return uploadResult
    }

    // Step 3: Poll for publish status
    let attempts = 0
    const maxAttempts = 30
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const statusResult = await getPublishStatus(accessToken, initResult.publishId)
      
      if (statusResult.status === 'PUBLISH_COMPLETE') {
        return {
          success: true,
          videoId: statusResult.publiclyAvailablePostId,
          url: `https://www.tiktok.com/@me/video/${statusResult.publiclyAvailablePostId}`
        }
      }
      
      if (statusResult.status === 'FAILED') {
        return {
          success: false,
          error: 'Video publish failed'
        }
      }
      
      attempts++
    }

    return {
      success: false,
      error: 'Video publish timeout'
    }
  } catch (error) {
    console.error('TikTok upload video error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Share a video from URL (Content Posting API)
 * Uses share intent flow
 */
export async function createShareIntent(accessToken, videoUrl, caption) {
  try {
    // This creates a share URL that opens TikTok app
    // The actual video must be hosted publicly
    const response = await axios.post(
      `${API_BASE}/share/video/upload/`,
      {
        source_info: {
          source: 'PULL_FROM_URL',
          video_url: videoUrl
        },
        post_info: {
          title: caption,
          privacy_level: 'SELF_ONLY'
        }
      },
      { headers: getHeaders(accessToken) }
    )

    return {
      success: true,
      publishId: response.data.data.publish_id
    }
  } catch (error) {
    console.error('TikTok share intent error:', error.response?.data || error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Get video insights
 */
export async function getVideoInsights(accessToken, videoIds) {
  try {
    const response = await axios.post(
      `${API_BASE}/video/query/`,
      {
        filters: {
          video_ids: Array.isArray(videoIds) ? videoIds : [videoIds]
        }
      },
      {
        headers: getHeaders(accessToken),
        params: {
          fields: 'id,like_count,comment_count,share_count,view_count'
        }
      }
    )

    return {
      success: true,
      videos: response.data.data.videos || []
    }
  } catch (error) {
    console.error('TikTok video insights error:', error.response?.data || error.message)
    return { success: false, videos: [], error: error.message }
  }
}

/**
 * Fetch analytics for account
 */
export async function fetchAnalytics(account) {
  try {
    const accessToken = account.accessToken
    if (!accessToken) {
      console.error('No access token for TikTok account')
      return []
    }

    // Get user's videos with metrics
    const videosResult = await getUserVideos(accessToken, 20)
    if (!videosResult.success || !videosResult.videos.length) {
      return []
    }

    // Transform to analytics format
    return videosResult.videos.map(video => ({
      postId: video.id,
      externalId: video.id,
      metrics: {
        views: video.view_count || 0,
        likes: video.like_count || 0,
        comments: video.comment_count || 0,
        shares: video.share_count || 0,
        impressions: 0,
        reach: 0
      },
      recordedAt: new Date(video.create_time * 1000)
    }))
  } catch (error) {
    console.error('TikTok fetchAnalytics error:', error)
    return []
  }
}

/**
 * Get user profile for OAuth
 */
export async function getUserProfile(accessToken) {
  try {
    const result = await getUserInfo(accessToken)
    if (!result.success) {
      return result
    }

    return {
      success: true,
      profile: {
        id: result.user.open_id,
        displayName: result.user.display_name,
        avatar: result.user.avatar_url,
        bio: result.user.bio_description,
        followerCount: result.user.follower_count,
        followingCount: result.user.following_count,
        likesCount: result.user.likes_count,
        videoCount: result.user.video_count,
        isVerified: result.user.is_verified
      }
    }
  } catch (error) {
    console.error('TikTok profile error:', error)
    return { success: false, error: error.message }
  }
}

export default {
  getUserInfo,
  getUserVideos,
  initializeVideoUpload,
  uploadVideoChunk,
  getPublishStatus,
  uploadVideo,
  createShareIntent,
  getVideoInsights,
  fetchAnalytics,
  getUserProfile
}
