'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider, isAuthorizedAdmin } from '@/lib/firebase';
import { getOrCreateUserProfile, updateUserProfilePhone, UserProfile } from '@/lib/firebaseDb';

const IMPERSONATE_STORAGE_KEY = 'dataabeg_admin_impersonate_uid';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  impersonatedUser: UserProfile | null;
  startImpersonation: (target: UserProfile) => void;
  stopImpersonation: () => void;
  signInWithGoogle: () => Promise<User | null>;
  signInWithEmail: (email: string, pass: string) => Promise<User>;
  signUpWithEmail: (email: string, pass: string, displayName?: string, phoneNumber?: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateUserPhone: (phoneNumber: string, phoneVerified?: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [impersonatedUser, setImpersonatedUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchTargetProfileByUid = async (uid: string): Promise<UserProfile | null> => {
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) {
        return snap.data() as UserProfile;
      }
    } catch (err) {
      console.warn('Could not fetch impersonated user profile:', err);
    }
    return null;
  };

  const fetchProfile = async (currentUser: User, customPhone?: string) => {
    try {
      // Check safe Admin Impersonation (strictly gated behind isAuthorizedAdmin)
      if (typeof window !== 'undefined' && isAuthorizedAdmin(currentUser.email)) {
        const targetUid = sessionStorage.getItem(IMPERSONATE_STORAGE_KEY);
        if (targetUid && targetUid !== currentUser.uid) {
          const targetProfile = await fetchTargetProfileByUid(targetUid);
          if (targetProfile) {
            setImpersonatedUser(targetProfile);
            setProfile(targetProfile);
            return;
          } else {
            sessionStorage.removeItem(IMPERSONATE_STORAGE_KEY);
          }
        }
      }

      setImpersonatedUser(null);
      const p = await getOrCreateUserProfile({
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName,
        photoURL: currentUser.photoURL,
        phoneNumber: customPhone || currentUser.phoneNumber
      });
      setProfile(p);
    } catch (err) {
      console.warn('Could not fetch user profile:', err);
    }
  };

  const isMobileOrWebView = () => {
    if (typeof window === 'undefined') return false;
    const ua = navigator.userAgent || '';
    const isTauri = !!(window as any).__TAURI_INTERNALS__ || /tauri/i.test(ua);
    const isMobile = /Android|iPhone|iPad|iPod|Mobile|wv/i.test(ua);
    return isTauri || isMobile;
  };

  useEffect(() => {
    // Check for redirect result from Google OAuth (essential on mobile WebView)
    getRedirectResult(auth)
      .then(async (result) => {
        if (result && result.user) {
          setUser(result.user);
          await fetchProfile(result.user);
        }
      })
      .catch((err) => {
        console.warn('Redirect auth result notice:', err);
      });

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser);
      } else {
        setProfile(null);
        setImpersonatedUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const startImpersonation = (target: UserProfile) => {
    if (!user || !isAuthorizedAdmin(user.email)) return;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(IMPERSONATE_STORAGE_KEY, target.uid);
    }
    setImpersonatedUser(target);
    setProfile(target);
    fetchTargetProfileByUid(target.uid).then((fresh) => {
      if (fresh) {
        setImpersonatedUser(fresh);
        setProfile(fresh);
      }
    });
  };

  const stopImpersonation = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(IMPERSONATE_STORAGE_KEY);
    }
    setImpersonatedUser(null);
    if (user) {
      fetchProfile(user);
    }
  };

  const signInWithGoogle = async (): Promise<User | null> => {
    if (isMobileOrWebView()) {
      await signInWithRedirect(auth, googleProvider);
      return null;
    }
    const cred = await signInWithPopup(auth, googleProvider);
    await fetchProfile(cred.user);
    return cred.user;
  };

  const signInWithEmail = async (email: string, pass: string): Promise<User> => {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    await fetchProfile(cred.user);
    return cred.user;
  };

  const signUpWithEmail = async (email: string, pass: string, displayName?: string, phoneNumber?: string): Promise<User> => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (displayName) {
      await updateProfile(cred.user, { displayName });
    }
    await fetchProfile(cred.user, phoneNumber);
    return cred.user;
  };

  const logout = async (): Promise<void> => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(IMPERSONATE_STORAGE_KEY);
    }
    await signOut(auth);
    setUser(null);
    setProfile(null);
    setImpersonatedUser(null);
  };

  const refreshProfile = async (): Promise<void> => {
    if (user) {
      await fetchProfile(user);
    }
  };

  const updateUserPhone = async (phoneNumber: string, phoneVerified = true): Promise<void> => {
    if (!user) return;
    const targetUid = impersonatedUser?.uid || user.uid;
    await updateUserProfilePhone(targetUid, phoneNumber, phoneVerified);
    setProfile((prev) => (prev ? { ...prev, phoneNumber, phoneVerified } : null));
    if (impersonatedUser) {
      setImpersonatedUser((prev) => (prev ? { ...prev, phoneNumber, phoneVerified } : null));
    }
    if (typeof window !== 'undefined' && !impersonatedUser) {
      localStorage.setItem('dataabeg_phone', phoneNumber);
    }
  };

  const isAdmin = isAuthorizedAdmin(user?.email);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin,
        loading,
        impersonatedUser,
        startImpersonation,
        stopImpersonation,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        logout,
        refreshProfile,
        updateUserPhone
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
