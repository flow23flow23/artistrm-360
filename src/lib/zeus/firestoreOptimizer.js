// Archivo: /home/ubuntu/artistrm-360-github/src/lib/zeus/firestoreOptimizer.js

/**
 * Módulo de optimización de consultas a Firestore para Zeus IA
 * 
 * Este módulo proporciona funciones y configuraciones para optimizar
 * las consultas a Firestore, mejorar el rendimiento y reducir costos.
 */

import { db } from '@/lib/firebase/config';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  getDocs,
  getCountFromServer,
  documentId,
  writeBatch,
  serverTimestamp
} from 'firebase/firestore';

/**
 * Configuración de índices recomendados para Firestore
 * Esta configuración debe ser aplicada en la consola de Firebase
 */
export const RECOMMENDED_INDEXES = [
  {
    collection: 'events',
    fields: [
      { fieldPath: 'userId', order: 'ASCENDING' },
      { fieldPath: 'date', order: 'ASCENDING' }
    ]
  },
  {
    collection: 'events',
    fields: [
      { fieldPath: 'userId', order: 'ASCENDING' },
      { fieldPath: 'date', order: 'DESCENDING' }
    ]
  },
  {
    collection: 'releases',
    fields: [
      { fieldPath: 'userId', order: 'ASCENDING' },
      { fieldPath: 'releaseDate', order: 'DESCENDING' }
    ]
  },
  {
    collection: 'social_metrics',
    fields: [
      { fieldPath: 'userId', order: 'ASCENDING' },
      { fieldPath: 'platform', order: 'ASCENDING' },
      { fieldPath: 'date', order: 'ASCENDING' }
    ]
  },
  {
    collection: 'streaming_stats',
    fields: [
      { fieldPath: 'userId', order: 'ASCENDING' },
      { fieldPath: 'platform', order: 'ASCENDING' },
      { fieldPath: 'date', order: 'ASCENDING' }
    ]
  },
  {
    collection: 'conversation_memory',
    fields: [
      { fieldPath: 'userId', order: 'ASCENDING' },
      { fieldPath: 'lastUpdated', order: 'DESCENDING' }
    ]
  },
  {
    collection: 'zeus_response_cache',
    fields: [
      { fieldPath: 'userId', order: 'ASCENDING' },
      { fieldPath: 'queryType', order: 'ASCENDING' }
    ]
  }
];

/**
 * Verifica si un índice está disponible en Firestore
 * @param {Object} indexConfig - Configuración del índice a verificar
 * @returns {Promise<boolean>} - true si el índice está disponible, false en caso contrario
 */
export const checkIndexAvailability = async (indexConfig) => {
  try {
    // Crear una consulta que utilizaría el índice
    const testQuery = query(
      collection(db, indexConfig.collection),
      ...indexConfig.fields.map(field => 
        field.order === 'ASCENDING' 
          ? orderBy(field.fieldPath, 'asc') 
          : orderBy(field.fieldPath, 'desc')
      ),
      limit(1)
    );
    
    // Intentar ejecutar la consulta
    await getDocs(testQuery);
    
    // Si no hay error, el índice está disponible
    return true;
  } catch (error) {
    // Verificar si el error es por falta de índice
    if (error.code === 'failed-precondition' && error.message.includes('index')) {
      return false;
    }
    
    // Otro tipo de error
    console.error(`Error verificando índice para ${indexConfig.collection}:`, error);
    return false;
  }
};

/**
 * Verifica la disponibilidad de todos los índices recomendados
 * @returns {Promise<Object>} - Estado de disponibilidad de cada índice
 */
export const checkAllIndexes = async () => {
  const results = {};
  
  for (const indexConfig of RECOMMENDED_INDEXES) {
    const collectionName = indexConfig.collection;
    if (!results[collectionName]) {
      results[collectionName] = [];
    }
    
    const isAvailable = await checkIndexAvailability(indexConfig);
    results[collectionName].push({
      fields: indexConfig.fields.map(f => `${f.fieldPath} ${f.order}`).join(', '),
      available: isAvailable
    });
  }
  
  return results;
};

