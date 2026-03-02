import Link from 'next/link';
import { RACES } from '@/lib/data';
import { getResult } from '@/lib/storage';

export const dynamic = 'force-dynamic';

function getRaceStatus(race: { qualDate: string }, hasResult: boolean) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const qual = new Date(race.qualDate);
  qual.setHours(0, 0, 0, 0);

  if (hasResult) return 'results';
  if (qual < today) return 'closed';
  if (qual.getTime() === today.getTime()) return 'today';
  return 'open';
}

const STATUS_STYLES = {
  results: 'bg-green-900/40 text-green-400 border-green-700/40',
  closed:  'bg-white/5 text-white/30 border-white/10',
  today:   'bg-yellow-900/40 text-yellow-400 border-yellow-700/40',
  open:    'bg-blue-900/40 text-blue-400 border-blue-700/40',
};

const STATUS_LABELS = {
  results: 'Results in',
  closed:  'Closed',
  today:   'Today — Predict!',
  open:    'Open',
};

export default async function HomePage() {
  // Check which rounds have results entered
  const resultChecks = await Promise.all(
    RACES.map(async (race) => {
      const result = await getResult(race.round);
      return { round: race.round, hasResult: !!result };
    })
  );
  const hasResultMap = Object.fromEntries(resultChecks.map((r) => [r.round, r.hasResult]));

  const now = new Date();
  const nextRace = RACES.find((r) => new Date(r.raceDate) >= now) ?? RACES[RACES.length - 1];

  return (
    <div>
      {/* Hero */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-1">
          <span className="text-[#e10600]">2026</span> F1 Season
        </h1>
        <p className="text-white/50 text-sm">
          Predict qualifying order · Max 11 pts per round · No account needed
        </p>
      </div>

      {/* Next race highlight */}
      <div className="mb-8 rounded-xl border border-[#e10600]/30 bg-[#e10600]/5 p-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-[#e10600] text-xs font-semibold uppercase tracking-wider mb-1">
            {hasResultMap[nextRace.round] ? 'Last race' : 'Next up'}
          </p>
          <p className="font-bold text-lg">{nextRace.flag} {nextRace.name}</p>
          <p className="text-white/50 text-sm">{nextRace.circuit} · Qualifying {new Date(nextRace.qualDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
        </div>
        <Link
          href={`/race/${nextRace.round}`}
          className="shrink-0 bg-[#e10600] hover:bg-[#c00] text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
        >
          {hasResultMap[nextRace.round] ? 'View Results' : 'Predict Now'}
        </Link>
      </div>

      {/* How to play */}
      <div className="mb-8 grid grid-cols-3 gap-3 text-sm">
        {[
          { icon: '🏆', label: 'Top 5', desc: 'Predict positions 1–5 in exact order' },
          { icon: '💀', label: 'Bottom 5', desc: 'Predict positions 18–22 in exact order' },
          { icon: '⭐', label: 'Bonus', desc: 'Pick one driver in P6–P17 at exact position' },
        ].map((tip) => (
          <div key={tip.label} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3">
            <div className="text-xl mb-1">{tip.icon}</div>
            <div className="font-semibold text-white/90">{tip.label}</div>
            <div className="text-white/40 text-xs mt-0.5">{tip.desc}</div>
          </div>
        ))}
      </div>

      {/* Race grid */}
      <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-4">Race Calendar</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {RACES.map((race) => {
          const status = getRaceStatus(race, hasResultMap[race.round]);
          return (
            <Link
              key={race.round}
              href={`/race/${race.round}`}
              className="group block bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#444] rounded-xl p-4 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{race.flag}</span>
                <div className="flex items-center gap-1.5">
                  {race.sprint && (
                    <span className="text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30 px-1.5 py-0.5 rounded">
                      SPRINT
                    </span>
                  )}
                  <span className={`text-[10px] font-bold border px-1.5 py-0.5 rounded ${STATUS_STYLES[status]}`}>
                    {STATUS_LABELS[status]}
                  </span>
                </div>
              </div>

              <div className="text-xs text-white/40 mb-0.5">Round {race.round}</div>
              <div className="font-semibold text-white group-hover:text-[#e10600] transition-colors leading-snug">
                {race.name}
              </div>
              <div className="text-xs text-white/40 mt-1">{race.circuit}</div>
              <div className="text-xs text-white/30 mt-2">
                Qual: {new Date(race.qualDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                {' · '}
                Race: {new Date(race.raceDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
