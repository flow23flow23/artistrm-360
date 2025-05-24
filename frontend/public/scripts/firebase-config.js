// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDZPiCJ9YhQZGe6QwXUDTXtJ9u0sCvO-vc",
    authDomain: "zamx-v1.firebaseapp.com",
    projectId: "zamx-v1",
    storageBucket: "zamx-v1.appspot.com",
    messagingSenderId: "609415718761",
    appId: "1:609415718761:web:3f5d8f5a9c5c5c5c5c5c5c"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
const functions = firebase.functions();
