import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

/**
 * Update user role (admin only)
 */
export const updateUserRole = functions.https.onCall(async (data, context) => {
  // Check if the request is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to update roles.'
    );
  }

  // Check if the requesting user is an admin
  const requestingUser = await db.collection('users').doc(context.auth.uid).get();
  if (!requestingUser.exists || requestingUser.data()?.role !== 'admin') {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only admins can update user roles.'
    );
  }

  const { userId, newRole } = data;

  // Validate input
  if (!userId || !newRole) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'userId and newRole are required.'
    );
  }

  if (!['artist', 'manager', 'admin'].includes(newRole)) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Invalid role. Must be artist, manager, or admin.'
    );
  }

  try {
    // Update user role in Firestore
    await db.collection('users').doc(userId).update({
      role: newRole,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Set custom claims for the user
    await admin.auth().setCustomUserClaims(userId, { role: newRole });

    return { success: true, message: 'User role updated successfully.' };
  } catch (error) {
    functions.logger.error('Error updating user role:', error);
    throw new functions.https.HttpsError(
      'internal',
      'An error occurred while updating the user role.'
    );
  }
});

/**
 * Get user statistics
 */
export const getUserStats = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated.'
    );
  }

  const userId = data.userId || context.auth.uid;

  try {
    // Get counts for various collections
    const [projects, content, events, transactions] = await Promise.all([
      db.collection('projects').where('userId', '==', userId).count().get(),
      db.collection('content').where('userId', '==', userId).count().get(),
      db.collection('events').where('userId', '==', userId).count().get(),
      db.collection('finances').where('userId', '==', userId).count().get(),
    ]);

    // Calculate total revenue (mock for now)
    const revenueSnapshot = await db
      .collection('finances')
      .where('userId', '==', userId)
      .where('type', '==', 'income')
      .get();

    let totalRevenue = 0;
    revenueSnapshot.forEach((doc) => {
      totalRevenue += doc.data().amount || 0;
    });

    return {
      projectsCount: projects.data().count,
      contentCount: content.data().count,
      eventsCount: events.data().count,
      transactionsCount: transactions.data().count,
      totalRevenue,
    };
  } catch (error) {
    functions.logger.error('Error getting user stats:', error);
    throw new functions.https.HttpsError(
      'internal',
      'An error occurred while fetching user statistics.'
    );
  }
});