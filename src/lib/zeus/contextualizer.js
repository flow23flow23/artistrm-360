// Archivo: /home/ubuntu/artistrm-360-github/src/lib/zeus/contextualizer.js

/**
 * Módulo de contextualización para Zeus IA
 * 
 * Este módulo proporciona funciones para contextualizar las consultas
 * y respuestas de Zeus IA utilizando los datos del artista, permitiendo
 * respuestas personalizadas y relevantes.
 */

import { getArtistSummary } from './dataConnectors';
import { generateArtistAnalysis } from './dataProcessor';

/**
 * Tipos de consultas que Zeus IA puede recibir
 */
export const QUERY_TYPES = {
  GENERAL: 'general',
  EVENTS: 'events',
  RELEASES: 'releases',
  SOCIAL_MEDIA: 'social_media',
  STREAMING: 'streaming',
  RECOMMENDATIONS: 'recommendations',
  ANALYTICS: 'analytics',
  PLANNING: 'planning',
  HELP: 'help'
};

/**
 * Detecta el tipo de consulta basado en palabras clave
 * @param {string} query - Consulta del usuario
 * @returns {string} - Tipo de consulta detectado
 */
export const detectQueryType = (query) => {
  const queryLower = query.toLowerCase();
  
  // Palabras clave por tipo de consulta
  const keywordMap = {
    [QUERY_TYPES.EVENTS]: ['evento', 'concierto', 'gira', 'tour', 'show', 'presentación', 'tocar', 'festival'],
    [QUERY_TYPES.RELEASES]: ['lanzamiento', 'canción', 'álbum', 'single', 'ep', 'música', 'publicar', 'estreno'],
    [QUERY_TYPES.SOCIAL_MEDIA]: ['redes', 'social', 'instagram', 'facebook', 'tiktok', 'seguidores', 'engagement'],
    [QUERY_TYPES.STREAMING]: ['stream', 'spotify', 'apple music', 'reproducciones', 'oyentes', 'playlist'],
    [QUERY_TYPES.RECOMMENDATIONS]: ['recomienda', 'sugerencia', 'consejo', 'debería', 'mejor', 'estrategia'],
    [QUERY_TYPES.ANALYTICS]: ['análisis', 'estadística', 'datos', 'métrica', 'rendimiento', 'comparar'],
    [QUERY_TYPES.PLANNING]: ['planificar', 'calendario', 'agenda', 'programar', 'futuro', 'próximo'],
    [QUERY_TYPES.HELP]: ['ayuda', 'cómo', 'funciona', 'puedes', 'explicar', 'instrucciones']
  };
  
  // Detectar tipo basado en palabras clave
  for (const [type, keywords] of Object.entries(keywordMap)) {
    if (keywords.some(keyword => queryLower.includes(keyword))) {
      return type;
    }
  }
  
  // Por defecto, tipo general
  return QUERY_TYPES.GENERAL;
};

/**
 * Obtiene datos contextuales basados en el tipo de consulta
 * @param {Object} artistAnalysis - Análisis completo del artista
 * @param {string} queryType - Tipo de consulta detectado
 * @returns {Object} - Datos contextuales relevantes para la consulta
 */
