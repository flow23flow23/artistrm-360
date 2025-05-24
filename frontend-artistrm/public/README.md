# ArtistRM 360 - Plataforma de Gestión para Artistas

## Descripción General

ArtistRM 360 es una plataforma SaaS completa diseñada para la gestión integral de artistas musicales. Permite administrar proyectos, contenido multimedia, analíticas de rendimiento e integraciones con plataformas de streaming y redes sociales, todo potenciado por Zeus IA, un asistente inteligente que proporciona análisis predictivo y recomendaciones personalizadas.

## Características Principales

- **Dashboard Interactivo**: Visualización de estadísticas clave y actividad reciente
- **Gestión de Proyectos**: Seguimiento de álbumes, giras y colaboraciones
- **Biblioteca de Contenido**: Organización de archivos de audio, video e imágenes
- **Analíticas Avanzadas**: Métricas de rendimiento en diferentes plataformas
- **Integraciones**: Conexión con plataformas de streaming y redes sociales
- **Zeus IA**: Asistente inteligente con capacidades de análisis predictivo y procesamiento OCR

## Estructura del Proyecto

```
frontend-artistrm/
├── public/               # Archivos para despliegue en Firebase Hosting
│   ├── images/           # Imágenes y recursos visuales
│   ├── index.html        # Página principal de la aplicación
│   ├── styles.css        # Estilos CSS de la aplicación
│   ├── app.js            # Lógica JavaScript y conexión con Firebase
│   └── firebase.json     # Configuración para despliegue en Firebase
├── firebase-deploy/      # Configuración para despliegue completo
│   ├── functions/        # Cloud Functions para backend
│   ├── firestore.rules   # Reglas de seguridad para Firestore
│   ├── storage.rules     # Reglas de seguridad para Storage
│   └── firebase.json     # Configuración principal de Firebase
```

## Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Firebase (Firestore, Storage, Authentication, Cloud Functions)
- **Integraciones**: APIs de Spotify, YouTube, Apple Music, TikTok, Instagram
- **IA y Análisis**: Manus.im para indexación, Gemini para análisis predictivo

## Instrucciones de Despliegue

### Requisitos Previos

- Cuenta de Firebase
- Firebase CLI instalada (`npm install -g firebase-tools`)
- Node.js y npm

### Pasos para el Despliegue

1. **Autenticación en Firebase**:
   ```
   firebase login
   ```

2. **Seleccionar el Proyecto**:
   ```
   firebase use zamx-v1
   ```

3. **Desplegar en Firebase Hosting**:
   ```
   cd frontend-artistrm/public
   firebase deploy --only hosting
   ```

4. **Despliegue Completo (opcional)**:
   ```
   cd firebase-deploy
   firebase deploy
   ```

## Integración con Firebase

La plataforma utiliza los siguientes servicios de Firebase:

- **Authentication**: Para gestión de usuarios y roles
- **Firestore**: Base de datos para proyectos, contenido y analíticas
- **Storage**: Almacenamiento de archivos multimedia
- **Cloud Functions**: Procesamiento backend y APIs

La configuración de Firebase se encuentra en el archivo `app.js` y está lista para conectarse al proyecto `zamx-v1`.

## Personalización

Para personalizar la plataforma:

1. **Tema Visual**: Modifica las variables CSS en `styles.css`
2. **Configuración de Firebase**: Actualiza las credenciales en `app.js`
3. **Integraciones**: Configura las APIs de terceros en la sección correspondiente

## Soporte y Contacto

Para soporte técnico o consultas sobre la plataforma, contacta a:
- Email: soporte@artistrm.com
- Web: https://artistrm.com/soporte

---

© 2025 ArtistRM 360. Todos los derechos reservados.
