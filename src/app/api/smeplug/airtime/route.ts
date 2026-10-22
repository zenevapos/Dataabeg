import { NextRequest, NextResponse } from 'next/server';
import { GladTidingsClient } from '@/lib/gladtidings';
import { isValidNigerianPhone, normalizePhone, generateTxReference } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { network_id, network, phone, mobile_number, amount, customer_reference } = body;

    const netId = network_id || network;
    const rawPhone = phone || mobile_number;

    if (!netId || !rawPhone || !amount) {
      return NextResponse.json(
        { status: false, msg: 'Missing required fields: network, phone, and amount are required.' },
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

    const rechargeAmount = Number(amount);
    if (isNaN(rechargeAmount) || rechargeAmount < 50 || rechargeAmount > 50000) {
      return NextResponse.json(
        { status: false, msg: 'Airtime amount must be between ₦50 and ₦50,000.' },
        { status: 400 }
      );
    }

    const txRef = customer_reference || generateTxReference('AIR');
    const customToken = req.headers.get('x-gladtidings-key') || req.headers.get('x-smeplug-key') || undefined;

    const client = new GladTidingsClient(customToken);
    const purchaseResult = await client.purchaseAirtime({
      network: Number(netId),
      mobile_number: cleanPhone,
      amount: rechargeAmount,
      Ported_number: true,
      airtime_type: 'VTU'
    });

    return NextResponse.json({
      ...purchaseResult,
      customer_reference: txRef,
      phone: cleanPhone,
      amount: rechargeAmount
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Transaction processing failed';
    console.error('Airtime route error:', err);
    return NextResponse.json(
      { status: false, msg: errorMsg },
      { status: 500 }
    );
  }
}
