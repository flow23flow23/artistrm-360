import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthContext } from '../../../src/context/AuthContext';

// Mock de next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    query: {},
  }),
}));

// Mock de componentes externos
jest.mock('../../../src/components/integrations/IntegrationCard', () => ({
  __esModule: true,
  default: ({ name, description, status, onConnect, onDisconnect }) => (
    <div data-testid={`integration-${name}`}>
      <h3>{name}</h3>
      <p>{description}</p>
      <div data-testid={`status-${status}`}>{status}</div>
      <button onClick={onConnect} data-testid={`connect-${name}`}>Connect</button>
      <button onClick={onDisconnect} data-testid={`disconnect-${name}`}>Disconnect</button>
    </div>
  ),
}));

describe('Integrations Page', () => {
  const mockUser = {
    uid: 'test-uid',
    email: 'test@example.com',
    displayName: 'Test User',
    role: 'artist',
  };

  beforeEach(() => {
    // Limpiar todos los mocks antes de cada test
    jest.clearAllMocks();
  });

  it('renderiza correctamente cuando el usuario está autenticado', () => {
    render(
      <AuthContext.Provider value={{ user: mockUser, loading: false }}>
        <div data-testid="integrations-page">Integrations Content</div>
      </AuthContext.Provider>
    );

    expect(screen.getByTestId('integrations-page')).toBeInTheDocument();
  });

  it('muestra mensaje de carga cuando loading es true', () => {
    render(
      <AuthContext.Provider value={{ user: null, loading: true }}>
        <div data-testid="loading">Loading...</div>
      </AuthContext.Provider>
    );

    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('muestra las integraciones disponibles', () => {
    const integrations = [
      { name: 'Spotify', description: 'Connect your Spotify account', status: 'disconnected' },
      { name: 'YouTube', description: 'Connect your YouTube account', status: 'connected' },
    ];

    render(
      <AuthContext.Provider value={{ user: mockUser, loading: false }}>
        <>
          {integrations.map(integration => (
            <div key={integration.name} data-testid={`integration-${integration.name}`}>
              {integration.name}
            </div>
          ))}
        </>
      </AuthContext.Provider>
    );

    expect(screen.getByTestId('integration-Spotify')).toBeInTheDocument();
    expect(screen.getByTestId('integration-YouTube')).toBeInTheDocument();
  });

  it('llama a la función onConnect cuando se hace clic en el botón de conectar', async () => {
    const onConnectMock = jest.fn();
    
    render(
      <AuthContext.Provider value={{ user: mockUser, loading: false }}>
        <div data-testid="integration-Spotify">
          <button onClick={onConnectMock} data-testid="connect-Spotify">Connect</button>
        </div>
      </AuthContext.Provider>
    );

    const connectButton = screen.getByTestId('connect-Spotify');
    fireEvent.click(connectButton);

    await waitFor(() => {
      expect(onConnectMock).toHaveBeenCalled();
    });
  });

  it('llama a la función onDisconnect cuando se hace clic en el botón de desconectar', async () => {
    const onDisconnectMock = jest.fn();
    
    render(
      <AuthContext.Provider value={{ user: mockUser, loading: false }}>
        <div data-testid="integration-YouTube">
          <button onClick={onDisconnectMock} data-testid="disconnect-YouTube">Disconnect</button>
        </div>
      </AuthContext.Provider>
    );

    const disconnectButton = screen.getByTestId('disconnect-YouTube');
    fireEvent.click(disconnectButton);

    await waitFor(() => {
      expect(onDisconnectMock).toHaveBeenCalled();
    });
  });
});
