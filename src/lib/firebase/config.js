import { initializeApp } from 'firebase/app';
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
  appId: "1:609415718761:web:a5d5c8e9c9b3b3b3b3b3b3"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar servicios de Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

export default app;
