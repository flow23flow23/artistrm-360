# ArtistRM 360 - Plataforma Integral para Gestión de Artistas

ArtistRM 360 es una plataforma SaaS completa diseñada para artistas y managers musicales que permite gestionar todos los aspectos de una carrera musical, desde proyectos y contenido hasta finanzas, eventos, analytics y más.

## Características Principales

- **Dashboard Integral**: Visualización centralizada de métricas clave y actividad reciente
- **Gestión de Proyectos**: Administración de álbumes, sencillos, giras y colaboraciones
- **Biblioteca de Contenido**: Organización de archivos multimedia, imágenes, audio y video
- **Finanzas**: Control de ingresos, gastos y reportes financieros
- **Eventos y Giras**: Planificación y seguimiento de conciertos, apariciones y promociones
- **Analytics**: Análisis detallado del rendimiento en plataformas digitales
- **Zeus IA**: Asistente inteligente para gestión musical y toma de decisiones
- **CRM de Fans**: Gestión de relaciones con seguidores y audiencia
- **Automatizaciones**: Flujos de trabajo automatizados para tareas repetitivas
- **Diseño Responsivo**: Experiencia optimizada para dispositivos móviles y desktop

## Tecnologías Utilizadas

- HTML5, CSS3 y JavaScript moderno
- Firebase (Autenticación, Firestore, Storage, Hosting)
- Integración con APIs de plataformas musicales
- Diseño responsivo y adaptable a todos los dispositivos

## Instalación y Despliegue

1. Clona este repositorio o descarga el ZIP
2. Configura tu proyecto en Firebase (https://console.firebase.google.com/)
3. Actualiza la configuración de Firebase en `scripts/firebase-config.js`
4. Despliega en Firebase Hosting con el comando:

```
firebase deploy --only hosting
```

## Estructura del Proyecto

- `index.html`: Punto de entrada principal
- `styles/`: Hojas de estilo CSS
  - `main.css`: Estilos principales y variables
  - `components.css`: Componentes reutilizables
- `scripts/`: Archivos JavaScript
  - `app.js`: Lógica principal de la aplicación
  - `auth.js`: Gestión de autenticación
  - `firebase-config.js`: Configuración de Firebase
- `sections/`: Contenido HTML de cada sección
- `assets/`: Recursos como imágenes y fuentes
- `firebase.json`: Configuración para despliegue en Firebase Hosting

## Personalización

Puedes personalizar la plataforma modificando:

- Variables de color en `styles/main.css`
- Configuración de Firebase en `scripts/firebase-config.js`
- Módulos y secciones en la carpeta `sections/`

## Soporte

Para soporte técnico o consultas, contacta a:
- Email: soporte@artistrm360.com
- Web: https://artistrm360.com/soporte

## Licencia

© 2025 ArtistRM 360. Todos los derechos reservados.
