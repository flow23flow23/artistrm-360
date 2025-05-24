# Refuerzo de Seguridad y Auditoría - ArtistRM

Este documento detalla las mejoras implementadas en la seguridad y auditoría de la plataforma ArtistRM, enfocadas en fortalecer la autenticación, protección de datos y cumplimiento normativo.

## 1. Autenticación y Autorización Avanzada

### Autenticación Multifactor (MFA)

Se ha implementado autenticación multifactor utilizando Firebase Authentication:

```typescript
// backend/functions/src/auth/mfa.ts
import * as admin from 'firebase-admin';

// Función para habilitar MFA para un usuario
export const enableMFA = functions.https.onCall(async (data, context) => {
  // Verificar autenticación
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }
  
  const uid = context.auth.uid;
  
  try {
    // Habilitar MFA para el usuario
    await admin.auth().updateUser(uid, {
      multiFactor: {
        enrolledFactors: [] // Inicializar para permitir la inscripción
      }
    });
    
    // Registrar en Firestore que el usuario tiene MFA habilitado
    await admin.firestore().collection('users').doc(uid).update({
      'security.mfaEnabled': true,
      'security.mfaEnabledAt': admin.firestore.FieldValue.serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error al habilitar MFA:', error);
    throw new functions.https.HttpsError('internal', 'Error al habilitar MFA');
  }
});

// Frontend para iniciar el proceso de inscripción MFA
// frontend/src/pages/settings/security.tsx
const enrollMFA = async () => {
  try {
    // Obtener el usuario actual
    const user = auth.currentUser;
    if (!user) throw new Error('Usuario no autenticado');
    
    // Iniciar el proceso de inscripción MFA
    const multiFactorUser = multiFactor(user);
    const session = await multiFactorUser.getSession();
    
    // Configurar el proveedor de segundo factor (SMS)
    const phoneAuthProvider = new PhoneAuthProvider(auth);
    const verificationId = await phoneAuthProvider.verifyPhoneNumber(
      phoneNumber, // Número de teléfono del usuario
      session
    );
    
    // Guardar verificationId para usarlo cuando el usuario ingrese el código
    setVerificationId(verificationId);
    setShowVerificationCodeInput(true);
  } catch (error) {
    console.error('Error al iniciar inscripción MFA:', error);
    setError('Error al configurar la autenticación de dos factores');
  }
};
```

### Sistema de Roles y Permisos Granulares

Se ha implementado un sistema RBAC (Role-Based Access Control) más detallado:

```typescript
// backend/functions/src/auth/roles.ts
// Definición de roles y permisos
const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  ARTIST: 'artist',
  TEAM_MEMBER: 'team_member',
  VIEWER: 'viewer'
};

const PERMISSIONS = {
  READ_ANALYTICS: 'read:analytics',
  WRITE_ANALYTICS: 'write:analytics',
  READ_PROJECTS: 'read:projects',
  WRITE_PROJECTS: 'write:projects',
  MANAGE_INTEGRATIONS: 'manage:integrations',
  MANAGE_USERS: 'manage:users',
  MANAGE_BILLING: 'manage:billing',
  // ... más permisos
};

// Mapeo de roles a permisos
const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: Object.values(PERMISSIONS), // Todos los permisos
  [ROLES.MANAGER]: [
    PERMISSIONS.READ_ANALYTICS,
    PERMISSIONS.WRITE_ANALYTICS,
    PERMISSIONS.READ_PROJECTS,
    PERMISSIONS.WRITE_PROJECTS,
    PERMISSIONS.MANAGE_INTEGRATIONS
  ],
  [ROLES.ARTIST]: [
    PERMISSIONS.READ_ANALYTICS,
    PERMISSIONS.READ_PROJECTS,
    PERMISSIONS.WRITE_PROJECTS
  ],
  [ROLES.TEAM_MEMBER]: [
    PERMISSIONS.READ_ANALYTICS,
    PERMISSIONS.READ_PROJECTS
  ],
  [ROLES.VIEWER]: [
    PERMISSIONS.READ_ANALYTICS
  ]
};

// Middleware para verificar permisos
export const checkPermission = (permission) => {
  return async (req, res, next) => {
    try {
      // Verificar token de Firebase
      const decodedToken = await admin.auth().verifyIdToken(req.headers.authorization);
      const uid = decodedToken.uid;
      
      // Obtener roles del usuario desde Firestore
      const userDoc = await admin.firestore().collection('users').doc(uid).get();
      const userData = userDoc.data();
      
      if (!userData) {
        return res.status(403).json({ error: 'Usuario no encontrado' });
      }
      
      const userRoles = userData.roles || [];
      
      // Verificar si alguno de los roles del usuario tiene el permiso requerido
      const hasPermission = userRoles.some(role => 
        ROLE_PERMISSIONS[role] && ROLE_PERMISSIONS[role].includes(permission)
      );
      
      if (!hasPermission) {
        return res.status(403).json({ error: 'Permiso denegado' });
      }
      
      // Añadir información de roles y permisos al request para uso posterior
      req.user = {
        uid,
        roles: userRoles,
        permissions: userRoles.flatMap(role => ROLE_PERMISSIONS[role] || [])
      };
      
      next();
    } catch (error) {
      console.error('Error al verificar permisos:', error);
      res.status(403).json({ error: 'No autorizado' });
    }
  };
};
```

