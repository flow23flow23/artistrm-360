import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

/**
 * Calculate project progress based on completed tasks
 */
export const updateProjectProgress = functions.firestore
  .document('projects/{projectId}/tasks/{taskId}')
  .onWrite(async (change, context) => {
    const projectId = context.params.projectId;

    try {
      // Get all tasks for the project
      const tasksSnapshot = await db
        .collection('projects')
        .doc(projectId)
        .collection('tasks')
        .get();

      let totalTasks = 0;
      let completedTasks = 0;

      tasksSnapshot.forEach((doc) => {
        totalTasks++;
        if (doc.data().status === 'done') {
          completedTasks++;
        }
      });

      // Calculate progress percentage
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      // Update project progress
      await db.collection('projects').doc(projectId).update({
        progress,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      functions.logger.info(`Updated project ${projectId} progress to ${progress}%`);
    } catch (error) {
      functions.logger.error('Error updating project progress:', error);
    }
  });

/**
 * Send notification when project deadline is approaching
 */
export const projectDeadlineReminder = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    try {
      const now = new Date();
      const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

      // Find projects with deadlines in the next 3 days
      const projectsSnapshot = await db
        .collection('projects')
        .where('endDate', '>=', now)
        .where('endDate', '<=', threeDaysFromNow)
        .where('status', 'in', ['planning', 'in-progress'])
        .get();

      const batch = db.batch();

      projectsSnapshot.forEach((doc) => {
        const project = doc.data();
        const notification = {
          userId: project.userId,
          type: 'warning',
          title: 'Project Deadline Approaching',
          message: `Your project "${project.title}" is due in less than 3 days.`,
          actionUrl: `/dashboard/projects/${doc.id}`,
          actionLabel: 'View Project',
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        const notificationRef = db.collection('notifications').doc();
        batch.set(notificationRef, notification);
      });

      await batch.commit();
      
      functions.logger.info(`Sent ${projectsSnapshot.size} deadline reminders`);
    } catch (error) {
      functions.logger.error('Error sending deadline reminders:', error);
    }
  });