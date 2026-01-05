import axios from 'axios'

const API_BASE = 'https://api.linkedin.com/v2'
const API_REST = 'https://api.linkedin.com/rest'

/**
 * Get authenticated headers
 */
function getHeaders(accessToken, restApi = false) {
  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    'X-Restli-Protocol-Version': '2.0.0'
  }
  
  if (restApi) {
    headers['LinkedIn-Version'] = '202401'
  }
  
  return headers
}

/**
 * Get user's LinkedIn profile
 */
export async function getUserProfile(accessToken) {
  try {
    const response = await axios.get(`${API_BASE}/userinfo`, {
      headers: getHeaders(accessToken)
    })

    return {
      success: true,
      profile: response.data
    }
  } catch (error) {
    console.error('LinkedIn profile error:', error.response?.data || error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Get user's URN (Uniform Resource Name)
 */
export async function getUserUrn(accessToken) {
  try {
    const response = await axios.get(`${API_BASE}/userinfo`, {
      headers: getHeaders(accessToken)
    })

    return {
      success: true,
      urn: `urn:li:person:${response.data.sub}`
    }
  } catch (error) {
    console.error('LinkedIn get URN error:', error.response?.data || error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Create a text post on LinkedIn
 */
export async function createPost(accessToken, authorUrn, text, visibility = 'PUBLIC') {
  try {
    const postBody = {
      author: authorUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text
          },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': visibility
      }
    }

    const response = await axios.post(`${API_BASE}/ugcPosts`, postBody, {
      headers: getHeaders(accessToken)
    })

    // Extract post ID from the response headers or data
    const postId = response.headers['x-restli-id'] || response.data.id

    return {
      success: true,
      externalId: postId,
      url: `https://www.linkedin.com/feed/update/${postId}`
    }
  } catch (error) {
    console.error('LinkedIn create post error:', error.response?.data || error.message)
    return {
      success: false,
      error: error.response?.data?.message || error.message
    }
  }
}

/**
 * Upload an image to LinkedIn
 */
export async function uploadImage(accessToken, authorUrn, imageBuffer) {
  try {
    // Step 1: Register the image upload
    const registerBody = {
      registerUploadRequest: {
        recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
        owner: authorUrn,
        serviceRelationships: [
          {
            relationshipType: 'OWNER',
            identifier: 'urn:li:userGeneratedContent'
          }
        ]
      }
    }

    const registerResponse = await axios.post(
      `${API_BASE}/assets?action=registerUpload`,
      registerBody,
      { headers: getHeaders(accessToken) }
    )

    const uploadUrl = registerResponse.data.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl
    const asset = registerResponse.data.value.asset

    // Step 2: Upload the image binary
    await axios.put(uploadUrl, imageBuffer, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'image/jpeg'
      }
    })

    return {
      success: true,
      asset
    }
  } catch (error) {
    console.error('LinkedIn upload image error:', error.response?.data || error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Create a post with image
 */
export async function createPostWithMedia(accessToken, authorUrn, text, mediaAsset, visibility = 'PUBLIC') {
  try {
    const postBody = {
      author: authorUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text
          },
          shareMediaCategory: 'IMAGE',
          media: [
            {
              status: 'READY',
              media: mediaAsset
            }
          ]
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': visibility
      }
    }

    const response = await axios.post(`${API_BASE}/ugcPosts`, postBody, {
      headers: getHeaders(accessToken)
    })

    const postId = response.headers['x-restli-id'] || response.data.id

    return {
      success: true,
      externalId: postId,
      url: `https://www.linkedin.com/feed/update/${postId}`
    }
  } catch (error) {
    console.error('LinkedIn create media post error:', error.response?.data || error.message)
    return {
      success: false,
      error: error.response?.data?.message || error.message
    }
  }
}

/**
 * Delete a post
 */
export async function deletePost(accessToken, postUrn) {
  try {
    await axios.delete(`${API_BASE}/ugcPosts/${encodeURIComponent(postUrn)}`, {
      headers: getHeaders(accessToken)
    })

    return { success: true }
  } catch (error) {
    console.error('LinkedIn delete post error:', error.response?.data || error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Get post analytics (Social Actions)
 */
export async function getPostAnalytics(accessToken, postUrn) {
  try {
    const encodedUrn = encodeURIComponent(postUrn)
    
    // Get social actions (likes, comments, shares)
    const response = await axios.get(`${API_BASE}/socialActions/${encodedUrn}`, {
      headers: getHeaders(accessToken)
    })

    return {
      success: true,
      analytics: {
        likes: response.data.likesSummary?.totalLikes || 0,
        comments: response.data.commentsSummary?.totalFirstLevelComments || 0,
        shares: response.data.sharesSummary?.totalShares || 0
      }
    }
  } catch (error) {
    console.error('LinkedIn post analytics error:', error.response?.data || error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Get organization (company page) posts analytics
 */
export async function getOrganizationAnalytics(accessToken, organizationId, startDate, endDate) {
  try {
    const response = await axios.get(`${API_BASE}/organizationalEntityShareStatistics`, {
      headers: getHeaders(accessToken),
      params: {
        q: 'organizationalEntity',
        organizationalEntity: `urn:li:organization:${organizationId}`,
        'timeIntervals.timeGranularityType': 'DAY',
        'timeIntervals.timeRange.start': startDate.getTime(),
        'timeIntervals.timeRange.end': endDate.getTime()
      }
    })

    return {
      success: true,
      analytics: response.data.elements || []
    }
  } catch (error) {
    console.error('LinkedIn org analytics error:', error.response?.data || error.message)
    return { success: false, analytics: [], error: error.message }
  }
}

/**
 * Get user's posts
 */
export async function getUserPosts(accessToken, authorUrn, count = 10) {
  try {
    const response = await axios.get(`${API_BASE}/ugcPosts`, {
      headers: getHeaders(accessToken),
      params: {
        q: 'authors',
        authors: `List(${encodeURIComponent(authorUrn)})`,
        count
      }
    })

    return {
      success: true,
      posts: response.data.elements || []
    }
  } catch (error) {
    console.error('LinkedIn get posts error:', error.response?.data || error.message)
    return { success: false, posts: [], error: error.message }
  }
}

/**
 * Fetch analytics for account
 */
export async function fetchAnalytics(account) {
  try {
    const accessToken = account.accessToken
    if (!accessToken) {
      console.error('No access token for LinkedIn account')
      return []
    }

    // Get user URN
    const urnResult = await getUserUrn(accessToken)
    if (!urnResult.success) {
      return []
    }

    // Get user's posts
    const postsResult = await getUserPosts(accessToken, urnResult.urn, 20)
    if (!postsResult.success || !postsResult.posts.length) {
      return []
    }

    // Get analytics for each post
    const analyticsPromises = postsResult.posts.map(async (post) => {
      const postUrn = post.id || post.activity
      const analyticsResult = await getPostAnalytics(accessToken, postUrn)
      
      return {
        postId: postUrn,
        externalId: postUrn,
        metrics: {
          likes: analyticsResult.analytics?.likes || 0,
          comments: analyticsResult.analytics?.comments || 0,
          shares: analyticsResult.analytics?.shares || 0,
          impressions: 0,
          reach: 0
        },
        recordedAt: new Date(post.created?.time || Date.now())
      }
    })

    return await Promise.all(analyticsPromises)
  } catch (error) {
    console.error('LinkedIn fetchAnalytics error:', error)
    return []
  }
}

export default {
  getUserProfile,
  getUserUrn,
  createPost,
  uploadImage,
  createPostWithMedia,
  deletePost,
  getPostAnalytics,
  getOrganizationAnalytics,
  getUserPosts,
  fetchAnalytics
}
