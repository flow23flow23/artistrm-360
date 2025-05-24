import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { db, handleError, region, validateAuth, validatePermission } from '../utils/admin';

/**
 * Función para procesar consulta de texto para Zeus
 */
export const processTextQuery = functions.region(region).https.onCall(async (data, context) => {
  try {
    // Validar autenticación
    const uid = await validateAuth(context);
    
    const { 
      artistId, 
      query, 
      conversationId,
      contextData
    } = data;
    
    // Validar datos de entrada
    if (!artistId || !query) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Se requiere ID del artista y consulta de texto'
      );
    }
    
    // Validar permisos (requiere rol de viewer o superior)
    await validatePermission(uid, artistId, 'viewer');
    
    // Obtener o crear conversación
    let conversationRef;
    
    if (conversationId) {
      conversationRef = db.collection('zeus_conversations').doc(conversationId);
      const conversationDoc = await conversationRef.get();
      
      if (!conversationDoc.exists) {
        throw new functions.https.HttpsError(
          'not-found',
          'Conversación no encontrada'
        );
      }
      
      // Verificar que la conversación pertenece al artista y usuario correctos
      if (conversationDoc.data()?.artistId !== artistId || conversationDoc.data()?.userId !== uid) {
        throw new functions.https.HttpsError(
          'permission-denied',
          'No tienes acceso a esta conversación'
        );
      }
    } else {
      // Crear nueva conversación
      conversationRef = db.collection('zeus_conversations').doc();
      
      await conversationRef.set({
        artistId,
        userId: uid,
        title: query.substring(0, 50) + (query.length > 50 ? '...' : ''),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        messageCount: 0
      });
    }
    
    // Crear mensaje del usuario
    const userMessageRef = db.collection('zeus_messages').doc();
    
    await userMessageRef.set({
      conversationId: conversationRef.id,
      artistId,
      userId: uid,
      role: 'user',
      content: query,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Incrementar contador de mensajes
    await conversationRef.update({
      messageCount: admin.firestore.FieldValue.increment(1),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Obtener contexto del artista para personalizar respuestas
    const artistDoc = await db.collection('artists').doc(artistId).get();
    
    if (!artistDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Artista no encontrado'
      );
    }
    
    const artistName = artistDoc.data()?.name || 'el artista';
    
    // Obtener historial de mensajes para contexto (últimos 10)
    let messageHistory = [];
    
    if (conversationId) {
      const messagesSnapshot = await db.collection('zeus_messages')
        .where('conversationId', '==', conversationRef.id)
        .orderBy('timestamp', 'desc')
        .limit(10)
        .get();
      
      messageHistory = messagesSnapshot.docs
        .map(doc => ({
          role: doc.data().role,
          content: doc.data().content
        }))
        .reverse();
    }
    
    // Preparar contexto adicional si se proporciona
    let additionalContext = '';
    
    if (contextData) {
      if (contextData.projectId) {
        const projectDoc = await db.collection('projects').doc(contextData.projectId).get();
        if (projectDoc.exists) {
          additionalContext += `Información del proyecto: ${projectDoc.data()?.title}. `;
          additionalContext += `Estado: ${projectDoc.data()?.status}. `;
          additionalContext += `Descripción: ${projectDoc.data()?.description}. `;
        }
      }
      
      if (contextData.contentId) {
        const contentDoc = await db.collection('content').doc(contextData.contentId).get();
        if (contentDoc.exists) {
          additionalContext += `Información del contenido: ${contentDoc.data()?.title}. `;
          additionalContext += `Tipo: ${contentDoc.data()?.type}. `;
          additionalContext += `Descripción: ${contentDoc.data()?.description}. `;
        }
      }
    }
    
    // En una implementación real, aquí se llamaría a Vertex AI para procesar la consulta
    // Para esta implementación, generamos una respuesta simulada
    
    // Analizar la consulta para determinar la intención
    const lowerQuery = query.toLowerCase();
    let response = '';
    
    if (lowerQuery.includes('proyecto') || lowerQuery.includes('proyectos')) {
      // Consulta sobre proyectos
      const projectsSnapshot = await db.collection('projects')
        .where('artistId', '==', artistId)
        .orderBy('updatedAt', 'desc')
        .limit(3)
        .get();
      
      if (projectsSnapshot.empty) {
        response = `No hay proyectos activos para ${artistName} en este momento. ¿Te gustaría crear uno nuevo?`;
      } else {
        response = `Estos son los proyectos más recientes de ${artistName}:\n\n`;
        
        projectsSnapshot.forEach(doc => {
          const project = doc.data();
          response += `- ${project.title}: ${project.status}, ${project.completionPercentage}% completado\n`;
        });
        
        response += `\n¿Necesitas más información sobre alguno de estos proyectos?`;
      }
    } else if (lowerQuery.includes('contenido') || lowerQuery.includes('video') || lowerQuery.includes('foto')) {
      // Consulta sobre contenido multimedia
      const contentSnapshot = await db.collection('content')
        .where('artistId', '==', artistId)
        .orderBy('createdAt', 'desc')
        .limit(3)
        .get();
      
      if (contentSnapshot.empty) {
        response = `No hay contenido multimedia para ${artistName} en este momento. ¿Te gustaría subir algo nuevo?`;
      } else {
        response = `Este es el contenido más reciente de ${artistName}:\n\n`;
        
        contentSnapshot.forEach(doc => {
          const content = doc.data();
          response += `- ${content.title} (${content.type}): ${content.views} vistas\n`;
        });
        
        response += `\n¿Quieres ver más detalles sobre alguno de estos elementos?`;
      }
    } else if (lowerQuery.includes('estadística') || lowerQuery.includes('analytic') || lowerQuery.includes('rendimiento')) {
      // Consulta sobre analytics
      response = `Aquí tienes un resumen del rendimiento de ${artistName}:\n\n`;
      response += `- Seguidores totales: 12,345 (+5% esta semana)\n`;
      response += `- Vistas de contenido: 45,678 en los últimos 30 días\n`;
      response += `- Engagement promedio: 8.7%\n\n`;
      response += `¿Te gustaría ver estadísticas más detalladas sobre alguna plataforma específica?`;
    } else if (lowerQuery.includes('evento') || lowerQuery.includes('concierto') || lowerQuery.includes('gira')) {
      // Consulta sobre eventos
      const eventsSnapshot = await db.collection('events')
        .where('artistId', '==', artistId)
        .where('startDate', '>=', admin.firestore.Timestamp.now())
        .orderBy('startDate', 'asc')
        .limit(3)
        .get();
      
      if (eventsSnapshot.empty) {
        response = `No hay eventos próximos programados para ${artistName}. ¿Quieres crear uno nuevo?`;
      } else {
        response = `Estos son los próximos eventos de ${artistName}:\n\n`;
        
        eventsSnapshot.forEach(doc => {
          const event = doc.data();
          const date = event.startDate.toDate().toLocaleDateString();
          response += `- ${event.title}: ${date}, ${event.location}\n`;
        });
        
        response += `\n¿Necesitas más detalles sobre alguno de estos eventos?`;
      }
    } else if (lowerQuery.includes('ayuda') || lowerQuery.includes('puedes hacer')) {
      // Consulta sobre capacidades
      response = `Hola, soy Zeus, tu asistente para gestionar la carrera de ${artistName}. Puedo ayudarte con:\n\n`;
      response += `- Información sobre proyectos y su estado\n`;
      response += `- Gestión de contenido multimedia\n`;
      response += `- Análisis de rendimiento y estadísticas\n`;
      response += `- Programación y detalles de eventos\n`;
      response += `- Recomendaciones personalizadas\n\n`;
      response += `¿En qué puedo ayudarte hoy?`;
    } else {
      // Respuesta genérica
      response = `Gracias por tu consulta sobre "${query}". Como asistente de ${artistName}, estoy aquí para ayudarte con la gestión de proyectos, contenido, eventos y análisis de rendimiento. ¿Podrías proporcionar más detalles sobre lo que necesitas?`;
    }
    
    // Si hay contexto adicional, personalizar la respuesta
    if (additionalContext) {
      response += `\n\nBasado en el contexto proporcionado: ${additionalContext}`;
    }
    
    // Crear mensaje de respuesta
    const assistantMessageRef = db.collection('zeus_messages').doc();
    
    await assistantMessageRef.set({
      conversationId: conversationRef.id,
      artistId,
      userId: uid,
      role: 'assistant',
      content: response,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Incrementar contador de mensajes
    await conversationRef.update({
      messageCount: admin.firestore.FieldValue.increment(1),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Registrar interacción en analytics
    const analyticsRef = db.collection('analytics_events').doc();
    
    await analyticsRef.set({
      artistId,
      eventType: 'zeus_interaction',
      eventSource: 'text',
      eventData: {
        query,
        conversationId: conversationRef.id
      },
      userId: uid,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      date: new Date().toISOString().split('T')[0]
    });
    
    return {
      conversationId: conversationRef.id,
      response,
      messageId: assistantMessageRef.id
    };
  } catch (error) {
    return handleError(error);
  }
});

/**
 * Función para procesar consulta de voz para Zeus
 */
export const processVoiceQuery = functions.region(region).https.onCall(async (data, context) => {
  try {
    // Validar autenticación
    const uid = await validateAuth(context);
    
    const { 
      artistId, 
      audioUrl, 
      conversationId,
      contextData
    } = data;
    
    // Validar datos de entrada
    if (!artistId || !audioUrl) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Se requiere ID del artista y URL del audio'
      );
    }
    
    // Validar permisos (requiere rol de viewer o superior)
    await validatePermission(uid, artistId, 'viewer');
    
    // En una implementación real, aquí se llamaría a Cloud Speech-to-Text para transcribir el audio
    // Para esta implementación, simulamos una transcripción
    
    // Simular transcripción basada en la URL del audio
    const transcription = "¿Cuáles son mis próximos eventos?";
    
    // Procesar la transcripción como una consulta de texto
    const textQueryResult = await processTextQuery({
      artistId,
      query: transcription,
      conversationId,
      contextData
    }, context);
    
    // En una implementación real, aquí se llamaría a Cloud Text-to-Speech para generar audio de respuesta
    // Para esta implementación, simulamos una URL de audio
    const responseAudioUrl = `https://storage.googleapis.com/zamx-v1.appspot.com/zeus/responses/${textQueryResult.messageId}.mp3`;
    
    return {
      ...textQueryResult,
      transcription,
      responseAudioUrl
    };
  } catch (error) {
    return handleError(error);
  }
});

/**
 * Función para obtener conversaciones de Zeus
 */
export const getConversations = functions.region(region).https.onCall(async (data, context) => {
  try {
    // Validar autenticación
    const uid = await validateAuth(context);
    
    const { artistId, limit } = data;
    
    if (!artistId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Se requiere ID del artista'
      );
    }
    
    // Validar permisos (requiere rol de viewer o superior)
    await validatePermission(uid, artistId, 'viewer');
    
    // Obtener conversaciones
    let query = db.collection('zeus_conversations')
      .where('artistId', '==', artistId)
      .where('userId', '==', uid)
      .orderBy('updatedAt', 'desc');
    
    if (limit && typeof limit === 'number') {
      query = query.limit(limit);
    } else {
      query = query.limit(20); // Límite por defecto
    }
    
    const conversationsSnapshot = await query.get();
    
    const conversations = conversationsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { conversations };
  } catch (error) {
    return handleError(error);
  }
});

/**
 * Función para obtener mensajes de una conversación
 */
export const getConversationMessages = functions.region(region).https.onCall(async (data, context) => {
  try {
    // Validar autenticación
    const uid = await validateAuth(context);
    
    const { conversationId, limit } = data;
    
    if (!conversationId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Se requiere ID de la conversación'
      );
    }
    
    // Obtener conversación
    const conversationDoc = await db.collection('zeus_conversations').doc(conversationId).get();
    
    if (!conversationDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Conversación no encontrada'
      );
    }
    
    const artistId = conversationDoc.data()?.artistId;
    
    // Verificar que la conversación pertenece al usuario
    if (conversationDoc.data()?.userId !== uid) {
      // Validar permisos (requiere rol de admin o superior para ver conversaciones de otros)
      await validatePermission(uid, artistId, 'admin');
    }
    
    // Obtener mensajes
    let query = db.collection('zeus_messages')
      .where('conversationId', '==', conversationId)
      .orderBy('timestamp', 'asc');
    
    if (limit && typeof limit === 'number') {
      query = query.limit(limit);
    }
    
    const messagesSnapshot = await query.get();
    
    const messages = messagesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return {
      conversation: {
        id: conversationId,
        ...conversationDoc.data()
      },
      messages
    };
  } catch (error) {
    return handleError(error);
  }
});

