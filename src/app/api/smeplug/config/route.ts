import { NextResponse } from 'next/server';

export async function GET() {
  const envKey = process.env.SMEPLUG_SECRET_KEY || '';
  const isConfigured = Boolean(envKey && envKey.trim().length > 8 && !envKey.includes('your_smeplug'));

  return NextResponse.json({
    status: true,
    isConfigured,
    maskedKey: isConfigured ? `${envKey.substring(0, 4)}...${envKey.substring(envKey.length - 4)}` : null,
    provider: 'SMEPlug VTU Engine (https://smeplug.ng)'
  });
}
