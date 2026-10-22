import { NextRequest, NextResponse } from 'next/server';
import { GladTidingsClient } from '@/lib/gladtidings';
import { generateTxReference } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cable_id, cablename, cable_plan_id, cableplan, smart_card_number, customer_reference } = body;

    const cableId = cable_id || cablename;
    const planId = cable_plan_id || cableplan;

    if (!cableId || !planId || !smart_card_number) {
      return NextResponse.json(
        { status: false, msg: 'Missing required fields: cable_id, cable_plan_id, and smart_card_number are required.' },
        { status: 400 }
      );
    }

    const txRef = customer_reference || generateTxReference('CABL');
    const client = new GladTidingsClient();

    const result = await client.subscribeCable({
      cablename: Number(cableId),
      cableplan: Number(planId),
      smart_card_number: String(smart_card_number).trim()
    });

    return NextResponse.json({
      ...result,
      customer_reference: txRef
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Subscription processing failed';
    return NextResponse.json(
      { status: false, msg: errorMsg },
      { status: 500 }
    );
  }
}
