import { NextRequest, NextResponse } from 'next/server';
import { PaystackClient } from '@/lib/paystack';
import { creditWalletIdempotently, fulfillServicePurchaseIdempotently } from '@/lib/walletCredit';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reference } = body;
    const authHeader = req.headers.get('authorization') || '';
    const firebaseIdToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : undefined;

    if (!reference) {
      return NextResponse.json(
        { status: false, message: 'Transaction reference is required.' },
        { status: 400 }
      );
    }

    const paystack = new PaystackClient();
    const verifyRes = await paystack.verifyTransaction(reference);

    if (!verifyRes.status || !verifyRes.data) {
      return NextResponse.json(
        { status: false, message: verifyRes.message || 'Payment verification failed.' },
        { status: 400 }
      );
    }

    const txData = verifyRes.data;

    if (txData.status !== 'success') {
      return NextResponse.json(
        {
          status: false,
          message: `Payment status is ${txData.status}: ${txData.gateway_response || 'Payment not completed.'}`,
          data: txData
        },
        { status: 400 }
      );
    }

    const amountInNaira = txData.amount / 100;
    const metadata = txData.metadata || {};
    const channel = txData.channel || 'card';

    // 1. Wallet Funding Flow (Atomic & Idempotent)
    if (metadata.type === 'wallet_funding' && metadata.uid) {
      const creditResult = await creditWalletIdempotently({
        uid: metadata.uid,
        amount: amountInNaira,
        paymentRef: txData.reference,
        customerEmail: txData.customer?.email,
        channel,
        firebaseIdToken
      });

      return NextResponse.json({
        status: true,
        message: creditResult.alreadyCredited
          ? `Payment of ₦${amountInNaira.toLocaleString()} was already credited to your wallet.`
          : `Wallet funded successfully with ₦${amountInNaira.toLocaleString()}`,
        data: {
          reference: txData.reference,
          amount: amountInNaira,
          newBalance: creditResult.newBalance,
          channel,
          credited: creditResult.credited,
          alreadyCredited: creditResult.alreadyCredited,
          requiresClientSync: creditResult.requiresClientSync
        }
      });
    }

    // 2. Direct Service Purchase Flow (Idempotent + Auto-Refund to Wallet on Gateway Failure)
    if (metadata.type === 'service_purchase') {
      const result = await fulfillServicePurchaseIdempotently({
        reference: txData.reference,
        amountInNaira,
        metadata,
        customerEmail: txData.customer?.email,
        customerPhone: txData.customer?.phone,
        channel,
        firebaseIdToken
      });

      return NextResponse.json({
        status: result.status,
        alreadyProcessed: result.alreadyProcessed,
        autoRefundedToWallet: result.autoRefundedToWallet,
        message: result.message,
        data: result.order
      });
    }

    // Default response if generic Paystack payment
    return NextResponse.json({
      status: true,
      message: 'Payment verified successfully.',
      data: txData
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Internal verification error';
    console.error('Paystack verify error:', err);
    return NextResponse.json(
      { status: false, message: errorMsg },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get('reference');
  if (!reference) {
    return NextResponse.json({ status: false, message: 'Reference required' }, { status: 400 });
  }

  const paystack = new PaystackClient();
  const verifyRes = await paystack.verifyTransaction(reference);
  return NextResponse.json(verifyRes);
}
