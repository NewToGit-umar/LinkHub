import mongoose from 'mongoose';
import dotenv from 'dotenv';
import SocialAccount from './models/SocialAccount.js';
import Analytics from './models/Analytics.js';
import youtubeProvider from './services/providers/youtube.js';

dotenv.config();

async function fetchYouTubeAnalytics() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/linkhub');
  console.log('Connected to MongoDB');

  // Find YouTube account - explicitly select accessToken field
  const account = await SocialAccount.findOne({ platform: 'youtube', isActive: true })
    .select('+accessToken +refreshToken');
  if (!account) {
    console.log('No active YouTube account found');
    process.exit(1);
  }

  console.log('Found YouTube account:', account.accountHandle);
  console.log('Access token exists:', !!account.accessToken);

  // Fetch analytics
  console.log('Fetching analytics from YouTube...');
  const analyticsData = await youtubeProvider.fetchAnalytics(account);
  console.log('Analytics data received:', analyticsData.length, 'records');

  if (analyticsData.length > 0) {
    console.log('Sample:', JSON.stringify(analyticsData[0], null, 2));

    // Calculate totals for user analytics
    const totals = analyticsData.reduce((acc, data) => {
      acc.views += data.metrics.views;
      acc.likes += data.metrics.likes;
      acc.comments += data.metrics.comments;
      return acc;
    }, { views: 0, likes: 0, comments: 0 });

    console.log('Totals:', totals);

    // Update or create UserAnalytics record
    await mongoose.connection.db.collection('useranalytics').updateOne(
      { userId: account.userId, platform: 'youtube' },
      { 
        $set: {
          userId: account.userId,
          platform: 'youtube',
          totalLikes: totals.likes,
          totalComments: totals.comments,
          totalViews: totals.views,
          totalShares: 0,
          totalPosts: analyticsData.length,
          lastFetchedAt: new Date(),
          updatedAt: new Date()
        },
        $setOnInsert: {
          createdAt: new Date()
        }
      },
      { upsert: true }
    );
    console.log('Analytics saved to useranalytics collection!');
  }

  process.exit(0);
}

fetchYouTubeAnalytics().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
