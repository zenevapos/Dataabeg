import { NextRequest, NextResponse } from 'next/server';
import { verifyUserRequest } from '@/lib/adminAuth';
import { adminAtomicWalletDelta, adminGetDoc, adminPatchDoc } from '@/lib/firebaseAdmin';
import { GladTidingsClient } from '@/lib/gladtidings';
import { CURATED_DATA_PLANS } from '@/lib/constants';
import { generateTxReference, isValidNigerianPhone, normalizePhone } from '@/lib/utils';

type ServiceType = 'data' | 'airtime' | 'electricity' | 'cable';

/**
 * Atomic, server-side wallet purchase endpoint.
 * - Verifies caller identity via Firebase ID token (cannot spoof uid)
 * - Validates and computes authoritative price server-side
 * - Debits wallet atomically via Firestore `currentDocument.updateTime` precondition
 * - Dispatches to GladTidings
 * - Atomically refunds on the server if GladTidings fails (prevents client-side refund race exploits)
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await verifyUserRequest(req);
    if (!auth.authenticated || !auth.uid) {
      return NextResponse.json(
        { status: false, msg: auth.error || 'Authentication required.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const serviceType: ServiceType = body.serviceType || 'data';
    const customToken =
      auth.isAdmin
        ? req.headers.get('x-gladtidings-key') || req.headers.get('x-smeplug-key') || undefined
        : undefined;

    let chargeAmount = 0;
    let txRef = String(body.customer_reference || '').trim() || generateTxReference(
      serviceType === 'electricity'
        ? 'ELEC'
        : serviceType === 'cable'
          ? 'CABL'
          : serviceType === 'airtime'
            ? 'AIR'
            : 'DABG'
    );

    let cleanPhone = '';
    let resolvedPlanName = '';
    let resolvedPlanSize = '';
    let resolvedNetworkName = String(body.networkName || '').trim();
    let resolvedNetworkShort = String(body.network || '').trim();

    // 1. Validate inputs & compute authoritative server-side chargeAmount
    if (serviceType === 'data') {
      const planId = Number(body.plan_id ?? body.plan);
      const netId = Number(body.network_id ?? body.network);
      cleanPhone = normalizePhone(String(body.phone || body.mobile_number || ''));

      if (!planId || !netId || !isValidNigerianPhone(cleanPhone)) {
        return NextResponse.json(
          { status: false, msg: 'Valid network, data plan, and 11-digit Nigerian phone number are required.' },
          { status: 400 }
        );
      }

      const curatedPlan = CURATED_DATA_PLANS.find(
        (p) => Number(p.planId) === planId && Number(p.networkId) === netId
      );
      if (!curatedPlan) {
        return NextResponse.json(
          { status: false, msg: 'Selected data plan is not recognized.' },
          { status: 400 }
        );
      }

      // Check if admin configured custom pricing in Firestore settings/general
      let sellingPrice = curatedPlan.sellingPrice;
      try {
        const settings = await adminGetDoc('settings', 'general');
        const customPrice = settings?.customPrices?.[curatedPlan.id];
        if (typeof customPrice === 'number' && Number.isFinite(customPrice) && customPrice > 0) {
          sellingPrice = customPrice;
        }
      } catch {}

      chargeAmount = Math.round(sellingPrice * 100) / 100;
      resolvedPlanName = curatedPlan.name;
      resolvedPlanSize = curatedPlan.size;
      resolvedNetworkShort = resolvedNetworkShort || curatedPlan.networkName;
      resolvedNetworkName = resolvedNetworkName || curatedPlan.networkName;
    } else if (serviceType === 'airtime') {
      const netId = Number(body.network_id ?? body.network);
      const faceAmount = Number(body.amount);
      cleanPhone = normalizePhone(String(body.phone || body.mobile_number || ''));

      if (!netId || !isValidNigerianPhone(cleanPhone)) {
        return NextResponse.json(
          { status: false, msg: 'Valid network and 11-digit Nigerian phone number are required.' },
          { status: 400 }
        );
      }
      if (!Number.isFinite(faceAmount) || faceAmount < 50 || faceAmount > 50000) {
        return NextResponse.json(
          { status: false, msg: 'Airtime amount must be between ₦50 and ₦50,000.' },
          { status: 400 }
        );
      }

      // Authoritative 2% discount computed server-side
      chargeAmount = Math.round(faceAmount * 0.98 * 100) / 100;
      resolvedPlanName = body.planName || `${resolvedNetworkShort || 'Airtime'} ₦${faceAmount} Airtime`;
      resolvedPlanSize = `₦${faceAmount}`;
    } else if (serviceType === 'electricity') {
      const discoId = Number(body.disco_id);
      const meterNumber = String(body.meter_number || '').trim();
      const amount = Number(body.amount);
      cleanPhone = normalizePhone(String(body.customer_phone || body.phone || ''));

      if (!discoId || !meterNumber || !Number.isFinite(amount) || amount < 500 || amount > 500000) {
        return NextResponse.json(
          { status: false, msg: 'Valid Disco, meter number, and amount (₦500 – ₦500,000) are required.' },
          { status: 400 }
        );
      }

      chargeAmount = Math.round(amount * 100) / 100;
      resolvedPlanName = body.planName || `${body.discoName || 'Electricity'} (${body.meter_type || 'Prepaid'})`;
      resolvedPlanSize = `Meter: ${meterNumber}`;
      resolvedNetworkShort = body.discoName || 'Electricity';
      resolvedNetworkName = body.discoName || 'Electricity';
    } else if (serviceType === 'cable') {
      const cableId = Number(body.cable_id);
      const cablePlanId = Number(body.cable_plan_id);
      const smartCardNumber = String(body.smart_card_number || '').trim();
      const amount = Number(body.amount);
      cleanPhone = normalizePhone(String(body.phone || ''));

      if (!cableId || !cablePlanId || !smartCardNumber || !Number.isFinite(amount) || amount < 500 || amount > 100000) {
        return NextResponse.json(
          { status: false, msg: 'Valid cable provider, package, smartcard number, and amount are required.' },
          { status: 400 }
        );
      }

      chargeAmount = Math.round(amount * 100) / 100;
      resolvedPlanName = body.planName || `${body.cableName || 'Cable TV'} - ${body.cablePlanName || 'Package'}`;
      resolvedPlanSize = `IUC: ${smartCardNumber}`;
      resolvedNetworkShort = body.cableName || 'Cable TV';
      resolvedNetworkName = body.cableName || 'Cable TV';
    } else {
      return NextResponse.json(
        { status: false, msg: 'Unsupported service type.' },
        { status: 400 }
      );
    }

    if (!Number.isFinite(chargeAmount) || chargeAmount <= 0) {
      return NextResponse.json(
        { status: false, msg: 'Invalid purchase amount.' },
        { status: 400 }
      );
    }

    // 2. Atomic wallet debit (optimistic concurrency — race-proof!)
    const debit = await adminAtomicWalletDelta(auth.uid, -chargeAmount, {
      minBalanceAfter: 0
    });

    if (!debit.ok) {
      return NextResponse.json(
        {
          status: false,
          msg: debit.error || 'Insufficient wallet balance.',
          newBalance: debit.previousBalance
        },
        { status: 400 }
      );
    }

    // 3. Dispatch to GladTidings — guaranteed server-side atomic refund if anything fails
    const client = new GladTidingsClient(customToken);
    let dispatchResult: { status: boolean; msg: string; data?: any; token?: string };

    try {
      if (serviceType === 'data') {
        dispatchResult = await client.purchaseData({
          network: Number(body.network_id ?? body.network),
          plan: Number(body.plan_id ?? body.plan),
          mobile_number: cleanPhone,
          Ported_number: true
        });
      } else if (serviceType === 'airtime') {
        dispatchResult = await client.purchaseAirtime({
          network: Number(body.network_id ?? body.network),
          amount: Number(body.amount),
          mobile_number: cleanPhone,
          Ported_number: true
        });
      } else if (serviceType === 'electricity') {
        dispatchResult = await client.rechargeMeter({
          disco_name: Number(body.disco_id),
          amount: Number(body.amount),
          meter_number: String(body.meter_number).trim(),
          MeterType: body.meter_type === 'Postpaid' ? 'Postpaid' : 'Prepaid',
          Customer_Phone: cleanPhone || debit.phoneNumber || '08000000000',
          customer_name: body.customer_name || 'Customer',
          customer_address: body.customer_address || 'Customer Address'
        });
      } else {
        dispatchResult = await client.subscribeCable({
          cablename: Number(body.cable_id),
          cableplan: Number(body.cable_plan_id),
          smart_card_number: String(body.smart_card_number).trim()
        });
      }
    } catch (dispatchErr: unknown) {
      const errMsg = dispatchErr instanceof Error ? dispatchErr.message : 'Gateway network error';
      const refund = await adminAtomicWalletDelta(auth.uid, +chargeAmount);
      return NextResponse.json(
        {
          status: false,
          msg: errMsg,
          refunded: refund.ok,
          newBalance: refund.ok ? refund.newBalance : debit.newBalance,
          customer_reference: txRef
        },
        { status: 502 }
      );
    }

    if (!dispatchResult.status) {
      // Atomic server-side refund of exact debited amount
      const refund = await adminAtomicWalletDelta(auth.uid, +chargeAmount);
      return NextResponse.json({
        status: false,
        msg: dispatchResult.msg || 'Transaction failed on gateway.',
        data: dispatchResult.data,
        refunded: refund.ok,
        newBalance: refund.ok ? refund.newBalance : debit.newBalance,
        customer_reference: txRef
      });
    }

    // 4. Success: save authoritative completed order directly to Firestore via Admin
    const nowIso = new Date().toISOString();
    const generatedToken = dispatchResult.token || dispatchResult.data?.token || '';
    const orderRecord: Record<string, any> = {
      id: txRef,
      reference: txRef,
      userId: auth.uid,
      userEmail: auth.email || debit.userEmail || '',
      smeplugReference: dispatchResult.data?.reference || dispatchResult.data?.ident || `GT_${Date.now()}`,
      network: resolvedNetworkShort || 'VTU',
      networkName: resolvedNetworkName || resolvedNetworkShort || 'VTU',
      phone: cleanPhone || debit.phoneNumber || '',
      phoneNumber: cleanPhone || debit.phoneNumber || '',
      planName: resolvedPlanName,
      planSize: resolvedPlanSize,
      amount: chargeAmount,
      amountPaid: chargeAmount,
      status: 'SUCCESS',
      statusMessage: dispatchResult.msg || 'Transaction completed successfully.',
      paymentMethod: 'WALLET',
      serviceType,
      createdAt: nowIso,
      timestamp: nowIso,
      completedAt: nowIso,
      updatedAt: nowIso
    };

    if (generatedToken) orderRecord.meterToken = generatedToken;
    if (body.meter_number) orderRecord.meterNumber = String(body.meter_number).trim();
    if (body.customer_name) orderRecord.customerName = String(body.customer_name);
    if (body.smart_card_number) orderRecord.smartCardNumber = String(body.smart_card_number).trim();
    if (body.cableName) orderRecord.cableName = String(body.cableName);
    if (body.cablePlanName) orderRecord.cablePlanName = String(body.cablePlanName);

    await adminPatchDoc('orders', txRef, orderRecord);

    return NextResponse.json({
      status: true,
      msg: dispatchResult.msg || 'Transaction completed successfully.',
      data: dispatchResult.data,
      token: generatedToken,
      order: orderRecord,
      newBalance: debit.newBalance,
      customer_reference: txRef
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Wallet purchase processing failed';
    console.error('Wallet purchase route error:', err);
    return NextResponse.json(
      { status: false, msg: errorMsg },
      { status: 500 }
    );
  }
}

