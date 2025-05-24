import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

// Interfaces para tipado
interface ZeusPreferences {
  voiceEnabled: boolean;
  language: string;
  notificationsEnabled: boolean;
  theme: string;
  customPrompts?: Record<string, string>;
  userId: string;
  createdAt: any;
  updatedAt: any;
}

interface UserContext {
  user?: {
    displayName?: string;
    role?: string;
    preferences?: Record<string, any>;
  };
  artists?: Array<{
    id: string;
    name: string;
    genre?: string;
    followers?: number;
  }>;
  projects?: Array<{
    id: string;
    name: string;
    type?: string;
    status?: string;
  }>;
  recentActivity?: Array<{
    type: string;
    description: string;
    timestamp: any;
  }>;
}

// Exportar funciones de Zeus
export const processZeusQuery = functions.https.onCall(async (data, context) => {
  // Verificar autenticación
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Se requiere autenticación para esta operación'
    );
  }

  try {
    const { query } = data;
    const userId = context.auth.uid;

    // Validar datos requeridos
    if (!query) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Se requiere una consulta'
      );
    }

    // Obtener contexto del usuario
    const userContext = await getUserContext(userId);
    
    // Generar respuesta
    const response = generateZeusResponse(query, userContext);
    
    // Guardar conversación
    let newConversationId = data.conversationId;
    
    if (!newConversationId) {
      // Crear nueva conversación
      const conversationRef = admin.firestore().collection('zeus_conversations').doc();
      newConversationId = conversationRef.id;
      
      await conversationRef.set({
        userId,
        title: generateConversationTitle(query),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        messages: [
          {
            role: 'user',
            content: query,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
          },
          {
            role: 'assistant',
            content: response,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
          }
        ]
      });
    } else {
      // Actualizar conversación existente
      await admin.firestore().collection('zeus_conversations').doc(newConversationId).update({
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        messages: admin.firestore.FieldValue.arrayUnion(
          {
            role: 'user',
            content: query,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
          },
          {
            role: 'assistant',
            content: response,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
          }
        )
      });
    }
    
    // Extraer acciones recomendadas
    const recommendedActions = extractRecommendedActions(response);

    return {
      success: true,
      response,
      conversationId: newConversationId,
      recommendedActions
    };
  } catch (error: any) {
    console.error('Error al procesar consulta de Zeus:', error);
    throw new functions.https.HttpsError('internal', error.message || 'Error desconocido');
  }
});

// Ejecutar acción de Zeus
export const executeZeusAction = functions.https.onCall(async (data, context) => {
  // Verificar autenticación
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Se requiere autenticación para esta operación'
    );
  }

  try {
    const { action, parameters } = data;
    const userId = context.auth.uid;

    // Validar datos requeridos
    if (!action) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Se requiere una acción'
      );
    }

    // Ejecutar acción según tipo
    let result;
    
    switch (action) {
      case 'createProject':
        result = await createProject(userId, parameters);
        break;
        
      case 'scheduleEvent':
        result = await scheduleEvent(userId, parameters);
        break;
        
      case 'generateReport':
        result = await generateReport(userId, parameters);
        break;
        
      case 'sendReminder':
        result = await sendReminder(userId, parameters);
        break;
        
      default:
        throw new functions.https.HttpsError(
          'invalid-argument',
          'Acción no soportada'
        );
    }

    return {
      success: true,
      result
    };
  } catch (error: any) {
    console.error('Error al ejecutar acción de Zeus:', error);
    throw new functions.https.HttpsError('internal', error.message || 'Error desconocido');
  }
});

// Obtener preferencias de Zeus
export const getZeusPreferences = functions.https.onCall(async (data, context) => {
  // Verificar autenticación
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Se requiere autenticación para esta operación'
    );
  }

  try {
    const userId = context.auth.uid;
    
    // Obtener preferencias
    const preferencesDoc = await admin.firestore().collection('zeus_preferences').doc(userId).get();
    
    if (!preferencesDoc.exists) {
      // Crear preferencias por defecto
      const defaultPreferences: ZeusPreferences = {
        voiceEnabled: true,
        language: 'es',
        notificationsEnabled: true,
        theme: 'dark',
        userId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      await admin.firestore().collection('zeus_preferences').doc(userId).set(defaultPreferences);
      
      return {
        success: true,
        preferences: defaultPreferences
      };
    }
    
    return {
      success: true,
      preferences: preferencesDoc.data()
    };
  } catch (error: any) {
    console.error('Error al obtener preferencias de Zeus:', error);
    throw new functions.https.HttpsError('internal', error.message || 'Error desconocido');
  }
});

