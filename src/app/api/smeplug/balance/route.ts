import { NextRequest, NextResponse } from 'next/server';
import { GladTidingsClient } from '@/lib/gladtidings';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const queryKey = searchParams.get('customKey');
    const headerKey = req.headers.get('x-gladtidings-key') || req.headers.get('x-smeplug-key');
    const customKey = queryKey || headerKey || undefined;

    const client = new GladTidingsClient(customKey);
    const result = await client.getBalance();

    const balanceNum =
      typeof result.data?.balance === 'number'
        ? result.data.balance
        : Number(result.data?.balance) || 0;

    return NextResponse.json({
      ...result,
      balance: balanceNum
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json(
      { status: false, msg: errorMsg },
      { status: 500 }
    );
  }
}
