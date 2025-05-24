import * as crypto from 'crypto';
import * as functions from 'firebase-functions';
import { auth, db } from './admin';

// Algoritmo de encriptación
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
// Tamaño del vector de inicialización
const IV_LENGTH = 16;
// Tamaño del tag de autenticación
const AUTH_TAG_LENGTH = 16;

/**
 * Encripta datos sensibles
 * @param data Datos a encriptar
 * @param secretKey Clave secreta (debe ser de 32 bytes)
 * @returns Datos encriptados en formato hexadecimal
 */
export const encryptData = (data: string, secretKey: string): string => {
  try {
    // Generar vector de inicialización aleatorio
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Crear cipher con algoritmo, clave y vector de inicialización
    const cipher = crypto.createCipheriv(
      ENCRYPTION_ALGORITHM, 
      Buffer.from(secretKey, 'hex'), 
      iv
    );
    
    // Encriptar datos
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Obtener tag de autenticación
    const authTag = cipher.getAuthTag();
    
    // Combinar IV, datos encriptados y tag de autenticación
    return iv.toString('hex') + ':' + encrypted + ':' + authTag.toString('hex');
  } catch (error) {
    console.error('Error al encriptar datos:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Error al encriptar datos sensibles'
    );
  }
};

/**
 * Desencripta datos
 * @param encryptedData Datos encriptados en formato hexadecimal
 * @param secretKey Clave secreta (debe ser de 32 bytes)
 * @returns Datos desencriptados
 */
export const decryptData = (encryptedData: string, secretKey: string): string => {
  try {
    // Separar IV, datos encriptados y tag de autenticación
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      throw new Error('Formato de datos encriptados inválido');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const authTag = Buffer.from(parts[2], 'hex');
    
    // Crear decipher con algoritmo, clave y vector de inicialización
    const decipher = crypto.createDecipheriv(
      ENCRYPTION_ALGORITHM, 
      Buffer.from(secretKey, 'hex'), 
      iv
    );
    
    // Establecer tag de autenticación
    decipher.setAuthTag(authTag);
    
    // Desencriptar datos
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Error al desencriptar datos:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Error al desencriptar datos sensibles'
    );
  }
};

/**
 * Genera un hash seguro para contraseñas
 * @param password Contraseña a hashear
 * @param salt Sal para el hash (opcional, se genera si no se proporciona)
 * @returns Hash y sal utilizados
 */
export const hashPassword = (password: string, salt?: string): { hash: string, salt: string } => {
  // Generar sal si no se proporciona
  const usedSalt = salt || crypto.randomBytes(16).toString('hex');
  
  // Generar hash con PBKDF2 (100,000 iteraciones)
  const hash = crypto.pbkdf2Sync(
    password,
    usedSalt,
    100000,
    64,
    'sha512'
  ).toString('hex');
  
  return { hash, salt: usedSalt };
};

/**
 * Verifica una contraseña contra un hash almacenado
 * @param password Contraseña a verificar
 * @param storedHash Hash almacenado
 * @param storedSalt Sal almacenada
 * @returns Verdadero si la contraseña es correcta
 */
export const verifyPassword = (
  password: string,
  storedHash: string,
  storedSalt: string
): boolean => {
  const { hash } = hashPassword(password, storedSalt);
  return hash === storedHash;
};

/**
 * Genera un token seguro
 * @param length Longitud del token (por defecto 32)
 * @returns Token generado
 */
export const generateSecureToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Registra un evento de auditoría
 * @param userId ID del usuario
 * @param action Acción realizada
 * @param resource Recurso afectado
 * @param details Detalles adicionales
 * @param status Estado de la acción (éxito/error)
 */
export const logAuditEvent = async (
  userId: string,
  action: string,
  resource: string,
  details: any,
  status: 'success' | 'error' = 'success'
): Promise<void> => {
  try {
    // Sanitizar detalles para eliminar información sensible
    const sanitizedDetails = sanitizeAuditDetails(details);
    
    // Crear registro de auditoría
    await db.collection('audit_logs').add({
      userId,
      action,
      resource,
      details: sanitizedDetails,
      status,
      timestamp: new Date(),
      ipAddress: details.ipAddress || 'unknown',
      userAgent: details.userAgent || 'unknown'
    });
  } catch (error) {
    console.error('Error al registrar evento de auditoría:', error);
    // No lanzar error para evitar interrumpir el flujo principal
  }
};

