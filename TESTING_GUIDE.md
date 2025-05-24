# Guía de Testing - ArtistRM 360

## Introducción

Esta documentación describe el entorno de testing unificado para ArtistRM 360, basado en Jest. Anteriormente, el proyecto utilizaba una combinación de Jest y Vitest, lo que causaba inconsistencias y fallos en la ejecución de pruebas. Ahora, todos los tests han sido migrados a Jest para garantizar un entorno de testing coherente y robusto.

## Configuración de Jest

### Archivo de Configuración Principal

El archivo `jest.config.js` en la raíz del proyecto contiene la configuración principal:

```js
module.exports = {
  // Directorios donde Jest buscará los tests
  testMatch: [
    "**/__tests__/**/*.test.[jt]s?(x)",
    "**/?(*.)+(spec|test).[jt]s?(x)"
  ],
  
  // Extensiones de archivo que Jest procesará
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  
  // Transformadores para diferentes tipos de archivos
  transform: {
    "^.+\\.(ts|tsx|js|jsx)$": "babel-jest"
  },
  
  // Patrones de transformación para node_modules
  transformIgnorePatterns: [
    "/node_modules/(?!(@firebase|firebase|react-firebase-hooks|next|@next)/)"
  ],
  
  // Configuración de entorno
  testEnvironment: "jsdom",
  
  // Mapeo de alias de importación
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1"
  },
  
  // Archivos de configuración global para tests
  setupFilesAfterEnv: [
    "<rootDir>/src/test-utils/jest.setup.ts"
  ],
  
  // Cobertura de código
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
    "!src/test-utils/**/*"
  ],
  
  // Umbral de cobertura
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  // Directorio donde se guardarán los informes de cobertura
  coverageDirectory: "coverage"
};
```

### Configuración de Babel

El archivo `babel.config.js` en la raíz del proyecto configura Babel para transformar correctamente los archivos de TypeScript y JSX:

```js
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-typescript',
    ['@babel/preset-react', { runtime: 'automatic' }]
  ],
  plugins: [
    ['module-resolver', {
      alias: {
        '@': './src'
      }
    }]
  ]
};
```

### Mocks Globales

El archivo `src/test-utils/jest.setup.ts` configura mocks globales para APIs del navegador:

```typescript
// Mock para window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock para localStorage
const localStorageMock = (function() {
  let store: Record<string, string> = {};
  return {
    getItem: function(key: string) {
      return store[key] || null;
    },
    setItem: function(key: string, value: string) {
      store[key] = value.toString();
    },
    removeItem: function(key: string) {
      delete store[key];
    },
    clear: function() {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});
```

## Migración de Vitest a Jest

### Principales Diferencias

| Vitest | Jest | Notas |
|--------|------|-------|
| `import { describe, it, expect, vi, beforeEach } from 'vitest';` | `import { describe, it, expect, jest, beforeEach } from '@jest/globals';` | Importación de funciones globales |
| `vi.fn()` | `jest.fn()` | Creación de mocks |
| `vi.mock()` | `jest.mock()` | Mocking de módulos |
| `vi.clearAllMocks()` | `jest.clearAllMocks()` | Limpieza de mocks |

### Ejemplo de Migración

**Antes (Vitest):**
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    const mockFn = vi.fn();
    // ...
  });
});
```

**Después (Jest):**
```typescript
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';

describe('Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const mockFn = jest.fn();
    // ...
  });
});
```

## Estructura de Tests

Los tests están organizados siguiendo la estructura de directorios del código fuente:

```
src/
  components/
    Component/
      __tests__/
        Component.test.tsx
  context/
    __tests__/
      auth-context.test.tsx
      theme-context.test.tsx
```

## Buenas Prácticas

1. **Nombrado de Tests**: Usar nombres descriptivos que indiquen claramente qué se está probando.
2. **Aislamiento**: Cada test debe ser independiente y no depender del estado de otros tests.
3. **Mocks**: Utilizar mocks para aislar el componente bajo prueba de sus dependencias.
4. **Limpieza**: Usar `beforeEach` para limpiar el estado entre tests.
5. **Cobertura**: Mantener una cobertura de código alta, especialmente en componentes críticos.

## Comandos Útiles

- `npm test`: Ejecuta todos los tests
- `npm test -- --watch`: Ejecuta tests en modo watch
- `npm test -- --coverage`: Genera informe de cobertura
- `npm test -- -t "nombre del test"`: Ejecuta tests específicos por nombre

## Solución de Problemas Comunes

### Error: Cannot find module 'vitest'

Este error indica que un archivo de test está importando desde Vitest en lugar de Jest. Para solucionarlo:

1. Cambiar `import { describe, it, expect, vi, beforeEach } from 'vitest';` a `import { describe, it, expect, jest, beforeEach } from '@jest/globals';`
2. Reemplazar todas las instancias de `vi` por `jest`

### Error: window.matchMedia is not a function

Este error ocurre cuando un componente utiliza `window.matchMedia` pero el entorno de test no lo proporciona. La solución está implementada globalmente en `src/test-utils/jest.setup.ts`.

---

*Documentación preparada por el equipo de ArtistRM 360 - Mayo 2025*
