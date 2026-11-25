import crypto from 'crypto';

/**
 * Zero-dependency Firebase Admin client using Node's built-in `crypto` + Firestore REST API.
 * Completely avoids `firebase-admin` / gRPC / Webpack serverless bundling crashes on Vercel
 * while having full Firebase Admin Service Account privileges (bypasses Firestore rules).
 */

interface ServiceAccount {
  project_id: string;
  client_email: string;
  private_key: string;
}

let cachedServiceAccount: ServiceAccount | null | undefined = undefined;
let cachedAccessToken: { token: string; expiresAt: number } | null = null;

function parseServiceAccount(): ServiceAccount | null {
  if (cachedServiceAccount !== undefined) return cachedServiceAccount;

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (raw && raw.trim()) {
    try {
      const trimmed = raw.trim();
      const jsonStr = trimmed.startsWith('{')
        ? trimmed
        : Buffer.from(trimmed, 'base64').toString('utf8');
      const parsed = JSON.parse(jsonStr);
      if (parsed.private_key && parsed.client_email) {
        cachedServiceAccount = {
          project_id: parsed.project_id || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'dataabeg-41f9b',
          client_email: parsed.client_email,
          private_key: String(parsed.private_key).replace(/\\n/g, '\n')
        };
        return cachedServiceAccount;
      }
    } catch (err) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', err);
    }
  }

  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'dataabeg-41f9b';

  if (clientEmail && privateKey) {
    cachedServiceAccount = {
      project_id: projectId,
      client_email: clientEmail,
      private_key: privateKey.replace(/\\n/g, '\n')
    };
    return cachedServiceAccount;
  }

  cachedServiceAccount = null;
  return null;
}

export function isFirebaseAdminConfigured(): boolean {
  return parseServiceAccount() !== null;
}

function base64UrlEncode(input: string | Buffer): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

/**
 * Generates a short-lived Google OAuth2 Access Token with full Firestore Admin scope
 * using the Firebase Service Account private key.
 */
export async function getAdminAccessToken(): Promise<{ token: string; projectId: string } | null> {
  const sa = parseServiceAccount();
  if (!sa) return null;

  const now = Math.floor(Date.now() / 1000);
  if (cachedAccessToken && cachedAccessToken.expiresAt > now + 120) {
    return { token: cachedAccessToken.token, projectId: sa.project_id };
  }

  try {
    const header = base64UrlEncode(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
    const claimSet = base64UrlEncode(
      JSON.stringify({
        iss: sa.client_email,
        scope: 'https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/cloud-platform',
        aud: 'https://oauth2.googleapis.com/token',
        exp: now + 3600,
        iat: now
      })
    );

    const unsignedJwt = `${header}.${claimSet}`;
    const signer = crypto.createSign('RSA-SHA256');
    signer.update(unsignedJwt);
    const signature = base64UrlEncode(signer.sign(sa.private_key));
    const assertion = `${unsignedJwt}.${signature}`;

    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${encodeURIComponent(assertion)}`,
      cache: 'no-store'
    });

    const json = await res.json();
    if (!res.ok || !json.access_token) {
      console.error('Failed to obtain Google Admin access token:', json);
      return null;
    }

    cachedAccessToken = {
      token: json.access_token,
      expiresAt: now + Number(json.expires_in || 3600)
    };
    return { token: cachedAccessToken.token, projectId: sa.project_id };
  } catch (err) {
    console.error('Error signing Google Admin JWT:', err);
    return null;
  }
}

/**
 * Convert plain JS values into Firestore REST API Value objects
 */
export function toFirestoreValue(val: any): Record<string, any> {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === 'boolean') return { booleanValue: val };
  if (typeof val === 'number') {
    return Number.isInteger(val) ? { integerValue: String(val) } : { doubleValue: val };
  }
  if (typeof val === 'string') return { stringValue: val };
  if (Array.isArray(val)) {
    return { arrayValue: { values: val.map(toFirestoreValue) } };
  }
  if (typeof val === 'object') {
    const fields: Record<string, any> = {};
    for (const [k, v] of Object.entries(val)) {
      if (v !== undefined) fields[k] = toFirestoreValue(v);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

export function fromFirestoreValue(val: any): any {
  if (!val || typeof val !== 'object') return null;
  if ('stringValue' in val) return val.stringValue;
  if ('integerValue' in val) return Number(val.integerValue);
  if ('doubleValue' in val) return Number(val.doubleValue);
  if ('booleanValue' in val) return Boolean(val.booleanValue);
  if ('nullValue' in val) return null;
  if ('timestampValue' in val) return val.timestampValue;
  if ('arrayValue' in val) return (val.arrayValue?.values || []).map(fromFirestoreValue);
  if ('mapValue' in val) {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(val.mapValue?.fields || {})) {
      out[k] = fromFirestoreValue(v);
    }
    return out;
  }
  return null;
}

export function fromFirestoreDoc(docJson: any): Record<string, any> | null {
  if (!docJson?.fields) return null;
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(docJson.fields)) {
    out[k] = fromFirestoreValue(v);
  }
  return out;
}

export async function adminGetDoc(collectionPath: string, docId: string): Promise<Record<string, any> | null> {
  const auth = await getAdminAccessToken();
  if (!auth) return null;
  const url = `https://firestore.googleapis.com/v1/projects/${auth.projectId}/databases/(default)/documents/${collectionPath}/${encodeURIComponent(docId)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${auth.token}` },
    cache: 'no-store'
  });
  if (res.status === 404) return null;
  if (!res.ok) return null;
  const json = await res.json();
  return fromFirestoreDoc(json);
}

export async function adminPatchDoc(
  collectionPath: string,
  docId: string,
  data: Record<string, any>
): Promise<boolean> {
  const auth = await getAdminAccessToken();
  if (!auth) return false;

  const entries = Object.entries(data).filter(([, v]) => v !== undefined);
  const maskParams = entries
    .map(([k]) => `updateMask.fieldPaths=${encodeURIComponent(k)}`)
    .join('&');
  const fields: Record<string, any> = {};
  for (const [k, v] of entries) {
    fields[k] = toFirestoreValue(v);
  }

  const url = `https://firestore.googleapis.com/v1/projects/${auth.projectId}/databases/(default)/documents/${collectionPath}/${encodeURIComponent(docId)}?${maskParams}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${auth.token}`
    },
    body: JSON.stringify({ fields }),
    cache: 'no-store'
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    console.error(`Admin Firestore PATCH ${collectionPath}/${docId} failed (${res.status}):`, errText);
    return false;
  }
  return true;
}
