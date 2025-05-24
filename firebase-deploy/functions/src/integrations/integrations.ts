import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

// Interfaces para tipado
interface IntegrationData {
  platform: string;
  userId: string;
  artistId?: string | null;
  status: string;
  credentials: Record<string, any>;
  createdAt: any;
  updatedAt: any;
}

interface SyncTaskData {
  integrationId: string;
  platform: string;
  dataType: string;
  status: string;
  userId: string;
  artistId?: string | null;
  createdAt: any;
  updatedAt: any;
  results?: Record<string, any>;
}

// Exportar funciones de integraciones
export const connectPlatform = functions.https.onCall(async (data, context) => {
  // Verificar autenticación
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Se requiere autenticación para esta operación'
    );
  }

  try {
    const { platform, credentials, artistId } = data;
    const userId = context.auth.uid;

    // Validar datos requeridos
    if (!platform) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Se requiere especificar la plataforma'
      );
    }

    // Verificar permisos si se especifica un artista
    if (artistId) {
      const artistDoc = await admin.firestore().collection('artists').doc(artistId).get();
      
      if (!artistDoc.exists) {
        throw new functions.https.HttpsError(
          'not-found',
          'El artista no existe'
        );
      }

      const artistData = artistDoc.data();
      
      if (!artistData?.managers.includes(userId)) {
        throw new functions.https.HttpsError(
          'permission-denied',
          'No tienes permisos para gestionar este artista'
        );
      }
    }

    // Crear documento de integración en Firestore
    const integrationRef = admin.firestore().collection('integrations').doc();
    
    const integrationData: IntegrationData = {
      platform,
      userId,
      artistId: artistId || null,
      status: 'connected',
      credentials: credentials || {},
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await integrationRef.set(integrationData);

    return {
      success: true,
      integrationId: integrationRef.id,
      message: `Integración con ${platform} configurada correctamente`
    };
  } catch (error: any) {
    console.error('Error al conectar plataforma:', error);
    throw new functions.https.HttpsError('internal', error.message || 'Error desconocido');
  }
});

// Obtener integraciones del usuario
export const getUserIntegrations = functions.https.onCall(async (data, context) => {
  // Verificar autenticación
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Se requiere autenticación para esta operación'
    );
  }

  try {
    const { artistId } = data;
    const userId = context.auth.uid;

    let query = admin.firestore().collection('integrations').where('userId', '==', userId);
    
    if (artistId) {
      query = query.where('artistId', '==', artistId);
    }
    
    const integrationsSnapshot = await query.get();
    
    const integrations = integrationsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Eliminar credenciales sensibles
      credentials: { connected: true }
    }));

    return {
      success: true,
      integrations
    };
  } catch (error: any) {
    console.error('Error al obtener integraciones:', error);
    throw new functions.https.HttpsError('internal', error.message || 'Error desconocido');
  }
});

// Desconectar plataforma
export const disconnectPlatform = functions.https.onCall(async (data, context) => {
  // Verificar autenticación
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Se requiere autenticación para esta operación'
    );
  }

  try {
    const { integrationId } = data;
    const userId = context.auth.uid;

    // Validar datos requeridos
    if (!integrationId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Se requiere el ID de la integración'
      );
    }

    // Verificar permisos
    const integrationDoc = await admin.firestore().collection('integrations').doc(integrationId).get();
    
    if (!integrationDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'La integración no existe'
      );
    }

    const integrationData = integrationDoc.data() as IntegrationData;
    
    if (integrationData.userId !== userId) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'No tienes permisos para gestionar esta integración'
      );
    }

    // Actualizar estado de la integración
    await admin.firestore().collection('integrations').doc(integrationId).update({
      status: 'disconnected',
      disconnectedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return {
      success: true,
      message: `Integración con ${integrationData.platform} desconectada correctamente`
    };
  } catch (error: any) {
    console.error('Error al desconectar plataforma:', error);
    throw new functions.https.HttpsError('internal', error.message || 'Error desconocido');
  }
});