// Actualizar preferencias de Zeus
export const updateZeusPreferences = functions.https.onCall(async (data, context) => {
  // Verificar autenticación
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Se requiere autenticación para esta operación'
    );
  }

  try {
    const { preferences } = data;
    const userId = context.auth.uid;

    // Validar datos requeridos
    if (!preferences) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Se requieren preferencias'
      );
    }

    // Actualizar preferencias
    await admin.firestore().collection('zeus_preferences').doc(userId).update({
      ...preferences,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return {
      success: true,
      message: 'Preferencias actualizadas correctamente'
    };
  } catch (error: any) {
    console.error('Error al actualizar preferencias de Zeus:', error);
    throw new functions.https.HttpsError('internal', error.message || 'Error desconocido');
  }
});

// Funciones auxiliares
async function getUserContext(userId: string): Promise<UserContext> {
  // Obtener datos del usuario
  const userDoc = await admin.firestore().collection('users').doc(userId).get();
  
  if (!userDoc.exists) {
    throw new Error('Usuario no encontrado');
  }
  
  const userData = userDoc.data();
  
  // Obtener artistas gestionados por el usuario
  const artistsSnapshot = await admin.firestore().collection('artists')
    .where('managers', 'array-contains', userId)
    .get();
  
  const artists = artistsSnapshot.docs.map(doc => ({
    id: doc.id,
    name: doc.data().name || 'Sin nombre',
    genre: doc.data().genre,
    followers: doc.data().followers
  }));
  
  // Obtener proyectos del usuario
  const projectsSnapshot = await admin.firestore().collection('projects')
    .where('members', 'array-contains', userId)
    .get();
  
  const projects = projectsSnapshot.docs.map(doc => ({
    id: doc.id,
    name: doc.data().name || 'Sin nombre',
    type: doc.data().type,
    status: doc.data().status
  }));
  
  // Obtener actividad reciente
  const activitySnapshot = await admin.firestore().collection('user_activity')
    .where('userId', '==', userId)
    .orderBy('timestamp', 'desc')
    .limit(5)
    .get();
  
  const recentActivity = activitySnapshot.docs.map(doc => ({
    type: doc.data().type || 'actividad',
    description: doc.data().description || 'Sin descripción',
    timestamp: doc.data().timestamp
  }));
  
  return {
    user: {
      displayName: userData?.displayName,
      role: userData?.role,
      preferences: userData?.preferences
    },
    artists,
    projects,
    recentActivity
  };
}

function generateZeusResponse(query: string, userContext: UserContext): string {
  // En un entorno real, aquí se enviaría el prompt a un modelo de lenguaje como GPT-4
  // Por ahora, generamos respuestas simuladas según el tipo de consulta
  
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('proyecto') && lowerQuery.includes('crear')) {
    return `Puedo ayudarte a crear un nuevo proyecto. Para ello, necesitaré algunos detalles:\n\n1. Nombre del proyecto\n2. Tipo de proyecto (álbum, single, gira, etc.)\n3. Fecha de inicio\n4. Artistas involucrados\n\nPuedes proporcionarme esta información o puedo guiarte paso a paso. También puedo crear el proyecto directamente si me indicas "Crear proyecto [nombre] de tipo [tipo]".`;
  }
  
  if (lowerQuery.includes('analítica') || lowerQuery.includes('estadística') || lowerQuery.includes('reporte')) {
    return `Basado en los datos disponibles, puedo generar varios tipos de reportes analíticos:\n\n1. Rendimiento en plataformas de streaming\n2. Engagement en redes sociales\n3. Análisis de audiencia\n4. Proyecciones de ingresos\n\nPuedo generar cualquiera de estos reportes para los artistas que gestionas. ¿Cuál te interesa?`;
  }
  
  if (lowerQuery.includes('recordatorio') || lowerQuery.includes('agenda')) {
    return `Puedo configurar recordatorios para eventos importantes. Actualmente tienes los siguientes eventos próximos:\n\n1. Reunión con distribuidora - 25/05/2025\n2. Entrega de master - 30/05/2025\n3. Lanzamiento de single - 15/06/2025\n\n¿Quieres que configure un nuevo recordatorio o que te muestre más detalles de alguno existente?`;
  }
  
  // Respuesta genérica personalizada con el contexto
  const artistNames = userContext.artists?.map(artist => artist.name).join(', ') || "tus artistas";
  
  return `Estoy aquí para ayudarte con la gestión de ${artistNames}. Puedo asistirte con la creación de proyectos, generación de reportes analíticos, configuración de recordatorios, y mucho más. ¿En qué puedo ayudarte específicamente hoy?`;
}

