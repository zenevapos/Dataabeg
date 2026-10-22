import { NextRequest, NextResponse } from 'next/server';
import { GladTidingsClient } from '@/lib/gladtidings';
import { isValidNigerianPhone, normalizePhone, generateTxReference } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      disco_id,
      disco_name,
      amount,
      meter_number,
      meter_type,
      customer_phone,
      phone,
      customer_name,
      customer_address,
      customer_reference
    } = body;

    const discoId = disco_id || disco_name;
    const rawPhone = customer_phone || phone;

    if (!discoId || !meter_number || !amount || !rawPhone) {
      return NextResponse.json(
        { status: false, msg: 'Missing required fields: disco_id, meter_number, amount, and phone are required.' },
        { status: 400 }
      );
    }

    const cleanPhone = normalizePhone(rawPhone);
    const rechargeAmount = Number(amount);

    if (isNaN(rechargeAmount) || rechargeAmount < 500) {
      return NextResponse.json(
        { status: false, msg: 'Minimum electricity recharge amount is ₦500.' },
        { status: 400 }
      );
    }

    const txRef = customer_reference || generateTxReference('ELEC');
    const client = new GladTidingsClient();

    const result = await client.rechargeMeter({
      disco_name: Number(discoId),
      amount: rechargeAmount,
      meter_number: String(meter_number).trim(),
      MeterType: meter_type?.toLowerCase() === 'postpaid' ? 'Postpaid' : 'Prepaid',
      Customer_Phone: cleanPhone,
      customer_name: customer_name || 'Valued Customer',
      customer_address: customer_address || ''
    });

    return NextResponse.json({
      ...result,
      customer_reference: txRef
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Recharge processing failed';
    return NextResponse.json(
      { status: false, msg: errorMsg },
      { status: 500 }
    );
  }
}
