// Archivo: /home/ubuntu/artistrm-360-github/src/lib/zeus/intentClassifier.js

/**
 * Módulo de clasificación de intenciones para Zeus IA
 * 
 * Este módulo proporciona funciones para clasificar las intenciones
 * del usuario en sus consultas, permitiendo respuestas más precisas
 * y adaptadas al propósito específico de cada interacción.
 */

import { VertexAI } from '@google-cloud/vertexai';

// Definición de intenciones que Zeus IA puede reconocer
export const INTENT_TYPES = {
  // Intenciones informativas
  GET_STATS: 'get_stats',                     // Obtener estadísticas o métricas
  GET_SCHEDULE: 'get_schedule',               // Consultar agenda o calendario
  GET_PERFORMANCE: 'get_performance',         // Consultar rendimiento
  GET_TRENDS: 'get_trends',                   // Consultar tendencias
  GET_COMPARISON: 'get_comparison',           // Solicitar comparación
  
  // Intenciones de acción
  PLAN_RELEASE: 'plan_release',               // Planificar lanzamiento
  PLAN_TOUR: 'plan_tour',                     // Planificar gira o eventos
  PLAN_PROMOTION: 'plan_promotion',           // Planificar promoción
  OPTIMIZE_STRATEGY: 'optimize_strategy',     // Optimizar estrategia
  
  // Intenciones de recomendación
  GET_RECOMMENDATIONS: 'get_recommendations',  // Solicitar recomendaciones generales
  GET_INSIGHTS: 'get_insights',               // Solicitar insights
  GET_OPPORTUNITIES: 'get_opportunities',     // Identificar oportunidades
  
  // Intenciones de sistema
  HELP: 'help',                               // Solicitar ayuda
  FEEDBACK: 'feedback',                       // Dar feedback
  PREFERENCES: 'preferences',                 // Establecer preferencias
  GREETING: 'greeting',                       // Saludar
  FAREWELL: 'farewell',                       // Despedirse
  
  // Intención por defecto
  GENERAL_QUERY: 'general_query'              // Consulta general
};

// Mapeo de intenciones a tipos de consulta para contextualización
export const INTENT_TO_QUERY_TYPE = {
  [INTENT_TYPES.GET_STATS]: 'analytics',
  [INTENT_TYPES.GET_SCHEDULE]: 'events',
  [INTENT_TYPES.GET_PERFORMANCE]: 'analytics',
  [INTENT_TYPES.GET_TRENDS]: 'analytics',
  [INTENT_TYPES.GET_COMPARISON]: 'analytics',
  
  [INTENT_TYPES.PLAN_RELEASE]: 'releases',
  [INTENT_TYPES.PLAN_TOUR]: 'events',
  [INTENT_TYPES.PLAN_PROMOTION]: 'social_media',
  [INTENT_TYPES.OPTIMIZE_STRATEGY]: 'recommendations',
  
  [INTENT_TYPES.GET_RECOMMENDATIONS]: 'recommendations',
  [INTENT_TYPES.GET_INSIGHTS]: 'analytics',
  [INTENT_TYPES.GET_OPPORTUNITIES]: 'recommendations',
  
  [INTENT_TYPES.HELP]: 'help',
  [INTENT_TYPES.FEEDBACK]: 'general',
  [INTENT_TYPES.PREFERENCES]: 'general',
  [INTENT_TYPES.GREETING]: 'general',
  [INTENT_TYPES.FAREWELL]: 'general',
  
  [INTENT_TYPES.GENERAL_QUERY]: 'general'
};

/**
 * Clasificador basado en reglas para intenciones comunes
 * @param {string} query - Consulta del usuario
 * @returns {string|null} - Intención detectada o null si no hay coincidencia
 */
