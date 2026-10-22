import { NextRequest, NextResponse } from 'next/server';
import { updateOrderStatusInFirestore } from '@/lib/firebaseDb';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    console.log('[Glad Tidings Webhook Callback Received]:', JSON.stringify(payload, null, 2));

    // Support Glad Tidings format and flat formats
    const tx = payload.transaction || payload.data || payload;
    const ref = tx.customer_reference || tx.ident || tx.reference;
    const statusRaw = String(tx.Status || tx.status || '').toLowerCase();
    const isSuccess =
      statusRaw === 'success' ||
      statusRaw === 'successful' ||
      statusRaw === 'delivered' ||
      statusRaw === 'completed';

    if (ref) {
      try {
        await updateOrderStatusInFirestore(
          ref,
          isSuccess ? 'SUCCESS' : 'FAILED',
          tx.api_response || tx.response || tx.memo || (isSuccess ? 'Delivered successfully via Glad Tidings' : 'Transaction failed on telecom gateway')
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
    message: 'DataAbeg Glad Tidings Webhook Endpoint is active and listening.'
  });
}
