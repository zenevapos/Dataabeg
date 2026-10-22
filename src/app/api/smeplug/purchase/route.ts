import { NextRequest, NextResponse } from 'next/server';
import { GladTidingsClient } from '@/lib/gladtidings';
import { isValidNigerianPhone, normalizePhone, generateTxReference } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { network_id, network, plan_id, plan, phone, mobile_number, customer_reference } = body;

    const netId = network_id || network;
    const planId = plan_id || plan;
    const rawPhone = phone || mobile_number;

    if (!netId || !planId || !rawPhone) {
      return NextResponse.json(
        { status: false, msg: 'Missing required fields: network, plan, and phone are required.' },
        { status: 400 }
      );
    }

    const cleanPhone = normalizePhone(rawPhone);
    if (!isValidNigerianPhone(cleanPhone)) {
      return NextResponse.json(
        { status: false, msg: 'Invalid Nigerian phone number. Must be 11 digits (e.g. 08031234567).' },
        { status: 400 }
      );
    }

    const txRef = customer_reference || generateTxReference('DABG');
    const customToken = req.headers.get('x-gladtidings-key') || req.headers.get('x-smeplug-key') || undefined;

    const client = new GladTidingsClient(customToken);
    const purchaseResult = await client.purchaseData({
      network: Number(netId),
      plan: planId,
      mobile_number: cleanPhone,
      Ported_number: true
    });

    return NextResponse.json({
      ...purchaseResult,
      customer_reference: txRef,
      phone: cleanPhone
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Transaction processing failed';
    console.error('Purchase route error:', err);
    return NextResponse.json(
      { status: false, msg: errorMsg },
      { status: 500 }
    );
  }
}
