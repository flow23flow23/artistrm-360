// Archivo: /home/ubuntu/artistrm-360-github/src/lib/zeus/dataConnectors.js

/**
 * Módulo de conectores de datos para Zeus IA
 * 
 * Este módulo proporciona funciones para acceder y procesar datos
 * del artista almacenados en Firestore, permitiendo a Zeus IA
 * generar respuestas personalizadas y contextualizadas.
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
  getDoc
} from 'firebase/firestore';

/**
 * Obtiene los datos básicos del perfil del artista
 * @param {string} userId - ID del usuario/artista
 * @returns {Promise<Object>} - Datos del perfil del artista
 */
export const getArtistProfile = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      throw new Error('Perfil de artista no encontrado');
    }
    
    return userDoc.data();
  } catch (error) {
    console.error('Error obteniendo perfil del artista:', error);
    throw error;
  }
};

/**
 * Obtiene los eventos recientes y próximos del artista
 * @param {string} userId - ID del usuario/artista
 * @param {number} limit - Número máximo de eventos a obtener
 * @returns {Promise<Array>} - Lista de eventos
 */
export const getArtistEvents = async (userId, eventLimit = 10) => {
  try {
    const now = new Date();
    
    // Eventos pasados (últimos 3 meses)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const pastEventsQuery = query(
      collection(db, 'events'),
      where('userId', '==', userId),
      where('date', '>=', threeMonthsAgo),
      where('date', '<=', now),
      orderBy('date', 'desc'),
      limit(eventLimit)
    );
    
    // Eventos futuros
    const futureEventsQuery = query(
      collection(db, 'events'),
      where('userId', '==', userId),
      where('date', '>', now),
      orderBy('date', 'asc'),
      limit(eventLimit)
    );
    
    const [pastEventsSnapshot, futureEventsSnapshot] = await Promise.all([
      getDocs(pastEventsQuery),
      getDocs(futureEventsQuery)
    ]);
    
    const pastEvents = [];
    pastEventsSnapshot.forEach(doc => {
      pastEvents.push({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate() || null
      });
    });
    
    const futureEvents = [];
    futureEventsSnapshot.forEach(doc => {
      futureEvents.push({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate() || null
      });
    });
    
    return {
      past: pastEvents,
      upcoming: futureEvents
    };
  } catch (error) {
    console.error('Error obteniendo eventos del artista:', error);
    throw error;
  }
};

/**
 * Obtiene los lanzamientos musicales del artista
 * @param {string} userId - ID del usuario/artista
 * @param {number} limit - Número máximo de lanzamientos a obtener
 * @returns {Promise<Array>} - Lista de lanzamientos
 */
export const getArtistReleases = async (userId, releaseLimit = 10) => {
  try {
    const releasesQuery = query(
      collection(db, 'releases'),
      where('userId', '==', userId),
      orderBy('releaseDate', 'desc'),
      limit(releaseLimit)
    );
    
    const releasesSnapshot = await getDocs(releasesQuery);
    
    const releases = [];
    releasesSnapshot.forEach(doc => {
      releases.push({
        id: doc.id,
        ...doc.data(),
        releaseDate: doc.data().releaseDate?.toDate() || null
      });
    });
    
    return releases;
  } catch (error) {
    console.error('Error obteniendo lanzamientos del artista:', error);
    throw error;
  }
};

/**
 * Obtiene las métricas de redes sociales del artista
 * @param {string} userId - ID del usuario/artista
 * @param {number} days - Número de días para obtener métricas
 * @returns {Promise<Object>} - Métricas de redes sociales
 */
