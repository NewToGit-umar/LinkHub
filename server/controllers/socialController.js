import SocialAccount from '../models/SocialAccount.js'

/**
 * Start OAuth flow (scaffold)
 * For real providers, this should redirect to provider's auth URL.
 */
export async function startOAuth(req, res) {
  const { provider } = req.params
  // Placeholder: in production generate provider-specific auth URL
  if (!process.env[`OAUTH_${provider?.toUpperCase()}_AUTH_URL`]) {
    return res.status(400).json({ message: `No OAuth configuration for provider: ${provider}` })
  }

  const authUrl = process.env[`OAUTH_${provider.toUpperCase()}_AUTH_URL`]
  // Redirect developer to provider auth if configured
  return res.redirect(authUrl)
}

/**
 * Callback handler
 * Accepts provider and either `code` (to exchange) or direct tokens in body (dev mode).
 */
export async function callback(req, res) {
  try {
    const { provider } = req.params
    const userId = req.user && req.user.id
    if (!userId) return res.status(401).json({ message: 'Unauthorized' })

    // Support developer/testing flow: tokens provided directly
    const {
      accessToken,
      refreshToken,
      tokenExpiresAt,
      accountId,
      accountHandle,
      accountName,
      profileData
    } = req.body

    if (!accessToken || !accountId || !accountHandle) {
      return res.status(400).json({ message: 'Missing required token/account data' })
    }

    const existing = await SocialAccount.findOne({ userId, platform: provider.toLowerCase() })
    if (existing) {
      existing.accessToken = accessToken
      existing.refreshToken = refreshToken || existing.refreshToken
      existing.tokenExpiresAt = tokenExpiresAt ? new Date(tokenExpiresAt) : existing.tokenExpiresAt
      existing.accountId = accountId
      existing.accountHandle = accountHandle
      existing.accountName = accountName || existing.accountName
      existing.profileData = profileData || existing.profileData
      existing.isActive = true
      existing.isRevoked = false
      await existing.save()
      return res.status(200).json({ message: 'Social account updated', account: existing.toPublicJSON() })
    }

    const account = await SocialAccount.create({
      userId,
      platform: provider.toLowerCase(),
      accountId,
      accountHandle,
      accountName,
      accessToken,
      refreshToken,
      tokenExpiresAt: tokenExpiresAt ? new Date(tokenExpiresAt) : undefined,
      profileData
    })

    return res.status(201).json({ message: 'Social account connected', account: account.toPublicJSON() })
  } catch (err) {
    console.error('social callback error', err)
    return res.status(500).json({ message: 'Social callback error', error: err.message })
  }
}

export async function listAccounts(req, res) {
  try {
    const userId = req.user && req.user.id
    if (!userId) return res.status(401).json({ message: 'Unauthorized' })

    const accounts = await SocialAccount.findValidByUserId(userId)
    const publicAccounts = accounts.map(a => a.toPublicJSON())
    return res.status(200).json({ accounts: publicAccounts })
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching accounts', error: err.message })
  }
}

export async function disconnect(req, res) {
  try {
    const userId = req.user && req.user.id
    const { provider } = req.params
    if (!userId) return res.status(401).json({ message: 'Unauthorized' })

    const account = await SocialAccount.findByUserAndPlatform(userId, provider)
    if (!account) return res.status(404).json({ message: 'Account not found' })

    await account.revoke()
    return res.status(200).json({ message: 'Account disconnected' })
  } catch (err) {
    return res.status(500).json({ message: 'Error disconnecting account', error: err.message })
  }
}
const SocialAccount = require('../models/SocialAccount');
const User = require('../models/User');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Get all connected social accounts for user
 * @route GET /api/v1/social/accounts
 * @access Protected
 */
exports.getSocialAccounts = asyncHandler(async (req, res) => {
  const { userId } = req.user._id;
  const { platform } = req.query;

  let query = { userId: req.user._id, isActive: true, isRevoked: false };
  if (platform) {
    query.platform = platform.toLowerCase();
  }

  const accounts = await SocialAccount.find(query).select('-accessToken -refreshToken');

  res.status(200).json({
    status: 'success',
    count: accounts.length,
    data: {
      accounts: accounts.map(acc => acc.toPublicJSON())
    }
  });
});

/**
 * Get single social account
 * @route GET /api/v1/social/accounts/:id
 * @access Protected
 */
exports.getSocialAccount = asyncHandler(async (req, res) => {
  const account = await SocialAccount.findOne({
    _id: req.params.id,
    userId: req.user._id
  }).select('-accessToken -refreshToken');

  if (!account) {
    throw new AppError('Social account not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: {
      account: account.toPublicJSON()
    }
  });
});

/**
 * Connect new social account
 * @route POST /api/v1/social/accounts
 * @access Protected
 */
