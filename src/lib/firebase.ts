// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDkgiHlduRhNSLOq2TXmB8XwqeY7zBrptA",
  authDomain: "pokedex-a2bd7.firebaseapp.com",
  projectId: "pokedex-a2bd7",
  storageBucket: "pokedex-a2bd7.appspot.com",
  messagingSenderId: "264243209467",
  appId: "1:264243209467:web:04f9816a31d15e9706bc5e",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase Auth and Google Provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
