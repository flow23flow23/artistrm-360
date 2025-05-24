// jest.config.js
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
