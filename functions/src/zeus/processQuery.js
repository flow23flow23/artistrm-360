const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { VertexAI } = require('@google-cloud/vertexai');

// Inicializar Firebase Admin si no está inicializado
if (!admin.apps.length) {
  admin.initializeApp();
}

// Inicializar Vertex AI
const vertexAI = new VertexAI({
  project: 'zamx-v1',
  location: 'us-central1',
});

// Modelo de lenguaje PaLM 2
const palmModel = vertexAI.preview.getGenerativeModel({
  model: 'text-bison',
  generation_config: {
    max_output_tokens: 1024,
    temperature: 0.2,
    top_p: 0.95,
    top_k: 40,
  },
});

// Función para procesar consultas de Zeus IA
exports.processQuery = functions.https.onCall(async (data, context) => {
  // Verificar autenticación
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'La función debe ser llamada por un usuario autenticado.'
    );
  }
  
  try {
    const { query, sessionId, conversationHistory = [] } = data;
    const userId = context.auth.uid;
    
    // Registrar consulta en Firestore
    const conversationRef = admin.firestore().collection('conversations').doc();
    const messageId = admin.firestore.FieldValue.serverTimestamp();
    
    await conversationRef.set({
      userId,
      sessionId,
      timestamp: messageId,
      messages: [
        ...conversationHistory,
        {
          role: 'user',
          content: query,
          timestamp: messageId,
        }
      ],
      metadata: {
        source: 'zeus-ia',
        ip: context.rawRequest.ip,
        userAgent: context.rawRequest.headers['user-agent'],
      },
    });
    
    // Preparar prompt para el modelo
    const prompt = `
      Eres Zeus, un asistente inteligente para artistas musicales en la plataforma ArtistRM.
      Respondes en español de manera profesional, concisa y útil.
      Tu objetivo es ayudar al artista a analizar su carrera musical, proporcionar insights valiosos y recomendaciones accionables.
      
      Historial de conversación:
      ${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}
      
      Usuario: ${query}
      
      Zeus:
    `;
    
    // Llamar a Vertex AI
    const result = await palmModel.generateText({
      prompt,
    });
    
    const response = result.response.text;
    
    // Actualizar conversación con respuesta
    await conversationRef.update({
      messages: admin.firestore.FieldValue.arrayUnion({
        role: 'assistant',
        content: response,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      }),
    });
    
    // Devolver respuesta
    return {
      messageId: conversationRef.id,
      response,
    };
  } catch (error) {
    console.error('Error procesando consulta:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Error procesando la consulta. Por favor, intenta de nuevo más tarde.'
    );
  }
});
