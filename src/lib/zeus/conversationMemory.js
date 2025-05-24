// Archivo: /home/ubuntu/artistrm-360-github/src/lib/zeus/conversationMemory.js

/**
 * Módulo de memoria de conversación para Zeus IA
 * 
 * Este módulo proporciona funciones para gestionar la memoria de conversación
 * de Zeus IA, permitiendo mantener contexto a lo largo de múltiples turnos
 * y sesiones para una experiencia más personalizada.
 */

import { db } from '@/lib/firebase/config';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  arrayUnion
} from 'firebase/firestore';

/**
 * Estructura de la memoria de conversación
 * @typedef {Object} ConversationMemory
 * @property {string} userId - ID del usuario/artista
 * @property {string} sessionId - ID de la sesión actual
 * @property {Array} messages - Mensajes de la conversación
 * @property {Object} context - Contexto acumulado de la conversación
 * @property {Array} topics - Temas identificados en la conversación
 * @property {Object} entities - Entidades mencionadas en la conversación
 * @property {Object} preferences - Preferencias identificadas del usuario
 * @property {Date} lastUpdated - Última actualización de la memoria
 */

/**
 * Inicializa una nueva memoria de conversación
 * @param {string} userId - ID del usuario/artista
 * @param {string} sessionId - ID de la sesión
 * @returns {Promise<ConversationMemory>} - Nueva memoria de conversación
 */
export const initializeMemory = async (userId, sessionId) => {
  try {
    // Crear documento de memoria
    const memoryRef = doc(collection(db, 'conversation_memory'));
    
    const memory = {
      userId,
      sessionId,
      messages: [],
      context: {
        lastQueryType: null,
        focusedTopics: [],
        recentEntities: {}
      },
      topics: [],
      entities: {},
      preferences: {
        detailedResponses: true,
        visualData: false,
        focusAreas: []
      },
      lastUpdated: serverTimestamp()
    };
    
    await setDoc(memoryRef, memory);
    
    return {
      ...memory,
      id: memoryRef.id
    };
  } catch (error) {
    console.error('Error inicializando memoria de conversación:', error);
    throw error;
  }
};

/**
 * Recupera la memoria de conversación para una sesión
 * @param {string} userId - ID del usuario/artista
 * @param {string} sessionId - ID de la sesión
 * @returns {Promise<ConversationMemory|null>} - Memoria de conversación o null si no existe
 */
export const getMemory = async (userId, sessionId) => {
  try {
    const memoryQuery = query(
      collection(db, 'conversation_memory'),
      where('userId', '==', userId),
      where('sessionId', '==', sessionId),
      limit(1)
    );
    
    const snapshot = await getDocs(memoryQuery);
    
    if (snapshot.empty) {
      return null;
    }
    
    const memoryDoc = snapshot.docs[0];
    return {
      id: memoryDoc.id,
      ...memoryDoc.data()
    };
  } catch (error) {
    console.error('Error recuperando memoria de conversación:', error);
    throw error;
  }
};

/**
 * Actualiza la memoria con un nuevo mensaje del usuario
 * @param {string} memoryId - ID del documento de memoria
 * @param {string} message - Mensaje del usuario
 * @param {string} queryType - Tipo de consulta detectado
 * @param {Object} entities - Entidades detectadas en el mensaje
 * @returns {Promise<void>}
 */
export const addUserMessage = async (memoryId, message, queryType, entities = {}) => {
  try {
    const memoryRef = doc(collection(db, 'conversation_memory'), memoryId);
    
    // Extraer posibles temas del mensaje
    const potentialTopics = extractTopics(message);
    
    // Actualizar memoria
    await updateDoc(memoryRef, {
      messages: arrayUnion({
        role: 'user',
        content: message,
        timestamp: new Date()
      }),
      'context.lastQueryType': queryType,
      topics: arrayUnion(...potentialTopics),
      lastUpdated: serverTimestamp()
    });
    
    // Actualizar entidades si hay nuevas
    if (Object.keys(entities).length > 0) {
      const memoryDoc = await getDoc(memoryRef);
      const memoryData = memoryDoc.data();
      const updatedEntities = { ...memoryData.entities };
      
      // Añadir o actualizar entidades
      Object.keys(entities).forEach(entityType => {
        if (!updatedEntities[entityType]) {
          updatedEntities[entityType] = {};
        }
        
        Object.keys(entities[entityType]).forEach(entityName => {
          updatedEntities[entityType][entityName] = {
            ...entities[entityType][entityName],
            lastMentioned: new Date()
          };
        });
      });
      
      // Actualizar entidades y entidades recientes en contexto
      await updateDoc(memoryRef, {
        entities: updatedEntities,
        'context.recentEntities': entities
      });
    }
  } catch (error) {
    console.error('Error añadiendo mensaje de usuario a memoria:', error);
    throw error;
  }
};

/**
 * Actualiza la memoria con una respuesta de Zeus
 * @param {string} memoryId - ID del documento de memoria
 * @param {string} response - Respuesta de Zeus
 * @param {Object} contextUsed - Contexto utilizado para generar la respuesta
 * @returns {Promise<void>}
 */
export const addZeusResponse = async (memoryId, response, contextUsed = {}) => {
  try {
    const memoryRef = doc(collection(db, 'conversation_memory'), memoryId);
    
    await updateDoc(memoryRef, {
      messages: arrayUnion({
        role: 'assistant',
        content: response,
        contextUsed,
        timestamp: new Date()
      }),
      lastUpdated: serverTimestamp()
    });
  } catch (error) {
    console.error('Error añadiendo respuesta de Zeus a memoria:', error);
    throw error;
  }
};