/**
 * Genera la URL para crear un índice en la consola de Firebase
 * @param {Object} indexConfig - Configuración del índice
 * @param {string} projectId - ID del proyecto de Firebase
 * @returns {string} - URL para crear el índice
 */
export const generateIndexCreationUrl = (indexConfig, projectId = 'zamx-v1') => {
  const baseUrl = `https://console.firebase.google.com/project/${projectId}/firestore/indexes`;
  
  // No podemos generar una URL directa para crear el índice específico,
  // pero podemos dirigir al usuario a la página de índices
  return baseUrl;
};

/**
 * Optimiza una consulta de eventos para un usuario
 * @param {string} userId - ID del usuario/artista
 * @param {Date} startDate - Fecha de inicio (opcional)
 * @param {Date} endDate - Fecha de fin (opcional)
 * @param {boolean} ascending - Ordenar ascendente o descendente
 * @param {number} maxResults - Número máximo de resultados
 * @returns {Promise<Array>} - Eventos optimizados
 */
export const getOptimizedEvents = async (
  userId, 
  startDate = null, 
  endDate = null, 
  ascending = true, 
  maxResults = 50
) => {
  try {
    // Construir consulta base
    let queryConstraints = [
      where('userId', '==', userId)
    ];
    
    // Añadir filtros de fecha si se proporcionan
    if (startDate) {
      queryConstraints.push(where('date', '>=', startDate));
    }
    
    if (endDate) {
      queryConstraints.push(where('date', '<=', endDate));
    }
    
    // Añadir ordenamiento
    queryConstraints.push(orderBy('date', ascending ? 'asc' : 'desc'));
    
    // Limitar resultados
    queryConstraints.push(limit(maxResults));
    
    // Ejecutar consulta
    const eventsQuery = query(
      collection(db, 'events'),
      ...queryConstraints
    );
    
    const snapshot = await getDocs(eventsQuery);
    
    // Procesar resultados
    const events = [];
    snapshot.forEach(doc => {
      events.push({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate() || null
      });
    });
    
    return events;
  } catch (error) {
    console.error('Error en getOptimizedEvents:', error);
    throw error;
  }
};

/**
 * Optimiza una consulta de métricas sociales para un usuario
 * @param {string} userId - ID del usuario/artista
 * @param {string} platform - Plataforma específica (opcional)
 * @param {Date} startDate - Fecha de inicio (opcional)
 * @param {number} maxResults - Número máximo de resultados por plataforma
 * @returns {Promise<Object>} - Métricas sociales optimizadas
 */
export const getOptimizedSocialMetrics = async (
  userId, 
  platform = null, 
  startDate = null, 
  maxResults = 30
) => {
  try {
    // Construir consulta base
    let queryConstraints = [
      where('userId', '==', userId)
    ];
    
    // Filtrar por plataforma si se especifica
    if (platform) {
      queryConstraints.push(where('platform', '==', platform));
    }
    
    // Filtrar por fecha si se especifica
    if (startDate) {
      queryConstraints.push(where('date', '>=', startDate));
    }
    
    // Añadir ordenamiento
    if (platform) {
      // Si hay plataforma específica, ordenar solo por fecha
      queryConstraints.push(orderBy('date', 'asc'));
    } else {
      // Si no hay plataforma específica, ordenar por plataforma y fecha
      queryConstraints.push(orderBy('platform', 'asc'));
      queryConstraints.push(orderBy('date', 'asc'));
    }
    
    // Ejecutar consulta
    const metricsQuery = query(
      collection(db, 'social_metrics'),
      ...queryConstraints
    );
    
    const snapshot = await getDocs(metricsQuery);
    
    // Procesar resultados agrupados por plataforma
    const metrics = {};
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const platform = data.platform;
      
      if (!metrics[platform]) {
        metrics[platform] = [];
      }
      
      // Limitar resultados por plataforma
      if (metrics[platform].length < maxResults) {
        metrics[platform].push({
          id: doc.id,
          ...data,
          date: data.date?.toDate() || null
        });
      }
    });
    
    return metrics;
  } catch (error) {
    console.error('Error en getOptimizedSocialMetrics:', error);
    throw error;
  }
};

