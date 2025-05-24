// src/test-utils/jest.setup.ts
import '@testing-library/jest-dom';

// Mock para window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated pero incluido para compatibilidad
    removeListener: jest.fn(), // Deprecated pero incluido para compatibilidad
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

// Silenciar warnings específicos de React
jest.spyOn(console, 'error').mockImplementation((...args) => {
  // Filtrar warnings conocidos que no afectan los tests
  const suppressedWarnings = [
    'Warning: ReactDOM.render is no longer supported',
    'Warning: useLayoutEffect does nothing on the server'
  ];
  
  if (!suppressedWarnings.some(warning => args[0]?.includes(warning))) {
    // eslint-disable-next-line no-console
    console.warn(...args);
  }
});

// Limpiar todos los mocks después de cada test
afterEach(() => {
  jest.clearAllMocks();
});
