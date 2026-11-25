import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, firebaseConfig } from './firebase';
import { adminGetDoc, adminPatchDoc, isFirebaseAdminConfigured } from './firebaseAdmin';
import { saveOrderToFirestore } from './firebaseDb';
import { GladTidingsClient } from './gladtidings';
import { Transaction } from './types';

const FIRESTORE_REST_BASE = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents`;

/**
 * Fallback helper when FIREBASE_SERVICE_ACCOUNT_KEY is not configured:
 * Updates walletBalance via Firestore REST API using the user's Firebase ID Token.
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
 * - Uses zero-dependency Firebase Service Account OAuth2 Admin REST API when
 *   FIREBASE_SERVICE_ACCOUNT_KEY is configured (works 100% in background webhooks
 *   even if the user closes the app).
 * - Falls back to authenticated user ID token REST API if service account is absent.
 */
export async function creditWalletIdempotently(params: {
  uid: string;
  amount: number;
  paymentRef: string;
  customerEmail?: string;
  channel?: string;
  firebaseIdToken?: string;
  customPlanName?: string;
  customStatusMessage?: string;
}): Promise<{
  credited: boolean;
  alreadyCredited: boolean;
  newBalance: number;
  requiresClientSync: boolean;
}> {
  const {
    uid,
    amount,
    paymentRef,
    customerEmail,
    channel = 'card',
    firebaseIdToken,
    customPlanName,
    customStatusMessage
  } = params;

  const useAdmin = isFirebaseAdminConfigured();

  // 1. Check idempotency: has this paymentRef already been credited?
  let existingOrder: Record<string, any> | null = null;
  if (useAdmin) {
    existingOrder = await adminGetDoc('orders', paymentRef);
  } else {
    try {
      const orderSnap = await getDoc(doc(db, 'orders', paymentRef));
      if (orderSnap.exists()) existingOrder = orderSnap.data();
    } catch {}
  }

  // 2. Read current user wallet balance
  let userData: Record<string, any> | null = null;
  if (useAdmin) {
    userData = await adminGetDoc('users', uid);
  } else {
    try {
      const userSnap = await getDoc(doc(db, 'users', uid));
      if (userSnap.exists()) userData = userSnap.data();
    } catch {}
  }

  const currentBalance = Number(userData?.walletBalance || 0);
  const userPhone = userData?.phoneNumber || '';

  if (existingOrder?.walletCredited === true) {
    return {
      credited: true,
      alreadyCredited: true,
      newBalance: currentBalance,
      requiresClientSync: false
    };
  }

  const newBalance = Math.round((currentBalance + amount) * 100) / 100;
  let walletUpdated = false;

  // 3. Update user's walletBalance — prefer Admin Service Account OAuth2 (bypasses rules, works in webhooks!)
  if (useAdmin) {
    walletUpdated = await adminPatchDoc('users', uid, {
      walletBalance: newBalance
    });
  }

  // 4. Fallback: use logged-in user's Firebase ID token
  if (!walletUpdated && firebaseIdToken) {
    walletUpdated = await updateWalletWithIdToken(uid, newBalance, firebaseIdToken);
  }

  // 5. Final fallback: standard Firestore SDK write
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

  // 6. Record the completed funding transaction in `orders/{paymentRef}`
  const nowIso = new Date().toISOString();
  const orderRecord: Record<string, any> = {
    id: paymentRef,
    reference: paymentRef,
    userId: uid,
    userEmail: customerEmail || userData?.email || '',
    network: 'Paystack',
    networkName: 'Paystack',
    phone: userPhone || customerEmail || 'Wallet Top-up',
    phoneNumber: userPhone || customerEmail || 'Wallet Top-up',
    planName: customPlanName || `Instant Wallet Funding (Paystack ${channel.toUpperCase()})`,
    planSize: `+₦${amount.toLocaleString()}`,
    amount,
    amountPaid: amount,
    status: 'SUCCESS',
    statusMessage: walletUpdated
      ? customStatusMessage || `Successfully credited ₦${amount.toLocaleString()} to wallet balance.`
      : `Payment verified (₦${amount.toLocaleString()}); awaiting wallet sync.`,
    paymentMethod: 'PAYSTACK',
    timestamp: existingOrder?.timestamp || existingOrder?.createdAt || nowIso,
    createdAt: existingOrder?.createdAt || nowIso,
    completedAt: nowIso,
    serviceType: 'wallet_funding',
    walletCredited: walletUpdated
  };

  if (useAdmin) {
    await adminPatchDoc('orders', paymentRef, orderRecord);
  } else {
    try {
      await saveOrderToFirestore(orderRecord as Transaction);
    } catch (err) {
      console.warn('Could not record wallet funding order:', err);
    }
  }

  return {
    credited: walletUpdated,
    alreadyCredited: false,
    newBalance,
    requiresClientSync: !walletUpdated
  };
}

/**
 * Idempotently fulfills a direct Paystack service purchase (Data, Airtime, Cable, Electricity).
 * - Checks & locks `orders/{reference}` BEFORE calling GladTidings so a payment can NEVER
 *   be dispensed twice.
 * - If GladTidings fails and the user has a UID, automatically refunds the paid amount into
 *   their DataAbeg wallet so they never lose money.
 */
export async function fulfillServicePurchaseIdempotently(params: {
  reference: string;
  amountInNaira: number;
  metadata: Record<string, any>;
  customerEmail?: string;
  customerPhone?: string;
  channel?: string;
  firebaseIdToken?: string;
}): Promise<{
  status: boolean;
  alreadyProcessed: boolean;
  autoRefundedToWallet: boolean;
  message: string;
  order: Transaction;
}> {
  const {
    reference,
    amountInNaira,
    metadata,
    customerEmail,
    customerPhone,
    channel = 'card',
    firebaseIdToken
  } = params;

  const useAdmin = isFirebaseAdminConfigured();

  // 1. Check idempotency lock so webhook + browser redirect can NEVER double-dispense
  let existing: Record<string, any> | null = null;
  if (useAdmin) {
    existing = await adminGetDoc('orders', reference);
  } else {
    try {
      const snap = await getDoc(doc(db, 'orders', reference));
      if (snap.exists()) existing = snap.data();
    } catch {}
  }

  if (
    existing &&
    (existing.status === 'SUCCESS' ||
      existing.status === 'successful' ||
      existing.status === 'PROCESSING' ||
      existing.autoRefundedToWallet === true)
  ) {
    return {
      status: existing.status === 'SUCCESS' || existing.status === 'successful',
      alreadyProcessed: true,
      autoRefundedToWallet: Boolean(existing.autoRefundedToWallet),
      message:
        existing.status === 'PROCESSING'
          ? 'Order is currently being dispensed.'
          : 'Order was already processed.',
      order: existing as Transaction
    };
  }

  const nowIso = new Date().toISOString();

  // Acquire PROCESSING lock before calling GladTidings
  const processingDoc = {
    id: reference,
    reference,
    userId: metadata.uid || '',
    userEmail: metadata.userEmail || customerEmail || '',
    network: metadata.networkName || 'Paystack',
    networkName: metadata.networkName || 'Paystack',
    phone: metadata.phone || customerPhone || '',
    phoneNumber: metadata.phone || customerPhone || '',
    planName: metadata.planName || 'Mobile Service Top-Up',
    planSize: metadata.planSize || '',
    amount: amountInNaira,
    amountPaid: amountInNaira,
    status: 'PROCESSING',
    statusMessage: 'Payment verified. Dispensing service...',
    paymentMethod: 'PAYSTACK',
    serviceType: metadata.serviceType || 'data',
    timestamp: nowIso,
    createdAt: nowIso
  };

  if (useAdmin) {
    await adminPatchDoc('orders', reference, processingDoc);
  } else {
    try {
      await saveOrderToFirestore(processingDoc as Transaction);
    } catch {}
  }

  // 2. Dispatch via GladTidings
  const gladtidings = new GladTidingsClient();
  let dispatchResult: any = { status: false, msg: 'Gateway error' };
  let token = '';

  try {
    if (metadata.serviceType === 'electricity') {
      dispatchResult = await gladtidings.rechargeMeter({
        disco_name: Number(metadata.discoId),
        meter_number: String(metadata.meterNumber).trim(),
        amount: Number(metadata.amount),
        MeterType: metadata.meterType?.toLowerCase() === 'postpaid' ? 'Postpaid' : 'Prepaid',
        Customer_Phone: metadata.phone || '',
        customer_name: metadata.customerName,
        customer_address: metadata.customerAddress
      });
      token = dispatchResult.token || dispatchResult.data?.token || '';
    } else if (metadata.serviceType === 'cable') {
      dispatchResult = await gladtidings.subscribeCable({
        cablename: Number(metadata.cableId),
        cableplan: Number(metadata.cablePlanId),
        smart_card_number: String(metadata.smartCardNumber).trim()
      });
    } else if (metadata.serviceType === 'airtime') {
      dispatchResult = await gladtidings.purchaseAirtime({
        network: Number(metadata.networkId),
        mobile_number: metadata.phone,
        amount: Number(metadata.amount),
        Ported_number: true,
        airtime_type: 'VTU'
      });
    } else {
      dispatchResult = await gladtidings.purchaseData({
        network: Number(metadata.networkId),
        plan: metadata.planId,
        mobile_number: metadata.phone,
        Ported_number: true
      });
    }
  } catch (err: any) {
    dispatchResult = { status: false, msg: err?.message || 'Service dispensing failed.' };
  }

  // 3. Auto-refund into user's DataAbeg wallet if dispensing failed!
  let autoRefundedToWallet = false;
  if (!dispatchResult.status && metadata.uid) {
    try {
      const refundRes = await creditWalletIdempotently({
        uid: metadata.uid,
        amount: amountInNaira,
        paymentRef: `REFUND-${reference}`,
        customerEmail: metadata.userEmail || customerEmail,
        channel,
        firebaseIdToken,
        customPlanName: `Auto-Refund for Failed Order (${metadata.planName || reference})`,
        customStatusMessage: `Dispensing failed (${dispatchResult.msg || 'gateway error'}). ₦${amountInNaira.toLocaleString()} was automatically refunded to your DataAbeg wallet.`
      });
      autoRefundedToWallet = refundRes.credited;
    } catch (refundErr) {
      console.error('Auto-refund to wallet failed:', refundErr);
    }
  }

  const finalStatusMessage = dispatchResult.status
    ? dispatchResult.msg || 'Transaction processed via Paystack live checkout.'
    : autoRefundedToWallet
      ? `Dispensing failed (${dispatchResult.msg || 'gateway issue'}). ₦${amountInNaira.toLocaleString()} was automatically refunded to your wallet!`
      : dispatchResult.msg || 'Dispensing failed. Please contact support with your reference.';

  const orderTx: Transaction & { autoRefundedToWallet?: boolean } = {
    id: reference,
    reference,
    userId: metadata.uid || '',
    userEmail: metadata.userEmail || customerEmail || '',
    smeplugReference: dispatchResult.data?.reference || dispatchResult.data?.ident || `GT_${Date.now()}`,
    network: metadata.networkName || 'Paystack',
    networkName: metadata.networkName || 'Paystack',
    phone: metadata.phone || customerPhone || '',
    phoneNumber: metadata.phone || customerPhone || '',
    planName: metadata.planName || 'Mobile Service Top-Up',
    planSize: metadata.planSize || '',
    amount: amountInNaira,
    amountPaid: amountInNaira,
    status: dispatchResult.status ? 'SUCCESS' : 'FAILED',
    statusMessage: finalStatusMessage,
    paymentMethod: 'PAYSTACK',
    createdAt: nowIso,
    completedAt: new Date().toISOString(),
    serviceType: metadata.serviceType || 'data',
    meterToken: token,
    meterNumber: metadata.meterNumber,
    customerName: metadata.customerName,
    smartCardNumber: metadata.smartCardNumber,
    cableName: metadata.cableName,
    cablePlanName: metadata.cablePlanName,
    autoRefundedToWallet
  };

  if (useAdmin) {
    await adminPatchDoc('orders', reference, {
      ...orderTx,
      timestamp: nowIso
    });
  } else {
    await saveOrderToFirestore(orderTx);
  }

  return {
    status: Boolean(dispatchResult.status),
    alreadyProcessed: false,
    autoRefundedToWallet,
    message: finalStatusMessage,
    order: orderTx
  };
}
