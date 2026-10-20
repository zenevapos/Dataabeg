import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth, GoogleAuthProvider } from "firebase/auth";

// Admin authorized email
export const ADMIN_EMAIL = "kokoroowoabdulsalam@gmail.com";

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyD_8yhjcZg_kJHi6-v6xZFPh77o2pM46qo",
  authDomain: "dataabeg-41f9b.firebaseapp.com",
  projectId: "dataabeg-41f9b",
  storageBucket: "dataabeg-41f9b.firebasestorage.app",
  messagingSenderId: "545510705100",
  appId: "1:545510705100:web:8a4a1c0b6c9dc2f0067f69",
  measurementId: "G-J26SL3W4QJ"
};

// Initialize Firebase safely for SSR/Client in Next.js
export const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db: Firestore = getFirestore(app);
export const auth: Auth = getAuth(app);
export const googleProvider: GoogleAuthProvider = new GoogleAuthProvider();
