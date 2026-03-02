/**
 * Storage abstraction.
 * - Production (Vercel): uses @vercel/kv (Redis).
 * - Local dev (no KV env vars): uses an in-process Map — resets on server restart.
 */
import { Prediction, RaceResult } from './types';

// ---------------------------------------------------------------------------
// Low-level KV helpers
// ---------------------------------------------------------------------------
const memStore = new Map<string, string>();

function isKvAvailable(): boolean {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

async function kvGet(key: string): Promise<string | null> {
  if (isKvAvailable()) {
    const { kv } = await import('@vercel/kv');
    const val = await kv.get<string>(key);
    return val ?? null;
  }
  return memStore.get(key) ?? null;
}

async function kvSet(key: string, value: string): Promise<void> {
  if (isKvAvailable()) {
    const { kv } = await import('@vercel/kv');
    await kv.set(key, value);
  } else {
    memStore.set(key, value);
  }
}

// ---------------------------------------------------------------------------
// Predictions
// ---------------------------------------------------------------------------
function predictionKey(round: number): string {
  return `predictions:${round}`;
}

export async function getAllPredictions(round: number): Promise<Prediction[]> {
  const raw = await kvGet(predictionKey(round));
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Prediction[];
  } catch {
    return [];
  }
}

export async function getPrediction(round: number, name: string): Promise<Prediction | null> {
  const all = await getAllPredictions(round);
  return all.find((p) => p.name.toLowerCase() === name.toLowerCase()) ?? null;
}

export async function savePrediction(prediction: Prediction): Promise<void> {
  const all = await getAllPredictions(prediction.round);
  const filtered = all.filter(
    (p) => p.name.toLowerCase() !== prediction.name.toLowerCase()
  );
  filtered.push({ ...prediction, submittedAt: new Date().toISOString() });
  await kvSet(predictionKey(prediction.round), JSON.stringify(filtered));
}

// ---------------------------------------------------------------------------
// Results
// ---------------------------------------------------------------------------
function resultKey(round: number): string {
  return `result:${round}`;
}

export async function getResult(round: number): Promise<RaceResult | null> {
  const raw = await kvGet(resultKey(round));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as RaceResult;
  } catch {
    return null;
  }
}

export async function saveResult(result: RaceResult): Promise<void> {
  await kvSet(resultKey(result.round), JSON.stringify(result));
}
