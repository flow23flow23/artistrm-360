import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { db, handleError, region, validateAuth, validatePermission } from '../utils/admin';

/**
 * Función para registrar evento de analytics
 */
export const trackEvent = functions.region(region).https.onCall(async (data, context) => {
  try {
    // Validar autenticación
    const uid = await validateAuth(context);
    
    const { 
      artistId, 
      eventType, 
      eventSource, 
      eventData,
      contentId,
      projectId
    } = data;
    
    // Validar datos de entrada
    if (!artistId || !eventType || !eventSource) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Se requiere ID del artista, tipo de evento y fuente del evento'
      );
    }
    
    // Validar permisos (requiere cualquier rol)
    try {
      await validatePermission(uid, artistId, 'viewer');
    } catch (error) {
      // Si no tiene permisos, verificar si el contenido es público
      if (contentId) {
        const contentDoc = await db.collection('content').doc(contentId).get();
        if (!contentDoc.exists || !contentDoc.data()?.isPublic) {
          throw new functions.https.HttpsError(
            'permission-denied',
            'No tienes acceso a este artista'
          );
        }
      } else {
        throw new functions.https.HttpsError(
          'permission-denied',
          'No tienes acceso a este artista'
        );
      }
    }
    
    // Crear documento de evento en Firestore
    const eventRef = db.collection('analytics_events').doc();
    
    await eventRef.set({
      artistId,
      eventType,
      eventSource,
      eventData: eventData || {},
      contentId: contentId || null,
      projectId: projectId || null,
      userId: uid,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD para facilitar consultas
      deviceInfo: {
        userAgent: context.rawRequest?.headers['user-agent'] || null,
        ip: context.rawRequest?.ip || null
      }
    });
    
    // Actualizar contadores según el tipo de evento
    if (contentId && ['view', 'like', 'share', 'comment'].includes(eventType)) {
      const updateData: any = {};
      updateData[eventType + 's'] = admin.firestore.FieldValue.increment(1);
      
      await db.collection('content').doc(contentId).update(updateData);
    }
    
    return { success: true };
  } catch (error) {
    return handleError(error);
  }
});

/**
 * Función para obtener resumen de analytics de un artista
 */
export const getArtistAnalyticsSummary = functions.region(region).https.onCall(async (data, context) => {
  try {
    // Validar autenticación
    const uid = await validateAuth(context);
    
    const { artistId, period } = data;
    
    if (!artistId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Se requiere ID del artista'
      );
    }
    
    // Validar permisos (requiere rol de viewer o superior)
    await validatePermission(uid, artistId, 'viewer');
    
    // Determinar rango de fechas según el período
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30); // Por defecto, último mes
    }
    
    const startTimestamp = admin.firestore.Timestamp.fromDate(startDate);
    
    // Obtener eventos de analytics
    const eventsSnapshot = await db.collection('analytics_events')
      .where('artistId', '==', artistId)
      .where('timestamp', '>=', startTimestamp)
      .get();
    
    // Agrupar eventos por tipo
    const eventsByType: any = {};
    const eventsBySource: any = {};
    const eventsByDate: any = {};
    const contentViews: any = {};
    
    eventsSnapshot.forEach(doc => {
      const event = doc.data();
      const eventType = event.eventType;
      const eventSource = event.eventSource;
      const date = event.date;
      const contentId = event.contentId;
      
      // Contar por tipo
      if (!eventsByType[eventType]) {
        eventsByType[eventType] = 0;
      }
      eventsByType[eventType]++;
      
      // Contar por fuente
      if (!eventsBySource[eventSource]) {
        eventsBySource[eventSource] = 0;
      }
      eventsBySource[eventSource]++;
      
      // Contar por fecha
      if (!eventsByDate[date]) {
        eventsByDate[date] = 0;
      }
      eventsByDate[date]++;
      
      // Contar vistas por contenido
      if (eventType === 'view' && contentId) {
        if (!contentViews[contentId]) {
          contentViews[contentId] = 0;
        }
        contentViews[contentId]++;
      }
    });
    
    // Obtener contenido más visto
    const topContentIds = Object.keys(contentViews)
      .sort((a, b) => contentViews[b] - contentViews[a])
      .slice(0, 5);
    
    const topContentPromises = topContentIds.map(async (contentId) => {
      const contentDoc = await db.collection('content').doc(contentId).get();
      if (contentDoc.exists) {
        return {
          id: contentId,
          title: contentDoc.data()?.title || 'Sin título',
          type: contentDoc.data()?.type || 'unknown',
          views: contentViews[contentId],
          thumbnailUrl: contentDoc.data()?.thumbnailUrl || null
        };
      }
      return null;
    });
    
    const topContent = (await Promise.all(topContentPromises)).filter(item => item !== null);
    
    // Obtener total de seguidores (integraciones)
    const integrationsSnapshot = await db.collection('integrations')
      .where('artistId', '==', artistId)
      .where('status', '==', 'active')
      .get();
    
    let totalFollowers = 0;
    const followersByPlatform: any = {};
    
    integrationsSnapshot.forEach(doc => {
      const integration = doc.data();
      const platform = integration.platform;
      const followers = integration.metrics?.followers || 0;
      
      totalFollowers += followers;
      followersByPlatform[platform] = followers;
    });
    
    // Preparar datos para gráficos de tendencias
    const dates = Object.keys(eventsByDate).sort();
    const activityTrend = dates.map(date => ({
      date,
      count: eventsByDate[date]
    }));
    
    return {
      period,
      totalEvents: eventsSnapshot.size,
      eventsByType,
      eventsBySource,
      activityTrend,
      topContent,
      totalFollowers,
      followersByPlatform
    };
  } catch (error) {
    return handleError(error);
  }
});

