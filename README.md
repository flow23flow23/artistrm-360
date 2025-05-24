# ArtistRM 360 - Plataforma SaaS de Road Management Artístico

## Descripción

ArtistRM 360 es una plataforma SaaS integral diseñada para artistas y managers musicales que proporciona herramientas completas para la gestión de carrera artística, desde la planificación de proyectos hasta el análisis de rendimiento y la gestión financiera.

## Estructura del Proyecto

El proyecto sigue la arquitectura App Router de Next.js con TypeScript, organizada de la siguiente manera:

```
src/
├── app/                    # Rutas y páginas (App Router)
│   ├── (auth)/             # Grupo de rutas de autenticación
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/          # Dashboard principal
│   ├── projects/           # Gestión de proyectos
│   ├── content/            # Biblioteca de contenido
│   ├── analytics/          # Análisis y métricas
│   ├── finances/           # Gestión financiera
│   ├── events/             # Gestión de eventos
│   └── zeus/               # Asistente IA Zeus
├── components/             # Componentes React
│   ├── layout/             # Componentes de layout
│   ├── ui/                 # Componentes de UI reutilizables
│   └── [module]/           # Componentes específicos por módulo
├── context/                # Contextos de React (auth, theme)
├── hooks/                  # Custom hooks
├── lib/                    # Bibliotecas y configuraciones
│   ├── firebase/           # Configuración de Firebase
│   └── api/                # Clientes de API
├── styles/                 # Estilos globales y temas
├── types/                  # Definiciones de TypeScript
└── utils/                  # Funciones utilitarias
```

## Tecnologías Principales

- **Frontend**: Next.js, TypeScript, React
- **Backend**: Firebase (Authentication, Firestore, Storage, Functions)
- **Integración**: n8n para automatizaciones y conexión con APIs externas
- **IA**: Zeus - Asistente inteligente basado en Gemini Pro

## Características

- Dashboard interactivo con métricas y actividad reciente
- Gestión de proyectos (álbumes, sencillos, giras)
- Biblioteca de contenido multimedia
- Finanzas y reportes financieros
- Eventos y gestión de giras
- Analytics avanzados
- Asistente Zeus IA

## Desarrollo

### Requisitos

- Node.js 18.x o superior
- npm 9.x o superior
- Cuenta de Firebase

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/flow23flow23/artistrm-360.git
cd artistrm-360

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales de Firebase

# Iniciar servidor de desarrollo
npm run dev
```

### Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run start` - Inicia la aplicación construida
- `npm run test` - Ejecuta los tests
- `npm run lint` - Ejecuta el linter

## Despliegue

La aplicación está configurada para despliegue automático en Firebase Hosting mediante GitHub Actions.

```bash
# Despliegue manual
npm run build
firebase deploy
```

## Contribución

1. Crear una rama para tu característica (`git checkout -b feature/amazing-feature`)
2. Hacer commit de tus cambios (`git commit -m 'feat: add amazing feature'`)
3. Hacer push a la rama (`git push origin feature/amazing-feature`)
4. Abrir un Pull Request

## Licencia

Este proyecto es propiedad de ArtistRM y está protegido por derechos de autor.

---

Desarrollado por el equipo de ArtistRM con la asistencia de manus.im
