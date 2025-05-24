import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { db, handleError, region, validateAuth, validatePermission } from '../utils/admin';

/**
 * Función para registrar una nueva integración con plataforma externa
 */
export const registerIntegration = functions.region(region).https.onCall(async (data, context) => {
  try {
    // Validar autenticación
    const uid = await validateAuth(context);
    
    const { 
      artistId, 
      platform, 
      accessToken, 
      refreshToken, 
      tokenExpiry,
      platformUserId,
      platformUserName,
      platformUserUrl,
      metadata
    } = data;
    
    // Validar datos de entrada
    if (!artistId || !platform || !accessToken) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Se requiere ID del artista, plataforma y token de acceso'
      );
    }
    
    // Validar permisos (requiere rol de admin o superior)
    await validatePermission(uid, artistId, 'admin');
    
    // Verificar si ya existe una integración para esta plataforma
    const existingIntegrationSnapshot = await db.collection('integrations')
      .where('artistId', '==', artistId)
      .where('platform', '==', platform)
      .limit(1)
      .get();
    
    let integrationRef;
    
    if (!existingIntegrationSnapshot.empty) {
      // Actualizar integración existente
      integrationRef = existingIntegrationSnapshot.docs[0].ref;
      
      await integrationRef.update({
        accessToken,
        refreshToken: refreshToken || null,
        tokenExpiry: tokenExpiry || null,
        platformUserId: platformUserId || null,
        platformUserName: platformUserName || null,
        platformUserUrl: platformUserUrl || null,
        metadata: metadata || {},
        status: 'active',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedBy: uid
      });
    } else {
      // Crear nueva integración
      integrationRef = db.collection('integrations').doc();
      
      await integrationRef.set({
        artistId,
        platform,
        accessToken,
        refreshToken: refreshToken || null,
        tokenExpiry: tokenExpiry || null,
        platformUserId: platformUserId || null,
        platformUserName: platformUserName || null,
        platformUserUrl: platformUserUrl || null,
        metadata: metadata || {},
        status: 'active',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: uid,
        updatedBy: uid,
        lastSyncAt: null,
        metrics: {
          followers: 0,
          views: 0,
          likes: 0,
          comments: 0,
          shares: 0
        },
        error: null
      });
    }
    
    // Registrar evento en analytics
    const analyticsRef = db.collection('analytics_events').doc();
    
    await analyticsRef.set({
      artistId,
      eventType: 'integration_registered',
      eventSource: platform,
      eventData: {
        integrationId: integrationRef.id,
        platform
      },
      userId: uid,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      date: new Date().toISOString().split('T')[0]
    });
    
    // Programar sincronización inicial de métricas
    // En una implementación real, esto se haría con Cloud Tasks o Pub/Sub
    
    return {
      success: true,
      integrationId: integrationRef.id,
      platform,
      status: 'active'
    };
  } catch (error) {
    return handleError(error);
  }
});

/**
 * Función para obtener integraciones de un artista
 */
export const getIntegrations = functions.region(region).https.onCall(async (data, context) => {
  try {
    // Validar autenticación
    const uid = await validateAuth(context);
    
    const { artistId, platform } = data;
    
    if (!artistId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Se requiere ID del artista'
      );
    }
    
    // Validar permisos (requiere rol de viewer o superior)
    await validatePermission(uid, artistId, 'viewer');
    
    // Construir consulta base
    let query = db.collection('integrations')
      .where('artistId', '==', artistId);
    
    // Filtrar por plataforma si se proporciona
    if (platform) {
      query = query.where('platform', '==', platform);
    }
    
    const integrationsSnapshot = await query.get();
    
    // Filtrar información sensible según el rol del usuario
    const userRole = await getUserRole(uid, artistId);
    
    const integrations = integrationsSnapshot.docs.map(doc => {
      const integration = doc.data();
      
      // Solo los administradores pueden ver tokens y datos sensibles
      if (userRole !== 'admin' && userRole !== 'owner') {
        delete integration.accessToken;
        delete integration.refreshToken;
        delete integration.tokenExpiry;
      }
      
      return {
        id: doc.id,
        ...integration
      };
    });
    
    return { integrations };
  } catch (error) {
    return handleError(error);
  }
});

/**
 * Función auxiliar para obtener el rol del usuario
 */
async function getUserRole(uid: string, artistId: string): Promise<string> {
  const userArtistRef = db.collection('user_artists').doc(`${uid}_${artistId}`);
  const userArtistDoc = await userArtistRef.get();
  
  if (!userArtistDoc.exists) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'No tienes acceso a este artista'
    );
  }
  
  return userArtistDoc.data()?.role || 'viewer';
}

