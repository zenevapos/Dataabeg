import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getPaystackSecretKey } from '@/lib/paystack';
import { creditWalletIdempotently, fulfillServicePurchaseIdempotently } from '@/lib/walletCredit';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-paystack-signature');
    const secretKey = getPaystackSecretKey();

    // Always require valid HMAC-SHA512 signature from Paystack
    if (!signature || !secretKey) {
      console.warn('⚠️ Paystack webhook rejected: missing signature or secret key');
      return NextResponse.json({ error: 'Unauthorized webhook' }, { status: 401 });
    }

    const hash = crypto
      .createHmac('sha512', secretKey)
      .update(rawBody)
      .digest('hex');

    if (hash !== signature) {
      console.warn('⚠️ Invalid Paystack webhook signature rejected');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    console.log(`🔔 Paystack Webhook received event: "${event.event}"`);

    if (event.event === 'charge.success') {
      const data = event.data;
      const amountInNaira = data.amount / 100;
      const metadata = data.metadata || {};
      const channel = data.channel || 'card';

      // 1. Wallet funding (Atomic & Idempotent via Firebase Admin SDK)
      if (metadata.type === 'wallet_funding' && metadata.uid) {
        const result = await creditWalletIdempotently({
          uid: metadata.uid,
          amount: amountInNaira,
          paymentRef: data.reference,
          customerEmail: data.customer?.email,
          channel
        });
        console.log(
          `✅ Webhook: Processed ₦${amountInNaira} for user ${metadata.uid} (credited=${result.credited}, already=${result.alreadyCredited})`
        );
      }

      // 2. Direct service purchase fulfillment (Idempotent + Auto-Refund on Failure)
      if (metadata.type === 'service_purchase') {
        const result = await fulfillServicePurchaseIdempotently({
          reference: data.reference,
          amountInNaira,
          metadata,
          customerEmail: data.customer?.email,
          customerPhone: data.customer?.phone,
          channel
        });
        console.log(
          `✅ Webhook: Service purchase ${data.reference} (status=${result.status}, already=${result.alreadyProcessed}, refunded=${result.autoRefundedToWallet})`
        );
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err: unknown) {
    console.error('Paystack webhook error:', err);
    return NextResponse.json({ error: 'Webhook processing error' }, { status: 500 });
  }
}