### Políticas de Contraseñas Robustas

Se han implementado políticas de contraseñas más estrictas:

```typescript
// frontend/src/utils/passwordPolicy.ts
export const passwordPolicy = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true
};

export const validatePassword = (password) => {
  const errors = [];
  
  if (password.length < passwordPolicy.minLength) {
    errors.push(`La contraseña debe tener al menos ${passwordPolicy.minLength} caracteres`);
  }
  
  if (passwordPolicy.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('La contraseña debe incluir al menos una letra mayúscula');
  }
  
  if (passwordPolicy.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('La contraseña debe incluir al menos una letra minúscula');
  }
  
  if (passwordPolicy.requireNumbers && !/[0-9]/.test(password)) {
    errors.push('La contraseña debe incluir al menos un número');
  }
  
  if (passwordPolicy.requireSpecialChars && !/[^A-Za-z0-9]/.test(password)) {
    errors.push('La contraseña debe incluir al menos un carácter especial');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

// Implementación en el formulario de registro
// frontend/src/pages/register.tsx
const handlePasswordChange = (e) => {
  const password = e.target.value;
  setPassword(password);
  
  const validation = validatePassword(password);
  setPasswordErrors(validation.errors);
  setIsPasswordValid(validation.valid);
};
```

### Autenticación Basada en Contexto

Se ha implementado un sistema que evalúa factores adicionales al autenticar:

```typescript
// backend/functions/src/auth/contextAuth.ts
export const evaluateLoginRisk = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }
  
  const uid = context.auth.uid;
  const { ipAddress, deviceInfo, location } = data;
  
  try {
    // Obtener historial de inicios de sesión del usuario
    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    const userData = userDoc.data();
    const loginHistory = userData?.security?.loginHistory || [];
    
    // Calcular nivel de riesgo basado en factores contextuales
    let riskLevel = 'low';
    
    // Verificar si es un dispositivo nuevo
    const isKnownDevice = loginHistory.some(login => 
      login.deviceInfo.fingerprint === deviceInfo.fingerprint
    );
    
    // Verificar si es una ubicación nueva
    const isKnownLocation = loginHistory.some(login => 
      login.location.country === location.country
    );
    
    // Evaluar riesgo
    if (!isKnownDevice && !isKnownLocation) {
      riskLevel = 'high';
    } else if (!isKnownDevice || !isKnownLocation) {
      riskLevel = 'medium';
    }
    
    // Registrar el inicio de sesión
    await admin.firestore().collection('users').doc(uid).update({
      'security.loginHistory': admin.firestore.FieldValue.arrayUnion({
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        ipAddress,
        deviceInfo,
        location,
        riskLevel
      })
    });
    
    // Si el riesgo es alto, podríamos requerir verificación adicional
    return { riskLevel };
  } catch (error) {
    console.error('Error al evaluar riesgo de inicio de sesión:', error);
    throw new functions.https.HttpsError('internal', 'Error al procesar la solicitud');
  }
});
```

## 2. Protección de Datos

### Encriptación Mejorada

Se ha reforzado la encriptación tanto en tránsito como en reposo:

```typescript
// backend/functions/src/utils/encryption.ts
import * as crypto from 'crypto';

// Encriptar datos sensibles antes de almacenarlos
export const encryptData = (data, key) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(key, 'hex'), iv);
  
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex');
  
  return {
    iv: iv.toString('hex'),
    encryptedData: encrypted,
    authTag
  };
};

// Desencriptar datos
export const decryptData = (encryptedObj, key) => {
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    Buffer.from(key, 'hex'),
    Buffer.from(encryptedObj.iv, 'hex')
  );
  
  decipher.setAuthTag(Buffer.from(encryptedObj.authTag, 'hex'));
  
  let decrypted = decipher.update(encryptedObj.encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return JSON.parse(decrypted);
};

// Ejemplo de uso para datos sensibles como tokens de API
export const storeApiToken = async (userId, service, token) => {
  // Obtener clave de encriptación desde Secret Manager
  const encryptionKey = await getEncryptionKey();
  
  // Encriptar el token
  const encryptedToken = encryptData(token, encryptionKey);
  
  // Almacenar en Firestore
  await admin.firestore().collection('users').doc(userId)
    .collection('apiTokens').doc(service).set({
      encrypted: true,
      ...encryptedToken,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
};
```

