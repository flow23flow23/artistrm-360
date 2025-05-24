# ArtistRM 360 - Plataforma SaaS para Gestión de Carreras Artísticas

![ArtistRM 360](https://img.shields.io/badge/ArtistRM-360-blue)
![Version](https://img.shields.io/badge/version-1.0.0-green)
![Status](https://img.shields.io/badge/status-beta-orange)

ArtistRM 360 es una plataforma SaaS integral diseñada para artistas y managers en la industria musical, centralizando todas las herramientas necesarias para gestionar carreras artísticas de manera eficiente y profesional.

## 🌟 Características Principales

- **Dashboard Interactivo**: Métricas clave y actividad reciente
- **Gestión de Proyectos**: Álbumes, sencillos, colaboraciones y giras
- **Biblioteca de Contenido**: Organización y gestión de assets multimedia
- **Finanzas**: Seguimiento de ingresos, gastos y proyecciones
- **Analytics**: Análisis de rendimiento en plataformas y redes sociales
- **Eventos**: Planificación y gestión de giras y presentaciones
- **Zeus IA**: Asistente virtual para automatización y análisis predictivo
- **Integraciones**: Conexión con plataformas de streaming, redes sociales y servicios de distribución

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **Backend**: Firebase (Authentication, Firestore, Storage, Functions)
- **State Management**: Zustand, React Query
- **UI Components**: Custom components with Framer Motion animations
- **Charts**: Chart.js with React Chart.js 2
- **AI**: Google Gemini Pro (for Zeus AI)
- **Integraciones**: n8n para automatización de flujos de trabajo

## 📋 Requisitos Previos

- Node.js 18+ y npm 9+
- Firebase CLI (`npm install -g firebase-tools`)
- Git
- Un proyecto Firebase (crear uno en [Firebase Console](https://console.firebase.google.com))

## 🚀 Primeros Pasos

### 1. Clonar el repositorio

```bash
git clone https://github.com/flow23flow23/artistrm-360.git
cd artistrm-360
```

### 2. Instalar dependencias

```bash
# Instalar dependencias del frontend
npm install
# Instalar dependencias de Cloud Functions
cd functions
npm install
cd ..
```

### 3. Configurar variables de entorno

Copia el archivo de entorno de ejemplo y completa con tus credenciales de Firebase y APIs:

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus valores:

```env
# Configuración de Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
# Desarrollo
NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true
# APIs Externas
GEMINI_API_KEY=your_gemini_api_key
SPOTIFY_CLIENT_ID=your_spotify_client_id
# ... etc
```

### 4. Configuración de Firebase

Inicia sesión en Firebase y selecciona tu proyecto:

```bash
firebase login
firebase use --add
```

Inicializa los servicios de Firebase (si no lo has hecho ya):

```bash
firebase init
```

### 5. Iniciar servidores de desarrollo

```bash
# Iniciar Next.js y emuladores de Firebase
npm run dev:all
# O iniciarlos por separado:
# Terminal 1: Iniciar emuladores de Firebase
npm run firebase:emulators
# Terminal 2: Iniciar servidor de desarrollo Next.js
npm run dev
```

La aplicación estará disponible en:
- Frontend: http://localhost:3000
- UI de Emuladores Firebase: http://localhost:4000

## 📁 Estructura del Proyecto

```
artistrm-360/
├── src/
│   ├── app/              # Páginas con Next.js app router
│   ├── components/       # Componentes React
│   ├── context/          # Contextos React (auth, theme)
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Bibliotecas y utilidades
│   ├── services/         # Servicios API y Firebase
│   ├── styles/           # Estilos globales y Tailwind
│   ├── types/            # Definiciones de tipos TypeScript
│   └── utils/            # Funciones auxiliares
├── frontend/            # Componentes y lógica específica del frontend
├── backend/             # Servicios y lógica de backend
├── functions/           # Firebase Cloud Functions
├── firebase-deploy/     # Configuración para despliegue en Firebase
├── public/              # Assets estáticos
├── firebase.json        # Configuración de Firebase
├── firestore.rules      # Reglas de seguridad de Firestore
├── storage.rules        # Reglas de seguridad de Storage
└── package.json         # Dependencias del proyecto
```

## 🔧 Desarrollo

### Ejecutar pruebas

```bash
# Ejecutar pruebas unitarias
npm test
# Ejecutar pruebas en modo watch
npm run test:watch
# Generar informe de cobertura
npm run test:coverage
```

### Linting y formateo

```bash
# Ejecutar ESLint
npm run lint
# Formatear código con Prettier
npm run format
# Verificación de tipos
npm run type-check
```

### Compilar para producción

```bash
# Compilar la aplicación
npm run build
# Iniciar servidor de producción localmente
npm run start
```

## 🚀 Despliegue

### Desplegar en Firebase Hosting

```bash
# Compilar y desplegar todo
firebase deploy
# Desplegar solo hosting
firebase deploy --only hosting
# Desplegar solo functions
firebase deploy --only functions
# Desplegar solo reglas
firebase deploy --only firestore:rules,storage:rules
```

## 🔐 Seguridad

- Todas las rutas API están protegidas con Firebase Authentication
- Firestore y Storage tienen reglas de seguridad configuradas
- Se utilizan variables de entorno para datos sensibles
- CORS está configurado adecuadamente
- Validación de entrada en todos los formularios

## 📚 Estado de Implementación de Características

- ✅ Autenticación (Email/Password, Google)
- ✅ Dashboard con estadísticas
- ✅ UI básica de gestión de proyectos
- ✅ UI de biblioteca de contenido
- ⚠️ Gestión financiera (solo UI)
- ⚠️ Calendario de eventos (solo UI)
- ⚠️ Dashboard de analytics (datos de prueba)
- 🚧 Asistente Zeus IA (planificado)
- 🚧 Integraciones externas (planificado)
- 🚧 Colaboración en equipo (planificado)

Leyenda: ✅ Completo | ⚠️ Parcial | 🚧 En Progreso | ❌ No Iniciado

## 🤝 Contribuir

1. Haz un fork del repositorio
2. Crea tu rama de características (`git checkout -b feature/caracteristica-increible`)
3. Haz commit de tus cambios (`git commit -m 'Añadir alguna característica increíble'`)
4. Haz push a la rama (`git push origin feature/caracteristica-increible`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto es software propietario. Todos los derechos reservados.

## 🆘 Soporte

Para soporte, envía un email a support@artistrm360.com o únete a nuestro canal de Slack.

## 🙏 Agradecimientos

- Equipo de Firebase por la excelente infraestructura backend
- Equipo de Next.js por el increíble framework React
- Tailwind CSS por el framework CSS utility-first
- Todos nuestros beta testers y early adopters

---

Construido con ❤️ por el Equipo ArtistRM
