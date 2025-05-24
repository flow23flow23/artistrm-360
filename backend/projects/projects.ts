import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { db, handleError, region, validateAuth, validatePermission } from '../utils/admin';

/**
 * Función para crear un nuevo proyecto
 */
export const createProject = functions.region(region).https.onCall(async (data, context) => {
  try {
    // Validar autenticación
    const uid = await validateAuth(context);
    
    const { 
      artistId, 
      title, 
      description, 
      type, 
      status, 
      priority, 
      startDate, 
      endDate, 
      teamIds 
    } = data;
    
    // Validar datos de entrada
    if (!artistId || !title || !type) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Se requiere ID del artista, título y tipo de proyecto'
      );
    }
    
    // Validar permisos (requiere rol de editor o superior)
    await validatePermission(uid, artistId, 'editor');
    
    // Crear documento de proyecto en Firestore
    const projectRef = db.collection('projects').doc();
    const projectId = projectRef.id;
    
    await projectRef.set({
      artistId,
      title,
      description: description || '',
      type,
      status: status || 'planning',
      priority: priority || 'medium',
      startDate: startDate ? admin.firestore.Timestamp.fromDate(new Date(startDate)) : null,
      endDate: endDate ? admin.firestore.Timestamp.fromDate(new Date(endDate)) : null,
      createdBy: uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      completionPercentage: 0
    });
    
    // Asignar miembros del equipo al proyecto
    if (teamIds && Array.isArray(teamIds) && teamIds.length > 0) {
      const batch = db.batch();
      
      teamIds.forEach(userId => {
        const projectTeamRef = db.collection('project_team').doc(`${projectId}_${userId}`);
        batch.set(projectTeamRef, {
          projectId,
          userId,
          role: 'member',
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
      });
      
      await batch.commit();
    }
    
    return {
      id: projectId,
      artistId,
      title,
      description,
      type,
      status,
      priority,
      startDate,
      endDate
    };
  } catch (error) {
    return handleError(error);
  }
});

/**
 * Función para actualizar un proyecto existente
 */
export const updateProject = functions.region(region).https.onCall(async (data, context) => {
  try {
    // Validar autenticación
    const uid = await validateAuth(context);
    
    const { 
      projectId, 
      title, 
      description, 
      type, 
      status, 
      priority, 
      startDate, 
      endDate,
      completionPercentage
    } = data;
    
    if (!projectId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Se requiere el ID del proyecto'
      );
    }
    
    // Obtener proyecto para verificar artistId
    const projectDoc = await db.collection('projects').doc(projectId).get();
    
    if (!projectDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Proyecto no encontrado'
      );
    }
    
    const artistId = projectDoc.data()?.artistId;
    
    // Validar permisos (requiere rol de editor o superior)
    await validatePermission(uid, artistId, 'editor');
    
    // Construir objeto de actualización
    const updateData: any = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (type !== undefined) updateData.type = type;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (startDate !== undefined) updateData.startDate = startDate ? admin.firestore.Timestamp.fromDate(new Date(startDate)) : null;
    if (endDate !== undefined) updateData.endDate = endDate ? admin.firestore.Timestamp.fromDate(new Date(endDate)) : null;
    if (completionPercentage !== undefined) updateData.completionPercentage = completionPercentage;
    
    // Actualizar documento de proyecto
    await db.collection('projects').doc(projectId).update(updateData);
    
    return { success: true };
  } catch (error) {
    return handleError(error);
  }
});

/**
 * Función para obtener un proyecto por ID
 */