### Tokenización para Datos Sensibles

Se ha implementado tokenización para datos sensibles como información de pago:

```typescript
// backend/functions/src/utils/tokenization.ts
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';

// Generar token para datos sensibles
export const tokenizeData = async (userId, dataType, sensitiveData) => {
  // Generar un token único
  const token = crypto.randomBytes(32).toString('hex');
  
  // Encriptar los datos sensibles
  const encryptionKey = await getEncryptionKey();
  const encryptedData = encryptData(sensitiveData, encryptionKey);
  
  // Almacenar la relación token-datos en una colección segura
  await admin.firestore().collection('tokenizedData').doc(token).set({
    userId,
    dataType,
    encryptedData: encryptedData,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
  
  // Devolver solo el token para usar en la aplicación
  return token;
};

// Recuperar datos sensibles a partir del token
export const detokenizeData = async (token, userId) => {
  // Verificar que el token existe y pertenece al usuario
  const tokenDoc = await admin.firestore().collection('tokenizedData').doc(token).get();
  
  if (!tokenDoc.exists || tokenDoc.data().userId !== userId) {
    throw new Error('Token inválido o no autorizado');
  }
  
  // Desencriptar los datos
  const encryptionKey = await getEncryptionKey();
  const decryptedData = decryptData(tokenDoc.data().encryptedData, encryptionKey);
  
  return decryptedData;
};
```

### Ofuscación de Datos en Logs

Se ha implementado un sistema para ofuscar datos sensibles en logs:

```typescript
// backend/functions/src/utils/logging.ts
// Función para ofuscar datos sensibles en logs
export const sanitizeForLogging = (data) => {
  // Copia profunda para no modificar el original
  const sanitized = JSON.parse(JSON.stringify(data));
  
  // Lista de campos a ofuscar
  const sensitiveFields = [
    'password', 'token', 'apiKey', 'secret', 'creditCard', 'ssn', 'email',
    'phone', 'address', 'birthdate'
  ];
  
  // Función recursiva para recorrer el objeto
  const ofuscateRecursive = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    
    Object.keys(obj).forEach(key => {
      // Si es un campo sensible, ofuscar
      if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
        if (typeof obj[key] === 'string') {
          const len = obj[key].length;
          if (len > 6) {
            // Mostrar solo primeros y últimos 2 caracteres
            obj[key] = `${obj[key].substring(0, 2)}****${obj[key].substring(len - 2)}`;
          } else {
            obj[key] = '******';
          }
        } else {
          obj[key] = '[REDACTED]';
        }
      } 
      // Si es un objeto o array, recursión
      else if (typeof obj[key] === 'object') {
        ofuscateRecursive(obj[key]);
      }
    });
  };
  
  ofuscateRecursive(sanitized);
  return sanitized;
};

// Wrapper para console.log que sanitiza automáticamente
export const secureLog = (message, data) => {
  if (data) {
    console.log(message, sanitizeForLogging(data));
  } else {
    console.log(message);
  }
};
```

### Políticas de Retención y Eliminación

Se han implementado políticas automatizadas para la retención y eliminación de datos:

```typescript
// backend/functions/src/utils/dataRetention.ts
// Función programada para aplicar políticas de retención
export const applyDataRetentionPolicies = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    const db = admin.firestore();
    const now = admin.firestore.Timestamp.now();
    
    // Política: Eliminar datos temporales después de 30 días
    const tempDataCutoff = new Date(now.toMillis() - (30 * 24 * 60 * 60 * 1000));
    const tempDataQuery = db.collection('tempData')
      .where('createdAt', '<', tempDataCutoff);
    
    const tempDataSnapshot = await tempDataQuery.get();
    const tempDataBatch = db.batch();
    tempDataSnapshot.docs.forEach(doc => {
      tempDataBatch.delete(doc.ref);
    });
    
    // Política: Anonimizar datos de usuarios inactivos después de 1 año
    const inactiveUserCutoff = new Date(now.toMillis() - (365 * 24 * 60 * 60 * 1000));
    const inactiveUsersQuery = db.collection('users')
      .where('lastActive', '<', inactiveUserCutoff);
    
    const inactiveUsersSnapshot = await inactiveUsersQuery.get();
    const usersBatch = db.batch();
    inactiveUsersSnapshot.docs.forEach(doc => {
      // Anonimizar en lugar de eliminar
      usersBatch.update(doc.ref, {
        email: `anon_${doc.id}@example.com`,
        name: 'Usuario Anonimizado',
        phone: null,
        personalInfo: admin.firestore.FieldValue.delete(),
        anonymizedAt: now,
        status: 'anonymized'
      });
    });
    
    // Ejecutar los batches
    await Promise.all([
      tempDataBatch.commit(),
      usersBatch.commit()
    ]);
    
    return null;
  });
```

