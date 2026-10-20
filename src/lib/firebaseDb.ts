import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
  where,
  updateDoc,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from './firebase';
import { Transaction } from './types';

export interface AdminSettings {
  smeplugApiKey: string;
  momoAccountNumber: string;
  momoAccountName: string;
  smartcashAccountNumber: string;
  smartcashAccountName: string;
  supportPhone: string;
  adminPin: string;
  globalDiscountNotice: string;
}

export const DEFAULT_ADMIN_SETTINGS: AdminSettings = {
  smeplugApiKey: '',
  momoAccountNumber: '08154276838',
  momoAccountName: 'DataAbeg MoMo PSB',
  smartcashAccountNumber: '08154276838',
  smartcashAccountName: 'DataAbeg Smartcash',
  supportPhone: '08154276838',
  adminPin: 'salam2026',
  globalDiscountNotice: '⚡ Save up to 71% • Direct Bank Transfer & Instant Debit Card Automated Dispenser'
};

/**
 * Save new transaction to Firestore
 */
export async function saveOrderToFirestore(tx: Transaction): Promise<void> {
  try {
    const orderRef = doc(db, 'orders', tx.reference);
    const normalizedData = {
      ...tx,
      id: tx.id || tx.reference,
      reference: tx.reference,
      smeplugReference: tx.smeplugReference || '',
      network: tx.network || tx.networkName || 'MTN',
      networkName: tx.networkName || tx.network || 'MTN',
      phone: tx.phone || tx.phoneNumber || '',
      phoneNumber: tx.phoneNumber || tx.phone || '',
      planName: tx.planName || '',
      planSize: tx.planSize || '',
      amount: tx.amount || tx.amountPaid || 0,
      amountPaid: tx.amountPaid || tx.amount || 0,
      status: (tx.status === 'successful' || tx.status === 'SUCCESS') ? 'SUCCESS' : tx.status === 'failed' ? 'FAILED' : 'PENDING',
      statusMessage: tx.statusMessage || '',
      paymentMethod: tx.paymentMethod || 'MOMO_PSB',
      timestamp: tx.timestamp || tx.createdAt || new Date().toISOString(),
      createdAt: tx.createdAt || new Date().toISOString(),
      updatedAt: serverTimestamp()
    };
    await setDoc(orderRef, normalizedData, { merge: true });
  } catch (err) {
    console.warn('Could not save order to Firestore:', err);
  }
}

/**
 * Fetch all orders from Firestore (for /admin-salam)
 */
export async function fetchAllOrdersFromFirestore(max: number = 100): Promise<Transaction[]> {
  try {
    const ordersCol = collection(db, 'orders');
    const q = query(ordersCol, limit(max));
    const snap = await getDocs(q);
    const orders: Transaction[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data() as Transaction;
      orders.push({
        ...data,
        phoneNumber: data.phoneNumber || data.phone || '',
        phone: data.phone || data.phoneNumber || '',
        networkName: data.networkName || (data.network as string) || 'MTN',
        amountPaid: data.amountPaid || data.amount || 0,
        timestamp: data.timestamp || data.createdAt || new Date().toISOString()
      });
    });
    // Sort descending by timestamp
    return orders.sort((a, b) => {
      const timeA = new Date(a.timestamp || a.createdAt || 0).getTime();
      const timeB = new Date(b.timestamp || b.createdAt || 0).getTime();
      return timeB - timeA;
    });
  } catch (err) {
    console.warn('Error fetching all orders from Firestore:', err);
    return [];
  }
}

/**
 * Fetch orders by phone number (for customer tracking)
 */
export async function fetchOrdersByPhone(phone: string): Promise<Transaction[]> {
  try {
    const ordersCol = collection(db, 'orders');
    const q = query(ordersCol, where('phoneNumber', '==', phone), limit(20));
    const snap = await getDocs(q);
    const orders: Transaction[] = [];
    snap.forEach((docSnap) => {
      orders.push(docSnap.data() as Transaction);
    });
    return orders.sort((a, b) => {
      const timeA = new Date(a.timestamp || a.createdAt || 0).getTime();
      const timeB = new Date(b.timestamp || b.createdAt || 0).getTime();
      return timeB - timeA;
    });
  } catch (err) {
    console.warn('Error fetching orders by phone:', err);
    return [];
  }
}

/**
 * Update an order's status (for /admin-salam)
 */
export async function updateOrderStatusInFirestore(
  reference: string,
  status: 'SUCCESS' | 'PENDING' | 'FAILED' | 'PROCESSING',
  notes?: string
): Promise<void> {
  try {
    const orderRef = doc(db, 'orders', reference);
    await updateDoc(orderRef, {
      status,
      ...(notes ? { notes } : {}),
      updatedAt: serverTimestamp()
    });
  } catch (err) {
    console.error('Error updating order status in Firestore:', err);
    throw err;
  }
}

/**
 * Get Admin settings from Firestore
 */