/**
 * Función para obtener analytics detallado de contenido
 */
export const getContentAnalytics = functions.region(region).https.onCall(async (data, context) => {
  try {
    // Validar autenticación
    const uid = await validateAuth(context);
    
    const { contentId, period } = data;
    
    if (!contentId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Se requiere ID del contenido'
      );
    }
    
    // Obtener contenido
    const contentDoc = await db.collection('content').doc(contentId).get();
    
    if (!contentDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Contenido no encontrado'
      );
    }
    
    const artistId = contentDoc.data()?.artistId;
    
    // Validar permisos (requiere rol de viewer o superior)
    await validatePermission(uid, artistId, 'viewer');
    
    // Determinar rango de fechas según el período
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30); // Por defecto, último mes
    }
    
    const startTimestamp = admin.firestore.Timestamp.fromDate(startDate);
    
    // Obtener eventos de analytics para este contenido
    const eventsSnapshot = await db.collection('analytics_events')
      .where('contentId', '==', contentId)
      .where('timestamp', '>=', startTimestamp)
      .get();
    
    // Agrupar eventos por tipo y fecha
    const eventsByType: any = {};
    const eventsByDate: any = {};
    const eventsBySource: any = {};
    
    eventsSnapshot.forEach(doc => {
      const event = doc.data();
      const eventType = event.eventType;
      const eventSource = event.eventSource;
      const date = event.date;
      
      // Contar por tipo
      if (!eventsByType[eventType]) {
        eventsByType[eventType] = 0;
      }
      eventsByType[eventType]++;
      
      // Contar por fuente
      if (!eventsBySource[eventSource]) {
        eventsBySource[eventSource] = 0;
      }
      eventsBySource[eventSource]++;
      
      // Contar por fecha y tipo
      if (!eventsByDate[date]) {
        eventsByDate[date] = {};
      }
      if (!eventsByDate[date][eventType]) {
        eventsByDate[date][eventType] = 0;
      }
      eventsByDate[date][eventType]++;
    });
    
    // Preparar datos para gráficos de tendencias
    const dates = Object.keys(eventsByDate).sort();
    
    const viewsTrend = dates.map(date => ({
      date,
      views: eventsByDate[date]['view'] || 0
    }));
    
    const likesTrend = dates.map(date => ({
      date,
      likes: eventsByDate[date]['like'] || 0
    }));
    
    const sharesTrend = dates.map(date => ({
      date,
      shares: eventsByDate[date]['share'] || 0
    }));
    
    // Obtener publicaciones en plataformas sociales
    const publicationsSnapshot = await db.collection('content_publications')
      .where('contentId', '==', contentId)
      .get();
    
    const publications = publicationsSnapshot.docs.map(doc => ({
      id: doc.id,
      platform: doc.data().platform,
      status: doc.data().status,
      publishedAt: doc.data().publishedAt,
      externalUrl: doc.data().externalUrl
    }));
    
    // Obtener métricas de plataformas sociales si existen
    const socialMetrics: any = {};
    
    for (const publication of publications) {
      if (publication.status === 'published' && publication.externalUrl) {
        const platform = publication.platform;
        
        // Aquí se obtendrían métricas reales de las APIs de cada plataforma
        // En esta implementación, usamos datos simulados
        socialMetrics[platform] = {
          views: Math.floor(Math.random() * 1000),
          likes: Math.floor(Math.random() * 100),
          comments: Math.floor(Math.random() * 50),
          shares: Math.floor(Math.random() * 20)
        };
      }
    }
    
    return {
      contentId,
      title: contentDoc.data()?.title,
      type: contentDoc.data()?.type,
      period,
      totalEvents: eventsSnapshot.size,
      eventsByType,
      eventsBySource,
      viewsTrend,
      likesTrend,
      sharesTrend,
      publications,
      socialMetrics,
      internalMetrics: {
        views: contentDoc.data()?.views || 0,
        likes: contentDoc.data()?.likes || 0,
        shares: contentDoc.data()?.shares || 0,
        comments: contentDoc.data()?.comments || 0
      }
    };
  } catch (error) {
    return handleError(error);
  }
});