/**
 * Actualiza las preferencias del usuario en la memoria
 * @param {string} memoryId - ID del documento de memoria
 * @param {Object} preferences - Nuevas preferencias a actualizar
 * @returns {Promise<void>}
 */
export const updatePreferences = async (memoryId, preferences) => {
  try {
    const memoryRef = doc(collection(db, 'conversation_memory'), memoryId);
    
    const memoryDoc = await getDoc(memoryRef);
    const currentPreferences = memoryDoc.data().preferences;
    
    await updateDoc(memoryRef, {
      preferences: {
        ...currentPreferences,
        ...preferences
      },
      lastUpdated: serverTimestamp()
    });
  } catch (error) {
    console.error('Error actualizando preferencias en memoria:', error);
    throw error;
  }
};

/**
 * Recupera el historial de conversación reciente para un usuario
 * @param {string} userId - ID del usuario/artista
 * @param {number} sessionsLimit - Número máximo de sesiones a recuperar
 * @returns {Promise<Array>} - Historial de conversación agrupado por sesiones
 */
export const getConversationHistory = async (userId, sessionsLimit = 5) => {
  try {
    const memoryQuery = query(
      collection(db, 'conversation_memory'),
      where('userId', '==', userId),
      orderBy('lastUpdated', 'desc'),
      limit(sessionsLimit)
    );
    
    const snapshot = await getDocs(memoryQuery);
    
    const history = [];
    
    snapshot.forEach(doc => {
      history.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return history;
  } catch (error) {
    console.error('Error recuperando historial de conversación:', error);
    throw error;
  }
};

/**
 * Extrae temas potenciales de un mensaje
 * @param {string} message - Mensaje a analizar
 * @returns {Array<string>} - Temas potenciales extraídos
 * @private
 */
const extractTopics = (message) => {
  const lowercaseMessage = message.toLowerCase();
  
  // Lista de temas potenciales a detectar
  const topicKeywords = {
    'eventos': ['evento', 'concierto', 'gira', 'tour', 'show', 'presentación', 'tocar', 'festival'],
    'lanzamientos': ['lanzamiento', 'canción', 'álbum', 'single', 'ep', 'música', 'publicar', 'estreno'],
    'redes_sociales': ['redes', 'social', 'instagram', 'facebook', 'tiktok', 'seguidores', 'engagement'],
    'streaming': ['stream', 'spotify', 'apple music', 'reproducciones', 'oyentes', 'playlist'],
    'finanzas': ['ingreso', 'ganancia', 'revenue', 'monetización', 'dinero', 'pago', 'royalty'],
    'marketing': ['promoción', 'campaña', 'publicidad', 'marketing', 'audiencia', 'target'],
    'colaboraciones': ['colaboración', 'featuring', 'feat', 'collab', 'artista invitado'],
    'producción': ['producción', 'estudio', 'grabación', 'mezcla', 'master', 'beat', 'instrumental']
  };
  
  const detectedTopics = [];
  
  // Detectar temas basados en palabras clave
  Object.keys(topicKeywords).forEach(topic => {
    if (topicKeywords[topic].some(keyword => lowercaseMessage.includes(keyword))) {
      detectedTopics.push(topic);
    }
  });
  
  return detectedTopics;
};

/**
 * Genera un resumen de la memoria de conversación para contextualizar respuestas
 * @param {ConversationMemory} memory - Memoria de conversación
 * @returns {Object} - Resumen de memoria para contextualización
 */
export const generateMemorySummary = (memory) => {
  if (!memory) return null;
  
  // Extraer mensajes recientes (últimos 5)
  const recentMessages = memory.messages.slice(-5);
  
  // Contar frecuencia de temas
  const topicFrequency = {};
  memory.topics.forEach(topic => {
    topicFrequency[topic] = (topicFrequency[topic] || 0) + 1;
  });
  
  // Ordenar temas por frecuencia
  const sortedTopics = Object.keys(topicFrequency).sort((a, b) => 
    topicFrequency[b] - topicFrequency[a]
  );
  
  // Extraer entidades mencionadas recientemente
  const recentEntities = memory.context.recentEntities || {};
  
  // Generar resumen
  return {
    sessionLength: memory.messages.length,
    recentMessages,
    focusedTopics: sortedTopics.slice(0, 3),
    recentEntities,
    preferences: memory.preferences,
    lastQueryType: memory.context.lastQueryType
  };
};

/**
 * Integra la memoria de conversación en el prompt contextualizado
 * @param {string} basePrompt - Prompt base contextualizado con datos del artista
 * @param {Object} memorySummary - Resumen de la memoria de conversación
 * @returns {string} - Prompt enriquecido con memoria de conversación
 */
export const integrateMemoryInPrompt = (basePrompt, memorySummary) => {
  if (!memorySummary) return basePrompt;
  
  // Extraer información relevante del resumen
  const { focusedTopics, preferences, recentEntities } = memorySummary;
  
  // Crear sección de memoria para el prompt
  const memorySection = `
    Información adicional de la conversación:
    - Temas principales discutidos: ${focusedTopics.join(', ')}
    - Preferencias del usuario: ${JSON.stringify(preferences)}
    - Entidades mencionadas recientemente: ${JSON.stringify(recentEntities)}
    
    Adapta tu respuesta considerando este contexto de conversación.
  `;
  
  // Insertar sección de memoria antes de la última parte del prompt
  const promptParts = basePrompt.split('Usuario:');
  return promptParts[0] + memorySection + '\n\nUsuario:' + promptParts[1];
};
