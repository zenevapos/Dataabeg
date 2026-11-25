import { NextRequest, NextResponse } from 'next/server';
import { getPaystackSecretKey } from '@/lib/paystack';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { isFirebaseAdminConfigured } from '@/lib/firebaseAdmin';

export async function GET(req: NextRequest) {
  try {
    // Strictly require authorized DataAbeg admin Firebase Auth token
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { status: false, message: auth.error || 'Unauthorized admin access.' },
        { status: 401 }
      );
    }

    const secretKey = getPaystackSecretKey();
    if (!secretKey) {
      return NextResponse.json(
        { status: false, message: 'PAYSTACK_SECRET_KEY is not configured on the server.' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(req.url);
    const perPage = Math.min(Number(searchParams.get('perPage') || 50), 100);
    const statusFilter = searchParams.get('status') || '';

    const url = new URL('https://api.paystack.co/transaction');
    url.searchParams.set('perPage', String(perPage));
    if (statusFilter && ['success', 'failed', 'abandoned'].includes(statusFilter)) {
      url.searchParams.set('status', statusFilter);
    }

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${secretKey.trim()}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });

    const json = await res.json();
    if (!res.ok || !json.status) {
      return NextResponse.json(
        { status: false, message: json.message || 'Failed to fetch Paystack transactions.' },
        { status: res.status || 400 }
      );
    }

    const transactions = (json.data || []).map((t: any) => ({
      id: t.id,
      reference: t.reference,
      status: t.status,
      amount: (t.amount || 0) / 100,
      email: t.customer?.email || '',
      phone: t.customer?.phone || t.metadata?.phone || '',
      channel: t.channel || '',
      gateway_response: t.gateway_response || '',
      created_at: t.created_at,
      paid_at: t.paid_at,
      type: t.metadata?.type || 'unknown',
      uid: t.metadata?.uid || '',
      planName: t.metadata?.planName || '',
      networkName: t.metadata?.networkName || ''
    }));

    return NextResponse.json({
      status: true,
      firebaseAdminActive: isFirebaseAdminConfigured(),
      data: transactions,
      meta: json.meta || {}
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ status: false, message: msg }, { status: 500 });
  }
}