function generateConversationTitle(query: string): string {
  // Generar título basado en la consulta
  return query.length > 30 ? query.substring(0, 30) + '...' : query;
}

function extractRecommendedActions(response: string): Array<{type: string, description: string}> {
  // En un entorno real, esto analizaría la respuesta para extraer acciones recomendadas
  // Por ahora, devolvemos acciones simuladas
  
  if (response.includes('crear un nuevo proyecto')) {
    return [
      { type: 'createProject', description: 'Crear nuevo proyecto' }
    ];
  }
  
  if (response.includes('generar varios tipos de reportes')) {
    return [
      { type: 'generateReport', description: 'Generar reporte analítico' }
    ];
  }
  
  if (response.includes('configurar recordatorios')) {
    return [
      { type: 'scheduleEvent', description: 'Configurar nuevo recordatorio' }
    ];
  }
  
  return [];
}

async function createProject(userId: string, parameters: Record<string, any>): Promise<Record<string, any>> {
  // Crear proyecto en Firestore
  const projectRef = admin.firestore().collection('projects').doc();
  
  await projectRef.set({
    name: parameters.name,
    type: parameters.type,
    startDate: parameters.startDate ? admin.firestore.Timestamp.fromDate(new Date(parameters.startDate)) : null,
    endDate: parameters.endDate ? admin.firestore.Timestamp.fromDate(new Date(parameters.endDate)) : null,
    artistId: parameters.artistId || null,
    description: parameters.description || '',
    members: [userId],
    status: 'active',
    createdBy: userId,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  
  return {
    projectId: projectRef.id,
    message: `Proyecto "${parameters.name}" creado correctamente`
  };
}

async function scheduleEvent(userId: string, parameters: Record<string, any>): Promise<Record<string, any>> {
  // Crear evento en Firestore
  const eventRef = admin.firestore().collection('events').doc();
  
  await eventRef.set({
    title: parameters.title,
    description: parameters.description || '',
    date: parameters.date ? admin.firestore.Timestamp.fromDate(new Date(parameters.date)) : null,
    time: parameters.time || null,
    location: parameters.location || null,
    projectId: parameters.projectId || null,
    artistId: parameters.artistId || null,
    attendees: parameters.attendees || [userId],
    reminder: parameters.reminder || true,
    reminderSent: false,
    createdBy: userId,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  
  return {
    eventId: eventRef.id,
    message: `Evento "${parameters.title}" programado correctamente`
  };
}

async function generateReport(userId: string, parameters: Record<string, any>): Promise<Record<string, any>> {
  // Crear reporte en Firestore
  const reportRef = admin.firestore().collection('reports').doc();
  
  await reportRef.set({
    title: parameters.title || 'Reporte generado por Zeus',
    type: parameters.type,
    artistId: parameters.artistId || null,
    projectId: parameters.projectId || null,
    dateRange: {
      start: parameters.startDate ? admin.firestore.Timestamp.fromDate(new Date(parameters.startDate)) : null,
      end: parameters.endDate ? admin.firestore.Timestamp.fromDate(new Date(parameters.endDate)) : null
    },
    status: 'processing',
    createdBy: userId,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  
  return {
    reportId: reportRef.id,
    message: `Reporte "${parameters.title || 'generado por Zeus'}" en proceso`
  };
}

async function sendReminder(userId: string, parameters: Record<string, any>): Promise<Record<string, any>> {
  // Crear recordatorio en Firestore
  const reminderRef = admin.firestore().collection('reminders').doc();
  
  await reminderRef.set({
    title: parameters.title,
    message: parameters.message || '',
    date: parameters.date ? admin.firestore.Timestamp.fromDate(new Date(parameters.date)) : null,
    time: parameters.time || null,
    recipients: parameters.recipients || [userId],
    sent: false,
    eventId: parameters.eventId || null,
    projectId: parameters.projectId || null,
    artistId: parameters.artistId || null,
    createdBy: userId,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  
  return {
    reminderId: reminderRef.id,
    message: `Recordatorio "${parameters.title}" configurado correctamente`
  };
}