/**
 * Función para eliminar una integración
 */
export const deleteIntegration = functions.region(region).https.onCall(async (data, context) => {
  try {
    // Validar autenticación
    const uid = await validateAuth(context);
    
    const { integrationId } = data;
    
    if (!integrationId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Se requiere ID de la integración'
      );
    }
    
    // Obtener integración
    const integrationDoc = await db.collection('integrations').doc(integrationId).get();
    
    if (!integrationDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Integración no encontrada'
      );
    }
    
    const artistId = integrationDoc.data()?.artistId;
    
    // Validar permisos (requiere rol de admin o superior)
    await validatePermission(uid, artistId, 'admin');
    
    // Eliminar integración
    await db.collection('integrations').doc(integrationId).delete();
    
    // Registrar evento en analytics
    const analyticsRef = db.collection('analytics_events').doc();
    
    await analyticsRef.set({
      artistId,
      eventType: 'integration_deleted',
      eventSource: integrationDoc.data()?.platform,
      eventData: {
        integrationId,
        platform: integrationDoc.data()?.platform
      },
      userId: uid,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      date: new Date().toISOString().split('T')[0]
    });
    
    return { success: true };
  } catch (error) {
    return handleError(error);
  }
});

/**
 * Función para sincronizar métricas de una integración
 */
export const syncIntegrationMetrics = functions.region(region).https.onCall(async (data, context) => {
  try {
    // Validar autenticación
    const uid = await validateAuth(context);
    
    const { integrationId } = data;
    
    if (!integrationId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Se requiere ID de la integración'
      );
    }
    
    // Obtener integración
    const integrationDoc = await db.collection('integrations').doc(integrationId).get();
    
    if (!integrationDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Integración no encontrada'
      );
    }
    
    const artistId = integrationDoc.data()?.artistId;
    const platform = integrationDoc.data()?.platform;
    
    // Validar permisos (requiere rol de editor o superior)
    await validatePermission(uid, artistId, 'editor');
    
    // En una implementación real, aquí se llamaría a la API de la plataforma para obtener métricas
    // Para esta implementación, generamos métricas simuladas
    
    const metrics = {
      followers: Math.floor(Math.random() * 10000),
      views: Math.floor(Math.random() * 100000),
      likes: Math.floor(Math.random() * 50000),
      comments: Math.floor(Math.random() * 5000),
      shares: Math.floor(Math.random() * 2000)
    };
    
    // Actualizar métricas en la integración
    await db.collection('integrations').doc(integrationId).update({
      metrics,
      lastSyncAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: uid
    });
    
    // Registrar evento en analytics
    const analyticsRef = db.collection('analytics_events').doc();
    
    await analyticsRef.set({
      artistId,
      eventType: 'integration_metrics_synced',
      eventSource: platform,
      eventData: {
        integrationId,
        platform,
        metrics
      },
      userId: uid,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      date: new Date().toISOString().split('T')[0]
    });
    
    return {
      success: true,
      metrics
    };
  } catch (error) {
    return handleError(error);
  }
});

/**
 * Función para publicar contenido en plataforma externa
 */
