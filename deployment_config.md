# Configuración de Despliegue para ArtistRM

Este documento detalla la configuración y el proceso de despliegue para los entornos de staging y producción de ArtistRM.

## Arquitectura de Despliegue

La arquitectura de despliegue de ArtistRM se basa en los servicios de Google Cloud Platform (GCP) y Firebase, siguiendo un enfoque de microservicios y serverless para maximizar la escalabilidad, disponibilidad y rendimiento.

### Componentes Principales

1. **Firebase Hosting**: Alojamiento del frontend Next.js
2. **Firebase Authentication**: Gestión de usuarios y autenticación
3. **Cloud Firestore**: Base de datos NoSQL para datos operacionales
4. **Cloud Storage**: Almacenamiento de archivos multimedia
5. **Cloud Functions**: Lógica de negocio serverless
6. **BigQuery**: Almacenamiento y análisis de datos analíticos
7. **Vertex AI**: Servicios de IA para el asistente Zeus
8. **Cloud Speech-to-Text/Text-to-Speech**: Capacidades de voz para Zeus
9. **n8n**: Orquestación de flujos de trabajo e integraciones externas

## Entornos de Despliegue

### Desarrollo
- **Propósito**: Desarrollo y pruebas locales
- **URL**: http://localhost:3000
- **Proyecto Firebase**: zamx-v1 (modo desarrollo)
- **Acceso**: Restringido al equipo de desarrollo

### Staging
- **Propósito**: Pruebas de integración, validación de características
- **URL**: https://staging.artistrm.com
- **Proyecto Firebase**: zamx-v1 (target: staging)
- **Acceso**: Equipo de desarrollo y stakeholders clave

### Producción
- **Propósito**: Entorno de usuario final
- **URL**: https://artistrm.com
- **Proyecto Firebase**: zamx-v1 (target: production)
- **Acceso**: Público (con autenticación)

## Proceso de Despliegue

### Despliegue a Staging

El despliegue a staging se realiza automáticamente a través del pipeline de CI/CD cuando se fusiona código en la rama `develop`:

1. Se ejecutan todas las pruebas automatizadas
2. Se construye la aplicación frontend y backend
3. Se despliega a Firebase Hosting (target: staging)
4. Se despliegan las Cloud Functions
5. Se actualizan las reglas de Firestore y Storage

```bash
# Comando manual para despliegue a staging (si es necesario)
firebase deploy --only hosting:staging,functions,firestore:rules,storage:rules --project zamx-v1
```

### Despliegue a Producción

El despliegue a producción requiere aprobación manual después de que el código se fusione en la rama `main`:

1. Se ejecutan todas las pruebas automatizadas
2. Se construye la aplicación frontend y backend
3. Se prepara el despliegue (pendiente de aprobación)
4. Un administrador revisa y aprueba el despliegue
5. Se despliega a Firebase Hosting (target: production)
6. Se despliegan las Cloud Functions
7. Se actualizan las reglas de Firestore y Storage

```bash
# Comando manual para despliegue a producción (si es necesario)
firebase deploy --only hosting:production,functions,firestore:rules,storage:rules --project zamx-v1
```

## Configuración de Dominios Personalizados

Para configurar los dominios personalizados en Firebase Hosting:

```bash
# Configurar dominio para staging
firebase hosting:channel:deploy staging --project zamx-v1

# Configurar dominio para producción
firebase hosting:channel:deploy production --project zamx-v1
```

Después, se deben configurar los registros DNS según las instrucciones proporcionadas por Firebase.

## Estrategia de Despliegue Progresivo

Para minimizar el impacto de posibles problemas, implementamos una estrategia de despliegue progresivo:

1. **Canary Release**: Despliegue inicial al 10% de los usuarios
2. **Monitorización**: Seguimiento de métricas clave durante 1 hora
3. **Rollout Gradual**: Incremento gradual al 25%, 50% y 100% si no se detectan problemas
4. **Rollback Automático**: En caso de detectar anomalías, se revierte automáticamente al despliegue anterior

## Configuración de Variables de Entorno

Las variables de entorno específicas para cada entorno se gestionan a través de Firebase Functions Config:

```bash
# Configurar variables para desarrollo
firebase functions:config:set spotify.client_id="xxx" spotify.client_secret="xxx" --project zamx-v1

# Configurar variables para staging
firebase functions:config:set spotify.client_id="xxx" spotify.client_secret="xxx" --project zamx-v1 --config firebase.staging.json

# Configurar variables para producción
firebase functions:config:set spotify.client_id="xxx" spotify.client_secret="xxx" --project zamx-v1 --config firebase.production.json
```

## Monitorización Post-Despliegue

Después de cada despliegue, se monitoriza:

1. **Errores de aplicación**: A través de Firebase Crashlytics y Error Reporting
2. **Rendimiento**: Latencia, tiempos de respuesta y uso de recursos
3. **Uso de API**: Tasas de éxito y error en llamadas a APIs externas
4. **Métricas de negocio**: Registros, inicios de sesión, conversiones

## Procedimiento de Rollback

En caso de problemas críticos, el procedimiento de rollback es:

```bash
# Identificar la última versión estable
firebase hosting:clone zamx-v1:production zamx-v1:production-backup

# Revertir a una versión específica
firebase hosting:clone zamx-v1:production-backup zamx-v1:production

# Revertir funciones a la versión anterior
firebase functions:rollback --project zamx-v1
```

## Automatización de Tareas de Mantenimiento

Se han configurado las siguientes tareas automatizadas:

1. **Backup diario de Firestore**: Programado a las 3:00 AM UTC
2. **Limpieza de archivos temporales**: Cada 7 días
3. **Rotación de logs**: Retención de 30 días para logs no críticos
4. **Verificación de integridad**: Pruebas de salud automatizadas cada 15 minutos

## Documentación de Despliegue

Cada despliegue genera automáticamente:

1. **Registro de cambios**: Lista de commits incluidos
2. **Informe de pruebas**: Resultados de todas las pruebas ejecutadas
3. **Métricas de construcción**: Tiempos, tamaños y optimizaciones
4. **Registro de aprobaciones**: Quién aprobó el despliegue a producción

Esta documentación se almacena en Cloud Storage y es accesible a través del panel de administración.
