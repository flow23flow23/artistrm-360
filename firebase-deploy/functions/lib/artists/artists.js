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
exports.addArtistManager = exports.updateArtist = exports.createArtist = void 0;
const admin = __importStar(require("firebase-admin"));
const functions = __importStar(require("firebase-functions"));
// Exportar funciones de artistas
exports.createArtist = functions.https.onCall(async (data, context) => {
    // Verificar autenticación
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Se requiere autenticación para esta operación');
    }
    try {
        const { name, genre, bio, imageUrl, socialMedia } = data;
        const userId = context.auth.uid;
        // Validar datos requeridos
        if (!name) {
            throw new functions.https.HttpsError('invalid-argument', 'Se requiere el nombre del artista');
        }
        // Crear documento de artista en Firestore
        const artistRef = admin.firestore().collection('artists').doc();
        const artistData = {
            name,
            genre: genre || '',
            bio: bio || '',
            imageUrl: imageUrl || '',
            socialMedia: socialMedia || {},
            managers: [userId],
            createdBy: userId,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        await artistRef.set(artistData);
        return {
            success: true,
            artistId: artistRef.id,
            message: `Artista ${name} creado correctamente`
        };
    }
    catch (error) {
        console.error('Error al crear artista:', error);
        throw new functions.https.HttpsError('internal', error.message || 'Error desconocido');
    }
});
// Actualizar artista
exports.updateArtist = functions.https.onCall(async (data, context) => {
    // Verificar autenticación
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Se requiere autenticación para esta operación');
    }
    try {
        const { artistId, name, genre, bio, imageUrl, socialMedia } = data;
        const userId = context.auth.uid;
        // Validar datos requeridos
        if (!artistId) {
            throw new functions.https.HttpsError('invalid-argument', 'Se requiere el ID del artista');
        }
        // Verificar permisos
        const artistDoc = await admin.firestore().collection('artists').doc(artistId).get();
        if (!artistDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'El artista no existe');
        }
        const artistData = artistDoc.data();
        if (!artistData.managers.includes(userId)) {
            throw new functions.https.HttpsError('permission-denied', 'No tienes permisos para actualizar este artista');
        }
        // Preparar datos de actualización
        const updateData = {
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        if (name !== undefined)
            updateData.name = name;
        if (genre !== undefined)
            updateData.genre = genre;
        if (bio !== undefined)
            updateData.bio = bio;
        if (imageUrl !== undefined)
            updateData.imageUrl = imageUrl;
        if (socialMedia !== undefined)
            updateData.socialMedia = socialMedia;
        // Actualizar documento
        await admin.firestore().collection('artists').doc(artistId).update(updateData);
        return {
            success: true,
            message: `Artista actualizado correctamente`
        };
    }
    catch (error) {
        console.error('Error al actualizar artista:', error);
        throw new functions.https.HttpsError('internal', error.message || 'Error desconocido');
    }
});
// Añadir manager a artista
exports.addArtistManager = functions.https.onCall(async (data, context) => {
    // Verificar autenticación
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Se requiere autenticación para esta operación');
    }
    try {
        const { artistId, managerEmail } = data;
        const userId = context.auth.uid;
        // Validar datos requeridos
        if (!artistId || !managerEmail) {
            throw new functions.https.HttpsError('invalid-argument', 'Se requieren ID del artista y email del manager');
        }
        // Verificar permisos
        const artistDoc = await admin.firestore().collection('artists').doc(artistId).get();
        if (!artistDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'El artista no existe');
        }
        const artistData = artistDoc.data();
        if (!artistData.managers.includes(userId)) {
            throw new functions.https.HttpsError('permission-denied', 'No tienes permisos para gestionar este artista');
        }
        // Buscar usuario por email
        const userSnapshot = await admin.firestore().collection('users')
            .where('email', '==', managerEmail)
            .limit(1)
            .get();
        if (userSnapshot.empty) {
            throw new functions.https.HttpsError('not-found', 'No se encontró ningún usuario con ese email');
        }
        const managerUserId = userSnapshot.docs[0].id;
        // Verificar que no sea ya un manager
        if (artistData.managers.includes(managerUserId)) {
            throw new functions.https.HttpsError('already-exists', 'Este usuario ya es manager del artista');
        }
        // Añadir manager
        await admin.firestore().collection('artists').doc(artistId).update({
            managers: admin.firestore.FieldValue.arrayUnion(managerUserId),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        return {
            success: true,
            message: `Manager añadido correctamente`
        };
    }
    catch (error) {
        console.error('Error al añadir manager:', error);
        throw new functions.https.HttpsError('internal', error.message || 'Error desconocido');
    }
});
//# sourceMappingURL=artists.js.map