// Sincronizar datos con plataforma
export const syncPlatformData = functions.https.onCall(async (data, context) => {
  // Verificar autenticación
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Se requiere autenticación para esta operación'
    );
  }

  try {
    const { integrationId, dataType } = data;
    const userId = context.auth.uid;

    // Validar datos requeridos
    if (!integrationId || !dataType) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Se requieren ID de integración y tipo de datos'
      );
    }

    // Verificar permisos
    const integrationDoc = await admin.firestore().collection('integrations').doc(integrationId).get();
    
    if (!integrationDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'La integración no existe'
      );
    }

    const integrationData = integrationDoc.data() as IntegrationData;
    
    if (integrationData.userId !== userId) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'No tienes permisos para gestionar esta integración'
      );
    }

    // Verificar estado de la integración
    if (integrationData.status !== 'connected') {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'La integración no está conectada'
      );
    }

    // Crear tarea de sincronización
    const syncTaskRef = admin.firestore().collection('sync_tasks').doc();
    
    const syncTaskData: SyncTaskData = {
      integrationId,
      platform: integrationData.platform,
      dataType,
      status: 'pending',
      userId,
      artistId: integrationData.artistId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await syncTaskRef.set(syncTaskData);

    // Aquí iría la lógica real de sincronización con la plataforma
    // Por ahora, simulamos una sincronización exitosa

    // Actualizar estado de la tarea
    await syncTaskRef.update({
      status: 'completed',
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      results: {
        itemsProcessed: 42,
        itemsCreated: 15,
        itemsUpdated: 27,
        itemsSkipped: 0
      }
    });

    return {
      success: true,
      taskId: syncTaskRef.id,
      message: `Sincronización de ${dataType} con ${integrationData.platform} completada correctamente`
    };
  } catch (error: any) {
    console.error('Error al sincronizar datos:', error);
    throw new functions.https.HttpsError('internal', error.message || 'Error desconocido');
  }
});

// Configurar webhook para plataforma
export const configurePlatformWebhook = functions.https.onCall(async (data, context) => {
  // Verificar autenticación
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Se requiere autenticación para esta operación'
    );
  }

  try {
    const { integrationId, webhookUrl, events } = data;
    const userId = context.auth.uid;

    // Validar datos requeridos
    if (!integrationId || !webhookUrl || !events) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Se requieren ID de integración, URL de webhook y eventos'
      );
    }

    // Verificar permisos
    const integrationDoc = await admin.firestore().collection('integrations').doc(integrationId).get();
    
    if (!integrationDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'La integración no existe'
      );
    }

    const integrationData = integrationDoc.data() as IntegrationData;
    
    if (integrationData.userId !== userId) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'No tienes permisos para gestionar esta integración'
      );
    }

    // Verificar estado de la integración
    if (integrationData.status !== 'connected') {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'La integración no está conectada'
      );
    }

    // Actualizar configuración de webhook
    await admin.firestore().collection('integrations').doc(integrationId).update({
      webhook: {
        url: webhookUrl,
        events,
        enabled: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      },
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return {
      success: true,
      message: `Webhook configurado correctamente para ${integrationData.platform}`
    };
  } catch (error: any) {
    console.error('Error al configurar webhook:', error);
    throw new functions.https.HttpsError('internal', error.message || 'Error desconocido');
  }
});

// Procesar webhook entrante
export const processIncomingWebhook = functions.https.onRequest(async (req, res) => {
  try {
    const { platform, event, data, signature } = req.body;
    
    // Validar datos requeridos
    if (!platform || !event || !data) {
      res.status(400).send({ error: 'Datos incompletos' });
      return;
    }
    
    // Aquí iría la lógica de verificación de firma
    // Por simplicidad, omitimos esta parte
    
    // Registrar evento de webhook
    const webhookEventRef = admin.firestore().collection('webhook_events').doc();
    
    await webhookEventRef.set({
      platform,
      event,
      data,
      signature,
      processedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'received'
    });
    
    // Procesar evento según plataforma y tipo
    let processingResult;
    
    switch (platform) {
      case 'spotify':
        processingResult = await processSpotifyEvent(event, data);
        break;
        
      case 'youtube':
        processingResult = await processYouTubeEvent(event, data);
        break;
        
      case 'instagram':
        processingResult = await processInstagramEvent(event, data);
        break;
        
      default:
        processingResult = { status: 'unsupported_platform' };
    }
    
    // Actualizar registro de evento con resultado
    await webhookEventRef.update({
      processingResult,
      status: 'processed',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.status(200).send({ success: true });
    return;
  } catch (error: any) {
    console.error('Error al procesar webhook:', error);
    res.status(500).send({ error: error.message || 'Error desconocido' });
    return;
  }
});

// Funciones auxiliares para procesar eventos de plataformas
async function processSpotifyEvent(event: string, data: any): Promise<Record<string, any>> {
  // Simulación de procesamiento de evento de Spotify
  return { status: 'processed', platform: 'spotify', event };
}

async function processYouTubeEvent(event: string, data: any): Promise<Record<string, any>> {
  // Simulación de procesamiento de evento de YouTube
  return { status: 'processed', platform: 'youtube', event };
}

async function processInstagramEvent(event: string, data: any): Promise<Record<string, any>> {
  // Simulación de procesamiento de evento de Instagram
  return { status: 'processed', platform: 'instagram', event };
}
