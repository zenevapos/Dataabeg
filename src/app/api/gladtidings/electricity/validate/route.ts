import { NextRequest, NextResponse } from 'next/server';
import { GladTidingsClient } from '@/lib/gladtidings';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const disco_id = searchParams.get('disco_id');
    const meter_type = searchParams.get('meter_type') || 'prepaid';
    const meter_number = searchParams.get('meter_number');

    if (!disco_id || !meter_number) {
      return NextResponse.json(
        { invalid: true, error: 'disco_id and meter_number query parameters are required.' },
        { status: 400 }
      );
    }

    const client = new GladTidingsClient();
    const result = await client.validateMeter(
      Number(disco_id),
      meter_type.toLowerCase() === 'postpaid' ? 'Postpaid' : 'Prepaid',
      meter_number
    );

    return NextResponse.json(result);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Meter verification failed';
    return NextResponse.json(
      { invalid: true, error: errorMsg },
      { status: 500 }
    );
  }
}
