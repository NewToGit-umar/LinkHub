const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const path = require('path');

// Import database configuration
const { connectDB } = require('./config/database');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ==================== MIDDLEWARE ====================

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// CORS Configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
}));

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Static Files
app.use(express.static(path.join(__dirname, 'public')));

// ==================== ROUTES ====================

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes (to be implemented)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', (req, res, next) => {
  res.status(501).json({ message: 'User routes not yet implemented' });
});
app.use('/api/social-accounts', (req, res, next) => {
  res.status(501).json({ message: 'Social account routes not yet implemented' });
});
app.use('/api/posts', (req, res, next) => {
  res.status(501).json({ message: 'Post routes not yet implemented' });
});
app.use('/api/analytics', (req, res, next) => {
  res.status(501).json({ message: 'Analytics routes not yet implemented' });
});
app.use('/api/teams', (req, res, next) => {
  res.status(501).json({ message: 'Team routes not yet implemented' });
});
app.use('/api/notifications', (req, res, next) => {
  res.status(501).json({ message: 'Notification routes not yet implemented' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to LinkHub API',
    version: '1.0.0',
    status: 'running'
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
    path: req.originalUrl
  });
});

// ==================== ERROR HANDLING ====================

/**
 * Centralized Error Handler Middleware
 * Handles all errors thrown in the application
 * Must be the last middleware
 */
app.use((error, req, res, next) => {
  const statusCode = error.statusCode || error.status || 500;
  const message = error.message || 'Internal Server Error';
  const details = process.env.NODE_ENV === 'development' ? error.stack : undefined;

  console.error(`[ERROR] ${statusCode} - ${message}`);
  if (details) console.error(details);

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' && { details })
  });
});

// ==================== SERVER STARTUP ====================

const server = app.listen(PORT, async () => {
  // Connect to MongoDB
  await connectDB();
  
  console.log(`
    ╔════════════════════════════════╗
    ║     LinkHub Server Started     ║
    ╚════════════════════════════════╝
    
    🚀 Server running on: http://localhost:${PORT}
    📝 Environment: ${process.env.NODE_ENV || 'development'}
    🗄️  Database: ${process.env.MONGODB_URI || 'Not configured'}
    
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});

// ==================== GRACEFUL SHUTDOWN ====================

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = app;