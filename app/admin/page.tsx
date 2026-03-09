'use client';

import { useState } from 'react';
import { RACES, DRIVERS } from '@/lib/data';

type FetchStatus = 'idle' | 'loading' | 'success' | 'error';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState('');

  const [round, setRound] = useState<number>(1);
  const [order, setOrder] = useState<string[]>(Array(DRIVERS.length).fill(''));
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [fetchStatus, setFetchStatus] = useState<FetchStatus>('idle');
  const [fetchMessage, setFetchMessage] = useState('');
  const [partialFetch, setPartialFetch] = useState(false);

  function handleAuth() {
    if (!password.trim()) {
      setAuthError('Enter the admin password.');
      return;
    }
    setAuthed(true);
  }

  function setPosition(pos: number, driverId: string) {
    const next = [...order];
    const existingIdx = next.indexOf(driverId);
    if (existingIdx !== -1 && existingIdx !== pos - 1) next[existingIdx] = '';
    next[pos - 1] = driverId;
    setOrder(next);
  }

  async function handleFetchFromApi() {
    setFetchStatus('loading');
    setFetchMessage('');
    setPartialFetch(false);
    setError('');

    try {
      const res = await fetch(`/api/fetch-qualifying?round=${round}`);
      const data = await res.json();

      if (!res.ok) {
        setFetchStatus('error');
        setFetchMessage(data.error ?? 'Failed to fetch qualifying results.');
        return;
      }

      setOrder(data.order);
      setFetchStatus('success');
      setPartialFetch(data.partial);

      if (data.partial && data.missingDrivers?.length > 0) {
        const names = (data.missingDrivers as string[])
          .map((id) => DRIVERS.find((d) => d.id === id)?.name ?? id)
          .join(', ');
        setFetchMessage(
          `Fetched ${data.order.filter(Boolean).length} positions. Missing from API (fill manually): ${names}`
        );
      } else {
        setFetchMessage('All 22 positions filled from Jolpica API. Review before saving.');
      }
    } catch {
      setFetchStatus('error');
      setFetchMessage('Network error — could not reach the API.');
    }
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

  function handleRoundChange(newRound: number) {
    setRound(newRound);
    setOrder(Array(DRIVERS.length).fill(''));
    setSuccess(false);
    setError('');
    setFetchStatus('idle');
    setFetchMessage('');
    setPartialFetch(false);
  }

  const usedDrivers = new Set(order.filter(Boolean));
  const race = RACES.find((r) => r.round === round);
  const filledCount = order.filter(Boolean).length;

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
          onClick={() => {
            setSuccess(false);
            setOrder(Array(DRIVERS.length).fill(''));
            setFetchStatus('idle');
            setFetchMessage('');
          }}
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
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 mb-4">
        <label className="text-xs text-white/50 font-medium mb-2 block">Select Race</label>
        <select
          value={round}
          onChange={(e) => handleRoundChange(Number(e.target.value))}
          className="w-full bg-[#0f0f0f] border border-[#333] text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#555]"
        >
          {RACES.map((r) => (
            <option key={r.round} value={r.round}>
              R{r.round} · {r.flag} {r.name} — Qual {new Date(r.qualDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </option>
          ))}
        </select>
      </div>

      {/* Auto-fetch from API */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 mb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-white mb-0.5">Auto-fetch from Jolpica API</p>
            <p className="text-xs text-white/40">
              Pulls qualifying order automatically. Only works after the session has finished.
            </p>
          </div>
          <button
            onClick={handleFetchFromApi}
            disabled={fetchStatus === 'loading'}
            className="shrink-0 flex items-center gap-2 bg-[#0f0f0f] hover:bg-[#1f1f1f] disabled:opacity-50 disabled:cursor-not-allowed border border-[#333] hover:border-[#555] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            {fetchStatus === 'loading' ? (
              <>
                <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Fetching…
              </>
            ) : (
              <>
                <span>⬇</span>
                Fetch Results
              </>
            )}
          </button>
        </div>

        {/* Fetch status message */}
        {fetchMessage && (
          <div
            className={`mt-3 text-xs px-3 py-2 rounded-lg border ${
              fetchStatus === 'success' && !partialFetch
                ? 'bg-green-900/20 border-green-700/30 text-green-400'
                : fetchStatus === 'success' && partialFetch
                ? 'bg-yellow-900/20 border-yellow-700/30 text-yellow-400'
                : 'bg-red-900/20 border-red-700/30 text-red-400'
            }`}
          >
            {fetchStatus === 'success' && !partialFetch && '✓ '}
            {fetchStatus === 'success' && partialFetch && '⚠ '}
            {fetchStatus === 'error' && '✕ '}
            {fetchMessage}
          </div>
        )}
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
                    pos <= 5
                      ? 'text-[#e10600]'
                      : pos >= DRIVERS.length - 4
                      ? 'text-blue-400'
                      : 'text-white/30'
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
                          borderLeftColor:
                            DRIVERS.find((d) => d.id === selectedId)?.teamColor ?? '#333',
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
          <span>
            {filledCount} / {DRIVERS.length}
          </span>
        </div>
        <div className="h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#e10600] rounded-full transition-all"
            style={{ width: `${(filledCount / DRIVERS.length) * 100}%` }}
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
