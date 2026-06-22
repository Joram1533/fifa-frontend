// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDC6654orf6WDosKUzmSqWvd992THt7Q6Y",
  authDomain: "world-cup-tickets-ea3dd.firebaseapp.com",
  projectId: "world-cup-tickets-ea3dd",
  storageBucket: "world-cup-tickets-ea3dd.firebasestorage.app",
  messagingSenderId: "20477385924",
  appId: "1:20477385924:web:2854eeace23ca2fd1e3d91",
  measurementId: "G-SBQ5ZXTG05"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export the tools we need for the Auth and Profile chunks
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();