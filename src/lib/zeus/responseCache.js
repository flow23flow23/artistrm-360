// Archivo: /home/ubuntu/artistrm-360-github/src/lib/zeus/responseCache.js

/**
 * Módulo de caché para respuestas de Zeus IA
 * 
 * Este módulo proporciona funciones para almacenar en caché y recuperar
 * respuestas frecuentes de Zeus IA, mejorando el rendimiento y reduciendo
 * la latencia en consultas repetidas.
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
  Timestamp
} from 'firebase/firestore';
import { createHash } from 'crypto';

// Tiempo de expiración de caché en milisegundos
const CACHE_EXPIRATION = {
  SHORT: 15 * 60 * 1000,       // 15 minutos
  MEDIUM: 6 * 60 * 60 * 1000,  // 6 horas
  LONG: 24 * 60 * 60 * 1000    // 24 horas
};

/**
 * Genera una clave de caché única para una consulta
 * @param {string} userId - ID del usuario/artista
 * @param {string} query - Consulta del usuario
 * @param {string} queryType - Tipo de consulta
 * @param {string} intent - Intención detectada
 * @returns {string} - Clave de caché única
 */
export const generateCacheKey = (userId, query, queryType, intent) => {
  // Normalizar la consulta (minúsculas, sin espacios extra)
  const normalizedQuery = query.toLowerCase().trim().replace(/\s+/g, ' ');
  
  // Crear string para hash
  const stringToHash = `${userId}:${normalizedQuery}:${queryType}:${intent}`;
  
  // Generar hash
  return createHash('md5').update(stringToHash).digest('hex');
};

/**
 * Determina el tiempo de expiración según el tipo de consulta
 * @param {string} queryType - Tipo de consulta
 * @param {string} intent - Intención detectada
 * @returns {number} - Tiempo de expiración en milisegundos
 */
export const getCacheExpiration = (queryType, intent) => {
  // Consultas que cambian con frecuencia (eventos próximos, métricas recientes)
  if (queryType === 'events' || intent.includes('schedule') || intent.includes('trends')) {
    return CACHE_EXPIRATION.SHORT;
  }
  
  // Consultas que cambian ocasionalmente (recomendaciones, análisis)
  if (queryType === 'recommendations' || queryType === 'analytics' || intent.includes('insights')) {
    return CACHE_EXPIRATION.MEDIUM;
  }
  
  // Consultas más estables (ayuda, información general)
  if (queryType === 'help' || queryType === 'general' || intent.includes('help')) {
    return CACHE_EXPIRATION.LONG;
  }
  
  // Por defecto, expiración media
  return CACHE_EXPIRATION.MEDIUM;
};

/**
 * Verifica si una respuesta en caché ha expirado
 * @param {Timestamp} timestamp - Timestamp de la respuesta en caché
 * @param {number} expiration - Tiempo de expiración en milisegundos
 * @returns {boolean} - true si ha expirado, false en caso contrario
 */
export const isCacheExpired = (timestamp, expiration) => {
  if (!timestamp) return true;
  
  const timestampMs = timestamp.toMillis();
  const now = Date.now();
  
  return (now - timestampMs) > expiration;
};

/**
 * Busca una respuesta en caché para una consulta
 * @param {string} userId - ID del usuario/artista
 * @param {string} query - Consulta del usuario
 * @param {string} queryType - Tipo de consulta
 * @param {string} intent - Intención detectada
 * @returns {Promise<Object|null>} - Respuesta en caché o null si no existe o ha expirado
 */
export const getCachedResponse = async (userId, query, queryType, intent) => {
  try {
    // Generar clave de caché
    const cacheKey = generateCacheKey(userId, query, queryType, intent);
    
    // Obtener documento de caché
    const cacheRef = doc(db, 'zeus_response_cache', cacheKey);
    const cacheDoc = await getDoc(cacheRef);
    
    // Si no existe, retornar null
    if (!cacheDoc.exists()) {
      return null;
    }
    
    const cacheData = cacheDoc.data();
    
    // Verificar expiración
    const expiration = getCacheExpiration(queryType, intent);
    if (isCacheExpired(cacheData.timestamp, expiration)) {
      return null;
    }
    
    // Retornar respuesta en caché
    return {
      response: cacheData.response,
      contextData: cacheData.contextData,
      fromCache: true,
      cacheAge: Date.now() - cacheData.timestamp.toMillis()
    };
  } catch (error) {
    console.error('Error obteniendo respuesta en caché:', error);
    return null;
  }
};

/**
 * Almacena una respuesta en caché
 * @param {string} userId - ID del usuario/artista
 * @param {string} query - Consulta del usuario
 * @param {string} queryType - Tipo de consulta
 * @param {string} intent - Intención detectada
 * @param {string} response - Respuesta generada
 * @param {Object} contextData - Datos contextuales utilizados
 * @returns {Promise<void>}
 */
