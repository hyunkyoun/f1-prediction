'use client';

import { useState, useEffect } from 'react';
import { DRIVERS, TOP_ZONE_END, BOTTOM_ZONE_START, BONUS_MIN, BONUS_MAX, TOTAL_DRIVERS } from '@/lib/data';
import { Driver } from '@/lib/types';

interface Props {
  round: number;
  isPredictionOpen: boolean;
}

const EMPTY = '';

function DriverSelect({
  label,
  value,
  onChange,
  excluded,
  drivers,
  highlightColor,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  excluded: string[];
  drivers: Driver[];
  highlightColor?: string;
}) {
  const available = drivers.filter((d) => !excluded.includes(d.id) || d.id === value);
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-white/40 w-10 shrink-0 text-right">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-[#0f0f0f] border border-[#333] text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#555] appearance-none cursor-pointer"
        style={value ? { borderLeftColor: DRIVERS.find((d) => d.id === value)?.teamColor ?? '#333', borderLeftWidth: 3 } : {}}
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
}

export function PredictionFormClient({ round, isPredictionOpen }: Props) {
  const [name, setName] = useState('');
  const [topFive, setTopFive] = useState<string[]>(['', '', '', '', '']);
  const [bottomFive, setBottomFive] = useState<string[]>(['', '', '', '', '']);
  const [bonusDriver, setBonusDriver] = useState('');
  const [bonusPosition, setBonusPosition] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill name from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('f1_predictor_name');
    if (saved) setName(saved);
  }, []);

  if (!isPredictionOpen) {
    return (
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 text-center text-white/40 text-sm">
        Predictions are closed for this round.
      </div>
    );
  }

  // All picked driver IDs (for exclusion logic)
  const allPicked = [...topFive, ...bottomFive, bonusDriver].filter(Boolean);

  function setTopFivePos(idx: number, val: string) {
    const next = [...topFive];
    next[idx] = val;
    setTopFive(next);
  }

  function setBottomFivePos(idx: number, val: string) {
    const next = [...bottomFive];
    next[idx] = val;
    setBottomFive(next);
  }

  const isComplete =
    name.trim().length > 0 &&
    topFive.every(Boolean) &&
    bottomFive.every(Boolean);

  async function handleSubmit() {
    setError('');
    if (!isComplete) {
      setError('Please fill in your name, all Top 5, and all Bottom 5 picks.');
      return;
    }
    if ((bonusDriver && !bonusPosition) || (!bonusDriver && bonusPosition)) {
      setError('Bonus: please select both a driver and a position, or leave both blank.');
      return;
    }

    setSubmitting(true);
    localStorage.setItem('f1_predictor_name', name.trim());

    try {
      const res = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          round,
          topFive,
          bottomFive,
          bonus: bonusDriver && bonusPosition
            ? { driverId: bonusDriver, position: parseInt(bonusPosition) }
            : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Submission failed');
      } else {
        setSubmitted(true);
        // Refresh page to show updated predictions
        setTimeout(() => window.location.reload(), 1200);
      }
    } catch {
      setError('Network error — please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="bg-[#1a1a1a] border border-green-700/40 rounded-xl p-6 text-center">
        <div className="text-3xl mb-2">✅</div>
        <div className="font-semibold text-green-400">Prediction submitted!</div>
        <div className="text-white/40 text-sm mt-1">Refreshing…</div>
      </div>
    );
  }

  // Bonus position options: P6–P17 (12 positions)
  const bonusPositions = Array.from({ length: BONUS_MAX - BONUS_MIN + 1 }, (_, i) => BONUS_MIN + i);

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 space-y-5">
      <h2 className="font-bold text-white">Make Your Prediction</h2>

      {/* Name */}
      <div>
        <label className="text-xs text-white/50 font-medium mb-1.5 block">Your Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          className="w-full bg-[#0f0f0f] border border-[#333] text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#555] placeholder:text-white/20"
        />
      </div>

      {/* Top 5 */}
      <div>
        <div className="text-xs font-bold text-[#e10600] uppercase tracking-wider mb-2">
          Top 5 — Positions 1–5
        </div>
        <div className="space-y-1.5">
          {topFive.map((val, i) => (
            <DriverSelect
              key={i}
              label={`P${i + 1}`}
              value={val}
              onChange={(v) => setTopFivePos(i, v)}
              excluded={allPicked.filter((id) => id !== val)}
              drivers={DRIVERS}
            />
          ))}
        </div>
      </div>

      {/* Bottom 5 */}
      <div>
        <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">
          Bottom 5 — Positions {BOTTOM_ZONE_START}–{TOTAL_DRIVERS}
        </div>
        <div className="space-y-1.5">
          {bottomFive.map((val, i) => (
            <DriverSelect
              key={i}
              label={`P${BOTTOM_ZONE_START + i}`}
              value={val}
              onChange={(v) => setBottomFivePos(i, v)}
              excluded={allPicked.filter((id) => id !== val)}
              drivers={DRIVERS}
            />
          ))}
        </div>
      </div>

      {/* Bonus */}
      <div>
        <div className="text-xs font-bold text-yellow-400 uppercase tracking-wider mb-2">
          Bonus — Pick P{BONUS_MIN}–P{BONUS_MAX} (optional)
        </div>
        <p className="text-xs text-white/30 mb-2">
          +1 pt if your driver lands at exactly that position
        </p>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/40 w-10 shrink-0 text-right">Driver</span>
            <select
              value={bonusDriver}
              onChange={(e) => setBonusDriver(e.target.value)}
              className="flex-1 bg-[#0f0f0f] border border-[#333] text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#555] appearance-none cursor-pointer"
              style={bonusDriver ? { borderLeftColor: DRIVERS.find((d) => d.id === bonusDriver)?.teamColor ?? '#333', borderLeftWidth: 3 } : {}}
            >
              <option value="">— None —</option>
              {DRIVERS.filter((d) => !allPicked.includes(d.id) || d.id === bonusDriver).map((d) => (
                <option key={d.id} value={d.id}>
                  {d.flag} {d.name} ({d.team})
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/40 w-10 shrink-0 text-right">Pos</span>
            <select
              value={bonusPosition}
              onChange={(e) => setBonusPosition(e.target.value)}
              disabled={!bonusDriver}
              className="flex-1 bg-[#0f0f0f] border border-[#333] text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#555] appearance-none cursor-pointer disabled:opacity-40"
            >
              <option value="">— Position —</option>
              {bonusPositions.map((pos) => (
                <option key={pos} value={pos}>P{pos}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="text-red-400 text-xs bg-red-900/20 border border-red-700/30 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={submitting || !isComplete}
        className="w-full bg-[#e10600] hover:bg-[#c00] disabled:bg-[#e10600]/30 disabled:cursor-not-allowed text-white font-semibold text-sm py-2.5 rounded-lg transition-colors"
      >
        {submitting ? 'Submitting…' : 'Submit Prediction'}
      </button>

      <p className="text-center text-xs text-white/25">
        You can resubmit to update your picks before qualifying starts.
      </p>
    </div>
  );
}