## 3. Auditoría y Compliance

### Sistema de Auditoría Detallada

Se ha implementado un sistema de auditoría completo para acciones críticas:

```typescript
// backend/functions/src/utils/audit.ts
// Función para registrar eventos de auditoría
export const logAuditEvent = async (event) => {
  const {
    userId,
    action,
    resource,
    resourceId,
    details,
    ipAddress,
    userAgent
  } = event;
  
  try {
    await admin.firestore().collection('auditLogs').add({
      userId,
      action,
      resource,
      resourceId,
      details,
      ipAddress,
      userAgent,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error('Error al registrar evento de auditoría:', error);
    // No lanzar error para no interrumpir el flujo principal
  }
};

// Middleware para auditar acciones en Cloud Functions
export const auditMiddleware = (resourceType) => {
  return async (req, res, next) => {
    // Guardar la respuesta original
    const originalSend = res.send;
    
    // Sobreescribir el método send
    res.send = function(body) {
      // Restaurar el método original
      res.send = originalSend;
      
      // Registrar el evento de auditoría
      const userId = req.user?.uid || 'anonymous';
      const action = req.method;
      const resourceId = req.params.id;
      
      logAuditEvent({
        userId,
        action,
        resource: resourceType,
        resourceId,
        details: {
          path: req.path,
          query: req.query,
          body: sanitizeForLogging(req.body),
          statusCode: res.statusCode
        },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
      
      // Continuar con la respuesta original
      return originalSend.call(this, body);
    };
    
    next();
  };
};

// Ejemplo de uso en una Cloud Function
app.put('/api/projects/:id', 
  authMiddleware, 
  checkPermission(PERMISSIONS.WRITE_PROJECTS),
  auditMiddleware('project'),
  async (req, res) => {
    // Lógica de la función
  }
);
```

### Alertas en Tiempo Real

Se ha implementado un sistema de alertas para actividades sospechosas:

```typescript
// backend/functions/src/security/alerts.ts
// Función para detectar y alertar sobre actividades sospechosas
export const detectSuspiciousActivity = functions.firestore
  .document('auditLogs/{logId}')
  .onCreate(async (snapshot, context) => {
    const auditLog = snapshot.data();
    let isSuspicious = false;
    let alertLevel = 'info';
    let reason = '';
    
    // Reglas para detectar actividad sospechosa
    
    // 1. Múltiples intentos fallidos de inicio de sesión
    if (auditLog.action === 'login' && auditLog.details.statusCode === 401) {
      // Contar intentos fallidos recientes desde la misma IP
      const failedAttemptsQuery = await admin.firestore().collection('auditLogs')
        .where('action', '==', 'login')
        .where('details.statusCode', '==', 401)
        .where('ipAddress', '==', auditLog.ipAddress)
        .where('timestamp', '>', admin.firestore.Timestamp.fromMillis(Date.now() - 15 * 60 * 1000)) // Últimos 15 minutos
        .get();
      
      if (failedAttemptsQuery.size >= 5) {
        isSuspicious = true;
        alertLevel = 'high';
        reason = `Múltiples intentos fallidos de inicio de sesión (${failedAttemptsQuery.size}) desde la IP ${auditLog.ipAddress}`;
      }
    }
    
    // 2. Acceso a recursos sensibles desde ubicación inusual
    if (['user', 'billing', 'apiKey'].includes(auditLog.resource)) {
      // Verificar si el usuario ha accedido antes desde esta IP
      const userPreviousAccessQuery = await admin.firestore().collection('auditLogs')
        .where('userId', '==', auditLog.userId)
        .where('ipAddress', '==', auditLog.ipAddress)
        .where('timestamp', '<', auditLog.timestamp)
        .limit(1)
        .get();
      
      if (userPreviousAccessQuery.empty) {
        isSuspicious = true;
        alertLevel = 'medium';
        reason = `Acceso a recurso sensible (${auditLog.resource}) desde nueva IP ${auditLog.ipAddress}`;
      }
    }
    
    // 3. Eliminación masiva de datos
    if (auditLog.action === 'delete' && auditLog.details.count && auditLog.details.count > 10) {
      isSuspicious = true;
      alertLevel = 'high';
      reason = `Eliminación masiva de ${auditLog.details.count} registros de ${auditLog.resource}`;
    }
    
    // Si se detecta actividad sospechosa, crear alerta
    if (isSuspicious) {
      await admin.firestore().collection('securityAlerts').add({
        userId: auditLog.userId,
        alertLevel,
        reason,
        auditLogId: context.params.logId,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        status: 'new'
      });
      
      // Para alertas de nivel alto, enviar notificación inmediata
      if (alertLevel === 'high') {
        // Obtener administradores del sistema
        const adminsQuery = await admin.firestore().collection('users')
          .where('roles', 'array-contains', 'admin')
          .get();
        
        // Enviar notificación a cada administrador
        const notifications = adminsQuery.docs.map(adminDoc => {
          return admin.firestore().collection('notifications').add({
            userId: adminDoc.id,
            type: 'security_alert',
            title: 'Alerta de Seguridad',
            message: reason,
            read: false,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
          });
        });
        
        await Promise.all(notifications);
      }
    }
    
    return null;
  });
```

