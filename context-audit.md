# Auditoría de Contextos - ArtistRM 360

## Estructura Actual

### Directorio `src/context/`
- **AuthContext.tsx** (8333 bytes)

### Directorio `frontend/src/context/`
- **AuthContext.tsx** (2660 bytes)
- **ThemeContext.tsx** (1580 bytes)
- **auth-context.tsx** (2998 bytes)
- **theme-context.tsx** (1916 bytes)
- Directorio **__tests__/** (contiene pruebas)

## Problemas Identificados

1. **Duplicidad de contextos de autenticación**:
   - Existen tres implementaciones diferentes: `src/context/AuthContext.tsx`, `frontend/src/context/AuthContext.tsx` y `frontend/src/context/auth-context.tsx`
   - La versión en `src/` es significativamente más grande (8333 bytes), lo que sugiere una implementación más completa

2. **Duplicidad de contextos de tema**:
   - Existen dos implementaciones: `frontend/src/context/ThemeContext.tsx` y `frontend/src/context/theme-context.tsx`
   - Nomenclatura inconsistente (PascalCase vs kebab-case)

3. **Inconsistencia en la ubicación**:
   - Algunos componentes probablemente importan desde `src/context/` y otros desde `frontend/src/context/`
   - Los tests están fallando porque buscan en rutas incorrectas

## Plan de Consolidación

1. **Contexto de Autenticación**:
   - Mantener la versión más completa (`src/context/AuthContext.tsx`)
   - Analizar funcionalidades únicas en las otras versiones e integrarlas si son necesarias
   - Eliminar versiones duplicadas

2. **Contexto de Tema**:
   - Mover la implementación más completa a `src/context/ThemeContext.tsx`
   - Eliminar versiones duplicadas

3. **Pruebas**:
   - Mover los tests a `src/context/__tests__/`
   - Actualizar las rutas de importación en los tests

4. **Actualización de Importaciones**:
   - Identificar todos los componentes que importan desde `frontend/src/context/`
   - Actualizar las rutas para que apunten a `src/context/`

## Próximos Pasos

1. Examinar el contenido de cada archivo para determinar la versión más completa y actualizada
2. Crear la estructura consolidada en `src/context/`
3. Actualizar todas las importaciones en el proyecto
4. Ejecutar pruebas para verificar la integración
