import * as NodeCache from 'node-cache';
import { db } from './admin';
import * as functions from 'firebase-functions';

// Configuración de caché con tiempo de vida estándar de 5 minutos y verificación de expiración cada 60 segundos
const cache = new NodeCache({
  stdTTL: 300,
  checkperiod: 60,
  useClones: false
});

// Interfaz para opciones de caché
interface CacheOptions {
  ttl?: number;          // Tiempo de vida en segundos
  bypassCache?: boolean; // Forzar bypass del caché
  keyPrefix?: string;    // Prefijo para la clave de caché
}

/**
 * Función para obtener datos de Firestore con caché
 * @param collectionPath Ruta de la colección
 * @param docId ID del documento (opcional)
 * @param options Opciones de caché
 * @returns Datos del documento o colección
 */
export const getCachedFirestoreData = async (
  collectionPath: string,
  docId?: string,
  options: CacheOptions = {}
): Promise<any> => {
  const { ttl = 300, bypassCache = false, keyPrefix = '' } = options;
  
  // Construir clave de caché
  const cacheKey = `${keyPrefix}${collectionPath}${docId ? `_${docId}` : ''}`;
  
  // Si no se debe usar caché, obtener datos directamente
  if (bypassCache) {
    return await fetchFirestoreData(collectionPath, docId);
  }
  
  // Intentar obtener datos del caché
  const cachedData = cache.get(cacheKey);
  if (cachedData !== undefined) {
    return cachedData;
  }
  
  // Si no hay datos en caché, obtener de Firestore
  const firestoreData = await fetchFirestoreData(collectionPath, docId);
  
  // Guardar en caché si hay datos
  if (firestoreData) {
    cache.set(cacheKey, firestoreData, ttl);
  }
  
  return firestoreData;
};

/**
 * Función para invalidar caché
 * @param collectionPath Ruta de la colección
 * @param docId ID del documento (opcional)
 * @param keyPrefix Prefijo para la clave de caché (opcional)
 */
export const invalidateCache = (
  collectionPath: string,
  docId?: string,
  keyPrefix: string = ''
): void => {
  const cacheKey = `${keyPrefix}${collectionPath}${docId ? `_${docId}` : ''}`;
  cache.del(cacheKey);
};

/**
 * Función para invalidar caché por patrón
 * @param pattern Patrón para las claves a invalidar
 */
export const invalidateCacheByPattern = (pattern: string): void => {
  const keys = cache.keys();
  const keysToDelete = keys.filter(key => key.includes(pattern));
  keysToDelete.forEach(key => cache.del(key));
};

/**
 * Función para obtener datos de Firestore
 * @param collectionPath Ruta de la colección
 * @param docId ID del documento (opcional)
 * @returns Datos del documento o colección
 */
const fetchFirestoreData = async (
  collectionPath: string,
  docId?: string
): Promise<any> => {
  try {
    if (docId) {
      // Obtener documento específico
      const docRef = db.collection(collectionPath).doc(docId);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        return null;
      }
      
      return { id: doc.id, ...doc.data() };
    } else {
      // Obtener todos los documentos de la colección
      const collectionRef = db.collection(collectionPath);
      const snapshot = await collectionRef.get();
      
      if (snapshot.empty) {
        return [];
      }
      
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
  } catch (error) {
    console.error(`Error fetching Firestore data: ${error}`);
    throw new functions.https.HttpsError(
      'internal',
      'Error al obtener datos de Firestore'
    );
  }
};

/**
 * Función para cachear resultado de una función
 * @param fn Función a cachear
 * @param keyGenerator Generador de clave de caché
 * @param ttl Tiempo de vida en segundos
 * @returns Función cacheada
 */
export const memoize = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyGenerator: (...args: Parameters<T>) => string,
  ttl: number = 300
): T => {
  return (async (...args: Parameters<T>): Promise<any> => {
    const cacheKey = keyGenerator(...args);
    
    // Intentar obtener del caché
    const cachedResult = cache.get(cacheKey);
    if (cachedResult !== undefined) {
      return cachedResult;
    }
    
    // Ejecutar función original
    const result = await fn(...args);
    
    // Guardar en caché
    cache.set(cacheKey, result, ttl);
    
    return result;
  }) as T;
};

/**
 * Función para crear un middleware de caché para Cloud Functions
 * @param keyGenerator Generador de clave de caché
 * @param ttl Tiempo de vida en segundos
 * @returns Middleware de caché
 */
export const createCacheMiddleware = (
  keyGenerator: (data: any, context: functions.https.CallableContext) => string,
  ttl: number = 300
) => {
  return (handler: functions.HttpsFunction) => {
    return functions.https.onCall(async (data, context) => {
      // Generar clave de caché
      const cacheKey = keyGenerator(data, context);
      
      // Verificar si se debe omitir caché
      if (data?.bypassCache) {
        return await handler(data, context);
      }
      
      // Intentar obtener del caché
      const cachedResult = cache.get(cacheKey);
      if (cachedResult !== undefined) {
        return cachedResult;
      }
      
      // Ejecutar handler original
      const result = await handler(data, context);
      
      // Guardar en caché
      cache.set(cacheKey, result, ttl);
      
      return result;
    });
  };
};

// Exportar instancia de caché para uso directo
export { cache };