export async function getAdminSettings(): Promise<AdminSettings> {
  try {
    const settingsRef = doc(db, 'settings', 'general');
    const snap = await getDoc(settingsRef);
    if (snap.exists()) {
      return { ...DEFAULT_ADMIN_SETTINGS, ...snap.data() } as AdminSettings;
    }
    return DEFAULT_ADMIN_SETTINGS;
  } catch (err) {
    console.warn('Error fetching admin settings from Firestore:', err);
    return DEFAULT_ADMIN_SETTINGS;
  }
}

/**
 * User Profile Interface
 */
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  walletBalance: number;
  momoVirtualAccount?: string;
  smartcashVirtualAccount?: string;
  createdAt: string;
}

/**
 * Local storage keys for graceful offline / unconfigured Firestore rules fallback
 */
const PROFILE_LOCAL_KEY = 'dataabeg_user_profile_';
const ORDERS_LOCAL_KEY = 'dataabeg_user_orders_';

/**
 * Get or create User Profile in Firestore with resilient fallback
 */
export async function getOrCreateUserProfile(user: {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  phoneNumber?: string | null;
}): Promise<UserProfile> {
  const localCached = typeof window !== 'undefined' ? localStorage.getItem(PROFILE_LOCAL_KEY + user.uid) : null;
  let fallbackProfile: UserProfile = localCached
    ? JSON.parse(localCached)
    : {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || user.email?.split('@')[0] || 'User',
        photoURL: user.photoURL || '',
        phoneNumber: user.phoneNumber || '08154276838',
        walletBalance: 0,
        momoVirtualAccount: '671' + (user.phoneNumber ? user.phoneNumber.slice(-8) : Math.floor(10000000 + Math.random() * 90000000).toString()),
        smartcashVirtualAccount: '90' + (user.phoneNumber ? user.phoneNumber.slice(-8) : Math.floor(10000000 + Math.random() * 90000000).toString()),
        createdAt: new Date().toISOString()
      };

  try {
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      const dbProfile = snap.data() as UserProfile;
      if (typeof window !== 'undefined') {
        localStorage.setItem(PROFILE_LOCAL_KEY + user.uid, JSON.stringify(dbProfile));
      }
      return dbProfile;
    }

    // Try writing new profile
    await setDoc(userRef, {
      ...fallbackProfile,
      updatedAt: serverTimestamp()
    });

    if (typeof window !== 'undefined') {
      localStorage.setItem(PROFILE_LOCAL_KEY + user.uid, JSON.stringify(fallbackProfile));
    }
    return fallbackProfile;
  } catch (err: any) {
    // Graceful permission or network fallback
    if (err?.code === 'permission-denied') {
      console.warn('Firestore permissions not yet published. Using local session profile.');
    } else {
      console.warn('Notice: Firestore profile read fallback:', err?.message || err);
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(PROFILE_LOCAL_KEY + user.uid, JSON.stringify(fallbackProfile));
    }
    return fallbackProfile;
  }
}

/**
 * Fetch orders for a specific user (by UID or email)
 */
export async function fetchOrdersByUser(uid: string, email?: string): Promise<Transaction[]> {
  try {
    const ordersCol = collection(db, 'orders');
    // First query by userId
    const q1 = query(ordersCol, where('userId', '==', uid), limit(50));
    const snap1 = await getDocs(q1);
    const ordersMap = new Map<string, Transaction>();

    snap1.forEach((docSnap) => {
      ordersMap.set(docSnap.id, docSnap.data() as Transaction);
    });

    if (email) {
      try {
        const q2 = query(ordersCol, where('userEmail', '==', email), limit(50));
        const snap2 = await getDocs(q2);
        snap2.forEach((docSnap) => {
          ordersMap.set(docSnap.id, docSnap.data() as Transaction);
        });
      } catch (_) {
        // ignore secondary email query permissions
      }
    }

    const orders = Array.from(ordersMap.values());
    if (orders.length > 0 && typeof window !== 'undefined') {
      localStorage.setItem(ORDERS_LOCAL_KEY + uid, JSON.stringify(orders));
    }
    return orders.sort((a, b) => {
      const timeA = new Date(a.timestamp || a.createdAt || 0).getTime();
      const timeB = new Date(b.timestamp || b.createdAt || 0).getTime();
      return timeB - timeA;
    });
  } catch (err: any) {
    // Fallback to local storage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(ORDERS_LOCAL_KEY + uid);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (_) {}
      }
    }
    return [];
  }
}

/**
 * Update user wallet balance in Firestore
 */
export async function updateUserWalletBalance(uid: string, newBalance: number): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      walletBalance: newBalance,
      updatedAt: serverTimestamp()
    });
  } catch (err) {
    console.error('Error updating user wallet:', err);
    throw err;
  }
}

/**
 * Save Admin settings to Firestore
 */
export async function saveAdminSettings(settings: Partial<AdminSettings>): Promise<void> {
  try {
    const settingsRef = doc(db, 'settings', 'general');
    await setDoc(settingsRef, {
      ...settings,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.error('Error saving admin settings to Firestore:', err);
    throw err;
  }
}


