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
exports.getAnalyticsReport = exports.generateAnalyticsReport = void 0;
const admin = __importStar(require("firebase-admin"));
const functions = __importStar(require("firebase-functions"));
// Exportar funciones de análisis
exports.generateAnalyticsReport = functions.https.onCall(async (data, context) => {
    // Verificar autenticación
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Se requiere autenticación para esta operación');
    }
    try {
        const { title, description, type, artistId, projectId, startDate, endDate, parameters } = data;
        const userId = context.auth.uid;
        // Validar datos requeridos
        if (!type) {
            throw new functions.https.HttpsError('invalid-argument', 'Se requiere el tipo de reporte');
        }
        // Crear documento de reporte en Firestore
        const reportRef = admin.firestore().collection('analytics_reports').doc();
        const reportData = {
            title: title || `Reporte de ${type}`,
            description: description || '',
            type,
            artistId: artistId || null,
            projectId: projectId || null,
            startDate: startDate ? new Date(startDate) : null,
            endDate: endDate ? new Date(endDate) : null,
            parameters: parameters || {},
            createdBy: userId,
            status: 'pending',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        await reportRef.set(reportData);
        // Iniciar procesamiento asincrónico del reporte
        // En un entorno real, esto activaría un Cloud Function de background
        // Por ahora, simulamos un procesamiento inmediato
        // Generar resultados simulados según el tipo de reporte
        let reportResults = {};
        switch (type) {
            case 'audience':
                reportResults = generateAudienceReportResults();
                break;
            case 'engagement':
                reportResults = generateEngagementReportResults();
                break;
            case 'revenue':
                reportResults = generateRevenueReportResults();
                break;
            default:
                reportResults = generateGenericReportResults();
        }
        // Actualizar reporte con resultados
        await reportRef.update({
            status: 'completed',
            results: reportResults,
            completedAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        return {
            success: true,
            reportId: reportRef.id,
            message: `Reporte ${title || type} generado correctamente`
        };
    }
    catch (error) {
        console.error('Error al generar reporte de análisis:', error);
        throw new functions.https.HttpsError('internal', error.message || 'Error desconocido');
    }
});
// Obtener reporte de análisis
exports.getAnalyticsReport = functions.https.onCall(async (data, context) => {
    var _a;
    // Verificar autenticación
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Se requiere autenticación para esta operación');
    }
    try {
        const { reportId } = data;
        const userId = context.auth.uid;
        // Validar datos requeridos
        if (!reportId) {
            throw new functions.https.HttpsError('invalid-argument', 'Se requiere el ID del reporte');
        }
        // Obtener documento de reporte
        const reportDoc = await admin.firestore().collection('analytics_reports').doc(reportId).get();
        if (!reportDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'El reporte no existe');
        }
        const reportData = reportDoc.data();
        // Verificar permisos (solo el creador o administradores pueden ver el reporte)
        if (reportData.createdBy !== userId) {
            // Verificar si es administrador
            const userDoc = await admin.firestore().collection('users').doc(userId).get();
            if (!userDoc.exists || ((_a = userDoc.data()) === null || _a === void 0 ? void 0 : _a.role) !== 'admin') {
                throw new functions.https.HttpsError('permission-denied', 'No tienes permisos para ver este reporte');
            }
        }
        return {
            success: true,
            report: reportDoc.data()
        };
    }
    catch (error) {
        console.error('Error al obtener reporte de análisis:', error);
        throw new functions.https.HttpsError('internal', error.message || 'Error desconocido');
    }
});
// Funciones auxiliares para generar resultados simulados
function generateAudienceReportResults() {
    return {
        totalAudience: 125000,
        demographics: {
            age: {
                '13-17': 15,
                '18-24': 32,
                '25-34': 28,
                '35-44': 18,
                '45+': 7
            },
            gender: {
                male: 58,
                female: 41,
                other: 1
            },
            topCountries: [
                { name: 'Estados Unidos', percentage: 35 },
                { name: 'México', percentage: 22 },
                { name: 'España', percentage: 15 },
                { name: 'Colombia', percentage: 12 },
                { name: 'Argentina', percentage: 8 }
            ]
        },
        growth: {
            weekly: 2.3,
            monthly: 8.7,
            yearly: 45.2
        },
        platforms: {
            spotify: 45,
            youtube: 30,
            instagram: 15,
            tiktok: 10
        }
    };
}
function generateEngagementReportResults() {
    return {
        totalEngagements: 87500,
        engagementRate: 7.2,
        interactions: {
            likes: 45000,
            comments: 12500,
            shares: 18000,
            saves: 12000
        },
        contentPerformance: [
            { title: 'Nuevo sencillo', type: 'audio', engagements: 25000, engagement_rate: 12.5 },
            { title: 'Sesión acústica', type: 'video', engagements: 18500, engagement_rate: 9.2 },
            { title: 'Anuncio de gira', type: 'post', engagements: 15000, engagement_rate: 7.5 },
            { title: 'Entrevista exclusiva', type: 'article', engagements: 9000, engagement_rate: 4.5 }
        ],
        peakTimes: {
            dayOfWeek: 'Viernes',
            timeOfDay: '19:00 - 21:00'
        }
    };
}
function generateRevenueReportResults() {
    return {
        totalRevenue: 125000,
        revenueSources: {
            streaming: 45000,
            downloads: 15000,
            merchandise: 35000,
            tickets: 30000
        },
        platformBreakdown: {
            spotify: 25000,
            appleMusic: 12000,
            amazonMusic: 8000,
            youtube: 15000,
            other: 5000
        },
        topMarkets: [
            { name: 'Estados Unidos', revenue: 55000 },
            { name: 'México', revenue: 25000 },
            { name: 'España', revenue: 20000 },
            { name: 'Colombia', revenue: 15000 },
            { name: 'Argentina', revenue: 10000 }
        ],
        growth: {
            monthly: 12.5,
            quarterly: 28.7,
            yearly: 65.2
        }
    };
}
function generateGenericReportResults() {
    return {
        summary: {
            totalAudience: 125000,
            totalEngagements: 87500,
            totalRevenue: 125000
        },
        performance: {
            audience_growth: 8.7,
            engagement_rate: 7.2,
            revenue_growth: 12.5
        },
        recommendations: [
            'Aumentar frecuencia de publicación en Instagram',
            'Crear más contenido de video para YouTube',
            'Expandir presencia en TikTok',
            'Considerar lanzamiento de podcast'
        ]
    };
}
//# sourceMappingURL=analytics.js.map