/**
 * Función para obtener recomendaciones personalizadas
 */
export const getRecommendations = functions.region(region).https.onCall(async (data, context) => {
  try {
    // Validar autenticación
    const uid = await validateAuth(context);
    
    const { artistId, type } = data;
    
    if (!artistId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Se requiere ID del artista'
      );
    }
    
    // Validar permisos (requiere rol de viewer o superior)
    await validatePermission(uid, artistId, 'viewer');
    
    // En una implementación real, aquí se llamaría a Vertex AI para generar recomendaciones
    // Para esta implementación, generamos recomendaciones simuladas
    
    let recommendations = [];
    
    switch (type) {
      case 'content':
        // Recomendaciones de contenido
        recommendations = [
          {
            title: 'Crear video behind-the-scenes',
            description: 'Los videos detrás de cámaras tienen un 40% más de engagement que el contenido regular.',
            priority: 'high',
            actionType: 'create_content',
            actionParams: {
              type: 'video',
              tags: ['behind-the-scenes']
            }
          },
          {
            title: 'Publicar más contenido en Instagram',
            description: 'Tu audiencia en Instagram ha crecido un 15% en el último mes.',
            priority: 'medium',
            actionType: 'platform_focus',
            actionParams: {
              platform: 'instagram'
            }
          },
          {
            title: 'Crear serie de contenido temático',
            description: 'Las series de contenido aumentan la retención de audiencia en un 25%.',
            priority: 'medium',
            actionType: 'content_series',
            actionParams: {
              suggestedThemes: ['día en la vida', 'proceso creativo', 'preguntas y respuestas']
            }
          }
        ];
        break;
        
      case 'projects':
        // Recomendaciones de proyectos
        recommendations = [
          {
            title: 'Finalizar proyecto pendiente',
            description: 'Tienes un proyecto al 80% de completado. Finalizarlo aumentaría tu productividad visible.',
            priority: 'high',
            actionType: 'complete_project',
            actionParams: {
              projectId: 'project123' // En una implementación real, sería un ID real
            }
          },
          {
            title: 'Iniciar proyecto de colaboración',
            description: 'Las colaboraciones aumentan tu alcance en un 35% en promedio.',
            priority: 'medium',
            actionType: 'new_project',
            actionParams: {
              type: 'collaboration',
              suggestedArtists: ['Artist1', 'Artist2', 'Artist3']
            }
          },
          {
            title: 'Planificar gira promocional',
            description: 'Es el momento ideal para una gira según tus lanzamientos recientes.',
            priority: 'medium',
            actionType: 'new_project',
            actionParams: {
              type: 'tour',
              suggestedLocations: ['Ciudad1', 'Ciudad2', 'Ciudad3']
            }
          }
        ];
        break;
        
      case 'marketing':
        // Recomendaciones de marketing
        recommendations = [
          {
            title: 'Aumentar presencia en TikTok',
            description: 'TikTok es la plataforma con mayor crecimiento para tu demografía objetivo.',
            priority: 'high',
            actionType: 'platform_focus',
            actionParams: {
              platform: 'tiktok',
              contentTypes: ['trends', 'challenges', 'behind-the-scenes']
            }
          },
          {
            title: 'Campaña de email marketing',
            description: 'No has enviado comunicación a tu base de fans en los últimos 2 meses.',
            priority: 'medium',
            actionType: 'email_campaign',
            actionParams: {
              suggestedTopics: ['Nuevo lanzamiento', 'Actualización de gira', 'Contenido exclusivo']
            }
          },
          {
            title: 'Colaboración con influencers',
            description: 'Las colaboraciones con influencers pueden aumentar tu alcance en un 50%.',
            priority: 'medium',
            actionType: 'influencer_collab',
            actionParams: {
              suggestedInfluencers: ['Influencer1', 'Influencer2', 'Influencer3']
            }
          }
        ];
        break;
        
      default:
        // Recomendaciones generales
        recommendations = [
          {
            title: 'Actualizar perfil en plataformas',
            description: 'Tu perfil en algunas plataformas no se ha actualizado en los últimos 3 meses.',
            priority: 'medium',
            actionType: 'update_profiles',
            actionParams: {
              platforms: ['Spotify', 'YouTube', 'Instagram']
            }
          },
          {
            title: 'Revisar analytics semanalmente',
            description: 'Los artistas que revisan sus analytics regularmente tienen un 30% más de crecimiento.',
            priority: 'medium',
            actionType: 'analytics_review',
            actionParams: {
              suggestedMetrics: ['engagement', 'audience growth', 'content performance']
            }
          },
          {
            title: 'Programar sesiones de creación de contenido',
            description: 'Crear contenido en lotes aumenta la eficiencia y consistencia.',
            priority: 'medium',
            actionType: 'content_planning',
            actionParams: {
              suggestedFrequency: 'bi-weekly'
            }
          }
        ];
    }
    
    // Registrar solicitud de recomendaciones en analytics
    const analyticsRef = db.collection('analytics_events').doc();
    
    await analyticsRef.set({
      artistId,
      eventType: 'recommendation_request',
      eventSource: 'zeus',
      eventData: {
        type: type || 'general'
      },
      userId: uid,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      date: new Date().toISOString().split('T')[0]
    });
    
    return { recommendations };
  } catch (error) {
    return handleError(error);
  }
});
