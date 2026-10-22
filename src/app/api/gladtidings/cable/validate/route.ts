import { NextRequest, NextResponse } from 'next/server';
import { GladTidingsClient } from '@/lib/gladtidings';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cable_id = searchParams.get('cable_id');
    const smart_card_number = searchParams.get('smart_card_number');

    if (!cable_id || !smart_card_number) {
      return NextResponse.json(
        { invalid: true, error: 'cable_id and smart_card_number query parameters are required.' },
        { status: 400 }
      );
    }

    const client = new GladTidingsClient();
    const result = await client.validateSmartCard(
      Number(cable_id),
      smart_card_number
    );

    return NextResponse.json(result);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Smartcard verification failed';
    return NextResponse.json(
      { invalid: true, error: errorMsg },
      { status: 500 }
    );
  }
}
