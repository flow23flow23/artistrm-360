import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

// Inicializar la aplicación de Firebase Admin con las credenciales
const serviceAccount = require('../../../firebase-adminsdk.json');

// Verificar si la aplicación ya está inicializada para evitar inicializaciones múltiples
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
    storageBucket: `${serviceAccount.project_id}.appspot.com`
  });
}

// Exportar las instancias de servicios para uso en otros módulos
export const db = admin.firestore();
export const auth = admin.auth();
export const storage = admin.storage();
export const messaging = admin.messaging();

// Configurar Firestore
db.settings({
  timestampsInSnapshots: true,
  ignoreUndefinedProperties: true
});

// Exportar funciones de utilidad para manejo de errores
export const handleError = (error: any): functions.https.HttpsError => {
  console.error('Error:', error);
  
  if (error instanceof functions.https.HttpsError) {
    return error;
  }
  
  // Determinar el tipo de error y devolver el código apropiado
  if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
    return new functions.https.HttpsError(
      'unauthenticated',
      'Credenciales inválidas'
    );
  }
  
  if (error.code === 'permission-denied' || error.code === 'auth/insufficient-permission') {
    return new functions.https.HttpsError(
      'permission-denied',
      'No tienes permisos para realizar esta acción'
    );
  }
  
  if (error.code === 'not-found') {
    return new functions.https.HttpsError(
      'not-found',
      'El recurso solicitado no existe'
    );
  }
  
  // Error genérico para cualquier otro caso
  return new functions.https.HttpsError(
    'internal',
    'Ha ocurrido un error interno. Por favor, inténtalo de nuevo más tarde.'
  );
};

// Función para validar que un usuario está autenticado
export const validateAuth = async (context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'La función debe ser llamada mientras estás autenticado.'
    );
  }
  return context.auth.uid;
};

// Función para validar que un usuario tiene los permisos necesarios
export const validatePermission = async (
  uid: string,
  artistId: string,
  requiredRole: string
) => {
  const userArtistRef = db.collection('user_artists').doc(`${uid}_${artistId}`);
  const userArtistDoc = await userArtistRef.get();
  
  if (!userArtistDoc.exists) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'No tienes acceso a este artista'
    );
  }
  
  const userRole = userArtistDoc.data()?.role;
  
  // Roles con permisos en orden jerárquico
  const roles = ['viewer', 'editor', 'admin', 'owner'];
  
  const userRoleIndex = roles.indexOf(userRole);
  const requiredRoleIndex = roles.indexOf(requiredRole);
  
  if (userRoleIndex < requiredRoleIndex) {
    throw new functions.https.HttpsError(
      'permission-denied',
      `Se requiere rol de ${requiredRole} o superior para esta acción`
    );
  }
  
  return userRole;
};

// Función para generar IDs únicos
export const generateId = (): string => {
  return db.collection('_').doc().id;
};

// Función para obtener la fecha actual en formato ISO
export const getCurrentTimestamp = (): admin.firestore.Timestamp => {
  return admin.firestore.Timestamp.now();
};

// Exportar la configuración regional para las funciones
export const region = 'us-central1';
