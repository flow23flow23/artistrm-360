import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { db, handleError, region, storage, validateAuth, validatePermission } from '../utils/admin';

/**
 * Función para crear un nuevo contenido multimedia
 */
export const createContent = functions.region(region).https.onCall(async (data, context) => {
  try {
    // Validar autenticación
    const uid = await validateAuth(context);
    
    const { 
      artistId, 
      title, 
      description, 
      type, 
      url, 
      thumbnailUrl,
      projectId,
      tags,
      isPublic,
      platform
    } = data;
    
    // Validar datos de entrada
    if (!artistId || !title || !type) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Se requiere ID del artista, título y tipo de contenido'
      );
    }
    
    // Validar permisos (requiere rol de editor o superior)
    await validatePermission(uid, artistId, 'editor');
    
    // Crear documento de contenido en Firestore
    const contentRef = db.collection('content').doc();
    const contentId = contentRef.id;
    
    await contentRef.set({
      artistId,
      title,
      description: description || '',
      type,
      url: url || null,
      thumbnailUrl: thumbnailUrl || null,
      projectId: projectId || null,
      tags: tags || [],
      isPublic: isPublic !== undefined ? isPublic : false,
      platform: platform || null,
      views: 0,
      likes: 0,
      shares: 0,
      comments: 0,
      createdBy: uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      publishedAt: null
    });
    
    return {
      id: contentId,
      artistId,
      title,
      description,
      type,
      url,
      thumbnailUrl,
      projectId,
      tags,
      isPublic,
      platform
    };
  } catch (error) {
    return handleError(error);
  }
});

/**
 * Función para actualizar contenido multimedia existente
 */
export const updateContent = functions.region(region).https.onCall(async (data, context) => {
  try {
    // Validar autenticación
    const uid = await validateAuth(context);
    
    const { 
      contentId, 
      title, 
      description, 
      url, 
      thumbnailUrl,
      projectId,
      tags,
      isPublic,
      platform
    } = data;
    
    if (!contentId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Se requiere el ID del contenido'
      );
    }
    
    // Obtener contenido para verificar artistId
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
    
    // Construir objeto de actualización
    const updateData: any = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (url !== undefined) updateData.url = url;
    if (thumbnailUrl !== undefined) updateData.thumbnailUrl = thumbnailUrl;
    if (projectId !== undefined) updateData.projectId = projectId;
    if (tags !== undefined) updateData.tags = tags;
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    if (platform !== undefined) updateData.platform = platform;
    
    // Si se está publicando por primera vez, establecer publishedAt
    if (isPublic === true && !contentDoc.data()?.publishedAt) {
      updateData.publishedAt = admin.firestore.FieldValue.serverTimestamp();
    }
    
    // Actualizar documento de contenido
    await db.collection('content').doc(contentId).update(updateData);
    
    return { success: true };
  } catch (error) {
    return handleError(error);
  }
});

/**
 * Función para obtener contenido multimedia por ID
 */
export const getContent = functions.region(region).https.onCall(async (data, context) => {
  try {
    // Validar autenticación
    const uid = await validateAuth(context);
    
    const { contentId } = data;
    
    if (!contentId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Se requiere el ID del contenido'
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
    const isPublic = contentDoc.data()?.isPublic;
    
    // Verificar permisos: público o con acceso al artista
    if (!isPublic) {
      try {
        await validatePermission(uid, artistId, 'viewer');
      } catch (error) {
        throw new functions.https.HttpsError(
          'permission-denied',
          'No tienes acceso a este contenido'
        );
      }
    }
    
    // Incrementar contador de vistas
    await db.collection('content').doc(contentId).update({
      views: admin.firestore.FieldValue.increment(1)
    });
    
    // Obtener comentarios del contenido
    const commentsSnapshot = await db.collection('content_comments')
      .where('contentId', '==', contentId)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();
    
    const comments = commentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return {
      id: contentId,
      ...contentDoc.data(),
      comments
    };
  } catch (error) {
    return handleError(error);
  }
});

/**
 * Función para listar contenido multimedia de un artista
 */
export const listContent = functions.region(region).https.onCall(async (data, context) => {
  try {
    // Validar autenticación
    const uid = await validateAuth(context);
    
    const { artistId, type, projectId, platform, isPublic, tags, limit } = data;
    
    if (!artistId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Se requiere el ID del artista'
      );
    }
    
    // Verificar si el usuario tiene acceso al artista o si solo quiere contenido público
    let hasAccess = false;
    
    try {
      await validatePermission(uid, artistId, 'viewer');
      hasAccess = true;
    } catch (error) {
      // Si no tiene acceso, solo podrá ver contenido público
      if (isPublic !== true) {
        throw new functions.https.HttpsError(
          'permission-denied',
          'No tienes acceso a este artista'
        );
      }
    }
    
    // Construir consulta base
    let query: FirebaseFirestore.Query = db.collection('content')
      .where('artistId', '==', artistId)
      .orderBy('createdAt', 'desc');
    
    // Si no tiene acceso, filtrar solo contenido público
    if (!hasAccess) {
      query = query.where('isPublic', '==', true);
    } else if (isPublic !== undefined) {
      // Si tiene acceso y especifica filtro de público/privado
      query = query.where('isPublic', '==', isPublic);
    }
    
    // Aplicar filtros adicionales si se proporcionan
    if (type) {
      query = query.where('type', '==', type);
    }
    
    if (projectId) {
      query = query.where('projectId', '==', projectId);
    }
    
    if (platform) {
      query = query.where('platform', '==', platform);
    }
    
    // Aplicar límite si se proporciona
    if (limit && typeof limit === 'number') {
      query = query.limit(limit);
    } else {
      query = query.limit(100); // Límite por defecto
    }
    
    const contentSnapshot = await query.get();
    
    // Filtrar por tags si se proporcionan (no se puede hacer en la consulta directamente)
    let content = contentSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    if (tags && Array.isArray(tags) && tags.length > 0) {
      content = content.filter(item => {
        const itemTags = item.tags || [];
        return tags.some(tag => itemTags.includes(tag));
      });
    }
    
    return { content };
  } catch (error) {
    return handleError(error);
  }
});

