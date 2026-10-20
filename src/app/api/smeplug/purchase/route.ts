import { NextRequest, NextResponse } from 'next/server';
import { SMEPlugClient } from '@/lib/smeplug';
import { isValidNigerianPhone, normalizePhone, generateTxReference } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { network_id, plan_id, phone, customer_reference } = body;

    if (!network_id || !plan_id || !phone) {
      return NextResponse.json(
        { status: false, msg: 'Missing required fields: network_id, plan_id, and phone are required.' },
        { status: 400 }
      );
    }

    const cleanPhone = normalizePhone(phone);
    if (!isValidNigerianPhone(cleanPhone)) {
      return NextResponse.json(
        { status: false, msg: 'Invalid Nigerian phone number. Must be 11 digits (e.g. 08031234567).' },
        { status: 400 }
      );
    }

    const txRef = customer_reference || generateTxReference();
    const customKey = req.headers.get('x-smeplug-key') || undefined;

    const client = new SMEPlugClient(customKey);
    const purchaseResult = await client.purchaseData({
      network_id: Number(network_id),
      plan_id,
      phone: cleanPhone,
      customer_reference: txRef
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
