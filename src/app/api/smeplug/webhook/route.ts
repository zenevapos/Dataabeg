import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    console.log('[SMEPlug Webhook Callback Received]:', JSON.stringify(payload, null, 2));

    // Payload typically contains:
    // {
    //   "reference": "...",
    //   "customer_reference": "...",
    //   "status": "successful" | "failed",
    //   "msg": "...",
    //   "phone": "...",
    //   "network_id": 1
    // }

    return NextResponse.json({
      status: true,
      msg: 'Webhook received successfully',
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
