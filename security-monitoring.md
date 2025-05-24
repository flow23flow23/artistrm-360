# Configuración de Monitoreo de Seguridad - ArtistRM 360

## Introducción

Este documento detalla la configuración recomendada para el monitoreo de seguridad en ArtistRM 360, con el objetivo de detectar y mitigar posibles explotaciones de las vulnerabilidades identificadas en las dependencias de Firebase.

## Componentes del Sistema de Monitoreo

### 1. Logging Avanzado

#### 1.1 Configuración de Firebase Logging

```javascript
// En src/lib/firebase/logging.ts
import { getApp } from 'firebase/app';
import { getAnalytics, logEvent } from 'firebase/analytics';
import { getFunctions, httpsCallable } from 'firebase/functions';

export const logSecurityEvent = async (eventType, eventData) => {
  try {
    // Log en Analytics para análisis de patrones
    const analytics = getAnalytics(getApp());
    logEvent(analytics, `security_${eventType}`, {
      ...eventData,
      timestamp: new Date().toISOString()
    });
    
    // Log en Cloud Functions para alertas en tiempo real
    const functions = getFunctions(getApp());
    const logSecurityEventFn = httpsCallable(functions, 'logSecurityEvent');
    await logSecurityEventFn({
      eventType,
      eventData,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    });
  } catch (error) {
    console.error('Error logging security event:', error);
  }
};
```

#### 1.2 Cloud Function para Procesamiento de Logs

```javascript
// En functions/src/security/logging.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.logSecurityEvent = functions.https.onCall(async (data, context) => {
  // Verificar autenticación
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }
  
  // Guardar evento en Firestore
  try {
    await admin.firestore().collection('security_logs').add({
      userId: context.auth.uid,
      ip: context.rawRequest.ip,
      ...data,
      serverTimestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Verificar si el evento requiere alerta
    if (isAlertableEvent(data.eventType)) {
      await triggerSecurityAlert(data, context);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error saving security log:', error);
    throw new functions.https.HttpsError('internal', 'Error saving security log');
  }
});

// Función para determinar si un evento requiere alerta
const isAlertableEvent = (eventType) => {
  const alertableEvents = [
    'auth_bruteforce_attempt',
    'suspicious_request_pattern',
    'storage_abuse',
    'firestore_abuse',
    'functions_abuse'
  ];
  
  return alertableEvents.includes(eventType);
};

// Función para enviar alertas
const triggerSecurityAlert = async (data, context) => {
  // Implementar lógica de alertas (email, SMS, webhook, etc.)
};
```

### 2. Detección de Patrones Anómalos

#### 2.1 Configuración de Reglas de Firestore

```javascript
// En firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Función para verificar límites de tasa
    function isUnderRateLimit() {
      return request.time > get(/databases/$(database)/documents/rate_limits/$(request.auth.uid)).data.resetTime ||
             get(/databases/$(database)/documents/rate_limits/$(request.auth.uid)).data.count < 100;
    }
    
    // Función para detectar patrones sospechosos
    function isSuspiciousRequest() {
      return request.resource.data.keys().hasAny(['__proto__', 'constructor', 'prototype']) ||
             request.resource.data.toString().matches('.*script.*');
    }
    
    // Reglas para colecciones específicas
    match /users/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId && !isSuspiciousRequest();
    }
    
    // Otras reglas...
  }
}
```

#### 2.2 Implementación de Middleware de Seguridad

```javascript
// En src/middleware/security.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Verificar patrones de ataque en URL
  const url = request.nextUrl.pathname;
  const suspiciousPatterns = [
    /\.\.\//,                // Path traversal
    /%00/,                   // Null byte
    /script/i,               // XSS simple
    /on\w+\s*=/i,            // Event handlers
    /javascript:/i,          // JavaScript protocol
  ];
  
  // Verificar si la URL contiene patrones sospechosos
  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(url));
  
  if (isSuspicious) {
    // Registrar intento sospechoso
    console.warn(`Suspicious request pattern detected: ${url}`);
    
    // Redirigir a página de error o bloquear
    return NextResponse.redirect(new URL('/error', request.url));
  }
  
  return NextResponse.next();
}

// Configurar rutas para aplicar el middleware
export const config = {
  matcher: [
    '/((?!api|_next/static|favicon.ico).*)',
  ],
};
```

### 3. Alertas y Notificaciones

#### 3.1 Configuración de Cloud Functions para Alertas

