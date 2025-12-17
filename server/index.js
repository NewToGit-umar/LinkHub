import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.js';
import linksRoutes from './routes/links.js';
import mockDB from './mockDB.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/links', linksRoutes);

app.get('/', (req, res) => res.send({ status: 'ok' }));

async function start() {
  try {
    const uri = process.env.MONGODB_URI;
    const useMock = !uri;
    app.set('useMock', useMock);
    if (useMock) {
      console.warn('MONGODB_URI not set — running with in-memory mock DB (development only)');
      mockDB.init();
    } else {
      await mongoose.connect(uri, { dbName: process.env.DB_NAME || 'linkhub' });
      console.log('Connected to MongoDB');
    }

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();
