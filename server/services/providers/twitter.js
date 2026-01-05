import axios from 'axios'

const API_BASE = 'https://api.twitter.com/2'

/**
 * Post a tweet
 */
export async function postTweet(accessToken, content, mediaIds = []) {
  try {
    const payload = { text: content }
    
    if (mediaIds && mediaIds.length > 0) {
      payload.media = { media_ids: mediaIds }
    }

    const response = await axios.post(`${API_BASE}/tweets`, payload, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    return {
      success: true,
      externalId: response.data.data.id,
      url: `https://twitter.com/i/web/status/${response.data.data.id}`
    }
  } catch (error) {
    console.error('Twitter post error:', error.response?.data || error.message)
    return {
      success: false,
      error: error.response?.data?.detail || error.message
    }
  }
}

/**
 * Upload media to Twitter
 */
export async function uploadMedia(accessToken, mediaBuffer, mediaType) {
  // Twitter media upload uses v1.1 API
  const UPLOAD_URL = 'https://upload.twitter.com/1.1/media/upload.json'
  
  try {
    const FormData = (await import('form-data')).default
    const formData = new FormData()
    formData.append('media', mediaBuffer)
    formData.append('media_category', mediaType.startsWith('video') ? 'tweet_video' : 'tweet_image')

    const response = await axios.post(UPLOAD_URL, formData, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        ...formData.getHeaders()
      }
    })

    return {
      success: true,
      mediaId: response.data.media_id_string
    }
  } catch (error) {
    console.error('Twitter media upload error:', error.response?.data || error.message)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Delete a tweet
 */
export async function deleteTweet(accessToken, tweetId) {
  try {
    await axios.delete(`${API_BASE}/tweets/${tweetId}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

/**
 * Fetch user's tweets with metrics
 */
export async function fetchUserTweets(accessToken, userId, maxResults = 10) {
  try {
    const response = await axios.get(`${API_BASE}/users/${userId}/tweets`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
      params: {
        max_results: maxResults,
        'tweet.fields': 'public_metrics,created_at',
        expansions: 'attachments.media_keys',
        'media.fields': 'preview_image_url,url'
      }
    })

    return {
      success: true,
      tweets: response.data.data || [],
      includes: response.data.includes
    }
  } catch (error) {
    console.error('Twitter fetch tweets error:', error.response?.data || error.message)
    return { success: false, error: error.message, tweets: [] }
  }
}

/**
 * Fetch analytics for user
 */
export async function fetchAnalytics(account) {
  try {
    // Get account with token
    const accessToken = account.accessToken
    if (!accessToken) {
      console.error('No access token for Twitter account')
      return []
    }

    // Fetch recent tweets with metrics
    const tweetsResult = await fetchUserTweets(accessToken, account.accountId, 20)
    
    if (!tweetsResult.success || !tweetsResult.tweets.length) {
      return []
    }

    // Transform to analytics format
    return tweetsResult.tweets.map(tweet => ({
      postId: tweet.id,
      externalId: tweet.id,
      metrics: {
        likes: tweet.public_metrics?.like_count || 0,
        shares: tweet.public_metrics?.retweet_count || 0,
        comments: tweet.public_metrics?.reply_count || 0,
        impressions: tweet.public_metrics?.impression_count || 0,
        reach: tweet.public_metrics?.impression_count || 0,
        quotes: tweet.public_metrics?.quote_count || 0
      },
      recordedAt: new Date(tweet.created_at)
    }))
  } catch (error) {
    console.error('Twitter fetchAnalytics error:', error)
    return []
  }
}

/**
 * Get user profile
 */
export async function getUserProfile(accessToken) {
  try {
    const response = await axios.get(`${API_BASE}/users/me`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
      params: {
        'user.fields': 'id,name,username,profile_image_url,description,public_metrics,verified'
      }
    })

    const user = response.data.data
    return {
      success: true,
      profile: {
        id: user.id,
        name: user.name,
        username: user.username,
        profilePicture: user.profile_image_url,
        bio: user.description,
        followers: user.public_metrics?.followers_count || 0,
        following: user.public_metrics?.following_count || 0,
        tweets: user.public_metrics?.tweet_count || 0,
        verified: user.verified
      }
    }
  } catch (error) {
    console.error('Twitter get profile error:', error.response?.data || error.message)
    return { success: false, error: error.message }
  }
}

export default {
  postTweet,
  uploadMedia,
  deleteTweet,
  fetchUserTweets,
  fetchAnalytics,
  getUserProfile
}
