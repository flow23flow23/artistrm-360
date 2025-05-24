# Auditoría de Estructura de Directorios - ArtistRM 360

## Resumen Ejecutivo

Esta auditoría documenta las inconsistencias encontradas en la estructura de directorios del proyecto ArtistRM 360, con el objetivo de establecer una base para la estandarización según las mejores prácticas de Next.js.

## Inconsistencias Principales

### 1. Duplicidad de Estructuras

Existen dos estructuras paralelas que generan confusión y dificultan el mantenimiento:

- **Estructura Legacy**: 
  - `frontend/components/`
  - `frontend/pages/`
  - `frontend/contexts/`
  - `frontend/hooks/`

- **Estructura Moderna**: 
  - `src/components/`
  - `src/app/` (Next.js App Router)
  - `src/context/`
  - `src/lib/`

### 2. Inconsistencias en Nomenclatura

- Uso inconsistente de singular vs plural:
  - `src/context/` vs `frontend/contexts/`
  - `src/utils/` vs `frontend/utils/`

- Inconsistencia en el caso (camelCase vs kebab-case):
  - Algunos archivos usan `AuthContext.tsx`
  - Otros usan `auth-context.tsx`

### 3. Duplicidad de Contextos

- Contextos duplicados en múltiples ubicaciones:
  - `src/context/AuthContext.tsx`
  - `frontend/src/context/AuthContext.tsx`
  - `frontend/contexts/AuthContext.js`

### 4. Estructura Híbrida de Enrutamiento

- Coexistencia de dos sistemas de enrutamiento:
  - Pages Router (`frontend/pages/`)
  - App Router (`src/app/`)

### 5. Problemas en Rutas de Importación

- Uso inconsistente de alias de importación:
  - Algunos archivos usan `@/components/`
  - Otros usan rutas relativas `../../components/`
  - Algunos tests no pueden encontrar módulos debido a rutas incorrectas

### 6. Estructura de Tests Fragmentada

- Tests ubicados en múltiples lugares:
  - `src/context/__tests__/`
  - `src/utils/__tests__/`
  - `frontend/components/Zeus/__tests__/`
  - `frontend/pages/__tests__/`
  - `frontend/pages/integrations/__tests__/`

## Impacto en el Desarrollo

1. **Dificultad de Mantenimiento**: La duplicidad y las inconsistencias hacen que sea difícil mantener y actualizar el código.
2. **Fallos en Tests**: Las rutas de importación incorrectas causan fallos en los tests.
3. **Curva de Aprendizaje Elevada**: Los nuevos desarrolladores deben aprender múltiples convenciones.
4. **Riesgo de Regresiones**: Cambios en una parte del código pueden afectar inesperadamente a otras partes.

## Recomendaciones para la Estandarización

1. **Adoptar App Router de Next.js**: Migrar completamente al App Router (`src/app/`) siguiendo las recomendaciones oficiales de Next.js.
2. **Unificar Contextos**: Consolidar todos los contextos en `src/context/`.
3. **Estandarizar Nomenclatura**: Adoptar una convención consistente (kebab-case para archivos, PascalCase para componentes).
4. **Centralizar Tests**: Ubicar los tests junto a los componentes que prueban.
5. **Implementar Alias de Importación**: Configurar y utilizar consistentemente alias de importación.

## Próximos Pasos

1. Diseñar una estructura estandarizada basada en las mejores prácticas de Next.js
2. Crear un plan de migración gradual para minimizar el impacto
3. Actualizar la configuración de Jest para reflejar la nueva estructura
4. Documentar la nueva estructura para el equipo

---

*Documento preparado por el equipo de ArtistRM 360 - Mayo 2025*