exports.connectAccount = asyncHandler(async (req, res) => {
  const { platform, accessToken, refreshToken, accountId, accountHandle, accountName, profileData, permissions } = req.body;

  // Validate required fields
  if (!platform || !accessToken || !accountId || !accountHandle) {
    throw new AppError('Platform, accessToken, accountId, and accountHandle are required', 400);
  }

  // Validate platform
  const validPlatforms = ['twitter', 'instagram', 'facebook', 'linkedin', 'tiktok', 'youtube'];
  if (!validPlatforms.includes(platform.toLowerCase())) {
    throw new AppError('Invalid platform. Must be one of: ' + validPlatforms.join(', '), 400);
  }

  // Check if account already connected
  const existing = await SocialAccount.findOne({
    userId: req.user._id,
    platform: platform.toLowerCase(),
    accountId
  });

  if (existing) {
    throw new AppError('This account is already connected. Please disconnect it first.', 409);
  }

  // Create new social account
  const account = await SocialAccount.create({
    userId: req.user._id,
    platform: platform.toLowerCase(),
    accountId,
    accountHandle: accountHandle.toLowerCase(),
    accountName: accountName || accountHandle,
    accessToken,
    refreshToken: refreshToken || undefined,
    profileData: profileData || {},
    permissions: permissions || []
  });

  logger.success(`Social account connected: ${platform}/${accountHandle} for user ${req.user.email}`);

  res.status(201).json({
    status: 'success',
    message: 'Social account connected successfully',
    data: {
      account: account.toPublicJSON()
    }
  });
});

/**
 * Update social account profile data
 * @route PATCH /api/v1/social/accounts/:id
 * @access Protected
 */
exports.updateSocialAccount = asyncHandler(async (req, res) => {
  const { profileData } = req.body;

  const account = await SocialAccount.findOne({
    _id: req.params.id,
    userId: req.user._id
  });

  if (!account) {
    throw new AppError('Social account not found', 404);
  }

  // Update only profileData
  if (profileData) {
    account.profileData = {
      ...account.profileData,
      ...profileData
    };
    account.lastSyncAt = Date.now();
  }

  await account.save();

  logger.info(`Updated profile data for ${account.platform}/${account.accountHandle}`);

  res.status(200).json({
    status: 'success',
    message: 'Social account updated successfully',
    data: {
      account: account.toPublicJSON()
    }
  });
});

/**
 * Disconnect social account
 * @route DELETE /api/v1/social/accounts/:id
 * @access Protected
 */
exports.disconnectAccount = asyncHandler(async (req, res) => {
  const account = await SocialAccount.findOne({
    _id: req.params.id,
    userId: req.user._id
  });

  if (!account) {
    throw new AppError('Social account not found', 404);
  }

  // Soft delete by marking as revoked
  await account.revoke();

  logger.warn(`Social account disconnected: ${account.platform}/${account.accountHandle} for user ${req.user.email}`);

  res.status(200).json({
    status: 'success',
    message: 'Social account disconnected successfully'
  });
});

/**
 * Refresh social account token
 * @route POST /api/v1/social/accounts/:id/refresh-token
 * @access Protected
 */
exports.refreshAccountToken = asyncHandler(async (req, res) => {
  const { accessToken, refreshToken, expiresIn } = req.body;

  if (!accessToken) {
    throw new AppError('New access token is required', 400);
  }

  const account = await SocialAccount.findOne({
    _id: req.params.id,
    userId: req.user._id
  });

  if (!account) {
    throw new AppError('Social account not found', 404);
  }

  // Update tokens
  account.accessToken = accessToken;
  if (refreshToken) account.refreshToken = refreshToken;
  if (expiresIn) {
    account.tokenExpiresAt = new Date(Date.now() + expiresIn * 1000);
  }

  await account.save();

  logger.info(`Token refreshed for ${account.platform}/${account.accountHandle}`);

  res.status(200).json({
    status: 'success',
    message: 'Token refreshed successfully',
    data: {
      account: account.toPublicJSON()
    }
  });
});

/**
 * Get account statistics
 * @route GET /api/v1/social/accounts/:id/stats
 * @access Protected
 */
exports.getAccountStats = asyncHandler(async (req, res) => {
  const account = await SocialAccount.findOne({
    _id: req.params.id,
    userId: req.user._id
  });

  if (!account) {
    throw new AppError('Social account not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: {
      platform: account.platform,
      accountHandle: account.accountHandle,
      stats: {
        followers: account.profileData.followerCount || 0,
        following: account.profileData.followingCount || 0,
        posts: account.profileData.postsCount || 0
      },
      lastSyncAt: account.lastSyncAt,
      isValid: account.isValid()
    }
  });
});

/**
 * Get all accounts summary
 * @route GET /api/v1/social/summary
 * @access Protected
 */
exports.getSocialSummary = asyncHandler(async (req, res) => {
  const accounts = await SocialAccount.findValidByUserId(req.user._id);
  const totalFollowers = accounts.reduce((sum, acc) => sum + (acc.profileData.followerCount || 0), 0);
  const totalPosts = accounts.reduce((sum, acc) => sum + (acc.profileData.postsCount || 0), 0);

  // Group by platform
  const byPlatform = {};
  accounts.forEach(acc => {
    if (!byPlatform[acc.platform]) {
      byPlatform[acc.platform] = [];
    }
    byPlatform[acc.platform].push(acc.toPublicJSON());
  });

  res.status(200).json({
    status: 'success',
    data: {
      totalConnectedAccounts: accounts.length,
      totalFollowers,
      totalPosts,
      byPlatform
    }
  });
});

module.exports = exports;
