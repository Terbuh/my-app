// Import wymaganych funkcji Firebase
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Konfiguracja Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDP55_YdqL1pEMyhsrxd89z9ppOGpNfOe4",
    authDomain: "kantor-9243d.firebaseapp.com",
    projectId: "kantor-9243d",
    storageBucket: "kantor-9243d.appspot.com",
    messagingSenderId: "122534481918",
    appId: "1:122534481918:web:2794dc4cd183a18df4faaf",
};

// Inicjalizacja Firebase
const app = initializeApp(firebaseConfig);

// Inicjalizacja usług Firebase
export const auth = getAuth(app); // Eksport Auth
export const db = getFirestore(app); // Eksport Firestore
