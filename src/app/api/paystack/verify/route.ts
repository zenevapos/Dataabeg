import { NextRequest, NextResponse } from 'next/server';
import { PaystackClient } from '@/lib/paystack';
import { creditUserWalletFromPayment, saveOrderToFirestore } from '@/lib/firebaseDb';
import { GladTidingsClient } from '@/lib/gladtidings';
import { Transaction } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reference } = body;

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

    // 1. Wallet Funding Flow
    if (metadata.type === 'wallet_funding' && metadata.uid) {
      const newBalance = await creditUserWalletFromPayment(
        metadata.uid,
        amountInNaira,
        txData.reference,
        txData.customer?.email,
        channel
      );

      return NextResponse.json({
        status: true,
        message: `Wallet funded successfully with ₦${amountInNaira.toLocaleString()}`,
        data: {
          reference: txData.reference,
          amount: amountInNaira,
          newBalance,
          channel
        }
      });
    }

    // 2. Direct Service Purchase Flow (Data, Airtime, Electricity, Cable)
    if (metadata.type === 'service_purchase') {
      const gladtidings = new GladTidingsClient();
      let dispatchResult: any = { status: true, msg: 'Dispensed' };
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
        // Data Bundle
        dispatchResult = await gladtidings.purchaseData({
          network: Number(metadata.networkId),
          plan: metadata.planId,
          mobile_number: metadata.phone,
          Ported_number: true
        });
      }

      const orderTx: Transaction = {
        id: txData.reference,
        reference: txData.reference,
        smeplugReference: dispatchResult.data?.reference || dispatchResult.data?.ident || `GT_${Date.now()}`,
        network: metadata.networkName || 'Paystack',
        networkName: metadata.networkName || 'Paystack',
        phone: metadata.phone || txData.customer?.phone || '',
        phoneNumber: metadata.phone || txData.customer?.phone || '',
        planName: metadata.planName || 'Mobile Service Top-Up',
        planSize: metadata.planSize || '',
        amount: amountInNaira,
        amountPaid: amountInNaira,
        status: dispatchResult.status ? 'successful' : 'failed',
        statusMessage: dispatchResult.msg || 'Transaction processed via Paystack live checkout.',
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

      return NextResponse.json({
        status: dispatchResult.status,
        message: dispatchResult.msg || 'Service purchased and verified successfully.',
        data: orderTx
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
