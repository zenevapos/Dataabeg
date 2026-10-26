import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth, GoogleAuthProvider } from "firebase/auth";

// Admin authorized emails (Restricted to these two emails only)
export const ADMIN_EMAILS = [
  "kokoroowoabdulsalam@gmail.com",
  "belloimam431@gmail.com"
];

export const ADMIN_EMAIL = ADMIN_EMAILS[0];

export function isAuthorizedAdmin(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.toLowerCase().trim();
  return ADMIN_EMAILS.some((adm) => adm.toLowerCase().trim() === normalized);
}

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyD_8yhjcZg_kJHi6-v6xZFPh77o2pM46qo",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "dataabeg-41f9b.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "dataabeg-41f9b",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "dataabeg-41f9b.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "545510705100",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:545510705100:web:8a4a1c0b6c9dc2f0067f69",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-J26SL3W4QJ"
};

// Initialize Firebase safely for SSR/Client in Next.js
export const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db: Firestore = getFirestore(app);
export const auth: Auth = getAuth(app);
export const googleProvider: GoogleAuthProvider = new GoogleAuthProvider();
