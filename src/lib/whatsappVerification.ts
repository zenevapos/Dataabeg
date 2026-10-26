import { doc, setDoc, getDoc, updateDoc, onSnapshot, serverTimestamp, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from './firebase';
import { normalizePhone } from './utils';

export interface PhoneVerificationRecord {
  phone: string;
  intlPhone: string;
  code: string;
  verified: boolean;
  createdAt: number;
  expiresAt: number;
}

export const DATAABEG_WHATSAPP_NUMBER = '2348154276838'; // Business / automated WhatsApp number

// Persistent in-memory verification registry (attached to globalThis so all Next.js API chunks share state)
const globalWithStore = globalThis as unknown as {
  __dataabeg_phone_verifications?: Map<string, PhoneVerificationRecord>;
};
if (!globalWithStore.__dataabeg_phone_verifications) {
  globalWithStore.__dataabeg_phone_verifications = new Map();
}
const inMemoryStore = globalWithStore.__dataabeg_phone_verifications;

/**
 * Converts 08012345678 to 2348012345678
 */
export function toInternationalPhone(phone: string): string {
  const norm = normalizePhone(phone);
  if (norm.startsWith('0')) {
    return '234' + norm.slice(1);
  }
  return norm;
}

/**
 * Generates an uppercase verification code (e.g. VERIFY-4912)
 */
export function generateVerificationCode(): string {
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `VERIFY-${digits}`;
}

/**
 * Creates or updates a verification record in Firestore and in-memory store
 */
export async function createPhoneVerification(phone: string, targetWhatsAppNumber = DATAABEG_WHATSAPP_NUMBER) {
  const normPhone = normalizePhone(phone);
  const intlPhone = toInternationalPhone(phone);
  const code = generateVerificationCode();
  const now = Date.now();
  const expiresAt = now + 15 * 60 * 1000; // 15 minutes validity

  const record: PhoneVerificationRecord = {
    phone: normPhone,
    intlPhone,
    code,
    verified: false,
    createdAt: now,
    expiresAt,
  };

  // Always store in memory for high-availability lookup
  inMemoryStore.set(normPhone, { ...record });

  try {
    const docRef = doc(db, 'phone_verifications', normPhone);
    await setDoc(docRef, {
      ...record,
      serverTime: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    // Local storage fallback for local testing
    if (typeof window !== 'undefined') {
      localStorage.setItem(`dataabeg_verify_${normPhone}`, JSON.stringify(record));
    }
  }

  // Generate WhatsApp deep link with pre-filled code (e.g. https://wa.me/2348154276838?text=VERIFY-4912)
  const message = code;
  const whatsappUrl = `https://wa.me/${targetWhatsAppNumber}?text=${encodeURIComponent(message)}`;

  return {
    phone: normPhone,
    intlPhone,
    code,
    whatsappUrl,
    expiresAt
  };
}

/**
 * Check verification status
 */
export async function getVerificationStatus(phone: string): Promise<boolean> {
  const normPhone = normalizePhone(phone);

  // 1. Check in-memory store
  const mem = inMemoryStore.get(normPhone);
  if (mem && mem.verified) {
    return true;
  }

  // 2. Check Firestore
  try {
    const docRef = doc(db, 'phone_verifications', normPhone);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data?.verified === true) {
        if (mem) mem.verified = true;
        return true;
      }
    }
  } catch {
    // Graceful fallback to memory
  }

  return false;
}

/**
 * Real-time listener for verification status changes (0-latency instant trigger)
 */
export function subscribeToVerification(phone: string, onVerified: () => void) {
  const normPhone = normalizePhone(phone);
  const docRef = doc(db, 'phone_verifications', normPhone);

  const unsubscribe = onSnapshot(docRef, (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      if (data?.verified === true) {
        onVerified();
      }
    }
  }, (error) => {
    console.warn('Real-time verification listener fallback:', error);
  });

  return unsubscribe;
}

/**
 * Marks phone verification as complete in memory and Firestore
 */