```javascript
// En functions/src/security/alerts.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

// Configuración de transporte de email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: functions.config().email.user,
    pass: functions.config().email.password
  }
});

// Función para enviar alertas por email
exports.sendSecurityAlert = functions.firestore
  .document('security_logs/{logId}')
  .onCreate(async (snap, context) => {
    const logData = snap.data();
    
    // Verificar si el evento requiere alerta
    if (!isAlertableEvent(logData.eventType)) {
      return null;
    }
    
    // Obtener destinatarios de alertas
    const alertConfig = await admin.firestore()
      .collection('config')
      .doc('security_alerts')
      .get();
    
    if (!alertConfig.exists) {
      console.error('Alert configuration not found');
      return null;
    }
    
    const recipients = alertConfig.data().recipients || [];
    
    // Preparar y enviar email
    const mailOptions = {
      from: `"ArtistRM 360 Security" <${functions.config().email.user}>`,
      to: recipients.join(','),
      subject: `Security Alert: ${logData.eventType}`,
      html: `
        <h2>Security Alert</h2>
        <p><strong>Event Type:</strong> ${logData.eventType}</p>
        <p><strong>Timestamp:</strong> ${logData.timestamp}</p>
        <p><strong>User ID:</strong> ${logData.userId}</p>
        <p><strong>IP Address:</strong> ${logData.ip}</p>
        <h3>Event Data:</h3>
        <pre>${JSON.stringify(logData.eventData, null, 2)}</pre>
      `
    };
    
    try {
      await transporter.sendMail(mailOptions);
      console.log('Security alert email sent');
      return null;
    } catch (error) {
      console.error('Error sending security alert email:', error);
      return null;
    }
  });

// Función para determinar si un evento requiere alerta
const isAlertableEvent = (eventType) => {
  // Implementar lógica para determinar eventos alertables
};
```

## Implementación del Monitoreo en Componentes Clave

### 1. Monitoreo en Autenticación

```javascript
// En src/hooks/use-auth.ts
import { useState, useEffect, useContext, createContext } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { logSecurityEvent } from '@/lib/firebase/logging';

// Implementación del hook con monitoreo
export const useAuth = () => {
  // Estado y lógica existente...
  
  const signIn = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      // Registrar intento de inicio de sesión
      await logSecurityEvent('auth_signin_attempt', { email });
      
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Registrar inicio de sesión exitoso
      await logSecurityEvent('auth_signin_success', { 
        email, 
        uid: result.user.uid 
      });
      
      return result;
    } catch (error) {
      setError(error);
      
      // Registrar error de inicio de sesión
      await logSecurityEvent('auth_signin_error', { 
        email, 
        errorCode: error.code,
        errorMessage: error.message
      });
      
      // Detectar posibles intentos de fuerza bruta
      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        const failedAttempts = (localStorage.getItem(`failedAttempts_${email}`) || 0) + 1;
        localStorage.setItem(`failedAttempts_${email}`, failedAttempts);
        
        if (failedAttempts >= 5) {
          await logSecurityEvent('auth_bruteforce_attempt', { 
            email, 
            failedAttempts 
          });
        }
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Implementar monitoreo similar para signUp, signOut, etc.
  
  return {
    // Valores y funciones existentes...
    signIn,
    // Otras funciones...
  };
};
```

### 2. Monitoreo en Operaciones de Firestore

```javascript
// En src/lib/firebase/firestore.ts
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  limit
} from 'firebase/firestore';
import { db } from './config';
import { logSecurityEvent } from './logging';

// Wrapper para operaciones de Firestore con monitoreo
export const safeGetDoc = async (path, id) => {
  try {
    const docRef = doc(db, path, id);
    const result = await getDoc(docRef);
    
    // Registrar acceso exitoso
    await logSecurityEvent('firestore_read', { 
      path, 
      id, 
      exists: result.exists() 
    });
    
    return result;
  } catch (error) {
    // Registrar error
    await logSecurityEvent('firestore_read_error', { 
      path, 
      id, 
      errorMessage: error.message 
    });
    
    throw error;
  }
};

// Implementar wrappers similares para otras operaciones de Firestore
```

## Configuración de Monitoreo en CI/CD

### 1. GitHub Actions para Escaneo de Seguridad

```yaml
# En .github/workflows/security-scan.yml
name: Security Scan

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]
  schedule:
    - cron: '0 0 * * 0'  # Ejecutar cada domingo a medianoche

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run npm audit
        run: npm audit --json > npm-audit.json || true
        
      - name: Analyze npm audit results
        run: node .github/scripts/analyze-audit.js
        
      - name: Run OWASP Dependency-Check
        uses: dependency-check/Dependency-Check_Action@main
        with:
          project: 'ArtistRM 360'
          path: '.'
          format: 'HTML'
          out: 'reports'
          
      - name: Upload security reports
        uses: actions/upload-artifact@v3
        with:
          name: security-reports
          path: reports/
```

## Conclusión

La implementación de este sistema de monitoreo de seguridad proporcionará:

1. **Detección temprana** de posibles explotaciones de vulnerabilidades
2. **Alertas en tiempo real** para respuesta rápida a incidentes
3. **Registro detallado** para análisis forense y mejora continua
4. **Mitigación proactiva** de riesgos de seguridad

Este enfoque de seguridad en profundidad complementa la actualización de dependencias y proporciona una capa adicional de protección mientras se espera la resolución definitiva de las vulnerabilidades en las dependencias de Firebase.