export const ruleBasedClassifier = (query) => {
  const queryLower = query.toLowerCase();
  
  // Patrones para intenciones de sistema
  if (/^(hola|hey|saludos|buenos días|buenas tardes|buenas noches)/.test(queryLower)) {
    return INTENT_TYPES.GREETING;
  }
  
  if (/^(adiós|hasta luego|nos vemos|chao|bye)/.test(queryLower)) {
    return INTENT_TYPES.FAREWELL;
  }
  
  if (/^(ayuda|ayúdame|cómo funciona|qué puedes hacer|instrucciones)/.test(queryLower)) {
    return INTENT_TYPES.HELP;
  }
  
  if (/^(prefiero|me gusta más|configura|ajusta|cambia)/.test(queryLower)) {
    return INTENT_TYPES.PREFERENCES;
  }
  
  // Patrones para intenciones informativas
  if (/^(muéstrame|cuáles son|cuántos|dame) .*(estadísticas|stats|números|métricas|datos)/.test(queryLower)) {
    return INTENT_TYPES.GET_STATS;
  }
  
  if (/^(muéstrame|cuál es|cómo está|dame) .*(agenda|calendario|horario|eventos|conciertos)/.test(queryLower)) {
    return INTENT_TYPES.GET_SCHEDULE;
  }
  
  if (/^(cómo está|cuál es|analiza) .*(rendimiento|desempeño|performance)/.test(queryLower)) {
    return INTENT_TYPES.GET_PERFORMANCE;
  }
  
  if (/^(cuáles son|muéstrame|analiza) .*(tendencias|trends|cambios|evolución)/.test(queryLower)) {
    return INTENT_TYPES.GET_TRENDS;
  }
  
  if (/^(compara|comparación|versus|vs|diferencia entre)/.test(queryLower)) {
    return INTENT_TYPES.GET_COMPARISON;
  }
  
  // Patrones para intenciones de acción
  if (/^(ayúdame a|cómo|planificar|planear|organizar) .*(lanzamiento|lanzar|publicar|estrenar)/.test(queryLower)) {
    return INTENT_TYPES.PLAN_RELEASE;
  }
  
  if (/^(ayúdame a|cómo|planificar|planear|organizar) .*(gira|tour|conciertos|eventos)/.test(queryLower)) {
    return INTENT_TYPES.PLAN_TOUR;
  }
  
  if (/^(ayúdame a|cómo|planificar|planear|organizar) .*(promoción|marketing|publicidad|campaña)/.test(queryLower)) {
    return INTENT_TYPES.PLAN_PROMOTION;
  }
  
  if (/^(optimiza|mejora|potencia|aumenta) .*(estrategia|enfoque|resultados)/.test(queryLower)) {
    return INTENT_TYPES.OPTIMIZE_STRATEGY;
  }
  
  // Patrones para intenciones de recomendación
  if (/^(recomienda|sugiéreme|qué me recomiendas|qué debería)/.test(queryLower)) {
    return INTENT_TYPES.GET_RECOMMENDATIONS;
  }
  
  if (/^(dame insights|insights sobre|análisis profundo|entendimiento de)/.test(queryLower)) {
    return INTENT_TYPES.GET_INSIGHTS;
  }
  
  if (/^(oportunidades|posibilidades|potencial|dónde puedo|cómo puedo)/.test(queryLower)) {
    return INTENT_TYPES.GET_OPPORTUNITIES;
  }
  
  // No se encontró un patrón claro
  return null;
};

/**
 * Clasificador basado en modelo de lenguaje para intenciones complejas
 * @param {string} query - Consulta del usuario
 * @param {Array} conversationHistory - Historial de conversación
 * @returns {Promise<Object>} - Resultado de la clasificación
 */
export const modelBasedClassifier = async (query, conversationHistory = []) => {
  try {
    // Inicializar Vertex AI
    const vertexAI = new VertexAI({
      project: 'zamx-v1',
      location: 'us-central1',
    });
    
    // Acceder al modelo Gemini
    const generativeModel = vertexAI.getGenerativeModel({
      model: 'gemini-pro',
      generation_config: {
        max_output_tokens: 256,
        temperature: 0.1,
        top_p: 0.8,
        top_k: 40
      }
    });
    
    // Crear contexto con historial de conversación
    const recentHistory = conversationHistory.slice(-3).map(msg => 
      `${msg.role === 'user' ? 'Usuario' : 'Asistente'}: ${msg.content}`
    ).join('\n');
    
    // Crear prompt para clasificación
    const prompt = `
      Clasifica la siguiente consulta de un artista musical en una de estas categorías de intención:
      
      ${Object.values(INTENT_TYPES).join(', ')}
      
      Contexto de conversación reciente:
      ${recentHistory}
      
      Consulta actual: "${query}"
      
      Responde solo con la categoría de intención más apropiada y una puntuación de confianza entre 0 y 1.
      Formato: {"intent": "nombre_de_intencion", "confidence": 0.95}
    `;
    
    // Obtener respuesta del modelo
    const result = await generativeModel.generateContent(prompt);
    const response = result.response.text();
    
    // Parsear respuesta
    try {
      // Limpiar respuesta para asegurar que sea JSON válido
      const cleanedResponse = response.replace(/```json|```/g, '').trim();
      const classification = JSON.parse(cleanedResponse);
      
      return {
        intent: classification.intent,
        confidence: classification.confidence,
        source: 'model'
      };
    } catch (parseError) {
      console.error('Error parseando respuesta del modelo:', parseError);
      
      // Intentar extraer la intención mediante regex si el parsing falla
      const intentMatch = response.match(/"intent":\s*"([^"]+)"/);
      const confidenceMatch = response.match(/"confidence":\s*([\d.]+)/);
      
      if (intentMatch && confidenceMatch) {
        return {
          intent: intentMatch[1],
          confidence: parseFloat(confidenceMatch[1]),
          source: 'model_regex'
        };
      }
      
      // Si todo falla, devolver intención general
      return {
        intent: INTENT_TYPES.GENERAL_QUERY,
        confidence: 0.5,
        source: 'fallback'
      };
    }
  } catch (error) {
    console.error('Error en clasificador basado en modelo:', error);
    
    // En caso de error, devolver null para usar clasificador de reglas como fallback
    return null;
  }
};