export const getProject = functions.region(region).https.onCall(async (data, context) => {
  try {
    // Validar autenticación
    const uid = await validateAuth(context);
    
    const { projectId } = data;
    
    if (!projectId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Se requiere el ID del proyecto'
      );
    }
    
    // Obtener proyecto
    const projectDoc = await db.collection('projects').doc(projectId).get();
    
    if (!projectDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Proyecto no encontrado'
      );
    }
    
    const artistId = projectDoc.data()?.artistId;
    
    // Validar permisos (requiere cualquier rol)
    await validatePermission(uid, artistId, 'viewer');
    
    // Obtener tareas del proyecto
    const tasksSnapshot = await db.collection('tasks')
      .where('projectId', '==', projectId)
      .orderBy('dueDate', 'asc')
      .get();
    
    const tasks = tasksSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Obtener miembros del equipo del proyecto
    const teamSnapshot = await db.collection('project_team')
      .where('projectId', '==', projectId)
      .get();
    
    const teamPromises = teamSnapshot.docs.map(async (doc) => {
      const userId = doc.data().userId;
      const userDoc = await db.collection('users').doc(userId).get();
      
      if (userDoc.exists) {
        return {
          userId,
          role: doc.data().role,
          displayName: userDoc.data()?.displayName || '',
          email: userDoc.data()?.email || '',
          photoURL: userDoc.data()?.photoURL || null
        };
      }
      return null;
    });
    
    const team = (await Promise.all(teamPromises)).filter(member => member !== null);
    
    // Obtener eventos del proyecto
    const eventsSnapshot = await db.collection('events')
      .where('projectId', '==', projectId)
      .orderBy('startDate', 'asc')
      .get();
    
    const events = eventsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return {
      id: projectId,
      ...projectDoc.data(),
      tasks,
      team,
      events
    };
  } catch (error) {
    return handleError(error);
  }
});

/**
 * Función para listar proyectos de un artista
 */
export const listProjects = functions.region(region).https.onCall(async (data, context) => {
  try {
    // Validar autenticación
    const uid = await validateAuth(context);
    
    const { artistId, status, type, priority } = data;
    
    if (!artistId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Se requiere el ID del artista'
      );
    }
    
    // Validar permisos (requiere cualquier rol)
    await validatePermission(uid, artistId, 'viewer');
    
    // Construir consulta base
    let query: FirebaseFirestore.Query = db.collection('projects')
      .where('artistId', '==', artistId)
      .orderBy('updatedAt', 'desc');
    
    // Aplicar filtros si se proporcionan
    if (status) {
      query = query.where('status', '==', status);
    }
    
    if (type) {
      query = query.where('type', '==', type);
    }
    
    if (priority) {
      query = query.where('priority', '==', priority);
    }
    
    const projectsSnapshot = await query.get();
    
    const projects = projectsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { projects };
  } catch (error) {
    return handleError(error);
  }
});

/**
 * Función para crear una tarea en un proyecto
 */
export const createTask = functions.region(region).https.onCall(async (data, context) => {
  try {
    // Validar autenticación
    const uid = await validateAuth(context);
    
    const { 
      projectId, 
      title, 
      description, 
      status, 
      priority, 
      dueDate, 
      assignedTo 
    } = data;
    
    if (!projectId || !title) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Se requiere ID del proyecto y título de la tarea'
      );
    }
    
    // Obtener proyecto para verificar artistId
    const projectDoc = await db.collection('projects').doc(projectId).get();
    
    if (!projectDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Proyecto no encontrado'
      );
    }
    
    const artistId = projectDoc.data()?.artistId;
    
    // Validar permisos (requiere rol de editor o superior)
    await validatePermission(uid, artistId, 'editor');
    
    // Crear documento de tarea en Firestore
    const taskRef = db.collection('tasks').doc();
    const taskId = taskRef.id;
    
    await taskRef.set({
      projectId,
      title,
      description: description || '',
      status: status || 'pending',
      priority: priority || 'medium',
      dueDate: dueDate ? admin.firestore.Timestamp.fromDate(new Date(dueDate)) : null,
      assignedTo: assignedTo || null,
      createdBy: uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      completedAt: null
    });
    
    return {
      id: taskId,
      projectId,
      title,
      description,
      status,
      priority,
      dueDate,
      assignedTo
    };
  } catch (error) {
    return handleError(error);
  }
});

/**
 * Función para actualizar el estado de una tarea
 */
