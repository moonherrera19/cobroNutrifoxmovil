import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB986pc2GSbwLb6zlHSkZgCNMp6cRiZ6lw",
  authDomain: "gestor-de-becas.firebaseapp.com",
  projectId: "gestor-de-becas",
  storageBucket: "gestor-de-becas.firebasestorage.app",
  messagingSenderId: "358752443254",
  appId: "1:358752443254:web:a6c22f98505a78c1a17857",
  measurementId: "G-X709HKRP10"
};
const app = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(app);
export const FIRESTORE_DB = getFirestore(app);
