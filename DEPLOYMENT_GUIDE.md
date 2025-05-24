# Guía de Despliegue - ArtistRM 360

## Introducción

Esta guía detalla el proceso de despliegue de ArtistRM 360 en un entorno de producción utilizando Firebase Hosting, Cloud Functions y GitHub Actions para CI/CD. Sigue estos pasos para asegurar un despliegue exitoso y seguro.

## Requisitos Previos

- Cuenta de Firebase con plan Blaze (pago por uso)
- Proyecto Firebase configurado (ID: `zamx-v1`)
- Cuenta de GitHub con acceso al repositorio
- Node.js 18.x o superior
- Firebase CLI instalado globalmente (`npm install -g firebase-tools`)

## Estructura de Despliegue

ArtistRM 360 utiliza una arquitectura de despliegue moderna:

- **Frontend**: Next.js desplegado en Firebase Hosting
- **Backend**: Cloud Functions para lógica serverless
- **Base de Datos**: Firestore para almacenamiento de datos
- **Almacenamiento**: Firebase Storage para archivos multimedia
- **CI/CD**: GitHub Actions para automatización de despliegue

## Configuración de Variables de Entorno

### Variables de Entorno para Desarrollo

Archivo: `.env.local`

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyD32w6JKRWbrlhgdQ1goCqC-EyHtMEVy-s
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=zamx-v1.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=zamx-v1
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=zamx-v1.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=609415718761
NEXT_PUBLIC_FIREBASE_APP_ID=1:609415718761:web:a7b3c5d8e9f0g1h2i3j4k5
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-MEASUREMENT_ID

NEXT_PUBLIC_VERTEX_AI_LOCATION=us-central1
NEXT_PUBLIC_VERTEX_AI_PROJECT_ID=zamx-v1
```

### Variables de Entorno para Producción

Estas variables deben configurarse en Firebase Functions y GitHub Actions:

```
FIREBASE_TOKEN=<token-secreto-firebase>
VERTEX_AI_PRIVATE_KEY=<clave-privada-vertex-ai>
FIREBASE_SERVICE_ACCOUNT=<cuenta-servicio-firebase-json>
```

## Configuración de Firebase

### firebase.json

```json
{
  "hosting": {
    "public": "out",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      },
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  },
  "functions": {
    "source": "functions",
    "runtime": "nodejs18"
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  }
}
```

### firestore.rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Autenticación requerida para todos los accesos
    match /{document=**} {
      allow read, write: if false;
    }
    
    // Reglas para usuarios
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Reglas para proyectos
    match /projects/{projectId} {
      allow read: if request.auth != null && (
        resource.data.userId == request.auth.uid || 
        resource.data.collaborators[request.auth.uid] != null
      );
      allow write: if request.auth != null && (
        resource.data.userId == request.auth.uid || 
        (resource.data.collaborators[request.auth.uid] != null && 
         resource.data.collaborators[request.auth.uid].role == 'editor')
      );
    }
    
    // Reglas para contenido
    match /content/{contentId} {
      allow read: if request.auth != null && (
        resource.data.userId == request.auth.uid || 
        resource.data.sharedWith[request.auth.uid] != null
      );
      allow write: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    // Reglas para analytics
    match /analytics/{analyticsId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow write: if false; // Solo escritura desde Cloud Functions
    }
    
    // Reglas para conversaciones de Zeus
    match /zeus_conversations/{conversationId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow write: if request.auth != null && request.auth.uid == conversationId.split('_')[0];
    }
  }
}
```

