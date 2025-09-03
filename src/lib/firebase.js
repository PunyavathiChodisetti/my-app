// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 🔴 keep your own config values here
const firebaseConfig = {
  apiKey: "AIzaSyDkgiHlduRhNSLOq2TXmB8XwqeY7zBrptA",
  authDomain: "pokedex-a2bd7.firebaseapp.com",
  projectId: "pokedex-a2bd7",
  storageBucket: "pokedex-a2bd7.appspot.com",
  messagingSenderId: "264243209467",
  appId: "1:264243209467:web:04f9816a31d15e9706bc5e",
};

// Avoid duplicate app during HMR
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