/**
 * Optimiza una consulta de estadísticas de streaming para un usuario
 * @param {string} userId - ID del usuario/artista
 * @param {string} platform - Plataforma específica (opcional)
 * @param {Date} startDate - Fecha de inicio (opcional)
 * @param {number} maxResults - Número máximo de resultados por plataforma
 * @returns {Promise<Object>} - Estadísticas de streaming optimizadas
 */
export const getOptimizedStreamingStats = async (
  userId, 
  platform = null, 
  startDate = null, 
  maxResults = 30
) => {
  try {
    // Construir consulta base
    let queryConstraints = [
      where('userId', '==', userId)
    ];
    
    // Filtrar por plataforma si se especifica
    if (platform) {
      queryConstraints.push(where('platform', '==', platform));
    }
    
    // Filtrar por fecha si se especifica
    if (startDate) {
      queryConstraints.push(where('date', '>=', startDate));
    }
    
    // Añadir ordenamiento
    if (platform) {
      // Si hay plataforma específica, ordenar solo por fecha
      queryConstraints.push(orderBy('date', 'asc'));
    } else {
      // Si no hay plataforma específica, ordenar por plataforma y fecha
      queryConstraints.push(orderBy('platform', 'asc'));
      queryConstraints.push(orderBy('date', 'asc'));
    }
    
    // Ejecutar consulta
    const statsQuery = query(
      collection(db, 'streaming_stats'),
      ...queryConstraints
    );
    
    const snapshot = await getDocs(statsQuery);
    
    // Procesar resultados agrupados por plataforma
    const stats = {};
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const platform = data.platform;
      
      if (!stats[platform]) {
        stats[platform] = [];
      }
      
      // Limitar resultados por plataforma
      if (stats[platform].length < maxResults) {
        stats[platform].push({
          id: doc.id,
          ...data,
          date: data.date?.toDate() || null
        });
      }
    });
    
    return stats;
  } catch (error) {
    console.error('Error en getOptimizedStreamingStats:', error);
    throw error;
  }
};

/**
 * Optimiza una consulta de lanzamientos para un usuario
 * @param {string} userId - ID del usuario/artista
 * @param {number} maxResults - Número máximo de resultados
 * @returns {Promise<Array>} - Lanzamientos optimizados
 */
export const getOptimizedReleases = async (userId, maxResults = 20) => {
  try {
    // Ejecutar consulta
    const releasesQuery = query(
      collection(db, 'releases'),
      where('userId', '==', userId),
      orderBy('releaseDate', 'desc'),
      limit(maxResults)
    );
    
    const snapshot = await getDocs(releasesQuery);
    
    // Procesar resultados
    const releases = [];
    snapshot.forEach(doc => {
      releases.push({
        id: doc.id,
        ...doc.data(),
        releaseDate: doc.data().releaseDate?.toDate() || null
      });
    });
    
    return releases;
  } catch (error) {
    console.error('Error en getOptimizedReleases:', error);
    throw error;
  }
};

/**
 * Optimiza la obtención de datos del artista para Zeus IA
 * @param {string} userId - ID del usuario/artista
 * @returns {Promise<Object>} - Datos optimizados del artista
 */
export const getOptimizedArtistData = async (userId) => {
  try {
    // Fechas para filtrado
    const now = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    // Ejecutar consultas en paralelo
    const [
      pastEvents,
      upcomingEvents,
      releases,
      socialMetrics,
      streamingStats,
      profile
    ] = await Promise.all([
      // Eventos pasados (últimos 3 meses)
      getOptimizedEvents(userId, threeMonthsAgo, now, false, 20),
      
      // Eventos futuros
      getOptimizedEvents(userId, now, null, true, 20),
      
      // Lanzamientos
      getOptimizedReleases(userId, 20),
      
      // Métricas sociales
      getOptimizedSocialMetrics(userId, null, threeMonthsAgo, 30),
      
      // Estadísticas de streaming
      getOptimizedStreamingStats(userId, null, threeMonthsAgo, 30),
      
      // Perfil del artista
      (async () => {
        const profileDoc = await getDocs(
          query(
            collection(db, 'users'),
            where(documentId(), '==', userId)
          )
        );
        
        if (profileDoc.empty) {
          return {};
        }
        
        return profileDoc.docs[0].data();
      })()
    ]);
    
    // Combinar resultados
    return {
      profile,
      events: {
        past: pastEvents,
        upcoming: upcomingEvents
      },
      releases,
      socialMetrics: {
        raw: socialMetrics
      },
      streamingStats: {
        raw: streamingStats
      },
      timestamp: new Date()
    };
  } catch (error) {
    console.error('Error en getOptimizedArtistData:', error);
    throw error;
  }
};

