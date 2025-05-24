import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

// Interfaces para tipado
interface UserProfile {
  displayName: string;
  email: string;
  photoURL?: string;
  role: string;
  bio?: string;
  preferences?: Record<string, any>;
  createdAt: any;
  updatedAt: any;
}

// Exportar funciones de autenticación
export const createUserProfile = functions.https.onCall(async (data, context) => {
  // Verificar autenticación
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Se requiere autenticación para esta operación'
    );
  }

  try {
    const { displayName, bio, preferences } = data;
    const userId = context.auth.uid;
    const email = context.auth.token.email || '';

    // Validar datos requeridos
    if (!displayName) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Se requiere el nombre de usuario'
      );
    }

    // Verificar si el perfil ya existe
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    
    if (userDoc.exists) {
      throw new functions.https.HttpsError(
        'already-exists',
        'El perfil de usuario ya existe'
      );
    }

    // Crear perfil de usuario
    const userProfile: UserProfile = {
      displayName,
      email,
      photoURL: context.auth.token.picture || '',
      role: 'user', // Rol por defecto
      bio: bio || '',
      preferences: preferences || {},
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await admin.firestore().collection('users').doc(userId).set(userProfile);

    return {
      success: true,
      message: 'Perfil de usuario creado correctamente'
    };
  } catch (error: any) {
    console.error('Error al crear perfil de usuario:', error);
    throw new functions.https.HttpsError('internal', error.message || 'Error desconocido');
  }
});

// Actualizar perfil de usuario
export const updateUserProfile = functions.https.onCall(async (data, context) => {
  // Verificar autenticación
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Se requiere autenticación para esta operación'
    );
  }

  try {
    const { displayName, photoURL, bio, preferences } = data;
    const userId = context.auth.uid;

    // Verificar si el perfil existe
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'El perfil de usuario no existe'
      );
    }

    // Preparar datos de actualización
    const updateData: Partial<UserProfile> = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    if (displayName !== undefined) updateData.displayName = displayName;
    if (photoURL !== undefined) updateData.photoURL = photoURL;
    if (bio !== undefined) updateData.bio = bio;
    if (preferences !== undefined) updateData.preferences = preferences;

    // Actualizar perfil
    await admin.firestore().collection('users').doc(userId).update(updateData);

    return {
      success: true,
      message: 'Perfil de usuario actualizado correctamente'
    };
  } catch (error: any) {
    console.error('Error al actualizar perfil de usuario:', error);
    throw new functions.https.HttpsError('internal', error.message || 'Error desconocido');
  }
});

// Obtener perfil de usuario
export const getUserProfile = functions.https.onCall(async (data, context) => {
  // Verificar autenticación
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Se requiere autenticación para esta operación'
    );
  }

  try {
    const userId = data.userId || context.auth.uid;

    // Obtener perfil
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'El perfil de usuario no existe'
      );
    }

    return {
      success: true,
      profile: userDoc.data()
    };
  } catch (error: any) {
    console.error('Error al obtener perfil de usuario:', error);
    throw new functions.https.HttpsError('internal', error.message || 'Error desconocido');
  }
});

// Actualizar rol de usuario (solo para administradores)
export const updateUserRole = functions.https.onCall(async (data, context) => {
  // Verificar autenticación
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Se requiere autenticación para esta operación'
    );
  }

  try {
    const { userId, role } = data;
    const adminUserId = context.auth.uid;

    // Validar datos requeridos
    if (!userId || !role) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Se requieren ID de usuario y rol'
      );
    }

    // Verificar si el usuario que realiza la acción es administrador
    const adminDoc = await admin.firestore().collection('users').doc(adminUserId).get();
    
    if (!adminDoc.exists || adminDoc.data()?.role !== 'admin') {
      throw new functions.https.HttpsError(
        'permission-denied',
        'No tienes permisos para realizar esta operación'
      );
    }

    // Verificar si el usuario a actualizar existe
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'El usuario no existe'
      );
    }

    // Actualizar rol
    await admin.firestore().collection('users').doc(userId).update({
      role,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Actualizar custom claims para Firebase Auth
    await admin.auth().setCustomUserClaims(userId, { role });

    return {
      success: true,
      message: `Rol de usuario actualizado a ${role}`
    };
  } catch (error: any) {
    console.error('Error al actualizar rol de usuario:', error);
    throw new functions.https.HttpsError('internal', error.message || 'Error desconocido');
  }
});

// Nota: Las siguientes funciones están comentadas porque no se utilizan actualmente,
// pero se mantienen como referencia para futuras implementaciones

/*
// Función para crear usuario en Firebase Auth
async function createAuthUser(email: string, password: string): Promise<admin.auth.UserRecord> {
  try {
    return await admin.auth().createUser({
      email,
      password,
      emailVerified: false
    });
  } catch (error: any) {
    console.error('Error al crear usuario en Auth:', error);
    throw error;
  }
}

// Función para eliminar usuario
async function deleteUser(userId: string): Promise<void> {
  try {
    // Eliminar de Auth
    await admin.auth().deleteUser(userId);
    
    // Eliminar perfil
    await admin.firestore().collection('users').doc(userId).delete();
  } catch (error: any) {
    console.error('Error al eliminar usuario:', error);
    throw error;
  }
}
*/
