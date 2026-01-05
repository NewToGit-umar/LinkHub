import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/linkhub').then(async () => {
  // Reset the sync status for YouTube account
  const result = await mongoose.connection.db.collection('socialaccounts').updateOne(
    { platform: 'youtube' },
    { $set: { syncStatus: 'idle', syncError: null } }
  );
  console.log('Updated YouTube sync status:', result.modifiedCount);
  process.exit(0);
});
