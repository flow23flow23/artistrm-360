import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthContext } from '@/contexts/AuthContext';
import ZeusAssistant from '@/components/Zeus/ZeusAssistant';

// Mock de Firebase
vi.mock('@/utils/firebase', () => ({
  db: {
    collection: vi.fn(() => ({
      doc: vi.fn(() => ({
        get: vi.fn(() => Promise.resolve({
          exists: vi.fn(() => true),
          data: vi.fn(() => ({
            zeus: {
              voiceEnabled: true,
              voiceVolume: 0.8,
              voiceRate: 1.0,
              voicePitch: 1.0,
              preferredLanguage: 'es-ES',
              showSuggestions: true,
              darkTheme: true,
              autoOpen: false
            }
          }))
        })),
        set: vi.fn(() => Promise.resolve()),
        update: vi.fn(() => Promise.resolve())
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

// Mock de SpeechRecognition
global.SpeechRecognition = vi.fn(() => ({
  continuous: true,
  interimResults: true,
  lang: 'es-ES',
  start: vi.fn(),
  stop: vi.fn(),
  onresult: vi.fn(),
  onerror: vi.fn(),
  onend: vi.fn()
}));

global.webkitSpeechRecognition = global.SpeechRecognition;

// Mock de SpeechSynthesisUtterance
global.SpeechSynthesisUtterance = vi.fn(() => ({
  lang: 'es-ES',
  volume: 0.8,
  rate: 1.0,
  pitch: 1.0,
  text: '',
  onend: vi.fn()
}));

global.speechSynthesis = {
  speak: vi.fn(),
  cancel: vi.fn()
};

describe('ZeusAssistant Component', () => {
  const mockUser = {
    uid: 'test-user-id',
    displayName: 'Test User',
    email: 'test@example.com'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the Zeus button when closed', () => {
    render(
      <AuthContext.Provider value={{ user: mockUser, loading: false }}>
        <ZeusAssistant />
      </AuthContext.Provider>
    );

    expect(screen.getByLabelText('Zeus')).toBeInTheDocument();
  });

  it('opens the Zeus dialog when button is clicked', async () => {
    render(
      <AuthContext.Provider value={{ user: mockUser, loading: false }}>
        <ZeusAssistant />
      </AuthContext.Provider>
    );

    fireEvent.click(screen.getByLabelText('Zeus'));
    
    await waitFor(() => {
      expect(screen.getByText('Zeus, multi agente de IA')).toBeInTheDocument();
    });
  });

  it('shows welcome message when no conversation exists', async () => {
    render(
      <AuthContext.Provider value={{ user: mockUser, loading: false }}>
        <ZeusAssistant />
      </AuthContext.Provider>
    );

    fireEvent.click(screen.getByLabelText('Zeus'));
    
    await waitFor(() => {
      expect(screen.getByText('¡Hola! Soy Zeus, tu asistente inteligente')).toBeInTheDocument();
    });
  });

  it('toggles microphone when mic button is clicked', async () => {
    render(
      <AuthContext.Provider value={{ user: mockUser, loading: false }}>
        <ZeusAssistant />
      </AuthContext.Provider>
    );

    fireEvent.click(screen.getByLabelText('Zeus'));
    
    await waitFor(() => {
      const micButton = screen.getByTitle('Activar micrófono');
      fireEvent.click(micButton);
      expect(global.SpeechRecognition).toHaveBeenCalled();
    });
  });

  it('processes text input when send button is clicked', async () => {
    render(
      <AuthContext.Provider value={{ user: mockUser, loading: false }}>
        <ZeusAssistant />
      </AuthContext.Provider>
    );

    fireEvent.click(screen.getByLabelText('Zeus'));
    
    await waitFor(() => {
      const input = screen.getByPlaceholderText('Escribe o habla a Zeus...');
      fireEvent.change(input, { target: { value: 'Muéstrame las estadísticas de Spotify' } });
      
      const sendButton = screen.getByTitle('Enviar mensaje');
      fireEvent.click(sendButton);
      
      // Verificar que se está procesando
      expect(screen.getByText('Zeus está pensando...')).toBeInTheDocument();
    });
  });

  it('closes the dialog when close button is clicked', async () => {
    render(
      <AuthContext.Provider value={{ user: mockUser, loading: false }}>
        <ZeusAssistant />
      </AuthContext.Provider>
    );

    fireEvent.click(screen.getByLabelText('Zeus'));
    
    await waitFor(() => {
      const closeButton = screen.getByTitle('Cerrar');
      fireEvent.click(closeButton);
      
      // Verificar que el diálogo se ha cerrado
      expect(screen.queryByText('Zeus, multi agente de IA')).not.toBeInTheDocument();
    });
  });

  it('toggles mute when volume button is clicked', async () => {
    render(
      <AuthContext.Provider value={{ user: mockUser, loading: false }}>
        <ZeusAssistant />
      </AuthContext.Provider>
    );

    fireEvent.click(screen.getByLabelText('Zeus'));
    
    await waitFor(() => {
      const volumeButton = screen.getByTitle('Silenciar');
      fireEvent.click(volumeButton);
      
      // Verificar que ahora muestra "Activar voz"
      expect(screen.getByTitle('Activar voz')).toBeInTheDocument();
    });
  });

  it('clears conversation when "Nueva conversación" is clicked', async () => {
    render(
      <AuthContext.Provider value={{ user: mockUser, loading: false }}>
        <ZeusAssistant />
      </AuthContext.Provider>
    );

    fireEvent.click(screen.getByLabelText('Zeus'));
    
    await waitFor(() => {
      const newConversationButton = screen.getByText('Nueva conversación');
      fireEvent.click(newConversationButton);
      
      // Verificar que muestra el mensaje de bienvenida
      expect(screen.getByText('¡Hola! Soy Zeus, tu asistente inteligente')).toBeInTheDocument();
    });
  });
});