/**
 * Sanitiza detalles para auditoría, eliminando información sensible
 * @param details Detalles a sanitizar
 * @returns Detalles sanitizados
 */
const sanitizeAuditDetails = (details: any): any => {
  if (!details) return {};
  
  // Crear copia para no modificar el original
  const sanitized = { ...details };
  
  // Lista de campos sensibles a eliminar
  const sensitiveFields = [
    'password', 'token', 'secret', 'key', 'credential', 
    'credit_card', 'ssn', 'social_security', 'auth'
  ];
  
  // Función recursiva para sanitizar objetos anidados
  const sanitizeObject = (obj: any): any => {
    if (!obj || typeof obj !== 'object') return obj;
    
    Object.keys(obj).forEach(key => {
      // Verificar si el campo es sensible
      const isFieldSensitive = sensitiveFields.some(field => 
        key.toLowerCase().includes(field)
      );
      
      if (isFieldSensitive) {
        // Reemplazar valor sensible
        obj[key] = '[REDACTED]';
      } else if (typeof obj[key] === 'object') {
        // Procesar objetos anidados
        obj[key] = sanitizeObject(obj[key]);
      }
    });
    
    return obj;
  };
  
  return sanitizeObject(sanitized);
};

/**
 * Verifica si un usuario tiene autenticación multifactor habilitada
 * @param uid ID del usuario
 * @returns Verdadero si MFA está habilitado
 */
export const isMfaEnabled = async (uid: string): Promise<boolean> => {
  try {
    const user = await auth.getUser(uid);
    return user.multiFactor?.enrolledFactors?.length > 0 || false;
  } catch (error) {
    console.error('Error al verificar MFA:', error);
    return false;
  }
};

/**
 * Verifica si una acción requiere verificación adicional basada en riesgo
 * @param userId ID del usuario
 * @param action Acción a realizar
 * @param context Contexto de la solicitud
 * @returns Verdadero si se requiere verificación adicional
 */
export const requiresAdditionalVerification = async (
  userId: string,
  action: string,
  context: any
): Promise<boolean> => {
  try {
    // Obtener historial de acceso del usuario
    const userAccessHistory = await db
      .collection('user_access')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(10)
      .get();
    
    // Acciones de alto riesgo que siempre requieren verificación
    const highRiskActions = [
      'delete_account',
      'change_password',
      'update_payment',
      'transfer_ownership',
      'bulk_delete'
    ];
    
    // Verificar si es una acción de alto riesgo
    if (highRiskActions.includes(action)) {
      return true;
    }
    
    // Verificar si es un nuevo dispositivo o ubicación
    if (userAccessHistory.empty) {
      return true; // Primer acceso, requiere verificación
    }
    
    const knownIPs = new Set();
    const knownDevices = new Set();
    
    userAccessHistory.docs.forEach(doc => {
      const data = doc.data();
      knownIPs.add(data.ipAddress);
      knownDevices.add(data.userAgent);
    });
    
    const isNewIP = !knownIPs.has(context.ipAddress);
    const isNewDevice = !knownDevices.has(context.userAgent);
    
    return isNewIP || isNewDevice;
  } catch (error) {
    console.error('Error al verificar necesidad de verificación adicional:', error);
    return true; // Por seguridad, requerir verificación en caso de error
  }
};

/**
 * Registra un intento de acceso
 * @param userId ID del usuario
 * @param success Éxito del intento
 * @param context Contexto del intento
 */
export const logAccessAttempt = async (
  userId: string,
  success: boolean,
  context: any
): Promise<void> => {
  try {
    await db.collection('user_access').add({
      userId,
      success,
      ipAddress: context.ipAddress || 'unknown',
      userAgent: context.userAgent || 'unknown',
      timestamp: new Date(),
      geoLocation: context.geoLocation || null
    });
  } catch (error) {
    console.error('Error al registrar intento de acceso:', error);
  }
};
