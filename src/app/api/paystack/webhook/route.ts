import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getPaystackSecretKey } from '@/lib/paystack';
import { creditUserWalletFromPayment, saveOrderToFirestore } from '@/lib/firebaseDb';
import { GladTidingsClient } from '@/lib/gladtidings';
import { Transaction } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-paystack-signature');
    const secretKey = getPaystackSecretKey();

    // Verify HMAC-SHA512 signature
    if (signature) {
      const hash = crypto
        .createHmac('sha512', secretKey)
        .update(rawBody)
        .digest('hex');

      if (hash !== signature) {
        console.warn('⚠️ Invalid Paystack webhook signature rejected');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
    }

    const event = JSON.parse(rawBody);
    console.log(`🔔 Paystack Webhook received event: "${event.event}"`);

    if (event.event === 'charge.success') {
      const data = event.data;
      const amountInNaira = data.amount / 100;
      const metadata = data.metadata || {};
      const channel = data.channel || 'card';

      // 1. Wallet funding
      if (metadata.type === 'wallet_funding' && metadata.uid) {
        await creditUserWalletFromPayment(
          metadata.uid,
          amountInNaira,
          data.reference,
          data.customer?.email,
          channel
        );
        console.log(`✅ Webhook: Credited ₦${amountInNaira} to user ${metadata.uid}`);
      }

      // 2. Direct service purchase fulfillment (if not already completed by client-side verify)
      if (metadata.type === 'service_purchase') {
        const gladtidings = new GladTidingsClient();
        let dispatchResult: any = { status: true };
        let token = '';

        if (metadata.serviceType === 'electricity') {
          dispatchResult = await gladtidings.rechargeMeter({
            disco_name: Number(metadata.discoId),
            meter_number: String(metadata.meterNumber).trim(),
            amount: Number(metadata.amount),
            MeterType: metadata.meterType?.toLowerCase() === 'postpaid' ? 'Postpaid' : 'Prepaid',
            Customer_Phone: metadata.phone || '',
            customer_name: metadata.customerName,
            customer_address: metadata.customerAddress
          });
          token = dispatchResult.token || dispatchResult.data?.token || '';
        } else if (metadata.serviceType === 'cable') {
          dispatchResult = await gladtidings.subscribeCable({
            cablename: Number(metadata.cableId),
            cableplan: Number(metadata.cablePlanId),
            smart_card_number: String(metadata.smartCardNumber).trim()
          });
        } else if (metadata.serviceType === 'airtime') {
          dispatchResult = await gladtidings.purchaseAirtime({
            network: Number(metadata.networkId),
            mobile_number: metadata.phone,
            amount: Number(metadata.amount),
            Ported_number: true,
            airtime_type: 'VTU'
          });
        } else {
          dispatchResult = await gladtidings.purchaseData({
            network: Number(metadata.networkId),
            plan: metadata.planId,
            mobile_number: metadata.phone,
            Ported_number: true
          });
        }

        const orderTx: Transaction = {
          id: data.reference,
          reference: data.reference,
          smeplugReference: dispatchResult.data?.reference || dispatchResult.data?.ident || `GT_${Date.now()}`,
          network: metadata.networkName || 'Paystack',
          networkName: metadata.networkName || 'Paystack',
          phone: metadata.phone || data.customer?.phone || '',
          phoneNumber: metadata.phone || data.customer?.phone || '',
          planName: metadata.planName || 'Mobile Service Top-Up',
          planSize: metadata.planSize || '',
          amount: amountInNaira,
          amountPaid: amountInNaira,
          status: dispatchResult.status ? 'successful' : 'failed',
          statusMessage: dispatchResult.msg || 'Transaction completed via Paystack webhook.',
          paymentMethod: 'PAYSTACK',
          createdAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          serviceType: metadata.serviceType || 'data',
          meterToken: token,
          meterNumber: metadata.meterNumber,
          customerName: metadata.customerName,
          smartCardNumber: metadata.smartCardNumber,
          cableName: metadata.cableName,
          cablePlanName: metadata.cablePlanName
        };

        await saveOrderToFirestore(orderTx);
        console.log(`✅ Webhook: Dispatched service for ${data.reference}`);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err: unknown) {
    console.error('Paystack webhook error:', err);
    return NextResponse.json({ error: 'Webhook processing error' }, { status: 500 });
  }
}
