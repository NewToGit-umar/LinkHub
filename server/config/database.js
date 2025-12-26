/**
 * MongoDB Configuration
 * Handles connection to MongoDB using Mongoose
 */

const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * Connect to MongoDB
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/linkhub';
    
    logger.info('Attempting to connect to MongoDB...');
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000
    });

    logger.success(`✅ MongoDB connected successfully to: ${mongoURI}`);
    
    // Log connection details
    const connectionState = mongoose.connection.readyState;
    const dbName = mongoose.connection.name;
    const host = mongoose.connection.host;
    
    logger.info(`Database: ${dbName} | Host: ${host} | State: ${connectionState}`);

  } catch (error) {
    logger.error('❌ MongoDB connection failed:', error.message);
    
    if (error.name === 'MongoServerError') {
      logger.error('Server Error: Check if MongoDB service is running');
    } else if (error.code === 'ECONNREFUSED') {
      logger.error('Connection Refused: Unable to reach MongoDB server');
    }
    
    process.exit(1);
  }
};

/**
 * Disconnect from MongoDB
 * @returns {Promise<void>}
 */
const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected');
  } catch (error) {
    logger.error('Error disconnecting from MongoDB:', error.message);
  }
};

/**
 * Handle connection events
 */
mongoose.connection.on('connected', () => {
  logger.success('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  logger.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('Mongoose disconnected from MongoDB');
});

mongoose.connection.on('reconnected', () => {
  logger.success('Mongoose reconnected to MongoDB');
});

process.on('SIGINT', async () => {
  await disconnectDB();
});

module.exports = {
  connectDB,
  disconnectDB,
  mongoose
};