/**
 * Función para obtener analytics de audiencia
 */
export const getAudienceAnalytics = functions.region(region).https.onCall(async (data, context) => {
  try {
    // Validar autenticación
    const uid = await validateAuth(context);
    
    const { artistId, period } = data;
    
    if (!artistId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Se requiere ID del artista'
      );
    }
    
    // Validar permisos (requiere rol de viewer o superior)
    await validatePermission(uid, artistId, 'viewer');
    
    // Determinar rango de fechas según el período
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30); // Por defecto, último mes
    }
    
    const startTimestamp = admin.firestore.Timestamp.fromDate(startDate);
    
    // Obtener eventos de analytics
    const eventsSnapshot = await db.collection('analytics_events')
      .where('artistId', '==', artistId)
      .where('timestamp', '>=', startTimestamp)
      .get();
    
    // Agrupar eventos por usuario
    const userEvents: any = {};
    const userFirstSeen: any = {};
    const userLastSeen: any = {};
    
    eventsSnapshot.forEach(doc => {
      const event = doc.data();
      const userId = event.userId;
      const timestamp = event.timestamp?.toDate?.() || new Date();
      
      if (!userEvents[userId]) {
        userEvents[userId] = 0;
        userFirstSeen[userId] = timestamp;
        userLastSeen[userId] = timestamp;
      }
      
      userEvents[userId]++;
      
      if (timestamp < userFirstSeen[userId]) {
        userFirstSeen[userId] = timestamp;
      }
      
      if (timestamp > userLastSeen[userId]) {
        userLastSeen[userId] = timestamp;
      }
    });
    
    // Calcular métricas de audiencia
    const totalUsers = Object.keys(userEvents).length;
    
    // Usuarios activos: han interactuado en los últimos 7 días
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);
    
    const activeUsers = Object.keys(userLastSeen).filter(userId => 
      userLastSeen[userId] >= sevenDaysAgo
    ).length;
    
    // Nuevos usuarios: primera interacción en el período seleccionado
    const newUsers = Object.keys(userFirstSeen).filter(userId => 
      userFirstSeen[userId] >= startDate
    ).length;
    
    // Usuarios recurrentes: más de 5 interacciones
    const recurringUsers = Object.keys(userEvents).filter(userId => 
      userEvents[userId] > 5
    ).length;
    
    // Usuarios por nivel de actividad
    const usersByActivity = {
      low: 0,    // 1-2 interacciones
      medium: 0, // 3-10 interacciones
      high: 0    // >10 interacciones
    };
    
    Object.keys(userEvents).forEach(userId => {
      const count = userEvents[userId];
      if (count <= 2) {
        usersByActivity.low++;
      } else if (count <= 10) {
        usersByActivity.medium++;
      } else {
        usersByActivity.high++;
      }
    });
    
    // Obtener datos demográficos de usuarios (simulados)
    // En una implementación real, estos datos vendrían de perfiles de usuario o analytics
    const demographics = {
      ageGroups: {
        '13-17': Math.floor(totalUsers * 0.05),
        '18-24': Math.floor(totalUsers * 0.25),
        '25-34': Math.floor(totalUsers * 0.35),
        '35-44': Math.floor(totalUsers * 0.20),
        '45-54': Math.floor(totalUsers * 0.10),
        '55+': Math.floor(totalUsers * 0.05)
      },
      gender: {
        male: Math.floor(totalUsers * 0.48),
        female: Math.floor(totalUsers * 0.49),
        other: Math.floor(totalUsers * 0.03)
      },
      topCountries: {
        'US': Math.floor(totalUsers * 0.30),
        'MX': Math.floor(totalUsers * 0.15),
        'ES': Math.floor(totalUsers * 0.12),
        'AR': Math.floor(totalUsers * 0.10),
        'CO': Math.floor(totalUsers * 0.08),
        'Other': Math.floor(totalUsers * 0.25)
      }
    };
    
    return {
      period,
      totalUsers,
      activeUsers,
      newUsers,
      recurringUsers,
      usersByActivity,
      demographics,
      retentionRate: totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0
    };
  } catch (error) {
    return handleError(error);
  }
});

/**
 * Función para obtener analytics de proyectos
 */
