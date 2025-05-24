# Documentación de Refactorización de Contextos - ArtistRM 360

## Resumen de Cambios

Se ha realizado una refactorización completa de los contextos de la aplicación para eliminar duplicidades y mejorar la mantenibilidad del código. Los principales cambios incluyen:

1. **Consolidación de Contextos**: Todos los contextos ahora se encuentran unificados en el directorio `src/context/`
2. **Eliminación de Duplicidad**: Se han eliminado implementaciones duplicadas de los contextos de autenticación y tema
3. **Mejora de Funcionalidad**: Se ha integrado la funcionalidad más completa de cada implementación en una versión unificada
4. **Actualización de Tests**: Los tests han sido migrados y actualizados para apuntar a la nueva ubicación

## Estructura Anterior vs. Nueva

### Estructura Anterior
```
├── src/
│   ├── context/
│   │   └── AuthContext.tsx
└── frontend/
    └── src/
        └── context/
            ├── AuthContext.tsx
            ├── ThemeContext.tsx
            ├── auth-context.tsx
            ├── theme-context.tsx
            └── __tests__/
                ├── auth-context.test.tsx
                └── theme-context.test.tsx
```

### Estructura Nueva
```
└── src/
    └── context/
        ├── AuthContext.tsx
        ├── ThemeContext.tsx
        ├── __tests__/
        │   ├── auth-context.test.tsx
        │   └── theme-context.test.tsx
        └── test-utils/
            └── matchMedia.mock.ts
```

## Detalles Técnicos

### Contexto de Autenticación (`AuthContext.tsx`)
- Se ha mantenido la implementación más completa que incluye:
  - Integración con Firestore para almacenamiento de perfiles de usuario
  - Gestión de errores detallada
  - Soporte para múltiples proveedores de autenticación (Email/Password, Google)
  - Funcionalidades avanzadas como actualización de perfil y restablecimiento de contraseña

### Contexto de Tema (`ThemeContext.tsx`)
- Se ha creado una implementación unificada que combina las mejores características de ambas versiones:
  - Soporte para temas light, dark y system
  - Detección automática de preferencias del sistema
  - Persistencia en localStorage
  - API simplificada con métodos `toggleTheme()` y `setTheme()`

### Tests
- Los tests han sido migrados a `src/context/__tests__/`
- Se han actualizado las rutas de importación
- Se ha creado un mock para `window.matchMedia` en `src/test-utils/matchMedia.mock.ts`

## Problemas Conocidos

Durante las pruebas se detectaron algunos fallos relacionados con el entorno de testing:

1. **window.matchMedia**: Jest no proporciona una implementación por defecto de esta API del navegador
2. **Importaciones con alias**: Algunos tests utilizan importaciones con alias (@/) que pueden requerir configuración adicional

## Recomendaciones para el Desarrollo

1. **Importaciones**: Utilizar siempre importaciones desde `src/context/` para los contextos
2. **Testing**: Importar el mock de matchMedia en los tests que utilicen el contexto de tema
3. **Nuevos Contextos**: Seguir el patrón establecido para la creación de nuevos contextos

## Próximos Pasos

1. Configurar Jest para incluir automáticamente el mock de matchMedia
2. Revisar y actualizar la documentación de la API de los contextos
3. Considerar la migración a React Context API más moderna o a soluciones como Zustand para gestión de estado global

---

*Documentación preparada por el equipo de ArtistRM 360 - Mayo 2025*
