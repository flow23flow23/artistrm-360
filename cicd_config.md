# Configuración de CI/CD para ArtistRM

Este documento detalla la configuración del pipeline de Integración Continua y Despliegue Continuo (CI/CD) para el proyecto ArtistRM, utilizando Google Cloud Build.

## Estructura del Pipeline

El pipeline de CI/CD está diseñado para automatizar el proceso de pruebas, construcción y despliegue de la aplicación, siguiendo las mejores prácticas de DevOps y asegurando la calidad del código antes de su despliegue en producción.

### Etapas del Pipeline

1. **Validación de Código**
   - Linting
   - Verificación de tipos (TypeScript)
   - Análisis estático de código

2. **Pruebas Automatizadas**
   - Pruebas unitarias
   - Pruebas de integración
   - Pruebas E2E (en entorno de staging)

3. **Construcción**
   - Compilación del frontend
   - Empaquetado de Cloud Functions

4. **Despliegue**
   - Despliegue automático a entorno de staging
   - Despliegue a producción (con aprobación manual)

## Configuración de Cloud Build

A continuación se presenta la configuración de Cloud Build para el proyecto ArtistRM:

```yaml
# cloudbuild.yaml
steps:
  # Instalación de dependencias del frontend
  - name: 'node:16'
    dir: 'frontend'
    entrypoint: npm
    args: ['install']

  # Instalación de dependencias del backend
  - name: 'node:16'
    dir: 'backend/functions'
    entrypoint: npm
    args: ['install']

  # Linting del frontend
  - name: 'node:16'
    dir: 'frontend'
    entrypoint: npm
    args: ['run', 'lint']

  # Linting del backend
  - name: 'node:16'
    dir: 'backend/functions'
    entrypoint: npm
    args: ['run', 'lint']

  # Pruebas unitarias del frontend
  - name: 'node:16'
    dir: 'frontend'
    entrypoint: npm
    args: ['run', 'test']

  # Pruebas unitarias del backend
  - name: 'node:16'
    dir: 'backend/functions'
    entrypoint: npm
    args: ['run', 'test']

  # Construcción del frontend
  - name: 'node:16'
    dir: 'frontend'
    entrypoint: npm
    args: ['run', 'build']

  # Construcción del backend
  - name: 'node:16'
    dir: 'backend/functions'
    entrypoint: npm
    args: ['run', 'build']

  # Despliegue de Firebase Hosting (frontend) a staging
  - name: 'gcr.io/$PROJECT_ID/firebase'
    args: ['deploy', '--only', 'hosting', '--project', '$PROJECT_ID', '--config', 'firebase.staging.json']
    env:
      - 'FIREBASE_TOKEN=$_FIREBASE_TOKEN'

  # Despliegue de Firebase Functions a staging
  - name: 'gcr.io/$PROJECT_ID/firebase'
    args: ['deploy', '--only', 'functions', '--project', '$PROJECT_ID', '--config', 'firebase.staging.json']
    env:
      - 'FIREBASE_TOKEN=$_FIREBASE_TOKEN'

  # Despliegue de Firestore Rules a staging
  - name: 'gcr.io/$PROJECT_ID/firebase'
    args: ['deploy', '--only', 'firestore:rules', '--project', '$PROJECT_ID', '--config', 'firebase.staging.json']
    env:
      - 'FIREBASE_TOKEN=$_FIREBASE_TOKEN'

  # Despliegue de Storage Rules a staging
  - name: 'gcr.io/$PROJECT_ID/firebase'
    args: ['deploy', '--only', 'storage:rules', '--project', '$PROJECT_ID', '--config', 'firebase.staging.json']
    env:
      - 'FIREBASE_TOKEN=$_FIREBASE_TOKEN'

# Configuración para despliegue a producción (requiere aprobación manual)
# Este paso se ejecuta manualmente desde la consola de Cloud Build
timeout: 1800s
options:
  machineType: 'N1_HIGHCPU_8'
substitutions:
  _FIREBASE_TOKEN: ${_FIREBASE_TOKEN}
```

## Configuración de Firebase para Entornos Múltiples

Para gestionar los diferentes entornos (desarrollo, staging, producción), utilizamos archivos de configuración específicos para cada uno:

### firebase.json (Desarrollo)

```json
{
  "hosting": {
    "public": "frontend/build",
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
    ]
  },
  "firestore": {
    "rules": "backend/firestore.rules",
    "indexes": "backend/firestore.indexes.json"
  },
  "storage": {
    "rules": "backend/storage.rules"
  },
  "functions": {
    "source": "backend/functions"
  }
}
```

### firebase.staging.json

```json
{
  "hosting": {
    "target": "staging",
    "public": "frontend/build",
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
    ]
  },
  "firestore": {
    "rules": "backend/firestore.rules",
    "indexes": "backend/firestore.indexes.json"
  },
  "storage": {
    "rules": "backend/storage.rules"
  },
  "functions": {
    "source": "backend/functions"
  }
}
```

### firebase.production.json

```json
{
  "hosting": {
    "target": "production",
    "public": "frontend/build",
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
    ]
  },
  "firestore": {
    "rules": "backend/firestore.rules",
    "indexes": "backend/firestore.indexes.json"
  },
  "storage": {
    "rules": "backend/storage.rules"
  },
  "functions": {
    "source": "backend/functions"
  }
}
```

## Configuración de Targets de Firebase Hosting

Para configurar múltiples entornos en Firebase Hosting, ejecutamos los siguientes comandos:

```bash
# Configurar target de staging
firebase target:apply hosting staging artistrm-staging

# Configurar target de producción
firebase target:apply hosting production artistrm
```

## Integración con GitHub

Para integrar Cloud Build con GitHub y automatizar el proceso de CI/CD, seguimos estos pasos:

1. Conectar el repositorio de GitHub a Cloud Build
2. Configurar triggers para diferentes eventos:
   - Push a rama `develop`: Ejecuta el pipeline completo y despliega a staging
   - Pull Request a `develop`: Ejecuta validación y pruebas
   - Push a rama `main`: Ejecuta el pipeline completo y prepara despliegue a producción (requiere aprobación manual)

## Configuración de Secretos y Variables de Entorno

Los secretos y variables de entorno se gestionan a través de Secret Manager de Google Cloud:

1. Firebase Token para CI/CD
2. Credenciales de APIs externas
3. Configuraciones específicas de entorno

## Monitorización del Pipeline

La monitorización del pipeline se realiza a través de:

1. Dashboard de Cloud Build
2. Alertas configuradas para fallos en el pipeline
3. Integración con Slack para notificaciones en tiempo real

## Procedimiento de Rollback

En caso de detectar problemas después de un despliegue, el procedimiento de rollback es:

1. Identificar la última versión estable
2. Ejecutar el despliegue de esa versión específica
3. Verificar la funcionalidad después del rollback

## Mejores Prácticas Implementadas

1. **Trunk-Based Development**: Desarrollo basado en ramas cortas que se integran frecuentemente
2. **Feature Flags**: Implementación de banderas de características para habilitar/deshabilitar funcionalidades
3. **Pruebas Automatizadas**: Cobertura de pruebas para garantizar la calidad del código
4. **Despliegue Progresivo**: Despliegue gradual para minimizar el impacto de posibles problemas
5. **Monitorización Continua**: Seguimiento constante del rendimiento y errores en producción
