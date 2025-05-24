import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';

// Mock component to test the ThemeProvider
const TestComponent = () => {
  return <div data-testid="test-component">Test Component</div>;
};

describe('ThemeProvider', () => {
  beforeEach(() => {
    // Reset localStorage mock before each test
    localStorage.clear();
    
    // Reset document classes
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.remove('light');
  });

  test('renders children correctly', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    expect(screen.getByTestId('test-component')).toBeInTheDocument();
    expect(screen.getByText('Test Component')).toBeInTheDocument();
  });

  test('defaults to system theme when no theme is stored', () => {
    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false, // Default to light mode
        media: query,
        onchange: null,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    // Should not have dark class when system preference is light
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  test('applies dark theme when stored in localStorage', () => {
    // Set theme in localStorage
    localStorage.setItem('theme', 'dark');
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    // Should have dark class
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  test('applies light theme when stored in localStorage', () => {
    // Set theme in localStorage
    localStorage.setItem('theme', 'light');
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    // Should not have dark class
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  test('applies system theme (dark) when system preference is dark', () => {
    // Mock window.matchMedia for dark mode
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query.includes('dark') ? true : false, // System prefers dark
        media: query,
        onchange: null,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
    
    // Set theme in localStorage
    localStorage.setItem('theme', 'system');
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    // Should have dark class when system preference is dark
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
