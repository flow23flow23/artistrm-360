# Correcciones para Tests Fallidos - ArtistRM 360

## Resumen de Problemas Detectados

Durante la ejecución de pruebas unitarias se identificaron dos problemas principales:

1. **Error "React is not defined"** en los tests de ThemeContext
2. **Error de módulos ES** en la importación de Firebase config

## Soluciones Detalladas

### 1. Corrección para "React is not defined"

Este error ocurre porque los tests utilizan JSX pero no importan React explícitamente. Aunque en el código de producción con Next.js no es necesario importar React, en el entorno de pruebas Jest sí lo requiere.

#### Solución 1.1: Añadir importación de React en cada test

Modificar cada archivo de test que utiliza JSX para incluir la importación de React:

```typescript
// Añadir esta línea al inicio de cada archivo de test que usa JSX
import React from 'react';

// Resto del código del test...
```

#### Solución 1.2: Configurar Babel para transformación automática

Alternativamente, modificar la configuración de Babel para usar la opción `runtime: 'automatic'` que permite JSX sin importar React:

```javascript
// En babel.config.js
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-typescript',
    ['@babel/preset-react', { runtime: 'automatic' }]  // Esta opción es clave
  ],
  // ...
};
```

### 2. Corrección para Error de Módulos ES en Firebase Config

Este error ocurre porque Jest está intentando procesar los imports de tipo ES Module en `src/firebase/config.js` pero está configurado para CommonJS.

#### Solución 2.1: Actualizar configuración de Jest

Modificar `jest.config.js` para transformar correctamente los módulos ES:

```javascript
// En jest.config.js
module.exports = {
  // ...
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': ['babel-jest', { configFile: './babel.config.js' }]
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(@firebase|firebase|react-firebase-hooks)/)'
  ],
  // ...
};
```

#### Solución 2.2: Crear mock específico para Firebase config

Crear un mock específico para `src/firebase/config.js` en los tests:

```javascript
// En src/test-utils/firebase.mock.ts
jest.mock('../firebase/config', () => ({
  auth: {
    onAuthStateChanged: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    createUserWithEmailAndPassword: jest.fn()
  },
  db: {
    collection: jest.fn(),
    doc: jest.fn(),
    getDoc: jest.fn(),
    setDoc: jest.fn(),
    updateDoc: jest.fn(),
    deleteDoc: jest.fn()
  },
  storage: {
    ref: jest.fn(),
    uploadBytes: jest.fn(),
    getDownloadURL: jest.fn()
  }
}), { virtual: true });
```

#### Solución 2.3: Convertir config.js a CommonJS

Como solución alternativa, convertir `src/firebase/config.js` a formato CommonJS:

```javascript
// Versión CommonJS de src/firebase/config.js
const { initializeApp } = require('firebase/app');
const { getAuth } = require('firebase/auth');
const { getFirestore } = require('firebase/firestore');
const { getStorage } = require('firebase/storage');
const { getFunctions } = require('firebase/functions');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);

module.exports = {
  app,
  auth,
  db,
  storage,
  functions
};
```

## Implementación Recomendada

Para una solución completa y robusta, se recomienda implementar:

1. La **Solución 1.2** (configuración de Babel) para resolver el error "React is not defined"
2. La **Solución 2.1** (actualización de Jest) junto con la **Solución 2.2** (mock específico) para resolver el error de módulos ES

Esta combinación proporciona la solución más limpia y mantenible a largo plazo, evitando modificaciones en múltiples archivos de test y permitiendo una configuración centralizada.

## Pasos de Implementación

1. Actualizar `babel.config.js` con la configuración recomendada
2. Actualizar `jest.config.js` con la configuración de transformación
3. Crear el archivo de mock `src/test-utils/firebase.mock.ts`
4. Importar el mock en `src/test-utils/jest.setup.ts`
5. Ejecutar los tests para verificar la resolución de los errores

## Validación

Después de implementar estas correcciones, ejecutar:

```bash
npm test
```

Los tests deberían ejecutarse sin los errores mencionados anteriormente.