export const getSocialMetrics = async (userId, days = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const metricsQuery = query(
      collection(db, 'social_metrics'),
      where('userId', '==', userId),
      where('date', '>=', startDate),
      orderBy('date', 'asc')
    );
    
    const metricsSnapshot = await getDocs(metricsQuery);
    
    const metrics = {
      spotify: [],
      instagram: [],
      youtube: [],
      tiktok: []
    };
    
    metricsSnapshot.forEach(doc => {
      const data = doc.data();
      const platform = data.platform;
      
      if (metrics[platform]) {
        metrics[platform].push({
          id: doc.id,
          ...data,
          date: data.date?.toDate() || null
        });
      }
    });
    
    // Calcular tendencias
    const trends = {};
    
    Object.keys(metrics).forEach(platform => {
      const platformData = metrics[platform];
      
      if (platformData.length >= 2) {
        const first = platformData[0];
        const last = platformData[platformData.length - 1];
        
        trends[platform] = {
          followers: {
            start: first.followers || 0,
            end: last.followers || 0,
            change: ((last.followers || 0) - (first.followers || 0))
          },
          engagement: {
            start: first.engagement || 0,
            end: last.engagement || 0,
            change: ((last.engagement || 0) - (first.engagement || 0))
          }
        };
      }
    });
    
    return {
      raw: metrics,
      trends
    };
  } catch (error) {
    console.error('Error obteniendo métricas sociales:', error);
    throw error;
  }
};

/**
 * Obtiene las estadísticas de streaming del artista
 * @param {string} userId - ID del usuario/artista
 * @param {number} months - Número de meses para obtener estadísticas
 * @returns {Promise<Object>} - Estadísticas de streaming
 */
export const getStreamingStats = async (userId, months = 3) => {
  try {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    
    const statsQuery = query(
      collection(db, 'streaming_stats'),
      where('userId', '==', userId),
      where('date', '>=', startDate),
      orderBy('date', 'asc')
    );
    
    const statsSnapshot = await getDocs(statsQuery);
    
    const stats = {
      spotify: [],
      appleMusic: [],
      deezer: [],
      amazonMusic: []
    };
    
    statsSnapshot.forEach(doc => {
      const data = doc.data();
      const platform = data.platform;
      
      if (stats[platform]) {
        stats[platform].push({
          id: doc.id,
          ...data,
          date: data.date?.toDate() || null
        });
      }
    });
    
    // Calcular totales y promedios
    const summary = {};
    
    Object.keys(stats).forEach(platform => {
      const platformData = stats[platform];
      
      if (platformData.length > 0) {
        const totalStreams = platformData.reduce((sum, item) => sum + (item.streams || 0), 0);
        const totalRevenue = platformData.reduce((sum, item) => sum + (item.revenue || 0), 0);
        
        summary[platform] = {
          totalStreams,
          totalRevenue,
          avgStreamsPerDay: totalStreams / (platformData.length || 1),
          avgRevenuePerDay: totalRevenue / (platformData.length || 1)
        };
      }
    });
    
    // Calcular totales generales
    const overallTotalStreams = Object.values(summary).reduce((sum, item) => sum + (item.totalStreams || 0), 0);
    const overallTotalRevenue = Object.values(summary).reduce((sum, item) => sum + (item.totalRevenue || 0), 0);
    
    return {
      raw: stats,
      summary,
      overall: {
        totalStreams: overallTotalStreams,
        totalRevenue: overallTotalRevenue
      }
    };
  } catch (error) {
    console.error('Error obteniendo estadísticas de streaming:', error);
    throw error;
  }
};

/**
 * Obtiene un resumen completo de los datos del artista
 * @param {string} userId - ID del usuario/artista
 * @returns {Promise<Object>} - Resumen de datos del artista
 */
export const getArtistSummary = async (userId) => {
  try {
    const [
      profile,
      events,
      releases,
      socialMetrics,
      streamingStats
    ] = await Promise.all([
      getArtistProfile(userId),
      getArtistEvents(userId),
      getArtistReleases(userId),
      getSocialMetrics(userId),
      getStreamingStats(userId)
    ]);
    
    return {
      profile,
      events,
      releases,
      socialMetrics,
      streamingStats,
      timestamp: new Date()
    };
  } catch (error) {
    console.error('Error obteniendo resumen del artista:', error);
    throw error;
  }
};