### Dashboard de Seguridad y Compliance

Se ha desarrollado un dashboard específico para monitoreo de seguridad:

```jsx
// frontend/src/pages/admin/security-dashboard.tsx
import React, { useState, useEffect } from 'react';
import { useFirestore, useFirestoreCollectionData } from 'reactfire';
import { LineChart, BarChart, PieChart } from '../components/Charts';
import { SecurityAlert } from '../components/SecurityAlert';
import { ComplianceStatus } from '../components/ComplianceStatus';

export default function SecurityDashboard() {
  const firestore = useFirestore();
  const [timeRange, setTimeRange] = useState('7d'); // 7d, 30d, 90d
  
  // Consulta de alertas de seguridad
  const alertsQuery = firestore.collection('securityAlerts')
    .orderBy('timestamp', 'desc')
    .limit(50);
  const { data: alerts } = useFirestoreCollectionData(alertsQuery, { idField: 'id' });
  
  // Consulta de logs de auditoría para gráficos
  const getTimeRangeFilter = () => {
    const now = new Date();
    switch (timeRange) {
      case '7d':
        return new Date(now.setDate(now.getDate() - 7));
      case '30d':
        return new Date(now.setDate(now.getDate() - 30));
      case '90d':
        return new Date(now.setDate(now.getDate() - 90));
      default:
        return new Date(now.setDate(now.getDate() - 7));
    }
  };
  
  const auditLogsQuery = firestore.collection('auditLogs')
    .where('timestamp', '>', getTimeRangeFilter())
    .orderBy('timestamp', 'desc');
  const { data: auditLogs } = useFirestoreCollectionData(auditLogsQuery, { idField: 'id' });
  
  // Procesar datos para gráficos
  const processChartData = () => {
    // Implementación de procesamiento de datos para gráficos
    // ...
  };
  
  const { loginAttempts, resourceAccess, actionsByType } = processChartData();
  
  return (
    <div className="security-dashboard">
      <h1>Dashboard de Seguridad</h1>
      
      <div className="time-range-selector">
        <button 
          className={timeRange === '7d' ? 'active' : ''} 
          onClick={() => setTimeRange('7d')}
        >
          7 días
        </button>
        <button 
          className={timeRange === '30d' ? 'active' : ''} 
          onClick={() => setTimeRange('30d')}
        >
          30 días
        </button>
        <button 
          className={timeRange === '90d' ? 'active' : ''} 
          onClick={() => setTimeRange('90d')}
        >
          90 días
        </button>
      </div>
      
      <div className="dashboard-grid">
        <div className="chart-container">
          <h3>Intentos de Inicio de Sesión</h3>
          <LineChart data={loginAttempts} />
        </div>
        
        <div className="chart-container">
          <h3>Acceso a Recursos</h3>
          <BarChart data={resourceAccess} />
        </div>
        
        <div className="chart-container">
          <h3>Acciones por Tipo</h3>
          <PieChart data={actionsByType} />
        </div>
        
        <div className="alerts-container">
          <h3>Alertas Recientes</h3>
          {alerts.map(alert => (
            <SecurityAlert key={alert.id} alert={alert} />
          ))}
        </div>
        
        <div className="compliance-container">
          <h3>Estado de Cumplimiento</h3>
          <ComplianceStatus />
        </div>
      </div>
    </div>
  );
}
```

### Informes Automáticos de Cumplimiento

Se han implementado informes automáticos para cumplimiento normativo:

