import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthContext } from '../../src/context/AuthContext';
import ZeusAssistant from '../../src/components/Zeus/ZeusAssistant';

// Mock de componentes y funciones
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('ZeusAssistant Component', () => {
  const mockUser = {
    uid: 'test-uid',
    email: 'test@example.com',
    displayName: 'Test User',
  };

  beforeEach(() => {
    // Limpiar todos los mocks antes de cada test
    jest.clearAllMocks();
  });

  it('renderiza correctamente cuando el usuario está autenticado', () => {
    render(
      <AuthContext.Provider value={{ user: mockUser, loading: false }}>
        <ZeusAssistant />
      </AuthContext.Provider>
    );

    expect(screen.getByText(/Zeus Assistant/i)).toBeInTheDocument();
  });

  it('muestra mensaje de carga cuando loading es true', () => {
    render(
      <AuthContext.Provider value={{ user: null, loading: true }}>
        <ZeusAssistant />
      </AuthContext.Provider>
    );

    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  it('muestra mensaje de inicio de sesión cuando el usuario no está autenticado', () => {
    render(
      <AuthContext.Provider value={{ user: null, loading: false }}>
        <ZeusAssistant />
      </AuthContext.Provider>
    );

    expect(screen.getByText(/Please sign in to use Zeus Assistant/i)).toBeInTheDocument();
  });

  it('envía mensaje cuando se hace clic en el botón de enviar', async () => {
    // Mock de la función de envío de mensajes
    const sendMessageMock = jest.fn();
    
    render(
      <AuthContext.Provider value={{ user: mockUser, loading: false }}>
        <ZeusAssistant sendMessage={sendMessageMock} />
      </AuthContext.Provider>
    );

    // Escribir en el campo de entrada
    const input = screen.getByPlaceholderText(/Type your message/i);
    fireEvent.change(input, { target: { value: 'Hello Zeus' } });

    // Hacer clic en el botón de enviar
    const sendButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendButton);

    // Verificar que la función de envío fue llamada
    await waitFor(() => {
      expect(sendMessageMock).toHaveBeenCalledWith('Hello Zeus');
    });
  });
});