export async function markPhoneVerified(phoneOrIntl: string, matchingCode?: string): Promise<boolean> {
  const normPhone = normalizePhone(phoneOrIntl);
  let isMatch = false;

  // 1. Update in-memory record
  const mem = inMemoryStore.get(normPhone);
  if (mem) {
    if (matchingCode) {
      const cleanInputCode = matchingCode.trim().toUpperCase().replace(/\s+/g, '');
      const cleanRecordCode = mem.code.trim().toUpperCase().replace(/\s+/g, '');
      if (cleanInputCode === cleanRecordCode) {
        mem.verified = true;
        isMatch = true;
      }
    } else {
      mem.verified = true;
      isMatch = true;
    }
  }

  // 2. Update Firestore record
  try {
    const docRef = doc(db, 'phone_verifications', normPhone);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as PhoneVerificationRecord;
      if (matchingCode) {
        const cleanInputCode = matchingCode.trim().toUpperCase().replace(/\s+/g, '');
        const cleanRecordCode = data.code.trim().toUpperCase().replace(/\s+/g, '');
        if (cleanInputCode !== cleanRecordCode) {
          return isMatch;
        }
      }

      await updateDoc(docRef, {
        verified: true,
        verifiedAt: Date.now()
      });
      isMatch = true;
    }
  } catch {
    // If Firestore rules are locked, in-memory match already succeeded
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(`dataabeg_verify_${normPhone}`, JSON.stringify({ phone: normPhone, verified: true }));
  }

  return isMatch;
}

/**
 * Handles incoming WhatsApp webhook messages:
 * Matches sender phone (msg.from) or code in message body (e.g. VERIFY-4912)
 * Marks verified: true in memory and Firestore instantly.
 */
export async function verifyByWebhookMessage(
  fromNumber: string,
  messageBody: string
): Promise<{ success: boolean; phone?: string; code?: string }> {
  try {
    // 1. Normalize fromNumber (e.g. 2348154276838 -> 08154276838)
    const cleanDigits = fromNumber.replace(/\D/g, '');
    let localFrom = cleanDigits;
    if (cleanDigits.startsWith('234') && cleanDigits.length === 13) {
      localFrom = '0' + cleanDigits.slice(3);
    }

    // 2. Extract verification code if contained in message
    const match = messageBody.toUpperCase().match(/(VERIFY[-\s]?\d{4,6}|ABEG[-\s]?\d{4,6})/);
    const extractedCode = match ? match[0].replace(/\s+/g, '-') : '';

    let matchedPhone = '';
    let matchedCode = '';

    // A. Check in-memory store by phone
    if (localFrom && inMemoryStore.has(localFrom)) {
      const rec = inMemoryStore.get(localFrom)!;
      rec.verified = true;
      matchedPhone = localFrom;
      matchedCode = rec.code;
    }

    // B. Check in-memory store by code
    if (!matchedPhone && extractedCode) {
      for (const [ph, rec] of inMemoryStore.entries()) {
        if (rec.code.toUpperCase() === extractedCode.toUpperCase()) {
          rec.verified = true;
          matchedPhone = ph;
          matchedCode = rec.code;
          break;
        }
      }
    }

    // C. Sync to Firestore
    try {
      if (localFrom) {
        const docRef = doc(db, 'phone_verifications', localFrom);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data() as PhoneVerificationRecord;
          await updateDoc(docRef, {
            verified: true,
            verifiedAt: Date.now(),
            verifiedVia: 'whatsapp_webhook'
          });
          matchedPhone = localFrom;
          matchedCode = data.code;
        }
      }

      if (!matchedPhone && extractedCode) {
        const colRef = collection(db, 'phone_verifications');
        const q = query(colRef, where('code', '==', extractedCode), limit(1));
        const querySnap = await getDocs(q);
        if (!querySnap.empty) {
          const matchDoc = querySnap.docs[0];
          await updateDoc(matchDoc.ref, {
            verified: true,
            verifiedAt: Date.now(),
            verifiedVia: 'whatsapp_webhook'
          });
          matchedPhone = matchDoc.id;
          matchedCode = extractedCode;
        }
      }
    } catch {
      // Graceful fallback to memory match
    }

    if (matchedPhone) {
      return { success: true, phone: matchedPhone, code: matchedCode };
    }

    return { success: false };
  } catch (err) {
    console.error('Error verifying by webhook message:', err);
    return { success: false };
  }
}
