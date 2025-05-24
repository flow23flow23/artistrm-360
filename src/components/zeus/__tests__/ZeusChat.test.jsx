import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ZeusChat from '../components/zeus/ZeusChat';
import { useAuth } from '@/hooks/use-auth';
import { httpsCallable } from 'firebase/functions';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';

// Mock de los hooks y funciones de Firebase
jest.mock('@/hooks/use-auth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('firebase/functions', () => ({
  httpsCallable: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  onSnapshot: jest.fn(),
}));

jest.mock('@/lib/firebase/config', () => ({
  db: {},
  functions: {},
}));

describe('ZeusChat Component', () => {
  // Configuración de mocks antes de cada test
  beforeEach(() => {
    // Mock del hook de autenticación
    useAuth.mockReturnValue({
      user: { uid: 'test-user-id' },
    });
    
    // Mock de la función onSnapshot para simular datos de Firestore
    onSnapshot.mockImplementation((query, callback) => {
      // Simular documentos de Firestore
      callback({
        forEach: (fn) => {
          fn({
            data: () => ({
              messages: [
                { role: 'user', content: 'Hola Zeus', timestamp: new Date() },
                { role: 'assistant', content: 'Hola, ¿en qué puedo ayudarte?', timestamp: new Date() },
              ],
            }),
          });
        },
      });
      
      // Retornar función de limpieza
      return jest.fn();
    });
    
    // Mock de la función httpsCallable para simular llamada a Cloud Function
    httpsCallable.mockReturnValue(jest.fn().mockResolvedValue({
      data: {
        messageId: 'test-message-id',
        response: 'Respuesta de prueba',
      },
    }));
    
    // Mock de las funciones de Firestore
    collection.mockReturnValue({});
    query.mockReturnValue({});
    where.mockReturnValue({});
    orderBy.mockReturnValue({});
  });
  
  test('renderiza correctamente el componente', () => {
    render(<ZeusChat />);
    
    // Verificar elementos principales
    expect(screen.getByText('Zeus IA - Tu asistente inteligente')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Escribe tu mensaje...')).toBeInTheDocument();
    expect(screen.getByText('Enviar')).toBeInTheDocument();
  });
  
  test('muestra mensajes del historial de conversación', async () => {
    render(<ZeusChat />);
    
    // Verificar que los mensajes del mock se muestran
    await waitFor(() => {
      expect(screen.getByText('Hola Zeus')).toBeInTheDocument();
      expect(screen.getByText('Hola, ¿en qué puedo ayudarte?')).toBeInTheDocument();
    });
  });
  
  test('envía mensaje cuando se presiona el botón Enviar', async () => {
    render(<ZeusChat />);
    
    // Simular entrada de texto
    const inputElement = screen.getByPlaceholderText('Escribe tu mensaje...');
    fireEvent.change(inputElement, { target: { value: 'Nuevo mensaje de prueba' } });
    
    // Simular clic en botón Enviar
    const sendButton = screen.getByText('Enviar');
    fireEvent.click(sendButton);
    
    // Verificar que se llamó a la Cloud Function
    await waitFor(() => {
      const mockCallable = httpsCallable.mock.results[0].value;
      expect(mockCallable).toHaveBeenCalledWith({
        query: 'Nuevo mensaje de prueba',
        sessionId: expect.any(String),
        conversationHistory: expect.any(Array),
      });
    });
    
    // Verificar que el input se limpió
    expect(inputElement.value).toBe('');
  });
  
  test('muestra mensaje de error cuando falla la llamada a la Cloud Function', async () => {
    // Modificar el mock para simular un error
    httpsCallable.mockReturnValue(jest.fn().mockRejectedValue(new Error('Error de prueba')));
    
    render(<ZeusChat />);
    
    // Simular entrada de texto y envío
    const inputElement = screen.getByPlaceholderText('Escribe tu mensaje...');
    fireEvent.change(inputElement, { target: { value: 'Mensaje que fallará' } });
    
    const sendButton = screen.getByText('Enviar');
    fireEvent.click(sendButton);
    
    // Verificar que se muestra el mensaje de error
    await waitFor(() => {
      expect(screen.getByText('Lo siento, ha ocurrido un error. Por favor, intenta de nuevo más tarde.')).toBeInTheDocument();
    });
  });
  
  test('deshabilita el botón de envío cuando el input está vacío', () => {
    render(<ZeusChat />);
    
    const sendButton = screen.getByText('Enviar');
    expect(sendButton).toBeDisabled();
    
    // Simular entrada de texto
    const inputElement = screen.getByPlaceholderText('Escribe tu mensaje...');
    fireEvent.change(inputElement, { target: { value: 'Texto de prueba' } });
    
    // Verificar que el botón se habilita
    expect(sendButton).not.toBeDisabled();
    
    // Limpiar el input
    fireEvent.change(inputElement, { target: { value: '' } });
    
    // Verificar que el botón se deshabilita nuevamente
    expect(sendButton).toBeDisabled();
  });
  
  test('muestra mensaje de bienvenida cuando no hay mensajes', () => {
    // Modificar el mock para simular que no hay mensajes
    onSnapshot.mockImplementation((query, callback) => {
      callback({
        forEach: jest.fn(), // No llama a la función, simulando array vacío
      });
      return jest.fn();
    });
    
    render(<ZeusChat />);
    
    // Verificar mensaje de bienvenida
    expect(screen.getByText('¡Hola! Soy Zeus, tu asistente de gestión artística.')).toBeInTheDocument();
    expect(screen.getByText('Puedes preguntarme sobre tus estadísticas, próximos eventos o solicitar recomendaciones.')).toBeInTheDocument();
  });
});
