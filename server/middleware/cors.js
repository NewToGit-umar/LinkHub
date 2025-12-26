/**
 * CORS Configuration
 * Handles Cross-Origin Resource Sharing
 */

const cors = require('cors');

const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 3600 // 1 hour
};

const corsMiddleware = cors(corsOptions);

module.exports = corsMiddleware;
