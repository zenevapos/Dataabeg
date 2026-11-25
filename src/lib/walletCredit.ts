import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, firebaseConfig } from './firebase';
import { saveOrderToFirestore } from './firebaseDb';

const FIRESTORE_REST_BASE = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents`;

/**
 * Update a user's walletBalance via Firestore REST API using the user's Firebase ID Token.
 * This satisfies `request.auth != null && request.auth.uid == userId` in firestore.rules
 * without needing Firebase Admin service account credentials on serverless routes.
 */
async function updateWalletWithIdToken(
  uid: string,
  newBalance: number,
  idToken: string
): Promise<boolean> {
  try {
    const url = `${FIRESTORE_REST_BASE}/users/${encodeURIComponent(uid)}?updateMask.fieldPaths=walletBalance`;
    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`
      },
      body: JSON.stringify({
        fields: {
          walletBalance: { doubleValue: newBalance }
        }
      }),
      cache: 'no-store'
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.warn(`Firestore REST wallet update failed (${res.status}):`, errText);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Firestore REST wallet update error:', err);
    return false;
  }
}

/**
 * Idempotently credit a user's wallet after a verified Paystack payment.
 * Prevents double-crediting if both /api/paystack/verify and /api/paystack/webhook run.
 */
export async function creditWalletIdempotently(params: {
  uid: string;
  amount: number;
  paymentRef: string;
  customerEmail?: string;
  channel?: string;
  firebaseIdToken?: string;
}): Promise<{
  credited: boolean;
  alreadyCredited: boolean;
  newBalance: number;
  requiresClientSync: boolean;
}> {
  const { uid, amount, paymentRef, customerEmail, channel = 'card', firebaseIdToken } = params;

  // 1. Check idempotency: has this paymentRef already been credited?
  let existingOrder: Record<string, any> | null = null;
  try {
    const orderSnap = await getDoc(doc(db, 'orders', paymentRef));
    if (orderSnap.exists()) {
      existingOrder = orderSnap.data();
      if (existingOrder?.walletCredited === true) {
        const userSnap = await getDoc(doc(db, 'users', uid));
        const existingBalance = userSnap.exists() ? Number(userSnap.data().walletBalance || 0) : 0;
        return {
          credited: true,
          alreadyCredited: true,
          newBalance: existingBalance,
          requiresClientSync: false
        };
      }
    }
  } catch (err) {
    console.warn('Could not check existing order for idempotency:', err);
  }

  // 2. Read current user wallet balance
  let currentBalance = 0;
  let userPhone = '';
  try {
    const userSnap = await getDoc(doc(db, 'users', uid));
    if (userSnap.exists()) {
      const data = userSnap.data();
      currentBalance = Number(data.walletBalance || 0);
      userPhone = data.phoneNumber || '';
    }
  } catch (err) {
    console.warn('Could not read user profile before crediting:', err);
  }

  const newBalance = Math.round((currentBalance + amount) * 100) / 100;
  let walletUpdated = false;

  // 3. Try updating user's walletBalance using the user's Firebase ID token (satisfies firestore.rules)
  if (firebaseIdToken) {
    walletUpdated = await updateWalletWithIdToken(uid, newBalance, firebaseIdToken);
  }

  // 4. Fallback: try standard Firestore SDK write (works if rules allow or admin context)
  if (!walletUpdated) {
    try {
      const userRef = doc(db, 'users', uid);
      await setDoc(
        userRef,
        {
          walletBalance: newBalance,
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );
      walletUpdated = true;
    } catch (err: any) {
      console.warn('Direct Firestore SDK wallet write blocked by rules:', err?.code || err?.message);
    }
  }

  // 5. Record the verified funding transaction in `orders` collection
  // If walletUpdated is true, mark walletCredited: true so it can never be credited twice.
  try {
    const orderPayload: any = {
      id: paymentRef,
      reference: paymentRef,
      userId: uid,
      userEmail: customerEmail || '',
      network: 'Paystack',
      networkName: 'Paystack',
      phone: userPhone || customerEmail || 'Wallet Top-up',
      phoneNumber: userPhone || customerEmail || 'Wallet Top-up',
      planName: `Instant Wallet Funding (Paystack ${channel.toUpperCase()})`,
      planSize: `+₦${amount.toLocaleString()}`,
      amount,
      amountPaid: amount,
      status: 'SUCCESS',
      statusMessage: walletUpdated
        ? `Successfully credited ₦${amount.toLocaleString()} to wallet balance.`
        : `Payment verified (₦${amount.toLocaleString()}); awaiting wallet sync.`,
      paymentMethod: 'PAYSTACK',
      createdAt: existingOrder?.createdAt || new Date().toISOString(),
      completedAt: new Date().toISOString(),
      serviceType: 'wallet_funding',
      walletCredited: walletUpdated
    };

    if (firebaseIdToken && existingOrder) {
      // Update existing order doc using user's token
      const orderUrl = `${FIRESTORE_REST_BASE}/orders/${encodeURIComponent(paymentRef)}?updateMask.fieldPaths=walletCredited&updateMask.fieldPaths=statusMessage`;
      await fetch(orderUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${firebaseIdToken}`
        },
        body: JSON.stringify({
          fields: {
            walletCredited: { booleanValue: walletUpdated },
            statusMessage: { stringValue: orderPayload.statusMessage }
          }
        }),
        cache: 'no-store'
      });
    } else {
      await saveOrderToFirestore(orderPayload);
    }
  } catch (err) {
    console.warn('Could not record wallet funding order:', err);
  }

  return {
    credited: walletUpdated,
    alreadyCredited: false,
    newBalance,
    requiresClientSync: !walletUpdated
  };
}
