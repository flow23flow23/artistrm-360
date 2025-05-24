import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/utils/firebase';

// Definir la interfaz para el contexto
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  logOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  updateUserProfile: (displayName: string, photoURL?: string) => Promise<void>;
  clearError: () => void;
}

// Crear el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

// Proveedor del contexto
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Efecto para escuchar cambios en el estado de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    // Limpiar suscripción al desmontar
    return () => unsubscribe();
  }, []);

  // Iniciar sesión con email y contraseña
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(translateFirebaseError(err.code));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Registrar nuevo usuario
  const signUp = async (email: string, password: string, name: string) => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Actualizar perfil con nombre
      await updateProfile(userCredential.user, {
        displayName: name
      });
      
      // Crear documento de usuario en Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email,
        displayName: name,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        role: 'user',
        status: 'active'
      });
      
    } catch (err: any) {
      setError(translateFirebaseError(err.code));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Cerrar sesión
  const logOut = async () => {
    setLoading(true);
    setError(null);
    try {
      await signOut(auth);
    } catch (err: any) {
      setError(translateFirebaseError(err.code));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Restablecer contraseña
  const resetPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      setError(translateFirebaseError(err.code));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Iniciar sesión con Google
  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      // Verificar si el usuario ya existe en Firestore
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      // Si no existe, crear documento de usuario
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName,
          photoURL: userCredential.user.photoURL,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          role: 'user',
          status: 'active'
        });
      }
    } catch (err: any) {
      setError(translateFirebaseError(err.code));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar perfil de usuario
  const updateUserProfile = async (displayName: string, photoURL?: string) => {
    setLoading(true);
    setError(null);
    try {
      if (!user) throw new Error('No hay usuario autenticado');
      
      const updateData: { displayName: string; photoURL?: string } = { displayName };
      if (photoURL) updateData.photoURL = photoURL;
      
      await updateProfile(user, updateData);
      
      // Actualizar documento de usuario en Firestore
      await setDoc(doc(db, 'users', user.uid), {
        displayName,
        photoURL: photoURL || user.photoURL,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
    } catch (err: any) {
      setError(translateFirebaseError(err.code));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Limpiar error
  const clearError = () => {
    setError(null);
  };

  // Traducir códigos de error de Firebase a mensajes amigables
  const translateFirebaseError = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/invalid-email':
        return 'El correo electrónico no es válido.';
      case 'auth/user-disabled':
        return 'Esta cuenta ha sido deshabilitada.';
      case 'auth/user-not-found':
        return 'No existe una cuenta con este correo electrónico.';
      case 'auth/wrong-password':
        return 'Contraseña incorrecta.';
      case 'auth/email-already-in-use':
        return 'Este correo electrónico ya está en uso.';
      case 'auth/weak-password':
        return 'La contraseña debe tener al menos 6 caracteres.';
      case 'auth/operation-not-allowed':
        return 'Operación no permitida.';
      case 'auth/account-exists-with-different-credential':
        return 'Ya existe una cuenta con este correo electrónico pero con diferentes credenciales.';
      case 'auth/popup-closed-by-user':
        return 'Ventana emergente cerrada antes de completar la operación.';
      default:
        return 'Ha ocurrido un error. Por favor, inténtalo de nuevo.';
    }
  };

  const value = {
    user,
    loading,
    error,
    signIn,
    signUp,
    logOut,
    resetPassword,
    signInWithGoogle,
    updateUserProfile,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
