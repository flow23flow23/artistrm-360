import React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

// Definición del contexto
const AuthContext = createContext();

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

// Proveedor del contexto
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const auth = getAuth();

  // Escuchar cambios en el estado de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      try {
        if (authUser) {
          setUser(authUser);
          
          // Obtener datos adicionales del usuario desde Firestore
          const userDocRef = doc(db, 'users', authUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          } else {
            // Si no existe el documento, crear uno con datos básicos
            const newUserData = {
              displayName: authUser.displayName || '',
              email: authUser.email,
              photoURL: authUser.photoURL || '',
              createdAt: new Date().toISOString(),
              role: 'artist', // Rol por defecto
              settings: {
                theme: 'dark',
                notifications: true
              }
            };
            
            await setDoc(userDocRef, newUserData);
            setUserData(newUserData);
          }
        } else {
          setUser(null);
          setUserData(null);
        }
      } catch (err) {
        console.error('Error al obtener datos del usuario:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    });

    // Limpiar suscripción al desmontar
    return () => unsubscribe();
  }, []);

  // Iniciar sesión con email y contraseña
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Registrar nuevo usuario
  const register = async (email, password, displayName) => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Actualizar perfil con displayName
      if (displayName) {
        await updateProfile(userCredential.user, { displayName });
      }
      
      return userCredential.user;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Cerrar sesión
  const logout = async () => {
    setError(null);
    try {
      await signOut(auth);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Restablecer contraseña
  const resetPassword = async (email) => {
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Actualizar datos del usuario en Firestore
  const updateUserData = async (data) => {
    setError(null);
    try {
      if (!user) throw new Error('No hay usuario autenticado');
      
      const userDocRef = doc(db, 'users', user.uid);
      const updatedData = { ...userData, ...data, updatedAt: new Date().toISOString() };
      
      await setDoc(userDocRef, updatedData, { merge: true });
      setUserData(updatedData);
      
      return updatedData;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Valores proporcionados por el contexto
  const value = {
    user,
    userData,
    loading,
    error,
    login,
    register,
    logout,
    resetPassword,
    updateUserData,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
