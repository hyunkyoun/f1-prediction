'use client';

import { useState } from 'react';
import { RACES, DRIVERS } from '@/lib/data';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState('');

  const [round, setRound] = useState<number>(1);
  const [order, setOrder] = useState<string[]>(Array(DRIVERS.length).fill(''));
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  function handleAuth() {
    // We test the password by sending it with the results; show error on fail.
    // Minimal client-side gate: just proceed if non-empty, API will reject wrong pw.
    if (!password.trim()) {
      setAuthError('Enter the admin password.');
      return;
    }
    setAuthed(true);
  }

  function setPosition(pos: number, driverId: string) {
    // pos is 1-indexed
    const next = [...order];
    // If driver already in another slot, clear that slot
    const existingIdx = next.indexOf(driverId);
    if (existingIdx !== -1 && existingIdx !== pos - 1) next[existingIdx] = '';
    next[pos - 1] = driverId;
    setOrder(next);
  }

  async function handleSubmit() {
    setError('');
    if (order.some((d) => !d)) {
      setError('All 22 positions must be filled.');
      return;
    }
    const unique = new Set(order);
    if (unique.size !== DRIVERS.length) {
      setError('Duplicate drivers detected. Each driver must appear exactly once.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ round, order, adminPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed');
        if (res.status === 403) {
          setAuthed(false);
          setAuthError('Wrong password.');
        }
      } else {
        setSuccess(true);
      }
    } catch {
      setError('Network error');
    } finally {
      setSubmitting(false);
    }
  }

  const usedDrivers = new Set(order.filter(Boolean));
  const race = RACES.find((r) => r.round === round);

  if (!authed) {
    return (
      <div className="max-w-sm mx-auto mt-16">
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-8">
          <h1 className="text-xl font-bold mb-1">Admin Panel</h1>
          <p className="text-white/40 text-sm mb-6">Enter results after each qualifying session.</p>
          <label className="text-xs text-white/50 font-medium mb-1.5 block">Admin Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
            placeholder="Password"
            className="w-full bg-[#0f0f0f] border border-[#333] text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#555] mb-3"
          />
          {authError && <p className="text-red-400 text-xs mb-3">{authError}</p>}
          <button
            onClick={handleAuth}
            className="w-full bg-[#e10600] hover:bg-[#c00] text-white font-semibold text-sm py-2.5 rounded-lg transition-colors"
          >
            Enter
          </button>
          <p className="text-white/20 text-xs mt-4 text-center">
            Default password: <code className="text-white/30">f1admin2026</code><br />
            Set ADMIN_PASSWORD env var on Vercel to change it.
          </p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-sm mx-auto mt-16 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-xl font-bold mb-2">Results Saved!</h2>
        <p className="text-white/40 text-sm mb-6">
          Scores for {race?.name} have been calculated automatically.
        </p>
        <button
          onClick={() => { setSuccess(false); setOrder(Array(DRIVERS.length).fill('')); }}
          className="bg-[#e10600] hover:bg-[#c00] text-white text-sm font-semibold px-5 py-2.5 rounded-lg"
        >
          Enter Another Round
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">
          Admin — <span className="text-[#e10600]">Enter Results</span>
        </h1>
        <p className="text-white/40 text-sm">Enter the full qualifying order after each session.</p>
      </div>

      {/* Round selector */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 mb-6">
        <label className="text-xs text-white/50 font-medium mb-2 block">Select Race</label>
        <select
          value={round}
          onChange={(e) => { setRound(Number(e.target.value)); setOrder(Array(DRIVERS.length).fill('')); setSuccess(false); setError(''); }}
          className="w-full bg-[#0f0f0f] border border-[#333] text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#555]"
        >
          {RACES.map((r) => (
            <option key={r.round} value={r.round}>
              R{r.round} · {r.flag} {r.name} — Qual {new Date(r.qualDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </option>
          ))}
        </select>
      </div>

      {/* Position inputs */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 mb-4">
        <h2 className="text-sm font-semibold text-white/60 mb-4">
          Qualifying Order — {race?.name}
        </h2>
        <div className="space-y-2">
          {Array.from({ length: DRIVERS.length }, (_, i) => i + 1).map((pos) => {
            const selectedId = order[pos - 1];
            const available = DRIVERS.filter(
              (d) => !usedDrivers.has(d.id) || d.id === selectedId
            );
            return (
              <div key={pos} className="flex items-center gap-3">
                <span
                  className={`w-8 text-right text-sm font-bold shrink-0 ${
                    pos <= 5 ? 'text-[#e10600]' : pos >= DRIVERS.length - 4 ? 'text-blue-400' : 'text-white/30'
                  }`}
                >
                  P{pos}
                </span>
                <select
                  value={selectedId}
                  onChange={(e) => setPosition(pos, e.target.value)}
                  className="flex-1 bg-[#0f0f0f] border border-[#333] text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#555] appearance-none cursor-pointer"
                  style={
                    selectedId
                      ? {
                          borderLeftColor: DRIVERS.find((d) => d.id === selectedId)?.teamColor ?? '#333',
                          borderLeftWidth: 3,
                        }
                      : {}
                  }
                >
                  <option value="">— Select driver —</option>
                  {available.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.flag} {d.name} ({d.team})
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-white/40 mb-1">
          <span>Positions filled</span>
          <span>{order.filter(Boolean).length} / {DRIVERS.length}</span>
        </div>
        <div className="h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#e10600] rounded-full transition-all"
            style={{ width: `${(order.filter(Boolean).length / DRIVERS.length) * 100}%` }}
          />
        </div>
      </div>

      {error && (
        <div className="text-red-400 text-sm bg-red-900/20 border border-red-700/30 rounded-lg px-4 py-3 mb-4">
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={submitting || order.some((d) => !d)}
        className="w-full bg-[#e10600] hover:bg-[#c00] disabled:bg-[#e10600]/30 disabled:cursor-not-allowed text-white font-semibold text-sm py-3 rounded-lg transition-colors"
      >
        {submitting ? 'Saving…' : 'Save Results & Calculate Scores'}
      </button>
    </div>
  );
}
