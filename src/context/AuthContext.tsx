'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider, ADMIN_EMAIL, isAuthorizedAdmin } from '@/lib/firebase';
import { getOrCreateUserProfile, updateUserProfilePhone, UserProfile } from '@/lib/firebaseDb';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<User>;
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
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProfile = async (currentUser: User, customPhone?: string) => {
    try {
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (): Promise<User> => {
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
    await signOut(auth);
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async (): Promise<void> => {
    if (user) {
      await fetchProfile(user);
    }
  };

  const updateUserPhone = async (phoneNumber: string, phoneVerified = true): Promise<void> => {
    if (!user) return;
    await updateUserProfilePhone(user.uid, phoneNumber, phoneVerified);
    setProfile((prev) => (prev ? { ...prev, phoneNumber, phoneVerified } : null));
    if (typeof window !== 'undefined') {
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
