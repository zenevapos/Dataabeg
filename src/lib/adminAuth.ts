import { NextRequest } from 'next/server';
import { getAdminAuth } from './firebaseAdmin';
import { firebaseConfig, isAuthorizedAdmin } from './firebase';

export interface VerifiedAdminResult {
  authorized: boolean;
  email?: string;
  uid?: string;
  error?: string;
}

/**
 * Verifies a Firebase ID token from the Authorization header and confirms
 * the caller is one of the authorized DataAbeg admin emails.
 * Works both with Firebase Admin SDK and via Firebase Identity Toolkit fallback.
 */
export async function verifyAdminRequest(req: NextRequest): Promise<VerifiedAdminResult> {
  const authHeader = req.headers.get('authorization') || '';
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

  if (!idToken) {
    return { authorized: false, error: 'Missing Authorization Bearer token.' };
  }

  // 1. Prefer Firebase Admin SDK if configured
  const adminAuth = getAdminAuth();
  if (adminAuth) {
    try {
      const decoded = await adminAuth.verifyIdToken(idToken);
      if (!isAuthorizedAdmin(decoded.email)) {
        return { authorized: false, error: 'Forbidden: Not an authorized admin account.' };
      }
      return { authorized: true, email: decoded.email, uid: decoded.uid };
    } catch {
      return { authorized: false, error: 'Invalid or expired Firebase ID token.' };
    }
  }

  // 2. Fallback: verify ID token directly with Google Identity Toolkit
  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(firebaseConfig.apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
        cache: 'no-store'
      }
    );
    const data = await res.json();
    const userRecord = data?.users?.[0];
    if (!res.ok || !userRecord?.email) {
      return { authorized: false, error: 'Invalid or expired Firebase session.' };
    }
    if (!isAuthorizedAdmin(userRecord.email)) {
      return { authorized: false, error: 'Forbidden: Not an authorized admin account.' };
    }
    return { authorized: true, email: userRecord.email, uid: userRecord.localId };
  } catch {
    return { authorized: false, error: 'Could not verify admin authentication.' };
  }
}
