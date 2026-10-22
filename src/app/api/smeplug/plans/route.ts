import { NextRequest, NextResponse } from 'next/server';
import { CURATED_DATA_PLANS } from '@/lib/constants';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const networkId = searchParams.get('network_id') ? Number(searchParams.get('network_id')) : undefined;

    const plans = networkId
      ? CURATED_DATA_PLANS.filter((p) => p.networkId === networkId)
      : CURATED_DATA_PLANS;

    return NextResponse.json({
      status: true,
      provider: 'Glad Tidings Automated Gateway',
      count: plans.length,
      data: plans
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json(
      { status: false, error: errorMsg, data: [] },
      { status: 500 }
    );
  }
}