export const updateTaskStatus = functions.region(region).https.onCall(async (data, context) => {
  try {
    // Validar autenticación
    const uid = await validateAuth(context);
    
    const { taskId, status } = data;
    
    if (!taskId || !status) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Se requiere ID de la tarea y nuevo estado'
      );
    }
    
    // Obtener tarea
    const taskDoc = await db.collection('tasks').doc(taskId).get();
    
    if (!taskDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Tarea no encontrada'
      );
    }
    
    const projectId = taskDoc.data()?.projectId;
    
    // Obtener proyecto para verificar artistId
    const projectDoc = await db.collection('projects').doc(projectId).get();
    
    if (!projectDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Proyecto no encontrado'
      );
    }
    
    const artistId = projectDoc.data()?.artistId;
    
    // Validar permisos (requiere rol de editor o superior)
    await validatePermission(uid, artistId, 'editor');
    
    // Actualizar estado de la tarea
    const updateData: any = {
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // Si se marca como completada, registrar fecha de completado
    if (status === 'completed') {
      updateData.completedAt = admin.firestore.FieldValue.serverTimestamp();
    } else {
      // Si se cambia de completada a otro estado, eliminar fecha de completado
      updateData.completedAt = null;
    }
    
    await db.collection('tasks').doc(taskId).update(updateData);
    
    // Actualizar porcentaje de completado del proyecto
    const tasksSnapshot = await db.collection('tasks')
      .where('projectId', '==', projectId)
      .get();
    
    const totalTasks = tasksSnapshot.size;
    const completedTasks = tasksSnapshot.docs.filter(doc => 
      doc.data().status === 'completed' || 
      (doc.id === taskId && status === 'completed')
    ).length;
    
    const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    await db.collection('projects').doc(projectId).update({
      completionPercentage,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return { 
      success: true,
      completionPercentage
    };
  } catch (error) {
    return handleError(error);
  }
});

/**
 * Función para crear un evento en un proyecto
 */
export const createEvent = functions.region(region).https.onCall(async (data, context) => {
  try {
    // Validar autenticación
    const uid = await validateAuth(context);
    
    const { 
      projectId, 
      title, 
      description, 
      location,
      startDate, 
      endDate, 
      allDay,
      reminderMinutes
    } = data;
    
    if (!projectId || !title || !startDate) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Se requiere ID del proyecto, título y fecha de inicio'
      );
    }
    
    // Obtener proyecto para verificar artistId
    const projectDoc = await db.collection('projects').doc(projectId).get();
    
    if (!projectDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Proyecto no encontrado'
      );
    }
    
    const artistId = projectDoc.data()?.artistId;
    
    // Validar permisos (requiere rol de editor o superior)
    await validatePermission(uid, artistId, 'editor');
    
    // Crear documento de evento en Firestore
    const eventRef = db.collection('events').doc();
    const eventId = eventRef.id;
    
    await eventRef.set({
      projectId,
      artistId,
      title,
      description: description || '',
      location: location || '',
      startDate: admin.firestore.Timestamp.fromDate(new Date(startDate)),
      endDate: endDate ? admin.firestore.Timestamp.fromDate(new Date(endDate)) : null,
      allDay: allDay || false,
      reminderMinutes: reminderMinutes || 60,
      createdBy: uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return {
      id: eventId,
      projectId,
      artistId,
      title,
      description,
      location,
      startDate,
      endDate,
      allDay,
      reminderMinutes
    };
  } catch (error) {
    return handleError(error);
  }
});

/**
 * Función para listar eventos de un artista
 */
export const listEvents = functions.region(region).https.onCall(async (data, context) => {
  try {
    // Validar autenticación
    const uid = await validateAuth(context);
    
    const { artistId, startDate, endDate } = data;
    
    if (!artistId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Se requiere el ID del artista'
      );
    }
    
    // Validar permisos (requiere cualquier rol)
    await validatePermission(uid, artistId, 'viewer');
    
    // Construir consulta base
    let query: FirebaseFirestore.Query = db.collection('events')
      .where('artistId', '==', artistId)
      .orderBy('startDate', 'asc');
    
    // Aplicar filtros de fecha si se proporcionan
    if (startDate) {
      const startTimestamp = admin.firestore.Timestamp.fromDate(new Date(startDate));
      query = query.where('startDate', '>=', startTimestamp);
    }
    
    if (endDate) {
      const endTimestamp = admin.firestore.Timestamp.fromDate(new Date(endDate));
      query = query.where('startDate', '<=', endTimestamp);
    }
    
    const eventsSnapshot = await query.get();
    
    const events = eventsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { events };
  } catch (error) {
    return handleError(error);
  }
});
