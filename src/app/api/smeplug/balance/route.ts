import { NextRequest, NextResponse } from 'next/server';
import { SMEPlugClient } from '@/lib/smeplug';

export async function GET(req: NextRequest) {
  try {
    const customKey = req.headers.get('x-smeplug-key') || undefined;
    const client = new SMEPlugClient(customKey);
    const result = await client.getBalance();
    return NextResponse.json(result);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json(
      { status: false, msg: errorMsg },
      { status: 500 }
    );
  }
}
