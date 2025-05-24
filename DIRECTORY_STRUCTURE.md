# Estructura Estandarizada de Directorios - ArtistRM 360

## Introducción

Este documento define la estructura estandarizada de directorios para el proyecto ArtistRM 360, basada en las mejores prácticas de Next.js y diseñada para resolver las inconsistencias identificadas en la auditoría previa.

## Estructura Propuesta

```
artistrm-360/
├── public/                    # Archivos estáticos accesibles públicamente
│   ├── fonts/                 # Fuentes tipográficas
│   ├── images/                # Imágenes estáticas
│   └── locales/               # Archivos de internacionalización
│
├── src/                       # Código fuente principal
│   ├── app/                   # Next.js App Router (estructura principal)
│   │   ├── (auth)/            # Grupo de rutas de autenticación
│   │   │   ├── login/         # Página de inicio de sesión
│   │   │   ├── register/      # Página de registro
│   │   │   └── reset/         # Página de restablecimiento de contraseña
│   │   │
│   │   ├── dashboard/         # Dashboard principal
│   │   │   ├── page.tsx       # Página principal del dashboard
│   │   │   └── layout.tsx     # Layout específico del dashboard
│   │   │
│   │   ├── projects/          # Gestión de proyectos
│   │   │   ├── [id]/          # Detalles de proyecto específico
│   │   │   └── page.tsx       # Lista de proyectos
│   │   │
│   │   ├── content/           # Biblioteca de contenido
│   │   ├── analytics/         # Análisis y métricas
│   │   ├── finances/          # Gestión financiera
│   │   ├── events/            # Gestión de eventos
│   │   ├── zeus/              # Asistente Zeus IA
│   │   │
│   │   ├── api/               # Rutas de API (App Router)
│   │   │   └── [endpoint]/    # Endpoints específicos
│   │   │
│   │   ├── layout.tsx         # Layout principal de la aplicación
│   │   └── page.tsx           # Página de inicio
│   │
│   ├── components/            # Componentes React reutilizables
│   │   ├── auth/              # Componentes de autenticación
│   │   ├── dashboard/         # Componentes del dashboard
│   │   ├── layout/            # Componentes de layout
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Footer.tsx
│   │   ├── projects/          # Componentes de proyectos
│   │   ├── content/           # Componentes de contenido
│   │   ├── analytics/         # Componentes de análisis
│   │   ├── finances/          # Componentes financieros
│   │   ├── events/            # Componentes de eventos
│   │   ├── zeus/              # Componentes del asistente Zeus
│   │   └── ui/                # Componentes UI genéricos
│   │       ├── Button/
│   │       │   ├── Button.tsx
│   │       │   ├── Button.module.css
│   │       │   └── Button.test.tsx
│   │       ├── Card/
│   │       ├── Modal/
│   │       └── Form/
│   │
│   ├── context/               # Contextos de React
│   │   ├── auth-context.tsx   # Contexto de autenticación
│   │   ├── theme-context.tsx  # Contexto de tema
│   │   └── app-context.tsx    # Contexto global de la aplicación
│   │
│   ├── hooks/                 # Custom hooks
│   │   ├── use-auth.ts        # Hook para autenticación
│   │   ├── use-theme.ts       # Hook para tema
│   │   └── use-api.ts         # Hook para llamadas API
│   │
│   ├── lib/                   # Bibliotecas y utilidades
│   │   ├── firebase/          # Configuración y utilidades de Firebase
│   │   │   ├── config.ts      # Configuración de Firebase
│   │   │   ├── auth.ts        # Utilidades de autenticación
│   │   │   ├── firestore.ts   # Utilidades de Firestore
│   │   │   └── storage.ts     # Utilidades de Storage
│   │   │
│   │   ├── api/               # Cliente API y utilidades
│   │   └── integrations/      # Integraciones con servicios externos
│   │
│   ├── types/                 # Definiciones de TypeScript
│   │   ├── auth.ts            # Tipos de autenticación
│   │   ├── project.ts         # Tipos de proyectos
│   │   └── api.ts             # Tipos de API
│   │
│   ├── utils/                 # Utilidades y helpers
│   │   ├── date.ts            # Utilidades de fecha
│   │   ├── format.ts          # Utilidades de formato
│   │   └── validation.ts      # Utilidades de validación
│   │
│   └── styles/                # Estilos globales
│       ├── globals.css        # Estilos globales
│       ├── variables.css      # Variables CSS
│       └── themes/            # Temas
│
├── tests/                     # Tests de integración y e2e
│   ├── integration/           # Tests de integración
│   └── e2e/                   # Tests end-to-end
│
├── .github/                   # Configuración de GitHub Actions
│   └── workflows/             # Flujos de trabajo CI/CD
│
├── scripts/                   # Scripts de utilidad
│   ├── setup.js               # Script de configuración
│   └── deploy.js              # Script de despliegue
│
├── .eslintrc.js               # Configuración de ESLint
├── .prettierrc                # Configuración de Prettier
├── jest.config.js             # Configuración de Jest
├── next.config.js             # Configuración de Next.js
├── tsconfig.json              # Configuración de TypeScript
├── package.json               # Dependencias y scripts
└── README.md                  # Documentación principal
```

