import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { auth, db, handleError, region, validateAuth } from '../utils/admin';

/**
 * Función para registrar un nuevo usuario
 */
export const registerUser = functions.region(region).https.onCall(async (data, context) => {
  try {
    const { email, password, displayName, phoneNumber } = data;
    
    // Validar datos de entrada
    if (!email || !password || !displayName) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Se requiere email, contraseña y nombre para el registro'
      );
    }
    
    // Crear usuario en Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName,
      phoneNumber: phoneNumber || null,
      emailVerified: false,
    });
    
    // Crear documento de usuario en Firestore
    await db.collection('users').doc(userRecord.uid).set({
      email,
      displayName,
      phoneNumber: phoneNumber || null,
      role: 'user',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLogin: null,
      preferences: {
        theme: 'dark',
        notifications: true,
        language: 'es'
      }
    });
    
    // Enviar email de verificación
    await auth.generateEmailVerificationLink(email);
    
    return {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName
    };
  } catch (error) {
    return handleError(error);
  }
});

/**
 * Función para actualizar el perfil de usuario
 */
export const updateUserProfile = functions.region(region).https.onCall(async (data, context) => {
  try {
    // Validar autenticación
    const uid = await validateAuth(context);
    
    const { displayName, phoneNumber, photoURL } = data;
    
    // Actualizar en Firebase Auth
    const updateAuthData: any = {};
    if (displayName) updateAuthData.displayName = displayName;
    if (phoneNumber) updateAuthData.phoneNumber = phoneNumber;
    if (photoURL) updateAuthData.photoURL = photoURL;
    
    if (Object.keys(updateAuthData).length > 0) {
      await auth.updateUser(uid, updateAuthData);
    }
    
    // Actualizar en Firestore
    const updateData: any = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    if (displayName) updateData.displayName = displayName;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (photoURL) updateData.photoURL = photoURL;
    
    await db.collection('users').doc(uid).update(updateData);
    
    return { success: true };
  } catch (error) {
    return handleError(error);
  }
});

/**
 * Función para cambiar la contraseña del usuario
 */
export const changePassword = functions.region(region).https.onCall(async (data, context) => {
  try {
    // Validar autenticación
    const uid = await validateAuth(context);
    
    const { newPassword } = data;
    
    if (!newPassword || newPassword.length < 6) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'La nueva contraseña debe tener al menos 6 caracteres'
      );
    }
    
    // Actualizar contraseña
    await auth.updateUser(uid, { password: newPassword });
    
    return { success: true };
  } catch (error) {
    return handleError(error);
  }
});

/**
 * Función para solicitar restablecimiento de contraseña
 */
export const requestPasswordReset = functions.region(region).https.onCall(async (data, context) => {
  try {
    const { email } = data;
    
    if (!email) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Se requiere el email para restablecer la contraseña'
      );
    }
    
    // Generar enlace de restablecimiento
    await auth.generatePasswordResetLink(email);
    
    return { success: true };
  } catch (error) {
    return handleError(error);
  }
});

/**
 * Función para actualizar las preferencias del usuario
 */
export const updateUserPreferences = functions.region(region).https.onCall(async (data, context) => {
  try {
    // Validar autenticación
    const uid = await validateAuth(context);
    
    const { theme, notifications, language } = data;
    
    const updateData: any = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // Construir objeto de preferencias con los campos proporcionados
    const preferences: any = {};
    if (theme !== undefined) preferences.theme = theme;
    if (notifications !== undefined) preferences.notifications = notifications;
    if (language !== undefined) preferences.language = language;
    
    // Actualizar solo los campos proporcionados
    if (Object.keys(preferences).length > 0) {
      // Usar dot notation para actualizar campos específicos dentro de preferences
      Object.keys(preferences).forEach(key => {
        updateData[`preferences.${key}`] = preferences[key];
      });
    }
    
    await db.collection('users').doc(uid).update(updateData);
    
    return { success: true };
  } catch (error) {
    return handleError(error);
  }
});

/**
 * Trigger que se ejecuta cuando un usuario inicia sesión
 */
export const onUserLogin = functions.region(region).auth.user().onCreate(async (user) => {
  try {
    // Actualizar lastLogin en Firestore
    await db.collection('users').doc(user.uid).update({
      lastLogin: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error en onUserLogin:', error);
    return { success: false, error };
  }
});

/**
 * Función para obtener el perfil del usuario actual
 */
export const getUserProfile = functions.region(region).https.onCall(async (data, context) => {
  try {
    // Validar autenticación
    const uid = await validateAuth(context);
    
    // Obtener datos del usuario de Firestore
    const userDoc = await db.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Perfil de usuario no encontrado'
      );
    }
    
    const userData = userDoc.data();
    
    // Obtener artistas asociados al usuario
    const userArtistsSnapshot = await db.collection('user_artists')
      .where('userId', '==', uid)
      .get();
    
    const artistsPromises = userArtistsSnapshot.docs.map(async (doc) => {
      const artistId = doc.data().artistId;
      const artistDoc = await db.collection('artists').doc(artistId).get();
      
      if (artistDoc.exists) {
        return {
          id: artistId,
          role: doc.data().role,
          ...artistDoc.data()
        };
      }
      return null;
    });
    
    const artists = (await Promise.all(artistsPromises)).filter(artist => artist !== null);
    
    return {
      ...userData,
      uid,
      artists
    };
  } catch (error) {
    return handleError(error);
  }
});
