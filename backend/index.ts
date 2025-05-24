import * as functions from 'firebase-functions';
import { auth } from './auth/auth';
import { artists } from './artists/artists';
import { projects } from './projects/projects';
import { content } from './content/content';
import { analytics } from './analytics/analytics';
import { zeus } from './zeus/zeus';
import { integrations } from './integrations/integrations';

// Exportar todas las funciones por módulo
export const authFunctions = auth;
export const artistsFunctions = artists;
export const projectsFunctions = projects;
export const contentFunctions = content;
export const analyticsFunctions = analytics;
export const zeusFunctions = zeus;
export const integrationsFunctions = integrations;

// Función de estado para verificar que el servicio está activo
export const status = functions.https.onRequest((request, response) => {
  response.json({
    status: 'online',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});
