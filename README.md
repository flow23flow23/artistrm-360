# ArtistRM 360 - Plataforma Integral para Gestión de Artistas

![ArtistRM 360 Logo](assets/images/logo.png)

## Descripción

ArtistRM 360 es una plataforma SaaS (Software as a Service) integral diseñada específicamente para la gestión completa de artistas musicales. Centraliza todas las operaciones críticas del negocio musical en una única interfaz intuitiva y potente, permitiendo a los artistas y sus equipos gestionar proyectos, contenido, finanzas, eventos, contratos y relaciones con fans desde cualquier dispositivo.

## Características Principales

- **Dashboard Interactivo**: Visualización de métricas clave, actividad reciente y próximos eventos
- **Gestión de Proyectos**: Administración de álbumes, sencillos, colaboraciones y lanzamientos
- **Biblioteca de Contenido**: Organización centralizada de audio, video, imágenes y documentos
- **Analytics Avanzados**: Análisis detallado de rendimiento en plataformas digitales y redes sociales
- **Gestión Financiera**: Seguimiento de ingresos, gastos, proyecciones y reportes financieros
- **Planificación de Eventos**: Organización de giras, conciertos y apariciones mediáticas
- **Gestión de Contratos**: Seguimiento y administración de acuerdos legales y licencias
- **CRM de Fans**: Gestión de relaciones con seguidores y campañas de engagement
- **Asistente Zeus IA**: Asistente virtual inteligente para automatización y análisis predictivo

## Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript moderno
- **Backend**: Firebase (Authentication, Firestore, Storage, Functions)
- **Integraciones**: APIs de Spotify, YouTube, Instagram, TikTok, y más
- **Inteligencia Artificial**: Zeus IA para asistencia y automatización
- **Análisis de Datos**: Visualizaciones avanzadas y reportes personalizados

## Estructura del Proyecto

```
artistrm-360/
├── assets/             # Recursos multimedia
│   ├── images/         # Imágenes e iconos
│   └── fonts/          # Tipografías
├── css/                # Estilos
│   ├── main.css        # Estilos principales
│   └── responsive.css  # Estilos responsivos
├── js/                 # Scripts
│   ├── app.js          # Lógica principal
│   └── validation.js   # Validación y experiencia de usuario
├── pages/              # Módulos HTML
│   ├── dashboard.html  # Dashboard principal
│   ├── projects.html   # Gestión de proyectos
│   ├── content.html    # Biblioteca de contenido
│   └── ...             # Otros módulos
├── index.html          # Punto de entrada principal
└── README.md           # Documentación
```

## Instalación y Despliegue

### Requisitos Previos

- Cuenta en Firebase
- Node.js y npm (para desarrollo)
- Firebase CLI (para despliegue)

### Configuración Local

1. Clonar el repositorio:
   ```
   git clone https://github.com/yourusername/artistrm-360.git
   cd artistrm-360
   ```

2. Configurar Firebase:
   - Crear un proyecto en Firebase Console
   - Actualizar la configuración en `js/firebase-config.js`
   - Habilitar Authentication, Firestore y Storage

3. Desplegar en Firebase:
   ```
   firebase login
   firebase init
   firebase deploy
   ```

## Uso

La plataforma está diseñada para ser intuitiva y fácil de usar. Después de iniciar sesión, los usuarios son dirigidos al Dashboard principal donde pueden acceder a todos los módulos desde la barra lateral de navegación.

El asistente Zeus IA está disponible en todo momento a través del botón flotante, proporcionando ayuda contextual y automatización de tareas.

## Contribución

Las contribuciones son bienvenidas. Para contribuir:

1. Haz un Fork del proyecto
2. Crea una rama para tu característica (`git checkout -b feature/amazing-feature`)
3. Haz commit de tus cambios (`git commit -m 'Add some amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo LICENSE para más detalles.

## Contacto

Para más información, contactar a:
- Email: info@artistrm.com
- Web: https://artistrm.com

---

Desarrollado con ❤️ para artistas por el equipo de ArtistRM 360