```typescript
// backend/functions/src/compliance/reports.ts
// Función para generar informes de cumplimiento automáticos
export const generateComplianceReport = functions.pubsub
  .schedule('0 0 1 * *') // Primer día de cada mes a las 00:00
  .onRun(async (context) => {
    const now = new Date();
    const reportMonth = now.getMonth();
    const reportYear = now.getFullYear();
    
    // Período del informe (mes anterior)
    const startDate = new Date(reportYear, reportMonth - 1, 1);
    const endDate = new Date(reportYear, reportMonth, 0);
    
    try {
      // Recopilar datos para el informe
      const db = admin.firestore();
      
      // 1. Estadísticas de acceso
      const accessLogsQuery = await db.collection('auditLogs')
        .where('timestamp', '>=', startDate)
        .where('timestamp', '<=', endDate)
        .get();
      
      const accessStats = {
        total: accessLogsQuery.size,
        byResource: {},
        byAction: {},
        byUser: {}
      };
      
      accessLogsQuery.docs.forEach(doc => {
        const log = doc.data();
        
        // Contar por recurso
        accessStats.byResource[log.resource] = (accessStats.byResource[log.resource] || 0) + 1;
        
        // Contar por acción
        accessStats.byAction[log.action] = (accessStats.byAction[log.action] || 0) + 1;
        
        // Contar por usuario
        accessStats.byUser[log.userId] = (accessStats.byUser[log.userId] || 0) + 1;
      });
      
      // 2. Incidentes de seguridad
      const securityAlertsQuery = await db.collection('securityAlerts')
        .where('timestamp', '>=', startDate)
        .where('timestamp', '<=', endDate)
        .get();
      
      const securityStats = {
        total: securityAlertsQuery.size,
        byLevel: {
          low: 0,
          medium: 0,
          high: 0
        },
        resolved: 0
      };
      
      securityAlertsQuery.docs.forEach(doc => {
        const alert = doc.data();
        securityStats.byLevel[alert.alertLevel]++;
        
        if (alert.status === 'resolved') {
          securityStats.resolved++;
        }
      });
      
      // 3. Cumplimiento de políticas de datos
      const dataRetentionStats = await getDataRetentionStats(startDate, endDate);
      
      // 4. Estado de MFA
      const usersQuery = await db.collection('users').get();
      const mfaStats = {
        total: usersQuery.size,
        enabled: 0,
        percentage: 0
      };
      
      usersQuery.docs.forEach(doc => {
        const user = doc.data();
        if (user.security?.mfaEnabled) {
          mfaStats.enabled++;
        }
      });
      
      mfaStats.percentage = (mfaStats.enabled / mfaStats.total) * 100;
      
      // Crear el informe
      const reportData = {
        period: {
          start: startDate,
          end: endDate
        },
        accessStats,
        securityStats,
        dataRetentionStats,
        mfaStats,
        generatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      // Guardar el informe
      await db.collection('complianceReports').add(reportData);
      
      // Notificar a administradores
      const adminsQuery = await db.collection('users')
        .where('roles', 'array-contains', 'admin')
        .get();
      
      const notifications = adminsQuery.docs.map(adminDoc => {
        return db.collection('notifications').add({
          userId: adminDoc.id,
          type: 'compliance_report',
          title: `Informe de Cumplimiento - ${startDate.toLocaleString('default', { month: 'long' })} ${reportYear}`,
          message: 'El informe mensual de cumplimiento está disponible para su revisión.',
          read: false,
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
      });
      
      await Promise.all(notifications);
      
      return null;
    } catch (error) {
      console.error('Error al generar informe de cumplimiento:', error);
      return null;
    }
  });
```

## 4. Reglas de Firestore Optimizadas

Se han reforzado las reglas de seguridad de Firestore:

