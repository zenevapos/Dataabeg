import { NextRequest, NextResponse } from 'next/server';
import { SMEPlugClient } from '@/lib/smeplug';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const networkId = searchParams.get('network_id') ? Number(searchParams.get('network_id')) : undefined;
    const customKey = req.headers.get('x-smeplug-key') || undefined;

    const client = new SMEPlugClient(customKey);
    const result = await client.getDataPlans(networkId);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json(
      { status: false, error: errorMsg, data: [] },
      { status: 500 }
    );
  }
}
