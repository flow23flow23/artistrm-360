# Documentación Técnica - ArtistRM 360

## Visión General

ArtistRM 360 es una plataforma SaaS completa diseñada para artistas musicales que buscan gestionar todos los aspectos de su carrera desde un único lugar. La plataforma integra gestión de proyectos, biblioteca de contenido, análisis de datos, gestión financiera y un asistente inteligente (Zeus IA) para proporcionar una solución integral de road management artístico.

## Arquitectura Técnica

### Stack Tecnológico

- **Frontend**: Next.js 14 con App Router, React, TypeScript
- **Backend/PaaS**: Firebase (Authentication, Firestore, Storage, Cloud Functions, Hosting)
- **IA/ML**: Vertex AI (Gemini) para el asistente Zeus
- **Análisis de Datos**: BigQuery, Data Studio
- **Automatización**: n8n para integraciones con APIs externas
- **Despliegue**: Firebase Hosting, GitHub Actions para CI/CD

### Estructura de Directorios

La aplicación sigue la estructura moderna de Next.js con App Router:

```
/src
  /app                  # Rutas y páginas de la aplicación
    /dashboard          # Dashboard principal
    /projects           # Gestión de proyectos
    /content            # Biblioteca de contenido
    /analytics          # Análisis y métricas
    /zeus              # Interfaz de Zeus IA
    layout.jsx         # Layout principal de la aplicación
  /components           # Componentes reutilizables
    /layout            # Componentes de layout (Sidebar, Header, etc.)
    /dashboard         # Componentes específicos del dashboard
    /projects          # Componentes de gestión de proyectos
    /content           # Componentes de biblioteca de contenido
    /analytics         # Componentes de análisis
    /zeus              # Componentes de Zeus IA
  /context              # Contextos de React (Auth, Theme)
  /lib                  # Utilidades y configuraciones
    /firebase          # Configuración e integración con Firebase
    /zeus              # Lógica de procesamiento para Zeus IA
  /test-utils           # Utilidades para testing
```

## Módulos Principales

### Autenticación y Gestión de Usuarios

La autenticación se implementa mediante Firebase Authentication, con un contexto de React (`AuthContext`) que proporciona funciones para:

- Inicio de sesión con email/contraseña
- Registro de nuevos usuarios
- Cierre de sesión
- Restablecimiento de contraseña
- Gestión de perfil de usuario

Los datos adicionales del usuario se almacenan en Firestore para mantener información como preferencias, configuraciones y metadatos.

### Sistema de Temas

La plataforma implementa un sistema de temas claro/oscuro mediante un contexto de React (`ThemeContext`), con preferencia por el tema oscuro como predeterminado. El sistema:

- Persiste la preferencia del usuario en localStorage
- Aplica clases CSS dinámicamente
- Proporciona un toggle accesible para cambiar entre temas
- Se integra con Tailwind CSS para estilos consistentes

### Dashboard

El dashboard principal proporciona una visión general del estado del artista, incluyendo:

- Tarjetas de estadísticas clave (streams, oyentes, seguidores, ingresos)
- Gráficos de rendimiento en plataformas de streaming
- Actividad reciente
- Próximos eventos
- Estado de proyectos en curso

Los datos se obtienen de Firestore y se actualizan en tiempo real.

### Gestión de Proyectos

El módulo de proyectos permite a los artistas gestionar diferentes tipos de proyectos:

- Álbumes
- Singles
- Videoclips
- Giras
- Merchandising
- Colaboraciones

Cada proyecto incluye:
- Información básica (título, descripción, fechas)
- Progreso y estado
- Colaboradores
- Tareas y subtareas
- Archivos asociados

### Biblioteca de Contenido

La biblioteca de contenido centraliza todos los archivos multimedia del artista:

- Audio (masters, demos, stems)
- Video (videoclips, ensayos, entrevistas)
- Imágenes (fotos promocionales, artwork)
- Documentos (contratos, riders técnicos)

Características principales:
- Filtrado por tipo, etiquetas, proyecto
- Búsqueda avanzada
- Vista de calendario para planificación
- Gestión de distribución a plataformas

### Analytics

El módulo de analytics proporciona análisis detallados del rendimiento del artista:

- Métricas de streaming por plataforma
- Análisis de redes sociales
- Demografía de audiencia
- Análisis de ingresos
- Comparativas y tendencias

Los datos se visualizan mediante gráficos interactivos y se pueden exportar en diferentes formatos.

### Zeus IA

Zeus IA es un asistente inteligente basado en Gemini que proporciona:

- Procesamiento de lenguaje natural para consultas en español
- Análisis de datos del artista para respuestas personalizadas
- Generación de informes y recomendaciones
- Visualizaciones contextuales según la consulta

La arquitectura de Zeus incluye:
- Conectores de datos para acceder a Firestore
- Procesamiento de datos para extraer insights
- Sistema de contextualización para personalizar respuestas
- Clasificación de intenciones
- Memoria de conversación
- Sistema de caché para respuestas frecuentes

## Integración con Servicios Externos

### Firebase

La plataforma utiliza múltiples servicios de Firebase:

- **Authentication**: Para gestión de usuarios y sesiones
- **Firestore**: Como base de datos principal para almacenar datos estructurados
- **Storage**: Para almacenar archivos multimedia
- **Cloud Functions**: Para lógica de backend serverless
- **Hosting**: Para despliegue de la aplicación

### Vertex AI (Gemini)

Zeus IA se integra con Vertex AI para:
- Procesamiento de lenguaje natural
- Generación de respuestas contextualizadas
- Análisis de sentimiento
- Clasificación de consultas

### n8n

La plataforma utiliza n8n para automatizar integraciones con:
- Plataformas de streaming (Spotify, Apple Music)
- Redes sociales (Instagram, TikTok, YouTube)
- Servicios de distribución digital
- Herramientas de email marketing

## Consideraciones de Seguridad

- Autenticación segura mediante Firebase Auth
- Reglas de seguridad en Firestore y Storage
- Validación de datos en cliente y servidor
- Protección contra inyección de código
- Encriptación de datos sensibles
- Monitoreo activo de patrones anómalos

## Optimizaciones de Rendimiento

- Lazy loading y code splitting para reducir el tamaño del bundle inicial
- Memoización con useMemo, useCallback y React.memo
- Optimización de efectos secundarios
- Sistema de caché para respuestas frecuentes de Zeus IA
- Consultas optimizadas a Firestore con índices adecuados

## Pruebas

La plataforma implementa diferentes niveles de pruebas:

- **Pruebas unitarias**: Para componentes y funciones individuales
- **Pruebas de integración**: Para flujos completos
- **Pruebas de rendimiento**: Para optimizaciones
- **Pruebas de seguridad**: Para validar protecciones

## Despliegue

El proceso de despliegue utiliza:

- GitHub Actions para CI/CD
- Firebase Hosting para la aplicación web
- Firebase Functions para el backend serverless

## Próximos Pasos y Mejoras Futuras

- Implementación de módulos adicionales (Finanzas, Fans, Contratos)
- Mejora de las capacidades de Zeus IA con datos históricos más completos
- Integración con más plataformas y servicios externos
- Implementación de aplicaciones móviles nativas
- Expansión de capacidades analíticas con modelos predictivos
