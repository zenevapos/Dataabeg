import { NextResponse } from 'next/server';

export async function GET() {
  const gladKey = process.env.GLADTIDINGS_API_TOKEN || process.env.NEXT_PUBLIC_GLADTIDINGS_TOKEN || '';
  const smeKey = process.env.SMEPLUG_SECRET_KEY || '';
  
  const activeKey = gladKey || smeKey;
  const isGladTidings = Boolean(gladKey && gladKey.trim().length > 10);
  const isConfigured = Boolean(activeKey && activeKey.trim().length > 8 && !activeKey.includes('your_'));

  return NextResponse.json({
    status: true,
    isConfigured,
    maskedKey: isConfigured ? `${activeKey.substring(0, 4)}...${activeKey.substring(activeKey.length - 4)}` : null,
    provider: isGladTidings ? 'Glad Tidings Data (https://gladtidingsdata.com)' : 'SMEPlug VTU Engine'
  });
}