export const publishToExternalPlatform = functions.region(region).https.onCall(async (data, context) => {
  try {
    // Validar autenticación
    const uid = await validateAuth(context);
    
    const { 
      contentId, 
      integrationId,
      customTitle,
      customDescription,
      customTags,
      scheduledTime
    } = data;
    
    if (!contentId || !integrationId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Se requiere ID del contenido e ID de la integración'
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
    
    // Validar permisos (requiere rol de editor o superior)
    await validatePermission(uid, artistId, 'editor');
    
    // Obtener integración
    const integrationDoc = await db.collection('integrations').doc(integrationId).get();
    
    if (!integrationDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Integración no encontrada'
      );
    }
    
    if (integrationDoc.data()?.status !== 'active') {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'La integración no está activa'
      );
    }
    
    const platform = integrationDoc.data()?.platform;
    
    // Crear registro de publicación
    const publicationRef = db.collection('content_publications').doc();
    
    await publicationRef.set({
      contentId,
      artistId,
      integrationId,
      platform,
      title: customTitle || contentDoc.data()?.title,
      description: customDescription || contentDoc.data()?.description,
      tags: customTags || contentDoc.data()?.tags,
      scheduledTime: scheduledTime ? admin.firestore.Timestamp.fromDate(new Date(scheduledTime)) : null,
      status: scheduledTime ? 'scheduled' : 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: uid,
      publishedAt: null,
      externalId: null,
      externalUrl: null,
      error: null
    });
    
    // En una implementación real, aquí se llamaría a n8n para iniciar el flujo de publicación
    // Para esta implementación, simulamos una publicación exitosa si no hay tiempo programado
    
    if (!scheduledTime) {
      // Simular publicación inmediata
      const externalId = `ext_${Math.random().toString(36).substring(2, 15)}`;
      const externalUrl = `https://${platform}.com/content/${externalId}`;
      
      await publicationRef.update({
        status: 'published',
        publishedAt: admin.firestore.FieldValue.serverTimestamp(),
        externalId,
        externalUrl
      });
      
      // Actualizar contenido para marcarlo como publicado
      await db.collection('content').doc(contentId).update({
        isPublic: true,
        publishedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // Registrar evento en analytics
      const analyticsRef = db.collection('analytics_events').doc();
      
      await analyticsRef.set({
        artistId,
        eventType: 'content_published',
        eventSource: platform,
        eventData: {
          contentId,
          publicationId: publicationRef.id,
          platform,
          externalId,
          externalUrl
        },
        userId: uid,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        date: new Date().toISOString().split('T')[0]
      });
      
      return {
        success: true,
        publicationId: publicationRef.id,
        status: 'published',
        externalUrl
      };
    }
    
    // Para publicaciones programadas
    return {
      success: true,
      publicationId: publicationRef.id,
      status: 'scheduled',
      scheduledTime
    };
  } catch (error) {
    return handleError(error);
  }
});

/**
 * Función para obtener publicaciones de un contenido
 */
export const getContentPublications = functions.region(region).https.onCall(async (data, context) => {
  try {
    // Validar autenticación
    const uid = await validateAuth(context);
    
    const { contentId } = data;
    
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
    
    // Obtener publicaciones
    const publicationsSnapshot = await db.collection('content_publications')
      .where('contentId', '==', contentId)
      .orderBy('createdAt', 'desc')
      .get();
    
    const publications = publicationsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { publications };
  } catch (error) {
    return handleError(error);
  }
});

/**
 * Función para obtener URL de autorización para una plataforma
 */
export const getAuthorizationUrl = functions.region(region).https.onCall(async (data, context) => {
  try {
    // Validar autenticación
    const uid = await validateAuth(context);
    
    const { artistId, platform } = data;
    
    if (!artistId || !platform) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Se requiere ID del artista y plataforma'
      );
    }
    
    // Validar permisos (requiere rol de admin o superior)
    await validatePermission(uid, artistId, 'admin');
    
    // En una implementación real, aquí se generaría una URL de autorización OAuth
    // Para esta implementación, generamos URLs simuladas
    
    let authUrl = '';
    const state = Buffer.from(JSON.stringify({ artistId, uid })).toString('base64');
    
    switch (platform) {
      case 'spotify':
        authUrl = `https://accounts.spotify.com/authorize?client_id=CLIENT_ID&response_type=code&redirect_uri=https://zamx-v1.web.app/auth/callback&scope=user-read-private,user-read-email,playlist-modify-public&state=${state}`;
        break;
      case 'youtube':
        authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=CLIENT_ID&redirect_uri=https://zamx-v1.web.app/auth/callback&scope=https://www.googleapis.com/auth/youtube&response_type=code&access_type=offline&state=${state}`;
        break;
      case 'instagram':
        authUrl = `https://api.instagram.com/oauth/authorize?client_id=CLIENT_ID&redirect_uri=https://zamx-v1.web.app/auth/callback&scope=user_profile,user_media&response_type=code&state=${state}`;
        break;
      case 'tiktok':
        authUrl = `https://www.tiktok.com/auth/authorize?client_key=CLIENT_ID&redirect_uri=https://zamx-v1.web.app/auth/callback&scope=user.info.basic,video.list&response_type=code&state=${state}`;
        break;
      default:
        throw new functions.https.HttpsError(
          'invalid-argument',
          'Plataforma no soportada'
        );
    }
    
    return {
      authUrl,
      platform
    };
  } catch (error) {
    return handleError(error);
  }
});

/**
 * Función para procesar callback de autorización OAuth
 * Esta función se ejecutaría como una HTTP function en una implementación real
 */
