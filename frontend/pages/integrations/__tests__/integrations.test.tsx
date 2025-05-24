import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthContext } from '@/contexts/AuthContext';
import Integrations from '@/pages/integrations';

// Mock de Firebase
vi.mock('@/utils/firebase', () => ({
  db: {
    collection: vi.fn(() => ({
      doc: vi.fn(() => ({
        get: vi.fn(() => Promise.resolve({
          exists: vi.fn(() => true),
          data: vi.fn(() => ({}))
        })),
        set: vi.fn(() => Promise.resolve()),
        update: vi.fn(() => Promise.resolve()),
        delete: vi.fn(() => Promise.resolve())
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

vi.mock('@/hooks/useFirestoreIntegration', () => ({
  useFirestoreIntegration: () => ({
    data: [
      {
        id: 'int_spotify_1',
        platform: 'spotify',
        name: 'Spotify - Luna Azul',
        status: 'active',
        connectedAt: new Date(),
        lastSyncAt: new Date(),
        credentials: {
          clientId: 'demo_client_id',
          clientSecret: 'demo_client_secret',
          accessToken: 'demo_access_token',
          refreshToken: 'demo_refresh_token',
          expiresAt: new Date(),
          scopes: ['user-read-private', 'user-read-email']
        },
        settings: {
          autoSync: true,
          syncInterval: 6,
          syncContent: ['playlists', 'tracks', 'albums'],
          notifications: true
        },
        stats: {
          followers: 8500,
          engagement: 7.8,
          content: 45,
          lastUpdated: new Date()
        }
      },
      {
        id: 'int_youtube_1',
        platform: 'youtube',
        name: 'YouTube - Canal Oficial',
        status: 'active',
        connectedAt: new Date(),
        lastSyncAt: new Date(),
        credentials: {
          clientId: 'demo_client_id',
          clientSecret: 'demo_client_secret',
          accessToken: 'demo_access_token',
          refreshToken: 'demo_refresh_token',
          expiresAt: new Date(),
          scopes: ['youtube.readonly']
        },
        settings: {
          autoSync: true,
          syncInterval: 12,
          syncContent: ['videos', 'playlists'],
          notifications: true
        },
        stats: {
          followers: 12500,
          engagement: 8.2,
          content: 78,
          lastUpdated: new Date()
        }
      }
    ],
    loading: false,
    error: null,
    hasMore: false,
    fetchData: vi.fn(),
    fetchMoreData: vi.fn(),
    getDocument: vi.fn(),
    refresh: vi.fn()
  })
}));

// Mock de componentes
vi.mock('@/components/Layout', () => ({
  default: ({ children }) => <div data-testid="layout">{children}</div>
}));

describe('Integrations Component', () => {
  const mockUser = {
    uid: 'test-user-id',
    displayName: 'Test User',
    email: 'test@example.com'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the integrations page with correct title', () => {
    render(
      <AuthContext.Provider value={{ user: mockUser, loading: false }}>
        <Integrations />
      </AuthContext.Provider>
    );

    expect(screen.getByText('Integraciones')).toBeInTheDocument();
    expect(screen.getByText('Gestiona conexiones con plataformas externas y automatiza flujos de trabajo')).toBeInTheDocument();
  });

  it('displays integration cards for connected platforms', () => {
    render(
      <AuthContext.Provider value={{ user: mockUser, loading: false }}>
        <Integrations />
      </AuthContext.Provider>
    );

    expect(screen.getByText('Spotify - Luna Azul')).toBeInTheDocument();
    expect(screen.getByText('YouTube - Canal Oficial')).toBeInTheDocument();
  });

  it('shows tabs for Platforms and Workflows', () => {
    render(
      <AuthContext.Provider value={{ user: mockUser, loading: false }}>
        <Integrations />
      </AuthContext.Provider>
    );

    expect(screen.getByText('Plataformas Conectadas')).toBeInTheDocument();
    expect(screen.getByText('Flujos de Trabajo')).toBeInTheDocument();
  });

  it('switches between tabs when clicked', async () => {
    render(
      <AuthContext.Provider value={{ user: mockUser, loading: false }}>
        <Integrations />
      </AuthContext.Provider>
    );

    // Inicialmente en la pestaña de Plataformas
    expect(screen.getByText('Plataformas Conectadas (2)')).toBeInTheDocument();
    
    // Cambiar a la pestaña de Flujos de Trabajo
    fireEvent.click(screen.getByText('Flujos de Trabajo'));
    
    await waitFor(() => {
      expect(screen.getByText('Flujos de Trabajo')).toHaveAttribute('aria-selected', 'true');
    });
  });

  it('opens add integration dialog when "Conectar Plataforma" is clicked', async () => {
    render(
      <AuthContext.Provider value={{ user: mockUser, loading: false }}>
        <Integrations />
      </AuthContext.Provider>
    );

    fireEvent.click(screen.getByText('Conectar Plataforma'));
    
    await waitFor(() => {
      expect(screen.getByText('Conectar Nueva Plataforma')).toBeInTheDocument();
      expect(screen.getByText('Selecciona una plataforma para conectar')).toBeInTheDocument();
    });
  });

  it('shows integration details when edit button is clicked', async () => {
    render(
      <AuthContext.Provider value={{ user: mockUser, loading: false }}>
        <Integrations />
      </AuthContext.Provider>
    );

    // Encontrar todos los botones de edición y hacer clic en el primero
    const editButtons = screen.getAllByTitle('Editar');
    fireEvent.click(editButtons[0]);
    
    await waitFor(() => {
      expect(screen.getByText('Detalles de Integración:')).toBeInTheDocument();
      expect(screen.getByText('Información General')).toBeInTheDocument();
      expect(screen.getByText('Credenciales')).toBeInTheDocument();
    });
  });

  it('shows delete confirmation when delete button is clicked', async () => {
    render(
      <AuthContext.Provider value={{ user: mockUser, loading: false }}>
        <Integrations />
      </AuthContext.Provider>
    );

    // Encontrar todos los botones de eliminar y hacer clic en el primero
    const deleteButtons = screen.getAllByTitle('Eliminar');
    fireEvent.click(deleteButtons[0]);
    
    await waitFor(() => {
      expect(screen.getByText('Confirmar Eliminación')).toBeInTheDocument();
      expect(screen.getByText(/¿Estás seguro de que deseas eliminar este/)).toBeInTheDocument();
    });
  });

  it('shows "Conectar Nueva Plataforma" card', () => {
    render(
      <AuthContext.Provider value={{ user: mockUser, loading: false }}>
        <Integrations />
      </AuthContext.Provider>
    );

    expect(screen.getByText('Conectar Nueva Plataforma')).toBeInTheDocument();
    expect(screen.getByText('Integra con SoundCloud, Twitch, Discord y más')).toBeInTheDocument();
  });
});
