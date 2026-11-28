import { NextRequest, NextResponse } from 'next/server';
import { GladTidingsClient, isGladTidingsProxyConfigured, getGladTidingsProxyHost } from '@/lib/gladtidings';

export async function GET(req: NextRequest) {
  const proxyActive = isGladTidingsProxyConfigured();
  const proxyHost = getGladTidingsProxyHost();
  try {
    const { searchParams } = new URL(req.url);
    const queryKey = searchParams.get('customKey');
    const headerKey = req.headers.get('x-gladtidings-key') || req.headers.get('Authorization')?.replace('Bearer ', '');
    const customKey = queryKey || headerKey || undefined;

    const client = new GladTidingsClient(customKey);
    const result = await client.getBalance();

    if (!result.status) {
      return NextResponse.json(
        {
          ...result,
          balance: null,
          proxyActive,
          proxyHost
        },
        { status: 502 }
      );
    }

    const rawBalance = result.data?.balance;
    const balanceNum =
      typeof rawBalance === 'number'
        ? rawBalance
        : Number(String(rawBalance ?? '0').replace(/[^\d.-]/g, '')) || 0;

    return NextResponse.json({
      ...result,
      balance: balanceNum,
      proxyActive,
      proxyHost
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json(
      { status: false, msg: errorMsg },
      { status: 500 }
    );
  }
}
