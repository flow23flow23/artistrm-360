"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserRole = exports.getUserProfile = exports.updateUserProfile = exports.createUserProfile = void 0;
const admin = __importStar(require("firebase-admin"));
const functions = __importStar(require("firebase-functions"));
// Exportar funciones de autenticación
exports.createUserProfile = functions.https.onCall(async (data, context) => {
    // Verificar autenticación
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Se requiere autenticación para esta operación');
    }
    try {
        const { displayName, bio, preferences } = data;
        const userId = context.auth.uid;
        const email = context.auth.token.email || '';
        // Validar datos requeridos
        if (!displayName) {
            throw new functions.https.HttpsError('invalid-argument', 'Se requiere el nombre de usuario');
        }
        // Verificar si el perfil ya existe
        const userDoc = await admin.firestore().collection('users').doc(userId).get();
        if (userDoc.exists) {
            throw new functions.https.HttpsError('already-exists', 'El perfil de usuario ya existe');
        }
        // Crear perfil de usuario
        const userProfile = {
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
    }
    catch (error) {
        console.error('Error al crear perfil de usuario:', error);
        throw new functions.https.HttpsError('internal', error.message || 'Error desconocido');
    }
});
// Actualizar perfil de usuario
exports.updateUserProfile = functions.https.onCall(async (data, context) => {
    // Verificar autenticación
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Se requiere autenticación para esta operación');
    }
    try {
        const { displayName, photoURL, bio, preferences } = data;
        const userId = context.auth.uid;
        // Verificar si el perfil existe
        const userDoc = await admin.firestore().collection('users').doc(userId).get();
        if (!userDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'El perfil de usuario no existe');
        }
        // Preparar datos de actualización
        const updateData = {
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        if (displayName !== undefined)
            updateData.displayName = displayName;
        if (photoURL !== undefined)
            updateData.photoURL = photoURL;
        if (bio !== undefined)
            updateData.bio = bio;
        if (preferences !== undefined)
            updateData.preferences = preferences;
        // Actualizar perfil
        await admin.firestore().collection('users').doc(userId).update(updateData);
        return {
            success: true,
            message: 'Perfil de usuario actualizado correctamente'
        };
    }
    catch (error) {
        console.error('Error al actualizar perfil de usuario:', error);
        throw new functions.https.HttpsError('internal', error.message || 'Error desconocido');
    }
});
// Obtener perfil de usuario
exports.getUserProfile = functions.https.onCall(async (data, context) => {
    // Verificar autenticación
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Se requiere autenticación para esta operación');
    }
    try {
        const userId = data.userId || context.auth.uid;
        // Obtener perfil
        const userDoc = await admin.firestore().collection('users').doc(userId).get();
        if (!userDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'El perfil de usuario no existe');
        }
        return {
            success: true,
            profile: userDoc.data()
        };
    }
    catch (error) {
        console.error('Error al obtener perfil de usuario:', error);
        throw new functions.https.HttpsError('internal', error.message || 'Error desconocido');
    }
});
// Actualizar rol de usuario (solo para administradores)
exports.updateUserRole = functions.https.onCall(async (data, context) => {
    var _a;
    // Verificar autenticación
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Se requiere autenticación para esta operación');
    }
    try {
        const { userId, role } = data;
        const adminUserId = context.auth.uid;
        // Validar datos requeridos
        if (!userId || !role) {
            throw new functions.https.HttpsError('invalid-argument', 'Se requieren ID de usuario y rol');
        }
        // Verificar si el usuario que realiza la acción es administrador
        const adminDoc = await admin.firestore().collection('users').doc(adminUserId).get();
        if (!adminDoc.exists || ((_a = adminDoc.data()) === null || _a === void 0 ? void 0 : _a.role) !== 'admin') {
            throw new functions.https.HttpsError('permission-denied', 'No tienes permisos para realizar esta operación');
        }
        // Verificar si el usuario a actualizar existe
        const userDoc = await admin.firestore().collection('users').doc(userId).get();
        if (!userDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'El usuario no existe');
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
    }
    catch (error) {
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
//# sourceMappingURL=auth.js.map