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
exports.processContentWithAI = exports.updateContent = exports.createContent = void 0;
const admin = __importStar(require("firebase-admin"));
const functions = __importStar(require("firebase-functions"));
// Exportar funciones de contenido
exports.createContent = functions.https.onCall(async (data, context) => {
    // Verificar autenticación
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Se requiere autenticación para esta operación');
    }
    try {
        const { title, description, type, url, fileUrl, thumbnailUrl, metadata, tags, artistId, projectId } = data;
        const userId = context.auth.uid;
        // Validar datos requeridos
        if (!title || !type) {
            throw new functions.https.HttpsError('invalid-argument', 'Se requieren título y tipo de contenido');
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
        // Verificar permisos si se especifica un proyecto
        if (projectId) {
            const projectDoc = await admin.firestore().collection('projects').doc(projectId).get();
            if (!projectDoc.exists) {
                throw new functions.https.HttpsError('not-found', 'El proyecto no existe');
            }
            const projectData = projectDoc.data();
            if (!(projectData === null || projectData === void 0 ? void 0 : projectData.members.includes(userId))) {
                throw new functions.https.HttpsError('permission-denied', 'No tienes permisos para gestionar este proyecto');
            }
        }
        // Crear documento de contenido en Firestore
        const contentRef = admin.firestore().collection('content').doc();
        const contentData = {
            title,
            description: description || '',
            type,
            url: url || '',
            fileUrl: fileUrl || '',
            thumbnailUrl: thumbnailUrl || '',
            metadata: metadata || {},
            tags: tags || [],
            artistId: artistId || null,
            projectId: projectId || null,
            createdBy: userId,
            status: 'active',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        await contentRef.set(contentData);
        return {
            success: true,
            contentId: contentRef.id,
            message: `Contenido "${title}" creado correctamente`
        };
    }
    catch (error) {
        console.error('Error al crear contenido:', error);
        throw new functions.https.HttpsError('internal', error.message || 'Error desconocido');
    }
});
// Actualizar contenido
exports.updateContent = functions.https.onCall(async (data, context) => {
    var _a;
    // Verificar autenticación
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Se requiere autenticación para esta operación');
    }
    try {
        const { contentId, title, description, url, fileUrl, thumbnailUrl, metadata, tags, status } = data;
        const userId = context.auth.uid;
        // Validar datos requeridos
        if (!contentId) {
            throw new functions.https.HttpsError('invalid-argument', 'Se requiere el ID del contenido');
        }
        // Verificar permisos
        const contentDoc = await admin.firestore().collection('content').doc(contentId).get();
        if (!contentDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'El contenido no existe');
        }
        const contentData = contentDoc.data();
        if (contentData.createdBy !== userId) {
            // Verificar si es administrador
            const userDoc = await admin.firestore().collection('users').doc(userId).get();
            if (!userDoc.exists || ((_a = userDoc.data()) === null || _a === void 0 ? void 0 : _a.role) !== 'admin') {
                throw new functions.https.HttpsError('permission-denied', 'No tienes permisos para actualizar este contenido');
            }
        }
        // Preparar datos de actualización
        const updateData = {
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        if (title !== undefined)
            updateData.title = title;
        if (description !== undefined)
            updateData.description = description;
        if (url !== undefined)
            updateData.url = url;
        if (fileUrl !== undefined)
            updateData.fileUrl = fileUrl;
        if (thumbnailUrl !== undefined)
            updateData.thumbnailUrl = thumbnailUrl;
        if (metadata !== undefined)
            updateData.metadata = metadata;
        if (tags !== undefined)
            updateData.tags = tags;
        if (status !== undefined)
            updateData.status = status;
        // Actualizar documento
        await admin.firestore().collection('content').doc(contentId).update(updateData);
        return {
            success: true,
            message: `Contenido actualizado correctamente`
        };
    }
    catch (error) {
        console.error('Error al actualizar contenido:', error);
        throw new functions.https.HttpsError('internal', error.message || 'Error desconocido');
    }
});
// Procesar contenido con IA
exports.processContentWithAI = functions.https.onCall(async (data, context) => {
    var _a;
    // Verificar autenticación
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Se requiere autenticación para esta operación');
    }
    try {
        const { contentId } = data;
        const userId = context.auth.uid;
        // Validar datos requeridos
        if (!contentId) {
            throw new functions.https.HttpsError('invalid-argument', 'Se requiere el ID del contenido');
        }
        // Verificar permisos
        const contentDoc = await admin.firestore().collection('content').doc(contentId).get();
        if (!contentDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'El contenido no existe');
        }
        const contentData = contentDoc.data();
        if (contentData.createdBy !== userId) {
            // Verificar si es administrador
            const userDoc = await admin.firestore().collection('users').doc(userId).get();
            if (!userDoc.exists || ((_a = userDoc.data()) === null || _a === void 0 ? void 0 : _a.role) !== 'admin') {
                throw new functions.https.HttpsError('permission-denied', 'No tienes permisos para procesar este contenido');
            }
        }
        // Actualizar estado de procesamiento
        await admin.firestore().collection('content').doc(contentId).update({
            processingStatus: 'processing',
            processingStartedAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        // Aquí iría la lógica real de procesamiento con IA
        // Por ahora, simulamos un procesamiento exitoso
        // Resultados simulados según el tipo de contenido
        let processingResults = {};
        switch (contentData.type) {
            case 'image':
                processingResults = {
                    tags: ['música', 'concierto', 'artista', 'escenario'],
                    objects: ['persona', 'micrófono', 'guitarra', 'público'],
                    colors: ['negro', 'rojo', 'azul'],
                    sentiment: 'positive',
                    description: 'Imagen de un artista actuando en un concierto con gran público'
                };
                break;
            case 'audio':
                processingResults = {
                    duration: 237, // segundos
                    bpm: 120,
                    key: 'C major',
                    instruments: ['voz', 'guitarra', 'batería', 'bajo'],
                    mood: 'energetic',
                    transcript: 'Transcripción simulada de la letra de la canción...'
                };
                break;
            case 'video':
                processingResults = {
                    duration: 312, // segundos
                    resolution: '1920x1080',
                    scenes: [
                        { start: 0, end: 45, description: 'Introducción' },
                        { start: 46, end: 180, description: 'Actuación principal' },
                        { start: 181, end: 312, description: 'Cierre y créditos' }
                    ],
                    transcript: 'Transcripción simulada del diálogo del video...',
                    sentiment: 'positive'
                };
                break;
            case 'document':
                processingResults = {
                    pageCount: 5,
                    wordCount: 2500,
                    topics: ['contrato', 'derechos', 'distribución', 'regalías'],
                    summary: 'Documento contractual sobre distribución digital y regalías',
                    entities: ['Sony Music', 'Spotify', 'Apple Music']
                };
                break;
            default:
                processingResults = {
                    status: 'processed',
                    summary: 'Contenido procesado correctamente'
                };
        }
        // Actualizar con resultados
        await admin.firestore().collection('content').doc(contentId).update({
            processingStatus: 'completed',
            processingResults,
            processingCompletedAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        return {
            success: true,
            message: `Contenido procesado correctamente`,
            results: processingResults
        };
    }
    catch (error) {
        console.error('Error al procesar contenido con IA:', error);
        // Actualizar estado en caso de error
        if (data.contentId) {
            await admin.firestore().collection('content').doc(data.contentId).update({
                processingStatus: 'error',
                processingError: error.message || 'Error desconocido',
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
        }
        throw new functions.https.HttpsError('internal', error.message || 'Error desconocido');
    }
});
//# sourceMappingURL=content.js.map