/**
 * Función para añadir un comentario a un contenido
 */
export const addComment = functions.region(region).https.onCall(async (data, context) => {
  try {
    // Validar autenticación
    const uid = await validateAuth(context);
    
    const { contentId, text } = data;
    
    if (!contentId || !text) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Se requiere ID del contenido y texto del comentario'
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
    const isPublic = contentDoc.data()?.isPublic;
    
    // Verificar permisos: público o con acceso al artista
    if (!isPublic) {
      try {
        await validatePermission(uid, artistId, 'viewer');
      } catch (error) {
        throw new functions.https.HttpsError(
          'permission-denied',
          'No tienes acceso a este contenido'
        );
      }
    }
    
    // Obtener información del usuario
    const userDoc = await db.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Usuario no encontrado'
      );
    }
    
    // Crear comentario
    const commentRef = db.collection('content_comments').doc();
    const commentId = commentRef.id;
    
    await commentRef.set({
      contentId,
      artistId,
      userId: uid,
      text,
      userDisplayName: userDoc.data()?.displayName || 'Usuario',
      userPhotoURL: userDoc.data()?.photoURL || null,
      likes: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Incrementar contador de comentarios
    await db.collection('content').doc(contentId).update({
      comments: admin.firestore.FieldValue.increment(1)
    });
    
    return {
      id: commentId,
      contentId,
      text,
      userDisplayName: userDoc.data()?.displayName || 'Usuario',
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    return handleError(error);
  }
});

/**
 * Función para generar URL firmada para subir contenido
 */
export const getUploadUrl = functions.region(region).https.onCall(async (data, context) => {
  try {
    // Validar autenticación
    const uid = await validateAuth(context);
    
    const { artistId, fileName, contentType } = data;
    
    if (!artistId || !fileName || !contentType) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Se requieren ID del artista, nombre de archivo y tipo de contenido'
      );
    }
    
    // Validar permisos (requiere rol de editor o superior)
    await validatePermission(uid, artistId, 'editor');
    
    // Generar ruta segura para el archivo
    const filePath = `artists/${artistId}/content/${Date.now()}_${fileName}`;
    const bucket = storage.bucket();
    const file = bucket.file(filePath);
    
    // Generar URL firmada para subir
    const [uploadUrl] = await file.getSignedUrl({
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutos
      contentType
    });
    
    // Generar URL pública para acceder después
    const [downloadUrl] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 365 * 24 * 60 * 60 * 1000 // 1 año
    });
    
    return {
      uploadUrl,
      downloadUrl,
      filePath
    };
  } catch (error) {
    return handleError(error);
  }
});

/**
 * Función para publicar contenido en plataformas sociales
 */
export const publishToSocial = functions.region(region).https.onCall(async (data, context) => {
  try {
    // Validar autenticación
    const uid = await validateAuth(context);
    
    const { contentId, platforms } = data;
    
    if (!contentId || !platforms || !Array.isArray(platforms) || platforms.length === 0) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Se requiere ID del contenido y plataformas de destino'
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
    
    // Verificar integraciones del artista
    const integrationsSnapshot = await db.collection('integrations')
      .where('artistId', '==', artistId)
      .where('platform', 'in', platforms)
      .where('status', '==', 'active')
      .get();
    
    if (integrationsSnapshot.empty) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'No hay integraciones activas para las plataformas seleccionadas'
      );
    }
    
    const integrations = integrationsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Registrar publicaciones en Firestore
    const batch = db.batch();
    const results: any = {};
    
    integrations.forEach(integration => {
      const platform = integration.platform;
      const publishRef = db.collection('content_publications').doc();
      
      batch.set(publishRef, {
        contentId,
        artistId,
        platform,
        integrationId: integration.id,
        status: 'pending',
        createdBy: uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        publishedAt: null,
        externalId: null,
        externalUrl: null,
        error: null
      });
      
      results[platform] = {
        status: 'pending',
        publicationId: publishRef.id
      };
    });
    
    await batch.commit();
    
    // Actualizar contenido para marcarlo como publicado
    await db.collection('content').doc(contentId).update({
      isPublic: true,
      publishedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Aquí se dispararía un proceso asincrónico para publicar en cada plataforma
    // En una implementación real, esto se haría con Cloud Tasks o Pub/Sub
    
    return {
      success: true,
      platforms: results
    };
  } catch (error) {
    return handleError(error);
  }
});
