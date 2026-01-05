import axios from 'axios'

const API_BASE = 'https://graph.facebook.com/v18.0'

/**
 * Post to Facebook Page
 */
export async function postToPage(pageAccessToken, pageId, content, mediaUrl = null) {
  try {
    let endpoint = `${API_BASE}/${pageId}/feed`
    const params = {
      access_token: pageAccessToken,
      message: content
    }

    if (mediaUrl) {
      if (mediaUrl.match(/\.(mp4|mov|avi)$/i)) {
        endpoint = `${API_BASE}/${pageId}/videos`
        params.file_url = mediaUrl
        params.description = content
        delete params.message
      } else {
        endpoint = `${API_BASE}/${pageId}/photos`
        params.url = mediaUrl
        params.caption = content
        delete params.message
      }
    }

    const response = await axios.post(endpoint, null, { params })

    return {
      success: true,
      externalId: response.data.id || response.data.post_id,
      url: `https://facebook.com/${response.data.id || response.data.post_id}`
    }
  } catch (error) {
    console.error('Facebook post error:', error.response?.data || error.message)
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message
    }
  }
}

/**
 * Post to personal feed
 */
export async function postToFeed(accessToken, content, link = null) {
  try {
    const params = {
      access_token: accessToken,
      message: content
    }

    if (link) {
      params.link = link
    }

    const response = await axios.post(`${API_BASE}/me/feed`, null, { params })

    return {
      success: true,
      externalId: response.data.id,
      url: `https://facebook.com/${response.data.id}`
    }
  } catch (error) {
    console.error('Facebook post error:', error.response?.data || error.message)
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message
    }
  }
}

/**
 * Get user's pages
 */
export async function getUserPages(accessToken) {
  try {
    const response = await axios.get(`${API_BASE}/me/accounts`, {
      params: {
        access_token: accessToken,
        fields: 'id,name,access_token,picture,fan_count,category'
      }
    })

    return {
      success: true,
      pages: response.data.data || []
    }
  } catch (error) {
    console.error('Facebook get pages error:', error.response?.data || error.message)
    return { success: false, pages: [], error: error.message }
  }
}

/**
 * Get page insights
 */
export async function getPageInsights(pageAccessToken, pageId, metrics = ['page_impressions', 'page_engaged_users', 'page_fan_adds']) {
  try {
    const response = await axios.get(`${API_BASE}/${pageId}/insights`, {
      params: {
        access_token: pageAccessToken,
        metric: metrics.join(','),
        period: 'day'
      }
    })

    return {
      success: true,
      insights: response.data.data || []
    }
  } catch (error) {
    console.error('Facebook insights error:', error.response?.data || error.message)
    return { success: false, insights: [], error: error.message }
  }
}

/**
 * Get post insights
 */
export async function getPostInsights(pageAccessToken, postId) {
  try {
    const response = await axios.get(`${API_BASE}/${postId}`, {
      params: {
        access_token: pageAccessToken,
        fields: 'id,message,created_time,shares,likes.summary(true),comments.summary(true),insights.metric(post_impressions,post_engaged_users,post_clicks)'
      }
    })

    const data = response.data
    return {
      success: true,
      metrics: {
        likes: data.likes?.summary?.total_count || 0,
        comments: data.comments?.summary?.total_count || 0,
        shares: data.shares?.count || 0,
        impressions: data.insights?.data?.find(i => i.name === 'post_impressions')?.values?.[0]?.value || 0,
        engagement: data.insights?.data?.find(i => i.name === 'post_engaged_users')?.values?.[0]?.value || 0,
        clicks: data.insights?.data?.find(i => i.name === 'post_clicks')?.values?.[0]?.value || 0
      }
    }
  } catch (error) {
    console.error('Facebook post insights error:', error.response?.data || error.message)
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
      console.error('No access token for Facebook account')
      return []
    }

    // Get user's pages
    const pagesResult = await getUserPages(accessToken)
    if (!pagesResult.success || !pagesResult.pages.length) {
      // Try to get personal feed posts
      return await fetchPersonalPosts(accessToken)
    }

    const analytics = []

    // Get insights for each page
    for (const page of pagesResult.pages) {
      const postsResponse = await axios.get(`${API_BASE}/${page.id}/posts`, {
        params: {
          access_token: page.access_token,
          fields: 'id,message,created_time,shares,likes.summary(true),comments.summary(true)',
          limit: 10
        }
      })

      for (const post of (postsResponse.data.data || [])) {
        analytics.push({
          postId: post.id,
          externalId: post.id,
          metrics: {
            likes: post.likes?.summary?.total_count || 0,
            comments: post.comments?.summary?.total_count || 0,
            shares: post.shares?.count || 0,
            impressions: 0,
            reach: 0
          },
          recordedAt: new Date(post.created_time)
        })
      }
    }

    return analytics
  } catch (error) {
    console.error('Facebook fetchAnalytics error:', error)
    return []
  }
}

/**
 * Fetch personal posts (limited by Graph API permissions)
 */
async function fetchPersonalPosts(accessToken) {
  try {
    const response = await axios.get(`${API_BASE}/me/posts`, {
      params: {
        access_token: accessToken,
        fields: 'id,message,created_time,shares,likes.summary(true),comments.summary(true)',
        limit: 10
      }
    })

    return (response.data.data || []).map(post => ({
      postId: post.id,
      externalId: post.id,
      metrics: {
        likes: post.likes?.summary?.total_count || 0,
        comments: post.comments?.summary?.total_count || 0,
        shares: post.shares?.count || 0,
        impressions: 0,
        reach: 0
      },
      recordedAt: new Date(post.created_time)
    }))
  } catch (error) {
    console.error('Facebook personal posts error:', error.response?.data || error.message)
    return []
  }
}

/**
 * Delete a post
 */
export async function deletePost(accessToken, postId) {
  try {
    await axios.delete(`${API_BASE}/${postId}`, {
      params: { access_token: accessToken }
    })
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export default {
  postToPage,
  postToFeed,
  getUserPages,
  getPageInsights,
  getPostInsights,
  fetchAnalytics,
  deletePost
}
