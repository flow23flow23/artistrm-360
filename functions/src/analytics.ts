import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

/**
 * Aggregate analytics data daily
 */
export const aggregateAnalytics = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get all users
      const usersSnapshot = await db.collection('users').get();

      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;

        // Mock analytics data - in production, this would fetch from external APIs
        const analyticsData = {
          userId,
          date: yesterday,
          platform: 'aggregate',
          metrics: {
            plays: Math.floor(Math.random() * 10000) + 1000,
            views: Math.floor(Math.random() * 50000) + 5000,
            likes: Math.floor(Math.random() * 1000) + 100,
            shares: Math.floor(Math.random() * 500) + 50,
            comments: Math.floor(Math.random() * 200) + 20,
            followers: Math.floor(Math.random() * 100) + 10,
            revenue: Math.random() * 1000 + 100,
          },
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        await db.collection('analytics').add(analyticsData);
      }

      functions.logger.info('Analytics aggregation completed');
    } catch (error) {
      functions.logger.error('Error aggregating analytics:', error);
    }
  });

/**
 * Get analytics summary for a user
 */
export const getAnalyticsSummary = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated.'
    );
  }

  const { period = '7d', platform = 'all' } = data;
  const userId = data.userId || context.auth.uid;

  try {
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '24h':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    // Query analytics data
    let query = db
      .collection('analytics')
      .where('userId', '==', userId)
      .where('date', '>=', startDate)
      .where('date', '<=', endDate);

    if (platform !== 'all') {
      query = query.where('platform', '==', platform);
    }

    const analyticsSnapshot = await query.get();

    // Aggregate metrics
    const summary = {
      totalPlays: 0,
      totalViews: 0,
      totalLikes: 0,
      totalShares: 0,
      totalComments: 0,
      totalRevenue: 0,
      newFollowers: 0,
      dataPoints: [],
    };

    analyticsSnapshot.forEach((doc) => {
      const data = doc.data();
      const metrics = data.metrics || {};
      
      summary.totalPlays += metrics.plays || 0;
      summary.totalViews += metrics.views || 0;
      summary.totalLikes += metrics.likes || 0;
      summary.totalShares += metrics.shares || 0;
      summary.totalComments += metrics.comments || 0;
      summary.totalRevenue += metrics.revenue || 0;
      summary.newFollowers += metrics.followers || 0;
      
      summary.dataPoints.push({
        date: data.date.toDate(),
        ...metrics,
      });
    });

    // Sort data points by date
    summary.dataPoints.sort((a, b) => a.date.getTime() - b.date.getTime());

    return summary;
  } catch (error) {
    functions.logger.error('Error getting analytics summary:', error);
    throw new functions.https.HttpsError(
      'internal',
      'An error occurred while fetching analytics.'
    );
  }
});