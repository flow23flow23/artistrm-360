import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

// Inicializar la aplicación de Firebase
admin.initializeApp();

// Exportar módulos de funciones
export * from './auth/auth';
export * from './artists/artists';
export * from './projects/projects';
export * from './content/content';
export * from './analytics/analytics';
export * from './zeus/zeus';
export * from './integrations/integrations';

// Función de prueba para verificar el despliegue
export const helloWorld = functions.https.onCall((data, context) => {
  return {
    message: "¡Hola desde ArtistRM Cloud Functions!",
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  };
});
