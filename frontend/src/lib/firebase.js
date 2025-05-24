import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDZPjQWZiYvRV1O8cy5dLkzK-RQP9D7fXA",
  authDomain: "zamx-v1.firebaseapp.com",
  projectId: "zamx-v1",
  storageBucket: "zamx-v1.appspot.com",
  messagingSenderId: "609415718761",
  appId: "1:609415718761:web:3a8f5c7d5c77a5b9a5b9a5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Export Firebase app
export default app;