## Convenciones de Nomenclatura

1. **Archivos y Directorios**:
   - Directorios: kebab-case (ej: `auth-utils/`)
   - Componentes React: PascalCase (ej: `Button.tsx`)
   - Utilidades y hooks: kebab-case (ej: `use-auth.ts`)
   - Contextos: kebab-case (ej: `auth-context.tsx`)

2. **Componentes**:
   - Un componente por archivo
   - Nombre del archivo igual al nombre del componente
   - Tests, estilos y tipos junto al componente

3. **Importaciones**:
   - Usar alias de importación para rutas absolutas:
     - `@/components/` para componentes
     - `@/lib/` para bibliotecas
     - `@/utils/` para utilidades
     - `@/context/` para contextos
     - `@/hooks/` para hooks
     - `@/styles/` para estilos
     - `@/types/` para tipos

## Configuración de Alias

En `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

En `next.config.js` (si es necesario):

```javascript
const path = require('path');

module.exports = {
  webpack: (config) => {
    config.resolve.alias['@'] = path.join(__dirname, 'src');
    return config;
  },
};
```

## Estructura de Tests

1. **Tests Unitarios**:
   - Ubicados junto al componente o función que prueban
   - Nomenclatura: `[nombre].test.tsx` o `[nombre].test.ts`

2. **Tests de Integración**:
   - Ubicados en `/tests/integration/`
   - Organizados por funcionalidad

3. **Tests End-to-End**:
   - Ubicados en `/tests/e2e/`
   - Organizados por flujo de usuario

## Plan de Migración

La migración a esta estructura estandarizada se realizará en fases:

1. **Fase 1**: Configuración de alias y estructura base
2. **Fase 2**: Migración de componentes UI y utilidades
3. **Fase 3**: Migración de contextos y hooks
4. **Fase 4**: Migración de páginas al App Router
5. **Fase 5**: Actualización de tests y documentación

Cada fase incluirá:
- Mover archivos a la nueva estructura
- Actualizar rutas de importación
- Ejecutar tests para verificar funcionalidad
- Documentar cambios y actualizaciones

## Beneficios de la Nueva Estructura

1. **Mejor Organización**: Clara separación de responsabilidades
2. **Mantenibilidad Mejorada**: Estructura consistente y predecible
3. **Escalabilidad**: Facilita la adición de nuevas funcionalidades
4. **Rendimiento Optimizado**: Aprovecha las ventajas del App Router de Next.js
5. **Desarrollo Más Rápido**: Convenciones claras reducen la curva de aprendizaje

---

*Documento preparado por el equipo de ArtistRM 360 - Mayo 2025*