export const cacheResponse = async (userId, query, queryType, intent, response, contextData) => {
  try {
    // Generar clave de caché
    const cacheKey = generateCacheKey(userId, query, queryType, intent);
    
    // Crear documento de caché
    const cacheRef = doc(db, 'zeus_response_cache', cacheKey);
    
    // Almacenar respuesta
    await setDoc(cacheRef, {
      userId,
      query,
      queryType,
      intent,
      response,
      contextData,
      timestamp: serverTimestamp(),
      expiration: getCacheExpiration(queryType, intent)
    });
  } catch (error) {
    console.error('Error almacenando respuesta en caché:', error);
    // No propagar el error, la caché es un mecanismo de optimización
  }
};

/**
 * Limpia entradas de caché expiradas para un usuario
 * @param {string} userId - ID del usuario/artista
 * @returns {Promise<number>} - Número de entradas eliminadas
 */
export const cleanExpiredCache = async (userId) => {
  try {
    // Obtener todas las entradas de caché del usuario
    const cacheQuery = query(
      collection(db, 'zeus_response_cache'),
      where('userId', '==', userId)
    );
    
    const snapshot = await getDocs(cacheQuery);
    
    let deletedCount = 0;
    const now = Date.now();
    
    // Verificar cada entrada
    const deletePromises = [];
    
    snapshot.forEach(doc => {
      const cacheData = doc.data();
      const timestamp = cacheData.timestamp;
      const expiration = cacheData.expiration || CACHE_EXPIRATION.MEDIUM;
      
      if (isCacheExpired(timestamp, expiration)) {
        deletePromises.push(
          doc.ref.delete()
            .then(() => { deletedCount++; })
            .catch(error => console.error(`Error eliminando caché ${doc.id}:`, error))
        );
      }
    });
    
    // Esperar a que se completen todas las eliminaciones
    await Promise.all(deletePromises);
    
    return deletedCount;
  } catch (error) {
    console.error('Error limpiando caché expirada:', error);
    return 0;
  }
};

/**
 * Invalida entradas de caché relacionadas con un tipo específico
 * @param {string} userId - ID del usuario/artista
 * @param {string} queryType - Tipo de consulta a invalidar
 * @returns {Promise<number>} - Número de entradas invalidadas
 */
export const invalidateCache = async (userId, queryType) => {
  try {
    // Obtener entradas de caché del tipo especificado
    const cacheQuery = query(
      collection(db, 'zeus_response_cache'),
      where('userId', '==', userId),
      where('queryType', '==', queryType)
    );
    
    const snapshot = await getDocs(cacheQuery);
    
    let invalidatedCount = 0;
    
    // Invalidar cada entrada
    const invalidatePromises = [];
    
    snapshot.forEach(doc => {
      invalidatePromises.push(
        doc.ref.delete()
          .then(() => { invalidatedCount++; })
          .catch(error => console.error(`Error invalidando caché ${doc.id}:`, error))
      );
    });
    
    // Esperar a que se completen todas las invalidaciones
    await Promise.all(invalidatePromises);
    
    return invalidatedCount;
  } catch (error) {
    console.error('Error invalidando caché:', error);
    return 0;
  }
};

/**
 * Obtiene estadísticas de uso de caché para un usuario
 * @param {string} userId - ID del usuario/artista
 * @returns {Promise<Object>} - Estadísticas de uso de caché
 */
export const getCacheStats = async (userId) => {
  try {
    // Obtener todas las entradas de caché del usuario
    const cacheQuery = query(
      collection(db, 'zeus_response_cache'),
      where('userId', '==', userId)
    );
    
    const snapshot = await getDocs(cacheQuery);
    
    // Inicializar estadísticas
    const stats = {
      totalEntries: snapshot.size,
      entriesByType: {},
      entriesByIntent: {},
      expiredEntries: 0,
      averageAge: 0
    };
    
    const now = Date.now();
    let totalAge = 0;
    
    // Procesar cada entrada
    snapshot.forEach(doc => {
      const cacheData = doc.data();
      const queryType = cacheData.queryType;
      const intent = cacheData.intent;
      const timestamp = cacheData.timestamp;
      const expiration = cacheData.expiration || CACHE_EXPIRATION.MEDIUM;
      
      // Contar por tipo
      stats.entriesByType[queryType] = (stats.entriesByType[queryType] || 0) + 1;
      
      // Contar por intención
      stats.entriesByIntent[intent] = (stats.entriesByIntent[intent] || 0) + 1;
      
      // Verificar expiración
      if (isCacheExpired(timestamp, expiration)) {
        stats.expiredEntries++;
      }
      
      // Calcular edad
      if (timestamp) {
        const age = now - timestamp.toMillis();
        totalAge += age;
      }
    });
    
    // Calcular edad promedio
    if (stats.totalEntries > 0) {
      stats.averageAge = totalAge / stats.totalEntries;
    }
    
    return stats;
  } catch (error) {
    console.error('Error obteniendo estadísticas de caché:', error);
    return {
      totalEntries: 0,
      entriesByType: {},
      entriesByIntent: {},
      expiredEntries: 0,
      averageAge: 0,
      error: error.message
    };
  }
};
