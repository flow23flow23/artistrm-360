import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider, useTheme } from '@/context/theme-context';

// Componente de prueba para verificar el contexto
const TestComponent = () => {
  const { theme, toggleTheme, isDark, isLight } = useTheme();
  
  return (
    <div>
      <div data-testid="theme-value">{theme}</div>
      <div data-testid="is-dark">{isDark ? 'true' : 'false'}</div>
      <div data-testid="is-light">{isLight ? 'true' : 'false'}</div>
      <button data-testid="toggle-button" onClick={toggleTheme}>
        Toggle Theme
      </button>
    </div>
  );
};

// Mock para localStorage
const localStorageMock = (function() {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('ThemeContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.documentElement.classList.remove('dark-theme', 'light-theme');
  });

  test('proporciona el tema oscuro por defecto', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    expect(screen.getByTestId('theme-value')).toHaveTextContent('dark');
    expect(screen.getByTestId('is-dark')).toHaveTextContent('true');
    expect(screen.getByTestId('is-light')).toHaveTextContent('false');
    expect(document.documentElement.classList).toContain('dark-theme');
  });

  test('usa el tema guardado en localStorage si existe', () => {
    localStorageMock.getItem.mockReturnValueOnce('light');
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    expect(screen.getByTestId('theme-value')).toHaveTextContent('light');
    expect(screen.getByTestId('is-dark')).toHaveTextContent('false');
    expect(screen.getByTestId('is-light')).toHaveTextContent('true');
    expect(document.documentElement.classList).toContain('light-theme');
  });

  test('cambia el tema cuando se llama a toggleTheme', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    // Inicialmente es tema oscuro
    expect(screen.getByTestId('theme-value')).toHaveTextContent('dark');
    
    // Cambiar a tema claro
    fireEvent.click(screen.getByTestId('toggle-button'));
    
    expect(screen.getByTestId('theme-value')).toHaveTextContent('light');
    expect(screen.getByTestId('is-dark')).toHaveTextContent('false');
    expect(screen.getByTestId('is-light')).toHaveTextContent('true');
    expect(document.documentElement.classList).toContain('light-theme');
    expect(document.documentElement.classList).not.toContain('dark-theme');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('artistrm-theme', 'light');
    
    // Cambiar de nuevo a tema oscuro
    fireEvent.click(screen.getByTestId('toggle-button'));
    
    expect(screen.getByTestId('theme-value')).toHaveTextContent('dark');
    expect(screen.getByTestId('is-dark')).toHaveTextContent('true');
    expect(screen.getByTestId('is-light')).toHaveTextContent('false');
    expect(document.documentElement.classList).toContain('dark-theme');
    expect(document.documentElement.classList).not.toContain('light-theme');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('artistrm-theme', 'dark');
  });

  test('lanza error si useTheme se usa fuera de ThemeProvider', () => {
    // Silenciar errores de consola para esta prueba
    const originalError = console.error;
    console.error = jest.fn();
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useTheme debe ser usado dentro de un ThemeProvider');
    
    // Restaurar console.error
    console.error = originalError;
  });
});