export const getProjectsAnalytics = functions.region(region).https.onCall(async (data, context) => {
  try {
    // Validar autenticación
    const uid = await validateAuth(context);
    
    const { artistId } = data;
    
    if (!artistId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Se requiere ID del artista'
      );
    }
    
    // Validar permisos (requiere rol de viewer o superior)
    await validatePermission(uid, artistId, 'viewer');
    
    // Obtener proyectos del artista
    const projectsSnapshot = await db.collection('projects')
      .where('artistId', '==', artistId)
      .get();
    
    // Calcular métricas de proyectos
    const projectsMetrics = {
      total: projectsSnapshot.size,
      byStatus: {
        planning: 0,
        inProgress: 0,
        completed: 0,
        onHold: 0,
        cancelled: 0
      },
      byType: {},
      completionRate: 0,
      averageCompletion: 0
    };
    
    let totalCompletionPercentage = 0;
    
    projectsSnapshot.forEach(doc => {
      const project = doc.data();
      const status = project.status || 'planning';
      const type = project.type || 'other';
      
      // Contar por estado
      if (projectsMetrics.byStatus[status] !== undefined) {
        projectsMetrics.byStatus[status]++;
      } else {
        projectsMetrics.byStatus[status] = 1;
      }
      
      // Contar por tipo
      if (!projectsMetrics.byType[type]) {
        projectsMetrics.byType[type] = 0;
      }
      projectsMetrics.byType[type]++;
      
      // Sumar porcentaje de completado
      totalCompletionPercentage += project.completionPercentage || 0;
    });
    
    // Calcular tasa de completado y promedio
    projectsMetrics.completionRate = projectsSnapshot.size > 0 ? 
      Math.round((projectsMetrics.byStatus.completed / projectsSnapshot.size) * 100) : 0;
    
    projectsMetrics.averageCompletion = projectsSnapshot.size > 0 ? 
      Math.round(totalCompletionPercentage / projectsSnapshot.size) : 0;
    
    // Obtener proyectos con mejor rendimiento (más contenido y eventos)
    const projectIds = projectsSnapshot.docs.map(doc => doc.id);
    
    // Contar contenido por proyecto
    const contentCountByProject: any = {};
    
    if (projectIds.length > 0) {
      const contentSnapshot = await db.collection('content')
        .where('artistId', '==', artistId)
        .where('projectId', 'in', projectIds)
        .get();
      
      contentSnapshot.forEach(doc => {
        const content = doc.data();
        const projectId = content.projectId;
        
        if (!contentCountByProject[projectId]) {
          contentCountByProject[projectId] = 0;
        }
        contentCountByProject[projectId]++;
      });
    }
    
    // Contar eventos por proyecto
    const eventsCountByProject: any = {};
    
    if (projectIds.length > 0) {
      const eventsSnapshot = await db.collection('events')
        .where('artistId', '==', artistId)
        .where('projectId', 'in', projectIds)
        .get();
      
      eventsSnapshot.forEach(doc => {
        const event = doc.data();
        const projectId = event.projectId;
        
        if (!eventsCountByProject[projectId]) {
          eventsCountByProject[projectId] = 0;
        }
        eventsCountByProject[projectId]++;
      });
    }
    
    // Calcular puntuación de rendimiento para cada proyecto
    const projectPerformance = projectIds.map(projectId => {
      const contentCount = contentCountByProject[projectId] || 0;
      const eventsCount = eventsCountByProject[projectId] || 0;
      const project = projectsSnapshot.docs.find(doc => doc.id === projectId)?.data();
      
      return {
        id: projectId,
        title: project?.title || 'Sin título',
        status: project?.status || 'planning',
        completionPercentage: project?.completionPercentage || 0,
        contentCount,
        eventsCount,
        performanceScore: contentCount * 2 + eventsCount + (project?.completionPercentage || 0) / 10
      };
    });
    
    // Ordenar por puntuación de rendimiento
    projectPerformance.sort((a, b) => b.performanceScore - a.performanceScore);
    
    // Obtener los 5 mejores proyectos
    const topProjects = projectPerformance.slice(0, 5);
    
    return {
      projectsMetrics,
      topProjects
    };
  } catch (error) {
    return handleError(error);
  }
});

/**
 * Función para sincronizar datos de analytics con BigQuery
 * Esta función se ejecutaría periódicamente mediante un Cloud Scheduler
 */
export const syncAnalyticsToBigQuery = functions.region(region).pubsub.schedule('every 24 hours').onRun(async (context) => {
  try {
    // En una implementación real, aquí se exportarían los datos de Firestore a BigQuery
    // Para esta implementación, solo registramos un mensaje de log
    console.log('Sincronizando datos de analytics con BigQuery...');
    
    // Obtener eventos de analytics del último día
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const startTimestamp = admin.firestore.Timestamp.fromDate(oneDayAgo);
    
    const eventsSnapshot = await db.collection('analytics_events')
      .where('timestamp', '>=', startTimestamp)
      .get();
    
    console.log(`Sincronizados ${eventsSnapshot.size} eventos de analytics a BigQuery`);
    
    return { success: true };
  } catch (error) {
    console.error('Error al sincronizar datos con BigQuery:', error);
    return { success: false, error };
  }
});
