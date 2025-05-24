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
exports.addProjectMember = exports.updateProject = exports.createProject = void 0;
const admin = __importStar(require("firebase-admin"));
const functions = __importStar(require("firebase-functions"));
// Exportar funciones de proyectos
exports.createProject = functions.https.onCall(async (data, context) => {
    // Verificar autenticación
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Se requiere autenticación para esta operación');
    }
    try {
        const { name, description, type, startDate, endDate, artistId, metadata } = data;
        const userId = context.auth.uid;
        // Validar datos requeridos
        if (!name || !type) {
            throw new functions.https.HttpsError('invalid-argument', 'Se requieren nombre y tipo de proyecto');
        }
        // Verificar permisos si se especifica un artista
        if (artistId) {
            const artistDoc = await admin.firestore().collection('artists').doc(artistId).get();
            if (!artistDoc.exists) {
                throw new functions.https.HttpsError('not-found', 'El artista no existe');
            }
            const artistData = artistDoc.data();
            if (!(artistData === null || artistData === void 0 ? void 0 : artistData.managers.includes(userId))) {
                throw new functions.https.HttpsError('permission-denied', 'No tienes permisos para gestionar este artista');
            }
        }
        // Crear documento de proyecto en Firestore
        const projectRef = admin.firestore().collection('projects').doc();
        const projectData = {
            name,
            description: description || '',
            type,
            status: 'active',
            startDate: startDate ? admin.firestore.Timestamp.fromDate(new Date(startDate)) : null,
            endDate: endDate ? admin.firestore.Timestamp.fromDate(new Date(endDate)) : null,
            artistId: artistId || null,
            members: [userId],
            createdBy: userId,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            metadata: metadata || {}
        };
        await projectRef.set(projectData);
        return {
            success: true,
            projectId: projectRef.id,
            message: `Proyecto "${name}" creado correctamente`
        };
    }
    catch (error) {
        console.error('Error al crear proyecto:', error);
        throw new functions.https.HttpsError('internal', error.message || 'Error desconocido');
    }
});
// Actualizar proyecto
exports.updateProject = functions.https.onCall(async (data, context) => {
    // Verificar autenticación
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Se requiere autenticación para esta operación');
    }
    try {
        const { projectId, name, description, type, status, startDate, endDate, metadata } = data;
        const userId = context.auth.uid;
        // Validar datos requeridos
        if (!projectId) {
            throw new functions.https.HttpsError('invalid-argument', 'Se requiere el ID del proyecto');
        }
        // Verificar permisos
        const projectDoc = await admin.firestore().collection('projects').doc(projectId).get();
        if (!projectDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'El proyecto no existe');
        }
        const projectData = projectDoc.data();
        if (!projectData.members.includes(userId)) {
            throw new functions.https.HttpsError('permission-denied', 'No tienes permisos para actualizar este proyecto');
        }
        // Preparar datos de actualización
        const updateData = {
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        if (name !== undefined)
            updateData.name = name;
        if (description !== undefined)
            updateData.description = description;
        if (type !== undefined)
            updateData.type = type;
        if (status !== undefined)
            updateData.status = status;
        if (startDate !== undefined)
            updateData.startDate = startDate ? admin.firestore.Timestamp.fromDate(new Date(startDate)) : null;
        if (endDate !== undefined)
            updateData.endDate = endDate ? admin.firestore.Timestamp.fromDate(new Date(endDate)) : null;
        if (metadata !== undefined)
            updateData.metadata = metadata;
        // Actualizar documento
        await admin.firestore().collection('projects').doc(projectId).update(updateData);
        return {
            success: true,
            message: `Proyecto actualizado correctamente`
        };
    }
    catch (error) {
        console.error('Error al actualizar proyecto:', error);
        throw new functions.https.HttpsError('internal', error.message || 'Error desconocido');
    }
});
// Añadir miembro a proyecto
exports.addProjectMember = functions.https.onCall(async (data, context) => {
    // Verificar autenticación
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Se requiere autenticación para esta operación');
    }
    try {
        const { projectId, memberEmail } = data;
        const userId = context.auth.uid;
        // Validar datos requeridos
        if (!projectId || !memberEmail) {
            throw new functions.https.HttpsError('invalid-argument', 'Se requieren ID del proyecto y email del miembro');
        }
        // Verificar permisos
        const projectDoc = await admin.firestore().collection('projects').doc(projectId).get();
        if (!projectDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'El proyecto no existe');
        }
        const projectData = projectDoc.data();
        if (!projectData.members.includes(userId)) {
            throw new functions.https.HttpsError('permission-denied', 'No tienes permisos para gestionar este proyecto');
        }
        // Buscar usuario por email
        const userSnapshot = await admin.firestore().collection('users')
            .where('email', '==', memberEmail)
            .limit(1)
            .get();
        if (userSnapshot.empty) {
            throw new functions.https.HttpsError('not-found', 'No se encontró ningún usuario con ese email');
        }
        const memberUserId = userSnapshot.docs[0].id;
        // Verificar que no sea ya un miembro
        if (projectData.members.includes(memberUserId)) {
            throw new functions.https.HttpsError('already-exists', 'Este usuario ya es miembro del proyecto');
        }
        // Añadir miembro
        await admin.firestore().collection('projects').doc(projectId).update({
            members: admin.firestore.FieldValue.arrayUnion(memberUserId),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        return {
            success: true,
            message: `Miembro añadido correctamente`
        };
    }
    catch (error) {
        console.error('Error al añadir miembro:', error);
        throw new functions.https.HttpsError('internal', error.message || 'Error desconocido');
    }
});
//# sourceMappingURL=projects.js.map