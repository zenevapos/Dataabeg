import { NextRequest } from 'next/server';
import { firebaseConfig, isAuthorizedAdmin } from './firebase';

export interface VerifiedAdminResult {
  authorized: boolean;
  email?: string;
  uid?: string;
  error?: string;
}

/**
 * Verifies a Firebase ID token from the Authorization header via Google Identity Toolkit
 * and confirms the caller is one of the authorized DataAbeg admin emails.
 * Zero external SDK dependencies — 100% reliable on Vercel serverless functions.
 */
export async function verifyAdminRequest(req: NextRequest): Promise<VerifiedAdminResult> {
  const authHeader = req.headers.get('authorization') || '';
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

  if (!idToken) {
    return { authorized: false, error: 'Missing Authorization Bearer token.' };
  }

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
