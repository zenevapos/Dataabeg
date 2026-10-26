import { NextResponse } from 'next/server';
import { createPhoneVerification, markPhoneVerified, getVerificationStatus } from '@/lib/whatsappVerification';
import { normalizePhone, isValidNigerianPhone } from '@/lib/utils';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, phone, code } = body;

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    const cleanPhone = normalizePhone(phone);
    if (!isValidNigerianPhone(cleanPhone)) {
      return NextResponse.json({ error: 'Invalid Nigerian phone number' }, { status: 400 });
    }

    // 1. Create a verification challenge
    if (action === 'create') {
      const challenge = await createPhoneVerification(cleanPhone);
      return NextResponse.json({
        success: true,
        ...challenge
      });
    }

    // 2. Check verification status
    if (action === 'check') {
      const isVerified = await getVerificationStatus(cleanPhone);
      return NextResponse.json({
        verified: isVerified,
        phone: cleanPhone
      });
    }

    // 3. Verify with code (manual confirmation fallback)
    if (action === 'verify_code') {
      if (!code) {
        return NextResponse.json({ error: 'Verification code is required' }, { status: 400 });
      }
      const isOk = await markPhoneVerified(cleanPhone, code);
      if (isOk) {
        return NextResponse.json({ success: true, verified: true, phone: cleanPhone });
      }
      return NextResponse.json({ success: false, error: 'Invalid or expired verification code' }, { status: 400 });
    }

    // 4. Instant verify (one-click fallback)
    if (action === 'instant_verify') {
      await markPhoneVerified(cleanPhone);
      return NextResponse.json({ success: true, verified: true, phone: cleanPhone });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    console.error('Phone verification API error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
