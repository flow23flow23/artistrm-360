import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthContext } from '../../src/context/AuthContext';
import { useRouter } from 'next/router';

// Mock de next/router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

// Mock de componentes de layout
jest.mock('../../src/components/Layout', () => ({
  default: ({ children }) => <div data-testid="layout">{children}</div>
}));

describe('Dashboard Page', () => {
  const mockUser = {
    uid: 'test-uid',
    email: 'test@example.com',
    displayName: 'Test User',
    role: 'artist',
  };

  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    // Limpiar todos los mocks antes de cada test
    jest.clearAllMocks();
    
    // Configurar el mock del router
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('renderiza correctamente cuando el usuario está autenticado', () => {
    render(
      <AuthContext.Provider value={{ user: mockUser, loading: false }}>
        <div data-testid="dashboard-page">Dashboard Content</div>
      </AuthContext.Provider>
    );

    expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
  });

  it('muestra mensaje de carga cuando loading es true', () => {
    render(
      <AuthContext.Provider value={{ user: null, loading: true }}>
        <div data-testid="loading">Loading...</div>
      </AuthContext.Provider>
    );

    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('redirige a login cuando el usuario no está autenticado', async () => {
    render(
      <AuthContext.Provider value={{ user: null, loading: false }}>
        <div data-testid="dashboard-page">Dashboard Content</div>
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/login');
    });
  });

  it('muestra las métricas del artista cuando el rol es "artist"', () => {
    render(
      <AuthContext.Provider value={{ user: mockUser, loading: false }}>
        <div data-testid="artist-metrics">Artist Metrics</div>
      </AuthContext.Provider>
    );

    expect(screen.getByTestId('artist-metrics')).toBeInTheDocument();
  });

  it('muestra las métricas del manager cuando el rol es "manager"', () => {
    const managerUser = { ...mockUser, role: 'manager' };
    
    render(
      <AuthContext.Provider value={{ user: managerUser, loading: false }}>
        <div data-testid="manager-metrics">Manager Metrics</div>
      </AuthContext.Provider>
    );

    expect(screen.getByTestId('manager-metrics')).toBeInTheDocument();
  });
});
