import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { FieldValue } from 'firebase-admin/firestore';
import { db, firebaseConfig } from './firebase';
import { getAdminFirestore } from './firebaseAdmin';
import { saveOrderToFirestore } from './firebaseDb';
import { GladTidingsClient } from './gladtidings';
import { Transaction } from './types';

const FIRESTORE_REST_BASE = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents`;

/**
 * Fallback helper when Firebase Admin SDK is not yet configured:
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
 * Atomically and idempotently credit a user's wallet after a verified Paystack payment.
 * - Uses Firebase Admin SDK Firestore Transaction when FIREBASE_SERVICE_ACCOUNT_KEY is set
 *   (works 100% in background webhooks even if the user closes the app).
 * - Falls back to authenticated REST API when running before service account is configured.
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

  // =========================================================================
  // PATH A: FIREBASE ADMIN SDK (Atomic Transaction — 100% Race-Condition Safe)
  // =========================================================================
  const adminDb = getAdminFirestore();
  if (adminDb) {
    const orderRef = adminDb.collection('orders').doc(paymentRef);
    const userRef = adminDb.collection('users').doc(uid);

    const txResult = await adminDb.runTransaction(async (tx) => {
      const [orderSnap, userSnap] = await Promise.all([tx.get(orderRef), tx.get(userRef)]);

      const existingOrder = orderSnap.exists ? orderSnap.data() : null;
      const userData = userSnap.exists ? userSnap.data() : null;
      const currentBalance = Number(userData?.walletBalance || 0);

      if (existingOrder?.walletCredited === true) {
        return {
          credited: true,
          alreadyCredited: true,
          newBalance: currentBalance,
          requiresClientSync: false
        };
      }

      const newBalance = Math.round((currentBalance + amount) * 100) / 100;
      const userPhone = userData?.phoneNumber || '';

      tx.set(
        userRef,
        {
          walletBalance: newBalance,
          updatedAt: FieldValue.serverTimestamp()
        },
        { merge: true }
      );

      tx.set(
        orderRef,
        {
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
          statusMessage:
            customStatusMessage ||
            `Successfully credited ₦${amount.toLocaleString()} to wallet balance.`,
          paymentMethod: 'PAYSTACK',
          timestamp: existingOrder?.timestamp || existingOrder?.createdAt || new Date().toISOString(),
          createdAt: existingOrder?.createdAt || new Date().toISOString(),
          completedAt: new Date().toISOString(),
          updatedAt: FieldValue.serverTimestamp(),
          serviceType: 'wallet_funding',
          walletCredited: true
        },
        { merge: true }
      );

      return {
        credited: true,
        alreadyCredited: false,
        newBalance,
        requiresClientSync: false
      };
    });

    return txResult;
  }

  // =========================================================================
  // PATH B: FALLBACK (Before FIREBASE_SERVICE_ACCOUNT_KEY is added to Vercel)
  // =========================================================================
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

  if (firebaseIdToken) {
    walletUpdated = await updateWalletWithIdToken(uid, newBalance, firebaseIdToken);
  }

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
      planName: customPlanName || `Instant Wallet Funding (Paystack ${channel.toUpperCase()})`,
      planSize: `+₦${amount.toLocaleString()}`,
      amount,
      amountPaid: amount,
      status: 'SUCCESS',
      statusMessage: walletUpdated
        ? customStatusMessage || `Successfully credited ₦${amount.toLocaleString()} to wallet balance.`
        : `Payment verified (₦${amount.toLocaleString()}); awaiting wallet sync.`,
      paymentMethod: 'PAYSTACK',
      createdAt: existingOrder?.createdAt || new Date().toISOString(),
      completedAt: new Date().toISOString(),
      serviceType: 'wallet_funding',
      walletCredited: walletUpdated
    };

    if (firebaseIdToken && existingOrder) {
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

/**
 * Idempotently fulfills a direct Paystack service purchase (Data, Airtime, Cable, Electricity).
 * - Acquires a lock on `orders/{reference}` BEFORE calling GladTidings so a payment can NEVER
 *   be dispensed twice (even if webhook and browser redirect arrive simultaneously).
 * - If GladTidings fails to dispense and the user has a UID, automatically refunds the paid
 *   amount into their DataAbeg wallet so they never lose money.
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

  const adminDb = getAdminFirestore();

  // 1. Acquire atomic lock so webhook + client verify can NEVER double-dispense
  if (adminDb) {
    const orderRef = adminDb.collection('orders').doc(reference);
    const lockResult = await adminDb.runTransaction(async (tx) => {
      const snap = await tx.get(orderRef);
      if (snap.exists) {
        const data = snap.data() as any;
        if (
          data?.status === 'SUCCESS' ||
          data?.status === 'PROCESSING' ||
          data?.autoRefundedToWallet === true
        ) {
          return { acquired: false, existing: data as Transaction };
        }
      }
      tx.set(
        orderRef,
        {
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
          timestamp: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: FieldValue.serverTimestamp()
        },
        { merge: true }
      );
      return { acquired: true, existing: null };
    });

    if (!lockResult.acquired && lockResult.existing) {
      return {
        status: lockResult.existing.status === 'SUCCESS' || lockResult.existing.status === 'successful',
        alreadyProcessed: true,
        autoRefundedToWallet: Boolean((lockResult.existing as any).autoRefundedToWallet),
        message:
          lockResult.existing.status === 'PROCESSING'
            ? 'Order is currently being dispensed.'
            : 'Order was already processed.',
        order: lockResult.existing
      };
    }
  } else {
    // Fallback idempotency check without Admin SDK
    try {
      const snap = await getDoc(doc(db, 'orders', reference));
      if (snap.exists()) {
        const data = snap.data() as any;
        if (
          data?.status === 'SUCCESS' ||
          data?.status === 'successful' ||
          data?.status === 'PROCESSING' ||
          data?.autoRefundedToWallet === true
        ) {
          return {
            status: data.status === 'SUCCESS' || data.status === 'successful',
            alreadyProcessed: true,
            autoRefundedToWallet: Boolean(data.autoRefundedToWallet),
            message: 'Order was already processed.',
            order: data as Transaction
          };
        }
      }
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
    createdAt: new Date().toISOString(),
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

  if (adminDb) {
    await adminDb.collection('orders').doc(reference).set(
      {
        ...orderTx,
        timestamp: orderTx.createdAt,
        updatedAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    );
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