/**
 * Crea un índice de búsqueda para respuestas frecuentes
 * @param {string} userId - ID del usuario/artista
 * @returns {Promise<void>}
 */
export const createSearchIndex = async (userId) => {
  try {
    // Obtener respuestas en caché
    const cacheQuery = query(
      collection(db, 'zeus_response_cache'),
      where('userId', '==', userId)
    );
    
    const snapshot = await getDocs(cacheQuery);
    
    // Crear batch para operaciones en lote
    const batch = writeBatch(db);
    
    // Procesar cada respuesta en caché
    snapshot.forEach(doc => {
      const cacheData = doc.data();
      
      // Crear documento en el índice de búsqueda
      const searchDoc = {
        userId: cacheData.userId,
        query: cacheData.query,
        queryType: cacheData.queryType,
        intent: cacheData.intent,
        cacheRef: doc.id,
        keywords: extractKeywords(cacheData.query),
        timestamp: serverTimestamp()
      };
      
      // Añadir al batch
      const searchRef = doc.ref.collection('search_index').doc();
      batch.set(searchRef, searchDoc);
    });
    
    // Ejecutar batch
    await batch.commit();
  } catch (error) {
    console.error('Error creando índice de búsqueda:', error);
    throw error;
  }
};

/**
 * Extrae palabras clave de una consulta para indexación
 * @param {string} query - Consulta del usuario
 * @returns {Array<string>} - Palabras clave extraídas
 * @private
 */
const extractKeywords = (query) => {
  if (!query) return [];
  
  // Normalizar consulta
  const normalizedQuery = query.toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
    .replace(/\s{2,}/g, ' ');
  
  // Dividir en palabras
  const words = normalizedQuery.split(' ');
  
  // Filtrar palabras vacías y duplicados
  const stopWords = ['el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'y', 'o', 'a', 'de', 'en', 'por', 'para', 'con', 'sin', 'mi', 'tu', 'su', 'que', 'como', 'cuando', 'donde', 'cual', 'quien', 'cuyo', 'cuya', 'este', 'esta', 'estos', 'estas', 'ese', 'esa', 'esos', 'esas', 'aquel', 'aquella', 'aquellos', 'aquellas'];
  
  const keywords = words.filter(word => 
    word.length > 2 && !stopWords.includes(word)
  );
  
  // Eliminar duplicados
  return [...new Set(keywords)];
};

/**
 * Monitorea el rendimiento de las consultas a Firestore
 * @param {Function} queryFn - Función de consulta a monitorear
 * @param {Array} args - Argumentos para la función de consulta
 * @returns {Promise<Object>} - Resultado de la consulta con métricas de rendimiento
 */
export const monitorQueryPerformance = async (queryFn, ...args) => {
  const startTime = performance.now();
  
  try {
    // Ejecutar consulta
    const result = await queryFn(...args);
    
    // Calcular tiempo de ejecución
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    
    // Determinar tamaño aproximado de los datos
    const resultSize = JSON.stringify(result).length;
    
    // Registrar métricas
    console.log(`Query Performance: ${queryFn.name}`, {
      executionTime: `${executionTime.toFixed(2)}ms`,
      resultSize: `${(resultSize / 1024).toFixed(2)}KB`,
      timestamp: new Date()
    });
    
    return {
      data: result,
      metrics: {
        executionTime,
        resultSize,
        success: true
      }
    };
  } catch (error) {
    // Calcular tiempo hasta el error
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    
    // Registrar error
    console.error(`Query Error: ${queryFn.name}`, {
      executionTime: `${executionTime.toFixed(2)}ms`,
      error: error.message,
      timestamp: new Date()
    });
    
    return {
      data: null,
      metrics: {
        executionTime,
        error: error.message,
        success: false
      }
    };
  }
};
