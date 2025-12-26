/**
 * Configuration Constants
 * Application-wide configuration settings
 */

module.exports = {
  // Database
  DB_NAME: 'linkhub',
  DB_TIMEOUT: 5000,
  DB_MAX_POOL_SIZE: 10,
  
  // JWT
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
  JWT_REFRESH_EXPIRE: process.env.JWT_REFRESH_EXPIRE || '30d',
  
  // Pagination
  DEFAULT_PAGE_SIZE: parseInt(process.env.DEFAULT_PAGE_SIZE || '20'),
  MAX_PAGE_SIZE: parseInt(process.env.MAX_PAGE_SIZE || '100'),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  
  // File Upload
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
  ALLOWED_FILE_TYPES: (process.env.ALLOWED_FILE_TYPES || 'jpg,jpeg,png,gif,pdf').split(','),
  
  // Email
  EMAIL_TIMEOUT: 10000,
  EMAIL_VERIFICATION_EXPIRE: '24h',
  PASSWORD_RESET_EXPIRE: '1h',
  
  // Feature Flags
  FEATURES: {
    ENABLE_2FA: process.env.ENABLE_2FA === 'true',
    ENABLE_EMAIL_VERIFICATION: process.env.ENABLE_EMAIL_VERIFICATION === 'true',
    ENABLE_ANALYTICS: process.env.ENABLE_ANALYTICS === 'true'
  },
  
  // Status Codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503
  }
};