### storage.rules

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if false;
    }
    
    // Reglas para imágenes de perfil
    match /profile_images/{userId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId
                   && request.resource.contentType.matches('image/.*')
                   && request.resource.size < 5 * 1024 * 1024; // 5MB max
    }
    
    // Reglas para contenido de proyectos
    match /projects/{projectId}/{fileName} {
      allow read: if request.auth != null && exists(/databases/$(database)/documents/projects/$(projectId))
                  && (get(/databases/$(database)/documents/projects/$(projectId)).data.userId == request.auth.uid
                  || get(/databases/$(database)/documents/projects/$(projectId)).data.collaborators[request.auth.uid] != null);
      allow write: if request.auth != null && exists(/databases/$(database)/documents/projects/$(projectId))
                   && (get(/databases/$(database)/documents/projects/$(projectId)).data.userId == request.auth.uid
                   || (get(/databases/$(database)/documents/projects/$(projectId)).data.collaborators[request.auth.uid] != null
                   && get(/databases/$(database)/documents/projects/$(projectId)).data.collaborators[request.auth.uid].role == 'editor'))
                   && request.resource.size < 100 * 1024 * 1024; // 100MB max
    }
    
    // Reglas para biblioteca de contenido
    match /content/{userId}/{fileName} {
      allow read: if request.auth != null && (request.auth.uid == userId
                  || exists(/databases/$(database)/documents/content/$(fileName))
                  && get(/databases/$(database)/documents/content/$(fileName)).data.sharedWith[request.auth.uid] != null);
      allow write: if request.auth != null && request.auth.uid == userId
                   && request.resource.size < 500 * 1024 * 1024; // 500MB max
    }
  }
}
```

## Configuración de GitHub Actions

### .github/workflows/deploy.yml

```yaml
name: Deploy to Firebase

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_FIREBASE_API_KEY: ${{ secrets.NEXT_PUBLIC_FIREBASE_API_KEY }}
          NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: ${{ secrets.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN }}
          NEXT_PUBLIC_FIREBASE_PROJECT_ID: ${{ secrets.NEXT_PUBLIC_FIREBASE_PROJECT_ID }}
          NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: ${{ secrets.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET }}
          NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID }}
          NEXT_PUBLIC_FIREBASE_APP_ID: ${{ secrets.NEXT_PUBLIC_FIREBASE_APP_ID }}
          NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: ${{ secrets.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID }}
          NEXT_PUBLIC_VERTEX_AI_LOCATION: ${{ secrets.NEXT_PUBLIC_VERTEX_AI_LOCATION }}
          NEXT_PUBLIC_VERTEX_AI_PROJECT_ID: ${{ secrets.NEXT_PUBLIC_VERTEX_AI_PROJECT_ID }}

      - name: Export Next.js app
        run: npm run export

      - name: Deploy to Firebase Hosting
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: zamx-v1

      - name: Deploy Firebase Functions
        run: |
          npm --prefix functions ci
          npx firebase-tools deploy --only functions --token "${{ secrets.FIREBASE_TOKEN }}"
```

## Proceso de Despliegue Manual

Si necesitas realizar un despliegue manual, sigue estos pasos:

1. **Preparación del entorno**:
   ```bash
   npm install
   ```

2. **Construcción del proyecto**:
   ```bash
   npm run build
   npm run export
   ```

3. **Despliegue en Firebase**:
   ```bash
   firebase login
   firebase deploy --project zamx-v1
   ```

## Verificación Post-Despliegue

Después del despliegue, verifica:

1. **Accesibilidad**: Confirma que la aplicación es accesible en la URL de producción
2. **Funcionalidad**: Prueba las funcionalidades principales
3. **Rendimiento**: Verifica los tiempos de carga y respuesta
4. **Logs**: Revisa los logs de Firebase para detectar errores
5. **Monitoreo**: Configura alertas para métricas clave

## Rollback

En caso de problemas, puedes realizar un rollback:

```bash
firebase hosting:clone zamx-v1:live zamx-v1:live --version=VERSION_ID
```

Donde `VERSION_ID` es el ID de la versión anterior estable, que puedes encontrar en la consola de Firebase Hosting.

## Monitoreo y Mantenimiento

### Herramientas de Monitoreo

- **Firebase Performance Monitoring**: Para métricas de rendimiento
- **Firebase Crashlytics**: Para detección de errores
- **Google Analytics**: Para análisis de uso
- **Cloud Monitoring**: Para alertas y dashboards

### Tareas de Mantenimiento

- Revisar logs diariamente
- Actualizar dependencias mensualmente
- Realizar pruebas de carga trimestralmente
- Auditar seguridad cada seis meses

## Contactos y Soporte

Para problemas de despliegue o infraestructura:

- **Responsable Técnico**: Claude4 (claude4@artistrm360.com)
- **Soporte Firebase**: [Consola de Firebase](https://console.firebase.google.com/project/zamx-v1/overview)
- **Documentación**: [Repositorio de GitHub](https://github.com/flow23flow23/artistrm-360)

## Apéndice: Comandos Útiles

```bash
# Ver versiones desplegadas
firebase hosting:versions --project zamx-v1

# Desplegar solo hosting
firebase deploy --only hosting --project zamx-v1

# Desplegar solo funciones
firebase deploy --only functions --project zamx-v1

# Desplegar reglas de Firestore
firebase deploy --only firestore:rules --project zamx-v1

# Desplegar reglas de Storage
firebase deploy --only storage:rules --project zamx-v1

# Ver logs de funciones
firebase functions:log --project zamx-v1
```
