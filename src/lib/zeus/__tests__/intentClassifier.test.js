// Archivo: /home/ubuntu/artistrm-360-github/src/lib/zeus/__tests__/intentClassifier.test.js

import { 
  INTENT_TYPES,
  ruleBasedClassifier, 
  modelBasedClassifier,
  extractEntities,
  classifyIntent
} from '../intentClassifier';

// Mock de Vertex AI
jest.mock('@google-cloud/vertexai', () => {
  return {
    VertexAI: jest.fn().mockImplementation(() => {
      return {
        getGenerativeModel: jest.fn().mockImplementation(() => {
          return {
            generateContent: jest.fn().mockResolvedValue({
              response: {
                text: () => '{"intent": "get_stats", "confidence": 0.95}'
              }
            })
          };
        })
      };
    })
  };
});

describe('Intent Classifier', () => {
  describe('ruleBasedClassifier', () => {
    it('debe identificar saludos correctamente', () => {
      expect(ruleBasedClassifier('Hola Zeus')).toBe(INTENT_TYPES.GREETING);
      expect(ruleBasedClassifier('Buenos días, ¿cómo estás?')).toBe(INTENT_TYPES.GREETING);
      expect(ruleBasedClassifier('Hey, necesito ayuda')).toBe(INTENT_TYPES.GREETING);
    });

    it('debe identificar despedidas correctamente', () => {
      expect(ruleBasedClassifier('Adiós Zeus')).toBe(INTENT_TYPES.FAREWELL);
      expect(ruleBasedClassifier('Hasta luego, gracias')).toBe(INTENT_TYPES.FAREWELL);
      expect(ruleBasedClassifier('Chao, hablamos después')).toBe(INTENT_TYPES.FAREWELL);
    });

    it('debe identificar solicitudes de ayuda correctamente', () => {
      expect(ruleBasedClassifier('Ayuda con la plataforma')).toBe(INTENT_TYPES.HELP);
      expect(ruleBasedClassifier('¿Cómo funciona esto?')).toBe(INTENT_TYPES.HELP);
      expect(ruleBasedClassifier('Necesito instrucciones')).toBe(INTENT_TYPES.HELP);
    });

    it('debe identificar solicitudes de estadísticas correctamente', () => {
      expect(ruleBasedClassifier('Muéstrame las estadísticas de Spotify')).toBe(INTENT_TYPES.GET_STATS);
      expect(ruleBasedClassifier('Dame los números de reproducciones')).toBe(INTENT_TYPES.GET_STATS);
      expect(ruleBasedClassifier('Cuáles son mis métricas este mes')).toBe(INTENT_TYPES.GET_STATS);
    });

    it('debe identificar solicitudes de agenda correctamente', () => {
      expect(ruleBasedClassifier('Muéstrame mi agenda de conciertos')).toBe(INTENT_TYPES.GET_SCHEDULE);
      expect(ruleBasedClassifier('Cuál es mi calendario de eventos')).toBe(INTENT_TYPES.GET_SCHEDULE);
      expect(ruleBasedClassifier('Dame mi horario de eventos')).toBe(INTENT_TYPES.GET_SCHEDULE);
    });

    it('debe identificar solicitudes de rendimiento correctamente', () => {
      expect(ruleBasedClassifier('Cómo está mi rendimiento en Instagram')).toBe(INTENT_TYPES.GET_PERFORMANCE);
      expect(ruleBasedClassifier('Analiza mi desempeño en redes sociales')).toBe(INTENT_TYPES.GET_PERFORMANCE);
      expect(ruleBasedClassifier('Cuál es mi performance en Spotify')).toBe(INTENT_TYPES.GET_PERFORMANCE);
    });

    it('debe identificar solicitudes de tendencias correctamente', () => {
      expect(ruleBasedClassifier('Cuáles son las tendencias de mis streams')).toBe(INTENT_TYPES.GET_TRENDS);
      expect(ruleBasedClassifier('Muéstrame los trends de seguidores')).toBe(INTENT_TYPES.GET_TRENDS);
      expect(ruleBasedClassifier('Analiza la evolución de mis reproducciones')).toBe(INTENT_TYPES.GET_TRENDS);
    });

    it('debe identificar solicitudes de comparación correctamente', () => {
      expect(ruleBasedClassifier('Compara mis resultados en Spotify y Apple Music')).toBe(INTENT_TYPES.GET_COMPARISON);
      expect(ruleBasedClassifier('Diferencia entre mis seguidores de Instagram y TikTok')).toBe(INTENT_TYPES.GET_COMPARISON);
      expect(ruleBasedClassifier('Instagram versus TikTok en engagement')).toBe(INTENT_TYPES.GET_COMPARISON);
    });

    it('debe identificar solicitudes de planificación de lanzamientos correctamente', () => {
      expect(ruleBasedClassifier('Ayúdame a planificar mi próximo lanzamiento')).toBe(INTENT_TYPES.PLAN_RELEASE);
      expect(ruleBasedClassifier('Cómo organizar el estreno de mi nuevo single')).toBe(INTENT_TYPES.PLAN_RELEASE);
      expect(ruleBasedClassifier('Planificar lanzamiento de EP')).toBe(INTENT_TYPES.PLAN_RELEASE);
    });

    it('debe identificar solicitudes de planificación de giras correctamente', () => {
      expect(ruleBasedClassifier('Ayúdame a planificar mi gira')).toBe(INTENT_TYPES.PLAN_TOUR);
      expect(ruleBasedClassifier('Cómo organizar mis próximos conciertos')).toBe(INTENT_TYPES.PLAN_TOUR);
      expect(ruleBasedClassifier('Planear tour por España')).toBe(INTENT_TYPES.PLAN_TOUR);
    });

    it('debe identificar solicitudes de planificación de promoción correctamente', () => {
      expect(ruleBasedClassifier('Ayúdame a planificar la promoción de mi single')).toBe(INTENT_TYPES.PLAN_PROMOTION);
      expect(ruleBasedClassifier('Cómo organizar mi campaña de marketing')).toBe(INTENT_TYPES.PLAN_PROMOTION);
      expect(ruleBasedClassifier('Planificar publicidad para mi lanzamiento')).toBe(INTENT_TYPES.PLAN_PROMOTION);
    });

    it('debe identificar solicitudes de optimización de estrategia correctamente', () => {
      expect(ruleBasedClassifier('Optimiza mi estrategia en redes sociales')).toBe(INTENT_TYPES.OPTIMIZE_STRATEGY);
      expect(ruleBasedClassifier('Mejora mis resultados en Spotify')).toBe(INTENT_TYPES.OPTIMIZE_STRATEGY);
      expect(ruleBasedClassifier('Potencia mi presencia en TikTok')).toBe(INTENT_TYPES.OPTIMIZE_STRATEGY);
    });

    it('debe identificar solicitudes de recomendaciones correctamente', () => {
      expect(ruleBasedClassifier('Recomiéndame qué hacer con mi próximo lanzamiento')).toBe(INTENT_TYPES.GET_RECOMMENDATIONS);
      expect(ruleBasedClassifier('Qué me recomiendas para aumentar seguidores')).toBe(INTENT_TYPES.GET_RECOMMENDATIONS);
      expect(ruleBasedClassifier('Sugiéreme ideas para mi próximo video')).toBe(INTENT_TYPES.GET_RECOMMENDATIONS);
    });

    it('debe identificar solicitudes de insights correctamente', () => {
      expect(ruleBasedClassifier('Dame insights sobre mi audiencia')).toBe(INTENT_TYPES.GET_INSIGHTS);
      expect(ruleBasedClassifier('Insights sobre mis fans en Spotify')).toBe(INTENT_TYPES.GET_INSIGHTS);
      expect(ruleBasedClassifier('Análisis profundo de mis oyentes')).toBe(INTENT_TYPES.GET_INSIGHTS);
    });

    it('debe identificar solicitudes de oportunidades correctamente', () => {
      expect(ruleBasedClassifier('Oportunidades para crecer en TikTok')).toBe(INTENT_TYPES.GET_OPPORTUNITIES);
      expect(ruleBasedClassifier('Dónde puedo encontrar nuevos fans')).toBe(INTENT_TYPES.GET_OPPORTUNITIES);
      expect(ruleBasedClassifier('Cómo puedo aumentar mis streams')).toBe(INTENT_TYPES.GET_OPPORTUNITIES);
    });

    it('debe devolver null para consultas sin patrón claro', () => {
      expect(ruleBasedClassifier('Información sobre música')).toBeNull();
      expect(ruleBasedClassifier('Algo interesante')).toBeNull();
      expect(ruleBasedClassifier('Zeus')).toBeNull();
    });
  });

  describe('modelBasedClassifier', () => {
    it('debe clasificar consultas usando el modelo de lenguaje', async () => {
      const result = await modelBasedClassifier('Cuántas reproducciones tuve este mes', []);
      
      expect(result).toEqual({
        intent: 'get_stats',
        confidence: 0.95,
        source: 'model'
      });
    });

    it('debe manejar errores de parsing correctamente', async () => {
      // Modificar mock para devolver respuesta no válida
      jest.mock('@google-cloud/vertexai', () => {
        return {
          VertexAI: jest.fn().mockImplementation(() => {
            return {
              getGenerativeModel: jest.fn().mockImplementation(() => {
                return {
                  generateContent: jest.fn().mockResolvedValue({
                    response: {
                      text: () => 'Respuesta no válida'
                    }
                  })
                };
              })
            };
          })
        };
      });

      const result = await modelBasedClassifier('Consulta de prueba', []);
      
      expect(result).toEqual({
        intent: INTENT_TYPES.GENERAL_QUERY,
        confidence: 0.5,
        source: 'fallback'
      });
    });
  });

  describe('extractEntities', () => {
    it('debe extraer plataformas de streaming correctamente', () => {
      const result = extractEntities('Cómo me está yendo en Spotify y Apple Music', INTENT_TYPES.GET_PERFORMANCE);
      
      expect(result.platforms).toContain('spotify');
      expect(result.platforms).toContain('apple music');
    });

    it('debe extraer redes sociales correctamente', () => {
      const result = extractEntities('Compara mis seguidores de Instagram y TikTok', INTENT_TYPES.GET_COMPARISON);
      
      expect(result.socialNetworks).toContain('instagram');
      expect(result.socialNetworks).toContain('tiktok');
    });

    it('debe extraer períodos de tiempo correctamente', () => {
      const result = extractEntities('Muéstrame mis streams de los últimos 30 días', INTENT_TYPES.GET_STATS);
      
      expect(result.timeframe.value).toBe(30);
      expect(result.timeframe.unit).toBe('days');
      expect(result.timeframe.future).toBe(false);
    });

    it('debe extraer tipos de contenido correctamente', () => {
      const result = extractEntities('Muéstrame mis reproducciones y engagement', INTENT_TYPES.GET_STATS);
      
      expect(result.contentTypes).toContain('streams');
      expect(result.contentTypes).toContain('engagement');
    });
  });

  describe('classifyIntent', () => {
    it('debe usar clasificador basado en reglas si encuentra coincidencia', async () => {
      const result = await classifyIntent('Hola Zeus, ¿cómo estás?', []);
      
      expect(result.intent).toBe(INTENT_TYPES.GREETING);
      expect(result.source).toBe('rules');
    });

    it('debe usar clasificador basado en modelo si no hay coincidencia en reglas', async () => {
      const result = await classifyIntent('Análisis de mi música en plataformas', []);
      
      expect(result.intent).toBe('get_stats'); // Del mock del modelo
      expect(result.source).toBe('model');
    });

    it('debe devolver consulta general si todo falla', async () => {
      // Modificar mocks para simular fallo en ambos clasificadores
      jest.spyOn(global, 'ruleBasedClassifier').mockReturnValue(null);
      jest.spyOn(global, 'modelBasedClassifier').mockResolvedValue(null);
      
      const result = await classifyIntent('Consulta muy ambigua', []);
      
      expect(result.intent).toBe(INTENT_TYPES.GENERAL_QUERY);
      expect(result.source).toBe('default');
    });
  });
});