export const processOAuthCallback = functions.region(region).https.onRequest(async (req, res) => {
  try {
    const { code, state, error } = req.query;
    
    if (error) {
      console.error('Error en callback OAuth:', error);
      return res.redirect('/auth/error?reason=denied');
    }
    
    if (!code || !state) {
      console.error('Parámetros faltantes en callback OAuth');
      return res.redirect('/auth/error?reason=invalid');
    }
    
    // Decodificar state para obtener artistId y uid
    let stateData;
    try {
      stateData = JSON.parse(Buffer.from(state as string, 'base64').toString());
    } catch (e) {
      console.error('Error al decodificar state:', e);
      return res.redirect('/auth/error?reason=invalid_state');
    }
    
    const { artistId, uid } = stateData;
    
    if (!artistId || !uid) {
      console.error('Datos de state incompletos');
      return res.redirect('/auth/error?reason=invalid_state');
    }
    
    // En una implementación real, aquí se intercambiaría el código por tokens de acceso
    // Para esta implementación, simulamos tokens
    
    const accessToken = `access_${Math.random().toString(36).substring(2, 15)}`;
    const refreshToken = `refresh_${Math.random().toString(36).substring(2, 15)}`;
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 1); // Expira en 1 hora
    
    // Determinar plataforma basada en la URL de referencia
    const referer = req.headers.referer || '';
    let platform = 'unknown';
    
    if (referer.includes('spotify')) {
      platform = 'spotify';
    } else if (referer.includes('google') || referer.includes('youtube')) {
      platform = 'youtube';
    } else if (referer.includes('instagram')) {
      platform = 'instagram';
    } else if (referer.includes('tiktok')) {
      platform = 'tiktok';
    }
    
    // Registrar integración
    const integrationRef = db.collection('integrations').doc();
    
    await integrationRef.set({
      artistId,
      platform,
      accessToken,
      refreshToken,
      tokenExpiry: admin.firestore.Timestamp.fromDate(tokenExpiry),
      platformUserId: `user_${Math.random().toString(36).substring(2, 10)}`,
      platformUserName: `User_${platform}`,
      platformUserUrl: `https://${platform}.com/user_${Math.random().toString(36).substring(2, 10)}`,
      metadata: {},
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: uid,
      updatedBy: uid,
      lastSyncAt: null,
      metrics: {
        followers: Math.floor(Math.random() * 10000),
        views: Math.floor(Math.random() * 100000),
        likes: Math.floor(Math.random() * 50000),
        comments: Math.floor(Math.random() * 5000),
        shares: Math.floor(Math.random() * 2000)
      },
      error: null
    });
    
    // Registrar evento en analytics
    const analyticsRef = db.collection('analytics_events').doc();
    
    await analyticsRef.set({
      artistId,
      eventType: 'integration_registered',
      eventSource: platform,
      eventData: {
        integrationId: integrationRef.id,
        platform
      },
      userId: uid,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      date: new Date().toISOString().split('T')[0]
    });
    
    // Redirigir a página de éxito
    return res.redirect(`/auth/success?platform=${platform}&artistId=${artistId}`);
  } catch (error) {
    console.error('Error en processOAuthCallback:', error);
    return res.redirect('/auth/error?reason=server_error');
  }
});

/**
 * Función para obtener métricas combinadas de todas las integraciones
 */
export const getCombinedMetrics = functions.region(region).https.onCall(async (data, context) => {
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
    
    // Obtener todas las integraciones activas
    const integrationsSnapshot = await db.collection('integrations')
      .where('artistId', '==', artistId)
      .where('status', '==', 'active')
      .get();
    
    // Inicializar métricas combinadas
    const combinedMetrics = {
      totalFollowers: 0,
      totalViews: 0,
      totalLikes: 0,
      totalComments: 0,
      totalShares: 0,
      byPlatform: {}
    };
    
    // Sumar métricas de todas las integraciones
    integrationsSnapshot.forEach(doc => {
      const integration = doc.data();
      const platform = integration.platform;
      const metrics = integration.metrics || {};
      
      combinedMetrics.totalFollowers += metrics.followers || 0;
      combinedMetrics.totalViews += metrics.views || 0;
      combinedMetrics.totalLikes += metrics.likes || 0;
      combinedMetrics.totalComments += metrics.comments || 0;
      combinedMetrics.totalShares += metrics.shares || 0;
      
      // Agrupar por plataforma
      if (!combinedMetrics.byPlatform[platform]) {
        combinedMetrics.byPlatform[platform] = {
          followers: 0,
          views: 0,
          likes: 0,
          comments: 0,
          shares: 0
        };
      }
      
      combinedMetrics.byPlatform[platform].followers += metrics.followers || 0;
      combinedMetrics.byPlatform[platform].views += metrics.views || 0;
      combinedMetrics.byPlatform[platform].likes += metrics.likes || 0;
      combinedMetrics.byPlatform[platform].comments += metrics.comments || 0;
      combinedMetrics.byPlatform[platform].shares += metrics.shares || 0;
    });
    
    return { metrics: combinedMetrics };
  } catch (error) {
    return handleError(error);
  }
});
