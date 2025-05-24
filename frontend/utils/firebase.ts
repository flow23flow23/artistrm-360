import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD32w6JKRWbrlhgdQ1goCqC-EyHtMEVy-s",
  authDomain: "zamx-v1.firebaseapp.com",
  projectId: "zamx-v1",
  storageBucket: "zamx-v1.appspot.com",
  messagingSenderId: "609415718761",
  appId: "1:609415718761:web:a1b2c3d4e5f6a7b8c9d0e1"
};

// Inicializar Firebase solo una vez
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Exportar servicios de Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

export default app;
