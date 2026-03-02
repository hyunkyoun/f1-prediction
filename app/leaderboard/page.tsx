import Link from 'next/link';
import { RACES } from '@/lib/data';
import { getAllPredictions, getResult } from '@/lib/storage';
import { calculateScore } from '@/lib/scoring';
import { SeasonStanding } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function LeaderboardPage() {
  // Fetch all rounds that have results
  const roundsWithResults = (
    await Promise.all(
      RACES.map(async (race) => {
        const result = await getResult(race.round);
        return result ? { race, result } : null;
      })
    )
  ).filter(Boolean) as { race: (typeof RACES)[0]; result: Awaited<ReturnType<typeof getResult>> }[];

  // Build standings
  const standingsMap = new Map<string, SeasonStanding>();

  for (const { race, result } of roundsWithResults) {
    if (!result) continue;
    const predictions = await getAllPredictions(race.round);
    for (const pred of predictions) {
      const score = calculateScore(pred, result);
      if (!standingsMap.has(pred.name)) {
        standingsMap.set(pred.name, { name: pred.name, totalPoints: 0, roundScores: {} });
      }
      const standing = standingsMap.get(pred.name)!;
      standing.totalPoints += score.total;
      standing.roundScores[race.round] = score;
    }
  }

  const standings = [...standingsMap.values()].sort((a, b) => b.totalPoints - a.totalPoints);

  const completedRounds = roundsWithResults.map((r) => r.race);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-1">
          Season <span className="text-[#e10600]">Leaderboard</span>
        </h1>
        <p className="text-white/40 text-sm">
          {completedRounds.length} of {RACES.length} rounds scored
        </p>
      </div>

      {standings.length === 0 ? (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-12 text-center text-white/30 text-sm">
          No scored rounds yet. Results will appear here after each qualifying session.
        </div>
      ) : (
        <>
          {/* Top 3 podium */}
          {standings.length >= 1 && (
            <div className="flex items-end justify-center gap-3 mb-8">
              {/* 2nd */}
              {standings[1] && (
                <div className="flex-1 max-w-[180px] bg-[#1a1a1a] border border-[#2a2a2a] rounded-t-xl p-4 text-center" style={{ marginBottom: 0, height: 140 }}>
                  <div className="text-3xl mb-1">🥈</div>
                  <div className="font-bold text-sm">{standings[1].name}</div>
                  <div className="text-2xl font-bold text-white/70 mt-1">{standings[1].totalPoints}</div>
                  <div className="text-white/30 text-xs">pts</div>
                </div>
              )}
              {/* 1st */}
              <div className="flex-1 max-w-[200px] bg-[#1a1a1a] border border-[#e10600]/40 rounded-t-xl p-4 text-center" style={{ height: 170 }}>
                <div className="text-4xl mb-1">🥇</div>
                <div className="font-bold">{standings[0].name}</div>
                <div className="text-3xl font-bold text-[#e10600] mt-1">{standings[0].totalPoints}</div>
                <div className="text-white/30 text-xs">pts</div>
              </div>
              {/* 3rd */}
              {standings[2] && (
                <div className="flex-1 max-w-[180px] bg-[#1a1a1a] border border-[#2a2a2a] rounded-t-xl p-4 text-center" style={{ height: 120 }}>
                  <div className="text-3xl mb-1">🥉</div>
                  <div className="font-bold text-sm">{standings[2].name}</div>
                  <div className="text-2xl font-bold text-white/70 mt-1">{standings[2].totalPoints}</div>
                  <div className="text-white/30 text-xs">pts</div>
                </div>
              )}
            </div>
          )}

          {/* Full table */}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-x-auto">
            <table className="w-full text-sm min-w-[500px]">
              <thead>
                <tr className="border-b border-[#2a2a2a]">
                  <th className="text-left px-4 py-3 text-xs text-white/40 font-semibold uppercase tracking-wider w-10">#</th>
                  <th className="text-left px-4 py-3 text-xs text-white/40 font-semibold uppercase tracking-wider">Player</th>
                  <th className="text-right px-4 py-3 text-xs text-white/40 font-semibold uppercase tracking-wider">Total</th>
                  {completedRounds.map((race) => (
                    <th key={race.round} className="text-right px-3 py-3 text-xs text-white/40 font-semibold">
                      <Link href={`/race/${race.round}`} className="hover:text-white transition-colors">
                        {race.flag} R{race.round}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {standings.map((s, i) => (
                  <tr key={s.name} className="border-b border-[#2a2a2a] last:border-0 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-white/40 font-medium">{i + 1}</td>
                    <td className="px-4 py-3 font-semibold">
                      {i === 0 && <span className="mr-1">🥇</span>}
                      {i === 1 && <span className="mr-1">🥈</span>}
                      {i === 2 && <span className="mr-1">🥉</span>}
                      {s.name}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-[#e10600] text-base">{s.totalPoints}</td>
                    {completedRounds.map((race) => {
                      const score = s.roundScores[race.round];
                      return (
                        <td key={race.round} className="px-3 py-3 text-right text-white/60">
                          {score !== undefined ? score.total : <span className="text-white/20">—</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Per-round breakdown */}
          <div className="mt-8">
            <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-4">Round-by-Round Scores</h2>
            <div className="space-y-3">
              {completedRounds.map((race) => (
                <div key={race.round} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
                  <Link href={`/race/${race.round}`} className="flex items-center gap-2 mb-3 hover:text-[#e10600] transition-colors">
                    <span>{race.flag}</span>
                    <span className="font-semibold text-sm">{race.name}</span>
                    <span className="text-white/30 text-xs ml-auto">R{race.round}</span>
                  </Link>
                  <div className="flex flex-wrap gap-2">
                    {standings
                      .filter((s) => s.roundScores[race.round] !== undefined)
                      .sort((a, b) => (b.roundScores[race.round]?.total ?? 0) - (a.roundScores[race.round]?.total ?? 0))
                      .map((s) => {
                        const score = s.roundScores[race.round];
                        return (
                          <span key={s.name} className="text-xs bg-white/5 border border-[#333] rounded px-2 py-1">
                            <span className="text-white/60">{s.name}:</span>{' '}
                            <span className="font-bold text-white">{score?.total ?? 0}</span>
                            <span className="text-white/30"> pts</span>
                          </span>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
