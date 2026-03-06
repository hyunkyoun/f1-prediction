import { NextRequest, NextResponse } from 'next/server';

const COOKIE_NAME = 'f1_access';

// Derive expected cookie token from env vars using HMAC-SHA256 (Edge-compatible, no Buffer)
async function getExpectedToken(): Promise<string> {
  const code   = process.env.ACCESS_CODE    ?? '';
  const secret = process.env.COOKIE_SECRET  ?? 'f1-predictor-default-secret';

  const enc    = new TextEncoder();
  const key    = await crypto.subtle.importKey(
    'raw', enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(code));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow the gate page and its API endpoint through without a cookie
  if (
    pathname.startsWith('/access') ||
    pathname.startsWith('/api/access')
  ) {
    return NextResponse.next();
  }

  const cookie   = req.cookies.get(COOKIE_NAME)?.value ?? '';
  const expected = await getExpectedToken();

  if (cookie === expected) {
    return NextResponse.next();
  }

  // Redirect to access page, preserving the originally requested path
  const url = req.nextUrl.clone();
  url.pathname = '/access';
  url.searchParams.set('from', pathname);
  return NextResponse.redirect(url);
}

export const config = {
  // Run on all routes except Next.js internals and static files
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
