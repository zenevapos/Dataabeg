import { NextRequest, NextResponse } from 'next/server';
import { PaystackClient } from '@/lib/paystack';
import { generateTxReference } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, email, reference, metadata, callback_url } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { status: false, message: 'Valid amount is required.' },
        { status: 400 }
      );
    }

    const customerEmail = email || 'customer@dataabeg.com';
    const txRef = reference || generateTxReference('PAY');

    const client = new PaystackClient();
    const initRes = await client.initializeTransaction({
      amount: Number(amount),
      email: customerEmail,
      reference: txRef,
      callback_url: callback_url || `${process.env.NEXT_PUBLIC_APP_URL || 'https://dataabeg.vercel.app'}/dashboard`,
      metadata: metadata || {}
    });

    if (!initRes.status) {
      return NextResponse.json(
        { status: false, message: initRes.message || 'Could not initialize payment with Paystack.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      status: true,
      message: 'Payment initialized successfully',
      data: initRes.data,
      reference: txRef
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Internal server error';
    console.error('Paystack initialize error:', err);
    return NextResponse.json(
      { status: false, message: errorMsg },
      { status: 500 }
    );
  }
}

