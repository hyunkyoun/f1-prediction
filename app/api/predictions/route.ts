import { NextRequest, NextResponse } from 'next/server';
import { getAllPredictions, savePrediction } from '@/lib/storage';
import { RACES, DRIVERS, BONUS_MIN, BONUS_MAX, TOP_ZONE_END, BOTTOM_ZONE_START, TOTAL_DRIVERS } from '@/lib/data';
import { Prediction } from '@/lib/types';

// GET /api/predictions?round=1
export async function GET(req: NextRequest) {
  const round = parseInt(req.nextUrl.searchParams.get('round') ?? '0');
  if (!round) return NextResponse.json({ error: 'round required' }, { status: 400 });

  const predictions = await getAllPredictions(round);
  return NextResponse.json({ predictions });
}

// POST /api/predictions  body: Prediction (without submittedAt)
export async function POST(req: NextRequest) {
  const body = await req.json() as Partial<Prediction>;

  const { name, round, topFive, bottomFive, bonus } = body;

  // Basic validation
  if (!name || typeof name !== 'string' || name.trim().length < 1) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }
  if (!round || !RACES.find((r) => r.round === round)) {
    return NextResponse.json({ error: 'Invalid round' }, { status: 400 });
  }
  if (!Array.isArray(topFive) || topFive.length !== TOP_ZONE_END) {
    return NextResponse.json({ error: 'topFive must have 5 entries' }, { status: 400 });
  }
  const bottomZoneSize = TOTAL_DRIVERS - BOTTOM_ZONE_START + 1;
  if (!Array.isArray(bottomFive) || bottomFive.length !== bottomZoneSize) {
    return NextResponse.json({ error: `bottomFive must have ${bottomZoneSize} entries` }, { status: 400 });
  }

  const driverIds = new Set(DRIVERS.map((d) => d.id));

  for (const id of topFive) {
    if (!driverIds.has(id)) return NextResponse.json({ error: `Unknown driver: ${id}` }, { status: 400 });
  }
  for (const id of bottomFive) {
    if (!driverIds.has(id)) return NextResponse.json({ error: `Unknown driver: ${id}` }, { status: 400 });
  }

  // Check no duplicates across all picks
  const allPicks: string[] = [...topFive, ...bottomFive];
  if (bonus) {
    if (!driverIds.has(bonus.driverId)) {
      return NextResponse.json({ error: `Unknown bonus driver: ${bonus.driverId}` }, { status: 400 });
    }
    if (bonus.position < BONUS_MIN || bonus.position > BONUS_MAX) {
      return NextResponse.json({ error: `Bonus position must be ${BONUS_MIN}–${BONUS_MAX}` }, { status: 400 });
    }
    allPicks.push(bonus.driverId);
  }

  const unique = new Set(allPicks);
  if (unique.size !== allPicks.length) {
    return NextResponse.json({ error: 'Each driver can only be picked once' }, { status: 400 });
  }

  const prediction: Prediction = {
    name: name.trim(),
    round,
    topFive,
    bottomFive,
    bonus: bonus ?? null,
    submittedAt: new Date().toISOString(),
  };

  await savePrediction(prediction);
  return NextResponse.json({ ok: true, prediction });
}
