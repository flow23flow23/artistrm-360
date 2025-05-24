# Registro de Migración - ArtistRM 360

## Estructura de Directorios Creada

### App Router (Next.js)
- src/app/dashboard
- src/app/projects
- src/app/content
- src/app/analytics
- src/app/finances
- src/app/events
- src/app/zeus
- src/app/(auth)/login
- src/app/(auth)/register
- src/app/(auth)/reset
- src/app/api

### Componentes
- src/components/auth
- src/components/dashboard
- src/components/layout
- src/components/projects
- src/components/content
- src/components/analytics
- src/components/finances
- src/components/events
- src/components/zeus
- src/components/ui/Button
- src/components/ui/Card
- src/components/ui/Modal
- src/components/ui/Form

### Bibliotecas y Utilidades
- src/lib/firebase
- src/lib/api
- src/lib/integrations
- src/hooks
- src/types
- src/utils
- src/styles/themes
- tests/integration
- tests/e2e

## Archivos Migrados

### Contextos
- `src/context/AuthContext.tsx` → `src/context/auth-context.tsx` (renombrado según convención kebab-case)
- `src/context/ThemeContext.tsx` → `src/context/theme-context.tsx` (renombrado según convención kebab-case)

### Configuración
- `src/firebase/config.js` → `src/lib/firebase/config.ts` (movido a lib y convertido a TypeScript)

### Componentes
- `frontend/components/Layout.tsx` → `src/components/layout/Layout.tsx` (movido a carpeta layout)
- `frontend/components/Zeus/ZeusAssistant.tsx` → `src/components/zeus/ZeusAssistant.tsx` (movido a carpeta zeus)

### Tests
- `frontend/components/Zeus/__tests__/ZeusAssistant.test.tsx` → `src/components/zeus/__tests__/ZeusAssistant.test.tsx` (movido junto al componente)

### Páginas
- `frontend/pages/_app.tsx` → `src/app/layout.tsx` (convertido a layout de App Router)
- `frontend/pages/analytics/index.tsx` → `src/app/analytics/page.tsx` (convertido a formato App Router)
- `frontend/pages/content/index.tsx` → `src/app/content/page.tsx` (convertido a formato App Router)
- `frontend/pages/artists/index.tsx` → `src/app/projects/page.tsx` (renombrado y convertido a formato App Router)
- `frontend/pages/dashboard.tsx` → `src/app/dashboard/page.tsx` (convertido a formato App Router)
- `frontend/pages/login.tsx` → `src/app/(auth)/login/page.tsx` (movido a grupo de autenticación)
- `frontend/pages/register.tsx` → `src/app/(auth)/register/page.tsx` (movido a grupo de autenticación)
- `frontend/pages/zeus/index.tsx` → `src/app/zeus/page.tsx` (convertido a formato App Router)
- `frontend/pages/integrations/index.tsx` → `src/app/api/page.tsx` (renombrado y convertido a formato App Router)

## Próximos Pasos

1. Continuar migración de componentes restantes
2. Migrar páginas del frontend a la estructura de App Router
3. Actualizar rutas de importación en todos los archivos
4. Ejecutar tests para verificar la integridad funcional

## Notas

- La migración se está realizando de forma gradual para minimizar riesgos
- Se está priorizando la consistencia en nomenclatura (kebab-case para archivos)
- Los tests se mantienen junto a los componentes que prueban
- La estructura sigue las mejores prácticas de Next.js App Router
- Se está realizando una normalización de nombres (artists → projects, integrations → api) según la estructura estandarizada

---

*Documento actualizado: 24 de mayo de 2025*
