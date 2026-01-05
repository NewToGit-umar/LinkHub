import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { requestLogger, errorLogger, logger } from './utils/logger.js';
import { initializeSocketIO } from './services/socketService.js';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO for real-time notifications
const io = initializeSocketIO(httpServer);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
// Allow the dev client origin dynamically so Vite dev server ports are accepted
// Using `origin: true` reflects the request Origin header back, which works
// well for development. In production set `CLIENT_URL` in .env to a specific origin.
app.use(cors({
  origin: true,
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (Task 47)
app.use(requestLogger);

// Add after body parsing middleware
app.use('/api/auth', (await import('./routes/auth.js')).default);
// Mount dashboard route
app.use('/api/dashboard', (await import('./routes/dashboard.js')).default);
// Mount social routes (Task 14)
app.use('/api/social', (await import('./routes/social.js')).default);
// Mount posts routes (Task 20)
app.use('/api/posts', (await import('./routes/posts.js')).default);
// Mount analytics routes (Task 27)
app.use('/api/analytics', (await import('./routes/analytics.js')).default);

// Mount bio/link routes (Task 32)
app.use('/api/bio', (await import('./routes/bio.js')).default);

// Mount templates routes (Task 34)
app.use('/api/templates', (await import('./routes/templates.js')).default);

// Mount engagement routes (Task 35)
app.use('/api/engagement', (await import('./routes/engagement.js')).default);

// Mount teams routes (Task 37)
app.use('/api/teams', (await import('./routes/teams.js')).default);

// Mount invitations routes (Task 38)
app.use('/api/invitations', (await import('./routes/invitations.js')).default);

// Mount comments routes (Task 40)
app.use('/api/comments', (await import('./routes/comments.js')).default);

// Mount notifications routes (Task 42)
app.use('/api/notifications', (await import('./routes/notifications.js')).default);

// Mount milestones routes (Task 45)
app.use('/api/milestones', (await import('./routes/milestones.js')).default);

// Mount admin routes (Task 46)
app.use('/api/admin', (await import('./routes/admin.js')).default);

// Mount privacy/GDPR routes (Task 49)
app.use('/api/privacy', (await import('./routes/privacy.js')).default);

// Mount profile routes
app.use('/api/profile', (await import('./routes/profile.js')).default);

// Mount landing page routes (for admin-editable sample profile)
app.use('/api/landing', (await import('./routes/landing.js')).default);

// Mount public profile routes (shareable profiles)
app.use('/api/u', (await import('./routes/publicProfile.js')).default);

// Mount media upload routes (for video uploads)
app.use('/api/media', (await import('./routes/media.js')).default);

// Serve static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/linkhub')
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Start token refresher service (refreshes expiring social tokens)
import { startTokenRefresher } from './services/tokenRefresher.js'
startTokenRefresher()

// Start post scheduler service
import { startScheduler } from './services/scheduler.js'
startScheduler()
// Start publisher service to publish queued posts
import { startPublisher } from './services/publisher.js'
startPublisher()
// Start analytics scheduler
import { startAnalyticsScheduler } from './services/analyticsScheduler.js'
startAnalyticsScheduler()

// Start milestone checker (Task 45)
import { startMilestoneChecker } from './services/milestoneService.js'
startMilestoneChecker()

// Seed system templates
import { seedTemplates } from './controllers/templateController.js'
seedTemplates()

// Basic route for testing
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'LinkHub API is running!',
    timestamp: new Date().toISOString()
  });
});

// Error logging middleware (Task 47)
app.use(errorLogger);

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.message 
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Health check: http://localhost:${PORT}/api/health`);
  logger.info(`WebSocket server ready for real-time notifications`);
});