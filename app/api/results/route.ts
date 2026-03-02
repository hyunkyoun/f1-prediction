import { NextRequest, NextResponse } from 'next/server';
import { getResult, saveResult } from '@/lib/storage';
import { DRIVERS, RACES } from '@/lib/data';
import { RaceResult } from '@/lib/types';

// GET /api/results?round=1
export async function GET(req: NextRequest) {
  const round = parseInt(req.nextUrl.searchParams.get('round') ?? '0');
  if (!round) return NextResponse.json({ error: 'round required' }, { status: 400 });

  const result = await getResult(round);
  return NextResponse.json({ result });
}

// POST /api/results  body: { round, order, adminPassword }
export async function POST(req: NextRequest) {
  const body = await req.json() as { round?: number; order?: string[]; adminPassword?: string };

  const adminPassword = process.env.ADMIN_PASSWORD ?? 'f1admin2026';
  if (body.adminPassword !== adminPassword) {
    return NextResponse.json({ error: 'Invalid admin password' }, { status: 403 });
  }

  const { round, order } = body;

  if (!round || !RACES.find((r) => r.round === round)) {
    return NextResponse.json({ error: 'Invalid round' }, { status: 400 });
  }

  const driverIds = new Set(DRIVERS.map((d) => d.id));
  if (!Array.isArray(order) || order.length !== DRIVERS.length) {
    return NextResponse.json(
      { error: `order must contain all ${DRIVERS.length} driver IDs` },
      { status: 400 }
    );
  }

  const uniqueDrivers = new Set(order);
  if (uniqueDrivers.size !== DRIVERS.length) {
    return NextResponse.json({ error: 'Duplicate or missing driver in order' }, { status: 400 });
  }

  for (const id of order) {
    if (!driverIds.has(id)) {
      return NextResponse.json({ error: `Unknown driver: ${id}` }, { status: 400 });
    }
  }

  const result: RaceResult = { round, order };
  await saveResult(result);
  return NextResponse.json({ ok: true, result });
}
