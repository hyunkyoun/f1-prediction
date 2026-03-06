'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function AccessForm() {
  const searchParams = useSearchParams();
  const from         = searchParams.get('from') ?? '/';

  const [code,       setCode]       = useState('');
  const [error,      setError]      = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!code.trim()) {
      setError('Please enter the access code.');
      return;
    }

    setSubmitting(true);
    try {
      const res  = await fetch('/api/access', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Incorrect code. Try again.');
      } else {
        window.location.href = from;
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 font-bold text-2xl tracking-tight mb-2">
            <span className="text-[#e10600]">F1</span>
            <span className="text-white/80">Predictor</span>
            <span className="text-sm font-normal text-white/40">2026</span>
          </div>
          <p className="text-white/40 text-sm">Private access · friends only</p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-8"
        >
          <h1 className="text-lg font-bold mb-1">Enter Access Code</h1>
          <p className="text-white/40 text-sm mb-6">
            Ask the group chat if you don&apos;t have it.
          </p>

          <label className="text-xs text-white/50 font-medium mb-1.5 block">
            Access Code
          </label>
          <input
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="••••••••"
            autoFocus
            className="w-full bg-[#0f0f0f] border border-[#333] text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#555] mb-3"
          />

          {error && (
            <p className="text-red-400 text-xs mb-3 flex items-center gap-1.5">
              <span>✕</span> {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#e10600] hover:bg-[#c00] disabled:bg-[#e10600]/40 disabled:cursor-not-allowed text-white font-semibold text-sm py-2.5 rounded-lg transition-colors"
          >
            {submitting ? 'Checking…' : 'Enter'}
          </button>
        </form>

        {/* Subtle red bar at the top of the card — F1 branding */}
        <div className="mt-6 flex gap-1 justify-center">
          <div className="h-0.5 w-8 bg-[#e10600] rounded-full" />
          <div className="h-0.5 w-2 bg-[#e10600]/40 rounded-full" />
          <div className="h-0.5 w-1 bg-[#e10600]/20 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function AccessPage() {
  return (
    <Suspense>
      <AccessForm />
    </Suspense>
  );
}
