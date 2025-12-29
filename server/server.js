import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();

// Security middleware
app.use(helmet());
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

// Add after body parsing middleware
app.use('/api/auth', (await import('./routes/auth.js')).default);
// Mount dashboard route
app.use('/api/dashboard', (await import('./routes/dashboard.js')).default);
// Mount social routes (Task 14)
app.use('/api/social', (await import('./routes/social.js')).default);
// Mount posts routes (Task 20)
app.use('/api/posts', (await import('./routes/posts.js')).default);

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/linkhub')
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Start token refresher service (refreshes expiring social tokens)
import { startTokenRefresher } from './services/tokenRefresher.js'
startTokenRefresher()

// Basic route for testing
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'LinkHub API is running!',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.message 
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});