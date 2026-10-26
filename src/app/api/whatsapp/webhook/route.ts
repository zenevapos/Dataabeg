import { NextRequest, NextResponse } from 'next/server';
import { verifyByWebhookMessage } from '@/lib/whatsappVerification';

// Webhook verification secret token configured in Meta App Developer Portal
const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'dataabeg_webhook_verify_secret';

/**
 * GET handler: Verifies webhook with Meta (WhatsApp Cloud API)
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('✅ WhatsApp Webhook verified successfully by Meta.');
      return new NextResponse(challenge, {
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    return NextResponse.json({ error: 'Forbidden: Invalid verification token' }, { status: 403 });
  } catch (err: any) {
    console.error('Error in WhatsApp webhook GET:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST handler: Receives incoming WhatsApp messages from users
 * Matches verification codes (e.g. VERIFY-4912) and marks phone as verified in Firestore
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Meta sends webhook updates formatted under entry[].changes[].value.messages[]
    const entries = body?.entry || [];
    for (const entry of entries) {
      const changes = entry?.changes || [];
      for (const change of changes) {
        const value = change?.value;
        const messages = value?.messages || [];

        for (const msg of messages) {
          const from = msg.from; // e.g. "2348154276838"
          const messageBody = msg?.text?.body || ''; // e.g. "VERIFY-4912"

          if (from) {
            console.log(`📱 Incoming WhatsApp verification message from ${from}: "${messageBody}"`);
            const result = await verifyByWebhookMessage(from, messageBody);
            if (result.success) {
              console.log(`🎉 Successfully verified phone ${result.phone} with code ${result.code}`);
            } else {
              console.log(`⚠️ No active pending challenge matched for ${from} / "${messageBody}"`);
            }
          }
        }
      }
    }

    // Always respond 200 OK immediately to Meta so they acknowledge receipt
    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (err: any) {
    console.error('Error in WhatsApp webhook POST:', err);
    // Still return 200 to acknowledge receipt to avoid retry loops from Meta
    return NextResponse.json({ status: 'error', message: err.message }, { status: 200 });
  }
}
