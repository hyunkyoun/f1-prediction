import { NextRequest, NextResponse } from 'next/server';
import { DRIVERS, RACES } from '@/lib/data';

// Map from driver car number → our app driver ID
// Built dynamically from DRIVERS so it stays in sync with data.ts
const numberToId: Record<string, string> = Object.fromEntries(
  DRIVERS.map((d) => [String(d.number), d.id])
);

// Jolpica driverId → our app driver ID  (only needed for mismatches)
const jolpicaIdMap: Record<string, string> = {
  max_verstappen: 'verstappen',
  arvid_lindblad: 'lindblad',
  // Add more here if Jolpica uses a different driverId for a 2026 driver
};

function resolveDriver(jolpicaDriverId: string, permanentNumber: string): string | null {
  // 1. Try car number first (most reliable)
  if (permanentNumber && numberToId[permanentNumber]) {
    return numberToId[permanentNumber];
  }
  // 2. Try our jolpica mismatch map
  if (jolpicaIdMap[jolpicaDriverId]) {
    return jolpicaIdMap[jolpicaDriverId];
  }
  // 3. Try direct match (works for most drivers e.g. "norris", "hamilton")
  if (DRIVERS.find((d) => d.id === jolpicaDriverId)) {
    return jolpicaDriverId;
  }
  return null;
}

// GET /api/fetch-qualifying?round=1
export async function GET(req: NextRequest) {
  const roundParam = req.nextUrl.searchParams.get('round');
  const round = parseInt(roundParam ?? '0');

  if (!round || !RACES.find((r) => r.round === round)) {
    return NextResponse.json({ error: 'Invalid round number.' }, { status: 400 });
  }

  const url = `https://api.jolpi.ca/ergast/f1/2026/${round}/qualifying.json`;

  let json: {
    MRData?: {
      RaceTable?: {
        Races?: Array<{
          QualifyingResults?: Array<{
            position: string;
            Driver: { driverId: string; permanentNumber: string };
          }>;
        }>;
      };
    };
  };

  try {
    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) {
      return NextResponse.json(
        { error: `Jolpica API returned ${res.status}. Results may not be available yet.` },
        { status: 502 }
      );
    }
    json = await res.json();
  } catch {
    return NextResponse.json(
      { error: 'Failed to reach the Jolpica F1 API. Check your internet connection.' },
      { status: 502 }
    );
  }

  const races = json?.MRData?.RaceTable?.Races ?? [];
  if (races.length === 0) {
    return NextResponse.json(
      { error: 'No qualifying results found for this round yet. Try again after the session.' },
      { status: 404 }
    );
  }

  const qualifyingResults = races[0]?.QualifyingResults ?? [];
  if (qualifyingResults.length === 0) {
    return NextResponse.json(
      { error: 'Qualifying results list is empty. The session may not have finished yet.' },
      { status: 404 }
    );
  }

  // Sort by position (Jolpica returns them sorted, but be safe)
  const sorted = [...qualifyingResults].sort(
    (a, b) => parseInt(a.position) - parseInt(b.position)
  );

  const order: string[] = [];
  const unresolved: string[] = [];

  for (const entry of sorted) {
    const id = resolveDriver(
      entry.Driver.driverId,
      entry.Driver.permanentNumber
    );
    if (id) {
      order.push(id);
    } else {
      unresolved.push(entry.Driver.driverId);
    }
  }

  if (unresolved.length > 0) {
    return NextResponse.json(
      {
        error: `Could not map these Jolpica drivers to your roster: ${unresolved.join(', ')}. You may need to update the driver mapping in fetch-qualifying/route.ts.`,
      },
      { status: 422 }
    );
  }

  // Jolpica only returns drivers who set a time. If someone didn't qualify (DNS/DNQ)
  // we pad the remaining positions with an empty string so the admin can fill them.
  const missing = DRIVERS.filter((d) => !order.includes(d.id)).map((d) => d.id);
  const fullOrder = [...order, ...missing]; // unresolved go to the bottom

  return NextResponse.json({
    order: fullOrder,
    partial: missing.length > 0,
    missingDrivers: missing,
    source: url,
  });
}