export const getContextualData = (artistAnalysis, queryType) => {
  const { summary, detail } = artistAnalysis;
  
  // Datos base que siempre se incluyen
  const baseContext = {
    artistName: summary.artistName,
    totalEvents: summary.totalEvents,
    totalReleases: summary.totalReleases,
    totalStreams: summary.totalStreams
  };
  
  // Datos específicos según tipo de consulta
  switch (queryType) {
    case QUERY_TYPES.EVENTS:
      return {
        ...baseContext,
        pastEvents: detail.events.pastStats,
        upcomingEvents: detail.events.upcomingTotal,
        nextEvent: detail.events.nextEvent,
        eventGaps: detail.events.eventGaps,
        eventInsights: detail.events.insights
      };
      
    case QUERY_TYPES.RELEASES:
      return {
        ...baseContext,
        recentReleases: detail.releases.recentReleases,
        topReleases: detail.releases.topReleases,
        releaseFrequency: detail.releases.averageReleaseInterval,
        predictedNextRelease: detail.releases.predictedNextRelease,
        releaseInsights: detail.releases.insights
      };
      
    case QUERY_TYPES.SOCIAL_MEDIA:
      return {
        ...baseContext,
        socialTrends: detail.social.trends,
        bestPlatform: detail.social.bestPlatform,
        worstPlatform: detail.social.worstPlatform,
        engagementRates: detail.social.engagementRates,
        socialInsights: detail.social.insights
      };
      
    case QUERY_TYPES.STREAMING:
      return {
        ...baseContext,
        streamingSummary: detail.streaming.summary,
        streamDistribution: detail.streaming.streamDistribution,
        dominantPlatform: detail.streaming.dominantPlatform,
        revenuePerStream: detail.streaming.revenuePerStream,
        streamingInsights: detail.streaming.insights
      };
      
    case QUERY_TYPES.RECOMMENDATIONS:
      return {
        ...baseContext,
        recommendations: summary.recommendations,
        topPlatforms: summary.topPlatforms,
        nextEvent: summary.nextEvent,
        latestRelease: summary.latestRelease
      };
      
    case QUERY_TYPES.ANALYTICS:
      return {
        ...baseContext,
        eventsAnalysis: detail.events,
        releasesAnalysis: detail.releases,
        socialAnalysis: detail.social,
        streamingAnalysis: detail.streaming
      };
      
    case QUERY_TYPES.PLANNING:
      return {
        ...baseContext,
        upcomingEvents: detail.events.upcomingByMonth,
        eventGaps: detail.events.eventGaps,
        predictedNextRelease: detail.releases.predictedNextRelease,
        recommendations: summary.recommendations
      };
      
    case QUERY_TYPES.HELP:
    case QUERY_TYPES.GENERAL:
    default:
      return {
        ...baseContext,
        nextEvent: summary.nextEvent,
        latestRelease: summary.latestRelease,
        topPlatforms: summary.topPlatforms,
        recommendations: summary.recommendations.slice(0, 2)
      };
  }
};

/**
 * Genera un prompt contextualizado para Vertex AI
 * @param {string} query - Consulta del usuario
 * @param {Array} conversationHistory - Historial de conversación
 * @param {Object} contextualData - Datos contextuales para la consulta
 * @returns {string} - Prompt contextualizado para Vertex AI
 */
export const generateContextualizedPrompt = (query, conversationHistory, contextualData) => {
  // Convertir datos contextuales a formato de texto
  const contextDataText = JSON.stringify(contextualData, null, 2);
  
  // Historial de conversación formateado
  const conversationHistoryText = conversationHistory
    .map(msg => `${msg.role === 'user' ? 'Usuario' : 'Zeus'}: ${msg.content}`)
    .join('\n');
  
  // Generar prompt base
  const basePrompt = `
    Eres Zeus, un asistente inteligente especializado en gestión de carrera para artistas musicales en la plataforma ArtistRM.
    Respondes en español de manera profesional, concisa y útil.
    
    Tu objetivo es proporcionar análisis, recomendaciones y respuestas personalizadas basadas en los datos reales del artista.
    Debes ser específico y referirte a los datos concretos del artista en tus respuestas.
    
    Datos actuales del artista:
    ${contextDataText}
    
    Historial de conversación:
    ${conversationHistoryText}
    
    Usuario: ${query}
    
    Zeus:
  `;
  
  return basePrompt;
};

/**
 * Obtiene contexto completo para una consulta de usuario
 * @param {string} userId - ID del usuario/artista
 * @param {string} query - Consulta del usuario
 * @param {Array} conversationHistory - Historial de conversación
 * @returns {Promise<Object>} - Contexto completo para la consulta
 */
export const getQueryContext = async (userId, query, conversationHistory) => {
  try {
    // Obtener datos del artista
    const artistData = await getArtistSummary(userId);
    
    // Generar análisis completo
    const artistAnalysis = generateArtistAnalysis(artistData);
    
    // Detectar tipo de consulta
    const queryType = detectQueryType(query);
    
    // Obtener datos contextuales relevantes
    const contextualData = getContextualData(artistAnalysis, queryType);
    
    // Generar prompt contextualizado
    const contextualizedPrompt = generateContextualizedPrompt(
      query,
      conversationHistory,
      contextualData
    );
    
    return {
      queryType,
      contextualData,
      contextualizedPrompt,
      artistAnalysis
    };
  } catch (error) {
    console.error('Error obteniendo contexto para consulta:', error);
    
    // Retornar prompt genérico en caso de error
    const genericPrompt = `
      Eres Zeus, un asistente inteligente para artistas musicales en la plataforma ArtistRM.
      Respondes en español de manera profesional, concisa y útil.
      
      Historial de conversación:
      ${conversationHistory.map(msg => `${msg.role === 'user' ? 'Usuario' : 'Zeus'}: ${msg.content}`).join('\n')}
      
      Usuario: ${query}
      
      Zeus:
    `;
    
    return {
      queryType: QUERY_TYPES.GENERAL,
      contextualData: null,
      contextualizedPrompt: genericPrompt,
      artistAnalysis: null
    };
  }
};
