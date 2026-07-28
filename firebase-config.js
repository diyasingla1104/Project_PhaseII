import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDV97ADwowkI1TGZPNBawajVbJw6B2HuDs",
  authDomain: "fitness-and-wellbeing-c5afb.firebaseapp.com",
  projectId: "fitness-and-wellbeing-c5afb",
  storageBucket: "fitness-and-wellbeing-c5afb.firebasestorage.app",
  messagingSenderId: "881837969586",
  appId: "1:881837969586:web:921f2790b9fc2094bfb9ab",
  measurementId: "G-9X77J112FL"
};

const isFirebaseConfigured = Object.values(firebaseConfig).every(
  (value) => typeof value === "string" && value && !value.startsWith("YOUR_")
);

const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;

export { firebaseConfig, isFirebaseConfigured, app, auth, db };
