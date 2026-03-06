import { NextRequest, NextResponse } from 'next/server';

const COOKIE_NAME = 'f1_access';

async function getExpectedToken(): Promise<string> {
  const code   = process.env.ACCESS_CODE    ?? '';
  const secret = process.env.COOKIE_SECRET  ?? 'f1-predictor-default-secret';

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(code));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// POST /api/access  body: { code: string }
export async function POST(req: NextRequest) {
  const { code } = await req.json() as { code?: string };

  const accessCode = process.env.ACCESS_CODE;
  if (!accessCode) {
    return NextResponse.json({ error: 'Access code not configured on server.' }, { status: 500 });
  }

  if (!code || code !== accessCode) {
    return NextResponse.json({ error: 'Invalid access code.' }, { status: 401 });
  }

  const token = await getExpectedToken();

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  });
  return res;
}
