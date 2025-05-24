import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Mocks para Firebase
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  onAuthStateChanged: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  updateProfile: jest.fn()
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn()
}));

jest.mock('@/lib/firebase/config', () => ({
  db: {}
}));

// Componente de prueba para verificar el contexto
const TestComponent = () => {
  const { 
    user, 
    userData, 
    loading, 
    error, 
    login, 
    register, 
    logout, 
    resetPassword, 
    updateUserData, 
    isAuthenticated 
  } = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'true' : 'false'}</div>
      <div data-testid="error">{error || 'no-error'}</div>
      <div data-testid="is-authenticated">{isAuthenticated ? 'true' : 'false'}</div>
      <div data-testid="user-email">{user?.email || 'no-user'}</div>
      <div data-testid="user-data">{userData ? JSON.stringify(userData) : 'no-data'}</div>
      <button data-testid="login-button" onClick={() => login('test@example.com', 'password')}>
        Login
      </button>
      <button data-testid="register-button" onClick={() => register('test@example.com', 'password', 'Test User')}>
        Register
      </button>
      <button data-testid="logout-button" onClick={logout}>
        Logout
      </button>
      <button data-testid="reset-button" onClick={() => resetPassword('test@example.com')}>
        Reset Password
      </button>
      <button data-testid="update-button" onClick={() => updateUserData({ displayName: 'Updated Name' })}>
        Update Data
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  let mockAuthStateChanged;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock para onAuthStateChanged
    mockAuthStateChanged = jest.fn();
    const mockAuth = { currentUser: null };
    getAuth.mockReturnValue(mockAuth);
    onAuthStateChanged = mockAuthStateChanged;
    
    // Mock para doc y getDoc
    doc.mockReturnValue('userDocRef');
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        displayName: 'Test User',
        email: 'test@example.com',
        role: 'artist'
      })
    });
  });

  test('proporciona estado de carga inicial', () => {
    // Simular que onAuthStateChanged no se resuelve inmediatamente
    mockAuthStateChanged.mockImplementation(() => {
      return () => {}; // Cleanup function
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(screen.getByTestId('loading')).toHaveTextContent('true');
    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
  });

  test('actualiza el estado cuando el usuario inicia sesión', async () => {
    // Simular un usuario autenticado
    const mockUser = { 
      uid: '123', 
      email: 'test@example.com',
      displayName: 'Test User'
    };
    
    mockAuthStateChanged.mockImplementation(auth, callback => {
      callback(mockUser);
      return () => {}; // Cleanup function
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    });
  });

  test('maneja correctamente el inicio de sesión', async () => {
    // Mock para signInWithEmailAndPassword
    signInWithEmailAndPassword.mockResolvedValue({
      user: { 
        uid: '123', 
        email: 'test@example.com',
        displayName: 'Test User'
      }
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    fireEvent.click(screen.getByTestId('login-button'));
    
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      'test@example.com',
      'password'
    );
  });

  test('maneja errores de autenticación', async () => {
    // Mock para signInWithEmailAndPassword con error
    const mockError = new Error('Auth error');
    mockError.message = 'Invalid credentials';
    signInWithEmailAndPassword.mockRejectedValue(mockError);
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    fireEvent.click(screen.getByTestId('login-button'));
    
    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Invalid credentials');
    });
  });

  test('crea documento de usuario si no existe', async () => {
    // Simular un usuario autenticado pero sin documento en Firestore
    const mockUser = { 
      uid: '123', 
      email: 'new@example.com',
      displayName: 'New User'
    };
    
    mockAuthStateChanged.mockImplementation(auth, callback => {
      callback(mockUser);
      return () => {}; // Cleanup function
    });
    
    // Mock para getDoc indicando que no existe el documento
    getDoc.mockResolvedValue({
      exists: () => false
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    await waitFor(() => {
      expect(setDoc).toHaveBeenCalledWith(
        'userDocRef',
        expect.objectContaining({
          email: 'new@example.com',
          displayName: 'New User',
          role: 'artist'
        })
      );
    });
  });

  test('lanza error si useAuth se usa fuera de AuthProvider', () => {
    // Silenciar errores de consola para esta prueba
    const originalError = console.error;
    console.error = jest.fn();
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth debe ser usado dentro de un AuthProvider');
    
    // Restaurar console.error
    console.error = originalError;
  });
});
