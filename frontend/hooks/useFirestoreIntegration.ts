import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/utils/firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  getDoc, 
  getDocs,
  orderBy,
  limit,
  startAfter,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';

/**
 * Hook personalizado para integración optimizada entre frontend y backend
 * Proporciona funcionalidades para obtener, cachear y sincronizar datos de Firestore
 */
export const useFirestoreIntegration = <T extends DocumentData>(
  collectionPath: string,
  options: {
    queryConstraints?: any[];
    idField?: string;
    cacheTime?: number;
    realtimeUpdates?: boolean;
    transformData?: (data: any) => T;
    errorHandler?: (error: any) => void;
  } = {}
) => {
  const {
    queryConstraints = [],
    idField = 'id',
    cacheTime = 5 * 60 * 1000, // 5 minutos por defecto
    realtimeUpdates = false,
    transformData = (data) => data as T,
    errorHandler = (error) => console.error(`Error en useFirestoreIntegration: ${error}`)
  } = options;

  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [cacheTimestamp, setCacheTimestamp] = useState<number>(0);
  const [unsubscribe, setUnsubscribe] = useState<(() => void) | null>(null);

  const { user } = useAuth();

  // Función para obtener datos iniciales
  const fetchData = useCallback(async (forceRefresh = false) => {
    // Si hay datos en caché y no se fuerza actualización, usar caché
    const now = Date.now();
    if (!forceRefresh && data.length > 0 && (now - cacheTimestamp) < cacheTime) {
      return;
    }

    if (!user) {
      setLoading(false);
      setData([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const q = query(
        collection(db, collectionPath),
        ...queryConstraints
      );

      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setData([]);
        setHasMore(false);
      } else {
        const docs = querySnapshot.docs;
        setLastDoc(docs[docs.length - 1]);
        setHasMore(docs.length >= 20); // Asumiendo paginación de 20 elementos

        const fetchedData = docs.map(doc => {
          return transformData({
            ...doc.data(),
            [idField]: doc.id
          });
        });

        setData(fetchedData);
        setCacheTimestamp(now);
      }
    } catch (err: any) {
      setError(err);
      errorHandler(err);
    } finally {
      setLoading(false);
    }
  }, [user, collectionPath, queryConstraints, cacheTime, data.length, cacheTimestamp, idField, transformData, errorHandler]);

  // Función para cargar más datos (paginación)
  const fetchMoreData = useCallback(async () => {
    if (!hasMore || !lastDoc || !user) return;

    setLoading(true);
    setError(null);

    try {
      const q = query(
        collection(db, collectionPath),
        ...queryConstraints,
        startAfter(lastDoc),
        limit(20)
      );

      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setHasMore(false);
      } else {
        const docs = querySnapshot.docs;
        setLastDoc(docs[docs.length - 1]);
        setHasMore(docs.length >= 20);

        const fetchedData = docs.map(doc => {
          return transformData({
            ...doc.data(),
            [idField]: doc.id
          });
        });

        setData(prevData => [...prevData, ...fetchedData]);
      }
    } catch (err: any) {
      setError(err);
      errorHandler(err);
    } finally {
      setLoading(false);
    }
  }, [hasMore, lastDoc, user, collectionPath, queryConstraints, idField, transformData, errorHandler]);

  // Función para obtener un documento específico
  const getDocument = useCallback(async (docId: string) => {
    if (!user) return null;

    try {
      const docRef = doc(db, collectionPath, docId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return transformData({
          ...docSnap.data(),
          [idField]: docSnap.id
        });
      } else {
        return null;
      }
    } catch (err) {
      errorHandler(err);
      return null;
    }
  }, [user, collectionPath, idField, transformData, errorHandler]);

  // Configurar escucha en tiempo real si está habilitada
  useEffect(() => {
    if (!realtimeUpdates || !user) return;

    // Limpiar suscripción anterior si existe
    if (unsubscribe) {
      unsubscribe();
    }

    const q = query(
      collection(db, collectionPath),
      ...queryConstraints
    );

    const unsubscribeFunc = onSnapshot(
      q,
      (querySnapshot) => {
        const docs = querySnapshot.docs;
        
        if (docs.length > 0) {
          setLastDoc(docs[docs.length - 1]);
          setHasMore(docs.length >= 20);

          const fetchedData = docs.map(doc => {
            return transformData({
              ...doc.data(),
              [idField]: doc.id
            });
          });

          setData(fetchedData);
          setCacheTimestamp(Date.now());
        } else {
          setData([]);
          setHasMore(false);
        }
        
        setLoading(false);
      },
      (err) => {
        setError(err);
        errorHandler(err);
        setLoading(false);
      }
    );

    setUnsubscribe(() => unsubscribeFunc);

    // Limpiar suscripción al desmontar
    return () => {
      unsubscribeFunc();
    };
  }, [user, realtimeUpdates, collectionPath, queryConstraints.toString(), idField, transformData, errorHandler]);

  // Cargar datos iniciales cuando cambian dependencias clave
  useEffect(() => {
    if (!realtimeUpdates) {
      fetchData();
    }
  }, [fetchData, realtimeUpdates]);

  return {
    data,
    loading,
    error,
    hasMore,
    fetchData,
    fetchMoreData,
    getDocument,
    refresh: () => fetchData(true)
  };
};

export default useFirestoreIntegration;
