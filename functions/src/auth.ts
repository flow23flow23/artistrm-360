import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

/**
 * Trigger when a new user is created via Firebase Auth
 */
export const onUserCreated = functions.auth.user().onCreate(async (user) => {
  try {
    // Create user document in Firestore
    const userDoc = {
      id: user.uid,
      email: user.email || '',
      displayName: user.displayName || 'New User',
      photoURL: user.photoURL || null,
      role: 'artist', // Default role
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      profile: {
        bio: '',
        location: '',
        website: '',
        socialLinks: {},
        genres: [],
        skills: [],
        achievements: [],
      },
    };

    await db.collection('users').doc(user.uid).set(userDoc);

    // Create initial notifications
    await db.collection('notifications').add({
      userId: user.uid,
      type: 'info',
      title: 'Welcome to ArtistRM 360!',
      message: 'Your journey to music career success starts here. Explore the platform and set up your profile.',
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    functions.logger.info('User document created for:', user.uid);
  } catch (error) {
    functions.logger.error('Error creating user document:', error);
  }
});

/**
 * Trigger when a user is deleted
 */
export const onUserDeleted = functions.auth.user().onDelete(async (user) => {
  try {
    // Delete user document and related data
    const batch = db.batch();
    
    // Delete user document
    batch.delete(db.collection('users').doc(user.uid));
    
    // Delete user's projects
    const projectsSnapshot = await db
      .collection('projects')
      .where('userId', '==', user.uid)
      .get();
    
    projectsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    // Delete user's content
    const contentSnapshot = await db
      .collection('content')
      .where('userId', '==', user.uid)
      .get();
    
    contentSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    // Delete user's notifications
    const notificationsSnapshot = await db
      .collection('notifications')
      .where('userId', '==', user.uid)
      .get();
    
    notificationsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    
    functions.logger.info('User data deleted for:', user.uid);
  } catch (error) {
    functions.logger.error('Error deleting user data:', error);
  }
});