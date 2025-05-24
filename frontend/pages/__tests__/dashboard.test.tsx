import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthContext } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import Dashboard from '@/pages/dashboard';

// Mock de Next Router
vi.mock('next/router', () => ({
  useRouter: vi.fn()
}));

// Mock de Firebase
vi.mock('@/utils/firebase', () => ({
  db: {
    collection: vi.fn(() => ({
      query: vi.fn(() => ({
        where: vi.fn(() => ({
          orderBy: vi.fn(() => ({
            getDocs: vi.fn(() => Promise.resolve({
              docs: []
            }))
          }))
        }))
      })),
      doc: vi.fn(() => ({
        get: vi.fn(() => Promise.resolve({
          exists: vi.fn(() => true),
          data: vi.fn(() => ({}))
        }))
      }))
    }))
  }
}));

// Mock de hooks
vi.mock('@/hooks/useResponsiveUI', () => ({
  useResponsiveUI: () => ({
    isMobile: false,
    isTablet: false,
    responsiveValue: (mobile, tablet, desktop) => desktop
  })
}));

// Mock de contextos
vi.mock('@/contexts/ZeusContext', () => ({
  useZeus: () => ({
    activateZeus: vi.fn(),
    processVoiceCommand: vi.fn(),
    zeusState: 'idle'
  })
}));

// Mock de componentes
vi.mock('@/components/Layout', () => ({
  default: ({ children }) => <div data-testid="layout">{children}</div>
}));

// Mock de framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>
  },
  AnimatePresence: ({ children }) => <>{children}</>
}));

describe('Dashboard Component', () => {
  const mockUser = {
    uid: 'test-user-id',
    displayName: 'Test User',
    email: 'test@example.com'
  };

  const mockRouter = {
    push: vi.fn(),
    pathname: '/dashboard'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue(mockRouter);
  });

  it('renders loading state initially', () => {
    render(
      <AuthContext.Provider value={{ user: mockUser, loading: false }}>
        <Dashboard />
      </AuthContext.Provider>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders dashboard content after loading', async () => {
    render(
      <AuthContext.Provider value={{ user: mockUser, loading: false }}>
        <Dashboard />
      </AuthContext.Provider>
    );

    // Esperar a que se cargue el dashboard
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText(/Bienvenido de nuevo/)).toBeInTheDocument();
    });
  });

  it('displays statistics cards', async () => {
    render(
      <AuthContext.Provider value={{ user: mockUser, loading: false }}>
        <Dashboard />
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Artistas')).toBeInTheDocument();
      expect(screen.getByText('Proyectos')).toBeInTheDocument();
      expect(screen.getByText('Contenido')).toBeInTheDocument();
      expect(screen.getByText('Plataformas')).toBeInTheDocument();
      expect(screen.getByText('Seguidores')).toBeInTheDocument();
      expect(screen.getByText('Engagement')).toBeInTheDocument();
    });
  });

  it('shows recent activity section', async () => {
    render(
      <AuthContext.Provider value={{ user: mockUser, loading: false }}>
        <Dashboard />
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Actividad Reciente')).toBeInTheDocument();
    });
  });

  it('shows upcoming events section', async () => {
    render(
      <AuthContext.Provider value={{ user: mockUser, loading: false }}>
        <Dashboard />
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Próximos Eventos')).toBeInTheDocument();
    });
  });

  it('refreshes data when refresh button is clicked', async () => {
    render(
      <AuthContext.Provider value={{ user: mockUser, loading: false }}>
        <Dashboard />
      </AuthContext.Provider>
    );

    await waitFor(() => {
      const refreshButton = screen.getByText('Actualizar');
      fireEvent.click(refreshButton);
      // Debería mostrar el indicador de carga nuevamente
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  it('activates Zeus when Zeus button is clicked', async () => {
    render(
      <AuthContext.Provider value={{ user: mockUser, loading: false }}>
        <Dashboard />
      </AuthContext.Provider>
    );

    await waitFor(() => {
      // Buscar el botón de Zeus y hacer clic
      const zeusButton = screen.getByText('Zeus');
      fireEvent.click(zeusButton);
      
      // Verificar que se abre el diálogo de Zeus
      expect(screen.getByText('Zeus está escuchando...')).toBeInTheDocument();
    });
  });

  it('renders responsive layout correctly', async () => {
    render(
      <AuthContext.Provider value={{ user: mockUser, loading: false }}>
        <Dashboard />
      </AuthContext.Provider>
    );

    await waitFor(() => {
      // Verificar que el layout es responsive
      const layout = screen.getByTestId('layout');
      expect(layout).toBeInTheDocument();
      
      // Verificar que las tarjetas de estadísticas están presentes
      const statsCards = screen.getAllByText(/Artistas|Proyectos|Contenido|Plataformas|Seguidores|Engagement/);
      expect(statsCards.length).toBe(6);
    });
  });
});
