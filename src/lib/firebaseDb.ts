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
  globalDiscountNotice: '⚡ Save up to 71% • Direct MoMo PSB (671) & Smartcash Virtual Funding'
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