/**
 * Extrae entidades relevantes de la consulta
 * @param {string} query - Consulta del usuario
 * @param {string} intent - Intención detectada
 * @returns {Object} - Entidades extraídas
 */
export const extractEntities = (query, intent) => {
  const queryLower = query.toLowerCase();
  const entities = {};
  
  // Extraer plataformas de streaming
  const streamingPlatforms = ['spotify', 'apple music', 'youtube', 'deezer', 'tidal', 'amazon music'];
  const mentionedPlatforms = streamingPlatforms.filter(platform => queryLower.includes(platform));
  
  if (mentionedPlatforms.length > 0) {
    entities.platforms = mentionedPlatforms;
  }
  
  // Extraer redes sociales
  const socialNetworks = ['instagram', 'facebook', 'tiktok', 'twitter', 'youtube'];
  const mentionedNetworks = socialNetworks.filter(network => queryLower.includes(network));
  
  if (mentionedNetworks.length > 0) {
    entities.socialNetworks = mentionedNetworks;
  }
  
  // Extraer períodos de tiempo
  const timePatterns = [
    { regex: /últim[oa]s?\s+(\d+)\s+días/i, unit: 'days' },
    { regex: /últim[oa]s?\s+(\d+)\s+semanas/i, unit: 'weeks' },
    { regex: /últim[oa]s?\s+(\d+)\s+meses/i, unit: 'months' },
    { regex: /últim[oa]s?\s+(\d+)\s+años?/i, unit: 'years' },
    { regex: /próxim[oa]s?\s+(\d+)\s+días/i, unit: 'days', future: true },
    { regex: /próxim[oa]s?\s+(\d+)\s+semanas/i, unit: 'weeks', future: true },
    { regex: /próxim[oa]s?\s+(\d+)\s+meses/i, unit: 'months', future: true }
  ];
  
  for (const pattern of timePatterns) {
    const match = queryLower.match(pattern.regex);
    if (match) {
      entities.timeframe = {
        value: parseInt(match[1]),
        unit: pattern.unit,
        future: pattern.future || false
      };
      break;
    }
  }
  
  // Extraer tipos de contenido según la intención
  if ([INTENT_TYPES.GET_STATS, INTENT_TYPES.GET_PERFORMANCE, INTENT_TYPES.GET_TRENDS].includes(intent)) {
    const contentTypes = {
      streams: ['streams', 'reproducciones', 'escuchas'],
      followers: ['seguidores', 'followers', 'fans'],
      engagement: ['engagement', 'interacción', 'interacciones'],
      revenue: ['ingresos', 'ganancias', 'revenue', 'dinero'],
      events: ['eventos', 'conciertos', 'shows', 'presentaciones']
    };
    
    const mentionedContentTypes = [];
    
    for (const [type, keywords] of Object.entries(contentTypes)) {
      if (keywords.some(keyword => queryLower.includes(keyword))) {
        mentionedContentTypes.push(type);
      }
    }
    
    if (mentionedContentTypes.length > 0) {
      entities.contentTypes = mentionedContentTypes;
    }
  }
  
  return entities;
};

/**
 * Clasifica la intención de una consulta de usuario
 * @param {string} query - Consulta del usuario
 * @param {Array} conversationHistory - Historial de conversación
 * @returns {Promise<Object>} - Resultado de la clasificación con entidades
 */
export const classifyIntent = async (query, conversationHistory = []) => {
  // Primero intentar con clasificador basado en reglas (rápido)
  const ruleBasedIntent = ruleBasedClassifier(query);
  
  if (ruleBasedIntent) {
    // Si el clasificador de reglas encuentra una coincidencia clara
    const entities = extractEntities(query, ruleBasedIntent);
    
    return {
      intent: ruleBasedIntent,
      confidence: 0.9,
      entities,
      source: 'rules',
      queryType: INTENT_TO_QUERY_TYPE[ruleBasedIntent] || 'general'
    };
  }
  
  // Si no hay coincidencia clara, usar clasificador basado en modelo
  const modelResult = await modelBasedClassifier(query, conversationHistory);
  
  if (modelResult) {
    // Si el modelo devuelve un resultado válido
    const entities = extractEntities(query, modelResult.intent);
    
    return {
      ...modelResult,
      entities,
      queryType: INTENT_TO_QUERY_TYPE[modelResult.intent] || 'general'
    };
  }
  
  // Si todo falla, clasificar como consulta general
  return {
    intent: INTENT_TYPES.GENERAL_QUERY,
    confidence: 0.5,
    entities: {},
    source: 'default',
    queryType: 'general'
  };
};
