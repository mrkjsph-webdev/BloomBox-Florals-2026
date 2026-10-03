
// Import Firebase functions
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAqh8WyG5vG6A9ibPKse_pmfX11sui1dhw",
  authDomain: "bloomboxflorals.firebaseapp.com",
  projectId: "bloomboxflorals",
  storageBucket: "bloomboxflorals.firebasestorage.app",
  messagingSenderId: "830491546899",
  appId: "1:830491546899:web:1d13c2626ed953171cb6e6",
  measurementId: "G-KEBTM7H2F2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Analytics
export const analytics = getAnalytics(app);

