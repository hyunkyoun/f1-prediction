import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getRace, DRIVERS, BONUS_MIN, BONUS_MAX, BOTTOM_ZONE_START, TOP_ZONE_END } from '@/lib/data';
import { getAllPredictions, getResult } from '@/lib/storage';
import { calculateScore } from '@/lib/scoring';
import { PredictionFormClient } from '@/components/PredictionFormClient';

interface Props {
  params: Promise<{ round: string }>;
}

export default async function RacePage({ params }: Props) {
  const { round: roundStr } = await params;
  const round = parseInt(roundStr);
  const race = getRace(round);
  if (!race) notFound();

  const [predictions, result] = await Promise.all([
    getAllPredictions(round),
    getResult(round),
  ]);

  const scores = result
    ? predictions.map((p) => calculateScore(p, result))
    : null;

  const sortedPredictions = scores
    ? [...predictions].sort((a, b) => {
        const sa = scores.find((s) => s.name === a.name)?.total ?? 0;
        const sb = scores.find((s) => s.name === b.name)?.total ?? 0;
        return sb - sa;
      })
    : predictions.sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));

  const qualDate = new Date(race.qualDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  qualDate.setHours(0, 0, 0, 0);
  const isPredictionOpen = qualDate >= today && !result;

  function driverName(id: string) {
    return DRIVERS.find((d) => d.id === id)?.name ?? id;
  }
  function driverShort(id: string) {
    return DRIVERS.find((d) => d.id === id)?.shortName ?? id;
  }
  function driverColor(id: string) {
    return DRIVERS.find((d) => d.id === id)?.teamColor ?? '#888';
  }

  return (
    <div>
      {/* Back */}
      <Link href="/" className="text-white/40 hover:text-white text-sm mb-6 inline-flex items-center gap-1 transition-colors">
        ← Calendar
      </Link>

      {/* Race header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-4xl">{race.flag}</span>
          <div>
            <div className="text-xs text-white/40 font-medium uppercase tracking-wider">Round {race.round}</div>
            <h1 className="text-2xl font-bold">{race.name}</h1>
          </div>
        </div>
        <p className="text-white/40 text-sm ml-[52px]">
          {race.circuit} ·{' '}
          Qualifying {new Date(race.qualDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          {race.sprint && <span className="ml-2 text-orange-400 text-xs font-bold">SPRINT WEEKEND</span>}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
        {/* Left: predictions table / results */}
        <div>
          {result ? (
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-4">Actual Qualifying Results</h2>
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden">
                {result.order.map((driverId, idx) => {
                  const pos = idx + 1;
                  const zone =
                    pos <= TOP_ZONE_END ? 'top' :
                    pos >= BOTTOM_ZONE_START ? 'bottom' : 'mid';
                  return (
                    <div
                      key={driverId}
                      className="flex items-center gap-3 px-4 py-2.5 border-b border-[#2a2a2a] last:border-0"
                    >
                      <span className={`w-8 text-right font-bold text-sm ${
                        zone === 'top' ? 'text-[#e10600]' :
                        zone === 'bottom' ? 'text-blue-400' : 'text-white/40'
                      }`}>P{pos}</span>
                      <div
                        className="w-1 h-5 rounded-full shrink-0"
                        style={{ background: driverColor(driverId) }}
                      />
                      <span className="font-medium text-sm">{driverName(driverId)}</span>
                      {zone === 'top' && <span className="ml-auto text-[10px] text-[#e10600] font-bold">TOP 5</span>}
                      {zone === 'bottom' && <span className="ml-auto text-[10px] text-blue-400 font-bold">BTM 5</span>}
                      {zone === 'mid' && pos >= BONUS_MIN && pos <= BONUS_MAX && (
                        <span className="ml-auto text-[10px] text-white/20">BONUS ZONE</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="mb-8 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 text-sm text-white/40 text-center">
              Results not yet entered. Check back after qualifying!
            </div>
          )}

          {/* Predictions table */}
          <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-4">
            Predictions ({predictions.length})
          </h2>

          {predictions.length === 0 ? (
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-8 text-center text-white/30 text-sm">
              No predictions yet. Be the first!
            </div>
          ) : (
            <div className="space-y-3">
              {sortedPredictions.map((pred, i) => {
                const score = scores?.find((s) => s.name === pred.name);
                return (
                  <div
                    key={pred.name}
                    className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {score && i < 3 && (
                          <span className="text-lg">{['🥇','🥈','🥉'][i]}</span>
                        )}
                        <span className="font-semibold">{pred.name}</span>
                      </div>
                      {score ? (
                        <div className="text-right">
                          <span className="text-lg font-bold text-[#e10600]">{score.total}</span>
                          <span className="text-white/30 text-xs ml-1">/ 11 pts</span>
                        </div>
                      ) : (
                        <span className="text-xs text-white/30">Pending results</span>
                      )}
                    </div>

                    {/* Score breakdown */}
                    {score && (
                      <div className="flex gap-3 text-xs mb-3">
                        <span className="text-white/50">Top 5: <span className="text-white font-semibold">{score.topFive}/5</span></span>
                        <span className="text-white/50">Btm 5: <span className="text-white font-semibold">{score.bottomFive}/5</span></span>
                        <span className="text-white/50">Bonus: <span className="text-white font-semibold">{score.bonus}/1</span></span>
                      </div>
                    )}

                    {/* Top 5 picks */}
                    <div className="mb-2">
                      <div className="text-[10px] text-[#e10600] font-bold uppercase mb-1.5">Top 5</div>
                      <div className="flex flex-wrap gap-1.5">
                        {pred.topFive.map((dId, idx) => {
                          const correct = result && result.order[idx] === dId;
                          return (
                            <span
                              key={idx}
                              style={{ borderColor: driverColor(dId) }}
                              className={`text-xs px-2 py-0.5 rounded border font-medium ${
                                result
                                  ? correct
                                    ? 'bg-green-900/30 text-green-300'
                                    : 'bg-white/5 text-white/40'
                                  : 'bg-white/5 text-white/70'
                              }`}
                            >
                              P{idx + 1} {driverShort(dId)}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Bottom 5 picks */}
                    <div className="mb-2">
                      <div className="text-[10px] text-blue-400 font-bold uppercase mb-1.5">Bottom 5</div>
                      <div className="flex flex-wrap gap-1.5">
                        {pred.bottomFive.map((dId, idx) => {
                          const actualPos = BOTTOM_ZONE_START + idx; // 18, 19, 20, 21, 22
                          const correct = result && result.order[actualPos - 1] === dId;
                          return (
                            <span
                              key={idx}
                              style={{ borderColor: driverColor(dId) }}
                              className={`text-xs px-2 py-0.5 rounded border font-medium ${
                                result
                                  ? correct
                                    ? 'bg-green-900/30 text-green-300'
                                    : 'bg-white/5 text-white/40'
                                  : 'bg-white/5 text-white/70'
                              }`}
                            >
                              P{actualPos} {driverShort(dId)}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Bonus pick */}
                    {pred.bonus && (
                      <div>
                        <div className="text-[10px] text-yellow-400 font-bold uppercase mb-1.5">Bonus</div>
                        <span
                          style={{ borderColor: driverColor(pred.bonus.driverId) }}
                          className={`text-xs px-2 py-0.5 rounded border font-medium ${
                            result
                              ? result.order[pred.bonus.position - 1] === pred.bonus.driverId
                                ? 'bg-green-900/30 text-green-300'
                                : 'bg-white/5 text-white/40'
                              : 'bg-white/5 text-white/70'
                          }`}
                        >
                          P{pred.bonus.position} {driverShort(pred.bonus.driverId)}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: prediction form (client) */}
        <div className="lg:sticky lg:top-20 h-fit">
          <PredictionFormClient round={round} isPredictionOpen={isPredictionOpen} />
        </div>
      </div>
    </div>
  );
}