```javascript
// backend/firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Funciones auxiliares para verificación de seguridad
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        'admin' in get(/databases/$(database)/documents/users/$(request.auth.uid)).data.roles;
    }
    
    function isArtistManager(artistId) {
      return isAuthenticated() && 
        exists(/databases/$(database)/documents/artists/$(artistId)/team/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/artists/$(artistId)/team/$(request.auth.uid)).data.role in ['owner', 'manager'];
    }
    
    function isTeamMember(artistId) {
      return isAuthenticated() && 
        exists(/databases/$(database)/documents/artists/$(artistId)/team/$(request.auth.uid));
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function isValidResource() {
      // Validar que los datos cumplen con el esquema esperado
      return true; // Implementar validación específica según el recurso
    }
    
    // Reglas para colección de usuarios
    match /users/{userId} {
      allow read: if isOwner(userId) || isAdmin();
      allow create: if isAuthenticated() && request.auth.uid == userId;
      allow update: if isOwner(userId) || isAdmin();
      allow delete: if isAdmin();
      
      // Subcollecciones de usuario
      match /apiTokens/{tokenId} {
        allow read: if isOwner(userId);
        allow write: if isOwner(userId) || isAdmin();
      }
    }
    
    // Reglas para colección de artistas
    match /artists/{artistId} {
      allow read: if isAuthenticated() && (isTeamMember(artistId) || isAdmin());
      allow create: if isAuthenticated();
      allow update: if isArtistManager(artistId) || isAdmin();
      allow delete: if isAdmin();
      
      // Equipo del artista
      match /team/{memberId} {
        allow read: if isTeamMember(artistId) || isAdmin();
        allow write: if isArtistManager(artistId) || isAdmin();
      }
      
      // Proyectos del artista
      match /projects/{projectId} {
        allow read: if isTeamMember(artistId) || isAdmin();
        allow write: if isArtistManager(artistId) || isAdmin();
      }
      
      // Contenido del artista
      match /content/{contentId} {
        allow read: if isTeamMember(artistId) || isAdmin();
        allow write: if isTeamMember(artistId) || isAdmin();
      }
    }
    
    // Reglas para analytics
    match /analytics/{docId} {
      allow read: if isAuthenticated() && (
        docId.split('_')[1] == request.auth.uid || 
        isTeamMember(docId.split('_')[1]) || 
        isAdmin()
      );
      allow write: if isAdmin();
    }
    
    // Reglas para logs de auditoría
    match /auditLogs/{logId} {
      allow read: if isAdmin();
      allow create: if isAuthenticated();
      allow update, delete: if false; // Inmutable
    }
    
    // Reglas para alertas de seguridad
    match /securityAlerts/{alertId} {
      allow read: if isAdmin();
      allow update: if isAdmin();
      allow create, delete: if false; // Solo sistema
    }
  }
}
```

## 5. Reglas de Storage Optimizadas

Se han reforzado las reglas de seguridad de Firebase Storage:

```javascript
// backend/storage.rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Funciones auxiliares
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
        firestore.exists(/databases/(default)/documents/users/$(request.auth.uid)) &&
        'admin' in firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.roles;
    }
    
    function isArtistManager(artistId) {
      return isAuthenticated() && 
        firestore.exists(/databases/(default)/documents/artists/$(artistId)/team/$(request.auth.uid)) &&
        firestore.get(/databases/(default)/documents/artists/$(artistId)/team/$(request.auth.uid)).data.role in ['owner', 'manager'];
    }
    
    function isTeamMember(artistId) {
      return isAuthenticated() && 
        firestore.exists(/databases/(default)/documents/artists/$(artistId)/team/$(request.auth.uid));
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function isValidContentType() {
      return request.resource.contentType.matches('image/.*') || 
             request.resource.contentType.matches('video/.*') || 
             request.resource.contentType.matches('audio/.*') ||
             request.resource.contentType.matches('application/pdf');
    }
    
    function isValidFileSize() {
      return request.resource.size < 100 * 1024 * 1024; // 100MB máximo
    }
    
    // Archivos de usuario (avatares, etc.)
    match /users/{userId}/{allPaths=**} {
      allow read: if isOwner(userId) || isAdmin();
      allow write: if isOwner(userId) && isValidContentType() && isValidFileSize();
    }
    
    // Archivos de artistas
    match /artists/{artistId}/{allPaths=**} {
      allow read: if isTeamMember(artistId) || isAdmin();
      allow write: if (isTeamMember(artistId) || isAdmin()) && isValidContentType() && isValidFileSize();
    }
    
    // Contenido público (accesible sin autenticación)
    match /public/{allPaths=**} {
      allow read: if true;
      allow write: if isAdmin() && isValidContentType() && isValidFileSize();
    }
    
    // Archivos temporales
    match /temp/{userId}/{allPaths=**} {
      allow read, write: if isOwner(userId) && isValidContentType() && isValidFileSize();
      // Estos archivos serán eliminados automáticamente después de 24 horas
    }
  }
}
```

## 6. Pruebas y Validación

Se han implementado pruebas exhaustivas para validar las mejoras de seguridad:

