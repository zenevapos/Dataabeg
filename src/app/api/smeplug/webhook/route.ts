import { NextRequest, NextResponse } from 'next/server';
import { updateOrderStatusInFirestore } from '@/lib/firebaseDb';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    console.log('[SMEPlug Webhook Callback Received]:', JSON.stringify(payload, null, 2));

    // Support official SMEPlug format:
    // { "transaction": { "status": "success", "reference": "...", "customer_reference": "...", "beneficiary": "...", "price": "..." } }
    // Or flat format: { "reference": "...", "customer_reference": "...", "status": "successful" }
    const tx = payload.transaction || payload;
    const ref = tx.customer_reference || tx.reference;
    const statusRaw = (tx.status || '').toLowerCase();
    const isSuccess = statusRaw === 'success' || statusRaw === 'successful' || statusRaw === 'delivered';

    if (ref) {
      try {
        await updateOrderStatusInFirestore(
          ref,
          isSuccess ? 'SUCCESS' : 'FAILED',
          tx.response || tx.memo || (isSuccess ? 'Delivered successfully via SMEPlug' : 'Transaction failed on telecom gateway')
        );
      } catch (err) {
        console.warn('Could not update order status in Firestore:', err);
      }
    }

    return NextResponse.json({
      status: true,
      msg: 'Webhook received and processed successfully',
      received_at: new Date().toISOString()
    });
  } catch (error: unknown) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { status: false, msg: 'Invalid webhook payload' },
      { status: 400 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: true,
    message: 'DataAbeg SMEPlug Webhook Endpoint is active and listening.'
  });
}
