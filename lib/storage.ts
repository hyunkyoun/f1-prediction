/**
 * Storage abstraction.
 * - Production (Vercel): uses @vercel/kv (Redis).
 * - Local dev (no KV env vars): uses a JSON file at .data/store.json — persists across restarts.
 */
import { Prediction, RaceResult } from './types';
import * as fs from 'fs';
import * as path from 'path';

// ---------------------------------------------------------------------------
// Low-level KV helpers
// ---------------------------------------------------------------------------
const DATA_FILE = path.join(process.cwd(), '.data', 'store.json');

function readFileStore(): Record<string, string> {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(DATA_FILE)) return {};
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

function writeFileStore(store: Record<string, string>): void {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (e) {
    console.error('[storage] Failed to write local store:', e);
  }
}

function isKvAvailable(): boolean {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

async function kvGet(key: string): Promise<string | null> {
  if (isKvAvailable()) {
    const { kv } = await import('@vercel/kv');
    const val = await kv.get(key);
    if (val === null || val === undefined) return null;
    // @vercel/kv auto-parses JSON, so val may already be a parsed object
    if (typeof val === 'string') return val;
    return JSON.stringify(val);
  }

  const store = readFileStore();
  return store[key] ?? null;
}

async function kvSet(key: string, value: string): Promise<void> {
  if (isKvAvailable()) {
    const { kv } = await import('@vercel/kv');
    await kv.set(key, value);
    return;
  }

  const store = readFileStore();
  store[key] = value;
  writeFileStore(store);
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