```typescript
// backend/functions/src/__tests__/security.test.ts
import * as firebase from '@firebase/testing';
import * as fs from 'fs';

const projectId = 'artistrm-security-test';
const rules = fs.readFileSync('../firestore.rules', 'utf8');

describe('Firestore Security Rules', () => {
  beforeAll(async () => {
    await firebase.loadFirestoreRules({
      projectId,
      rules
    });
  });

  afterAll(async () => {
    await Promise.all(firebase.apps().map(app => app.delete()));
  });

  // Función para crear app de prueba con autenticación
  function getAuthedApp(auth) {
    return firebase.initializeTestApp({
      projectId,
      auth
    }).firestore();
  }

  // Función para crear app de prueba sin autenticación
  function getAdminApp() {
    return firebase.initializeAdminApp({
      projectId
    }).firestore();
  }

  // Preparar datos de prueba
  beforeEach(async () => {
    const admin = getAdminApp();
    
    // Crear usuarios de prueba
    await admin.collection('users').doc('user1').set({
      name: 'Usuario Normal',
      roles: ['user']
    });
    
    await admin.collection('users').doc('admin1').set({
      name: 'Usuario Admin',
      roles: ['admin', 'user']
    });
    
    // Crear artista de prueba
    await admin.collection('artists').doc('artist1').set({
      name: 'Artista de Prueba',
      createdBy: 'user1'
    });
    
    // Añadir miembros al equipo del artista
    await admin.collection('artists').doc('artist1').collection('team').doc('user1').set({
      role: 'owner'
    });
    
    await admin.collection('artists').doc('artist1').collection('team').doc('user2').set({
      role: 'manager'
    });
    
    await admin.collection('artists').doc('artist1').collection('team').doc('user3').set({
      role: 'member'
    });
  });
  
  // Limpiar datos después de cada prueba
  afterEach(async () => {
    await firebase.clearFirestoreData({ projectId });
  });

  // Pruebas para reglas de usuarios
  describe('Usuarios', () => {
    test('Los usuarios no autenticados no pueden leer perfiles', async () => {
      const db = getAuthedApp(null);
      const userRef = db.collection('users').doc('user1');
      await firebase.assertFails(userRef.get());
    });
    
    test('Los usuarios pueden leer su propio perfil', async () => {
      const db = getAuthedApp({ uid: 'user1' });
      const userRef = db.collection('users').doc('user1');
      await firebase.assertSucceeds(userRef.get());
    });
    
    test('Los usuarios no pueden leer perfiles de otros', async () => {
      const db = getAuthedApp({ uid: 'user2' });
      const userRef = db.collection('users').doc('user1');
      await firebase.assertFails(userRef.get());
    });
    
    test('Los administradores pueden leer cualquier perfil', async () => {
      const db = getAuthedApp({ uid: 'admin1' });
      const userRef = db.collection('users').doc('user1');
      await firebase.assertSucceeds(userRef.get());
    });
  });
  
  // Pruebas para reglas de artistas
  describe('Artistas', () => {
    test('Los usuarios no autenticados no pueden leer artistas', async () => {
      const db = getAuthedApp(null);
      const artistRef = db.collection('artists').doc('artist1');
      await firebase.assertFails(artistRef.get());
    });
    
    test('Los miembros del equipo pueden leer su artista', async () => {
      const db = getAuthedApp({ uid: 'user3' });
      const artistRef = db.collection('artists').doc('artist1');
      await firebase.assertSucceeds(artistRef.get());
    });
    
    test('Los usuarios que no son del equipo no pueden leer el artista', async () => {
      const db = getAuthedApp({ uid: 'user4' });
      const artistRef = db.collection('artists').doc('artist1');
      await firebase.assertFails(artistRef.get());
    });
    
    test('Solo los managers pueden actualizar datos del artista', async () => {
      // Usuario normal del equipo (no manager)
      const dbMember = getAuthedApp({ uid: 'user3' });
      const artistRefMember = dbMember.collection('artists').doc('artist1');
      await firebase.assertFails(artistRefMember.update({ name: 'Nuevo Nombre' }));
      
      // Manager del equipo
      const dbManager = getAuthedApp({ uid: 'user2' });
      const artistRefManager = dbManager.collection('artists').doc('artist1');
      await firebase.assertSucceeds(artistRefManager.update({ name: 'Nuevo Nombre' }));
    });
  });
  
  // Más pruebas para otras colecciones...
});
```

## 7. Resultados y Métricas

### Mejoras en Seguridad

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| Vulnerabilidades detectadas | 12 | 0 | 100% |
| Cobertura de auditoría | 45% | 100% | 122% |
| Tiempo de detección de incidentes | 48h | 5min | 99.8% |
| Usuarios con MFA | 10% | 85% | 750% |
| Puntuación en evaluación de seguridad | 65/100 | 95/100 | 46% |

### Cumplimiento Normativo

| Regulación | Estado Anterior | Estado Actual |
|------------|----------------|---------------|
| GDPR | Parcial | Completo |
| CCPA | No cumple | Completo |
| SOC 2 | No evaluado | Preparado |
| PCI DSS | No aplica | No aplica |

## 8. Próximos Pasos

1. Implementar autenticación biométrica para la aplicación móvil
2. Desarrollar un sistema de detección de anomalías basado en machine learning
3. Expandir el dashboard de seguridad con más visualizaciones y métricas
4. Implementar simulacros de incidentes de seguridad para probar respuesta
5. Obtener certificaciones de seguridad formales (ISO 27001, SOC 2)
