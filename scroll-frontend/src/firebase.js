// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyC7cDPFjhqJ3vroXw3mvbH8VmcNV8xTVDc",
    authDomain: "scroll-29988.firebaseapp.com",
    projectId: "scroll-29988",
    storageBucket: "scroll-29988.firebasestorage.app",
    messagingSenderId: "352219726895",
    appId: "1:352219726895:web:2d716615d37a9a3169f2da"
};

// Inizializza Firebase
const app = initializeApp(firebaseConfig);
// Esporta l'istanza di Auth già pronta per essere usata ovunque
export const auth = getAuth(app);