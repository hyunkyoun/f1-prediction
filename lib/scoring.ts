import { Prediction, RaceResult, Score } from './types';
import { TOTAL_DRIVERS, TOP_ZONE_END, BOTTOM_ZONE_START } from './data';

/**
 * Calculate score for a single prediction against actual results.
 *
 * Scoring rules:
 *  - Top 5 (P1–P5):   1 point per exact position match
 *  - Bottom 6 (P17–P22): 1 point per exact position match
 *  - Bonus (P6–P16):  1 point if driver is at exactly that position
 *  - Max: 12 points per qualifying session
 */
export function calculateScore(prediction: Prediction, result: RaceResult): Score {
  const actual = result.order; // index 0 = P1, index 21 = P22

  // --- Top 5 ---
  let topFive = 0;
  for (let i = 0; i < TOP_ZONE_END; i++) {
    if (prediction.topFive[i] && actual[i] === prediction.topFive[i]) topFive++;
  }

  // --- Bottom 6 (last 6 positions, indices 16–21) ---
  let bottomFive = 0;
  const bottomStartIdx = BOTTOM_ZONE_START - 1; // index of P17 → 16
  for (let i = 0; i < 6; i++) {
    if (prediction.bottomFive[i] && actual[bottomStartIdx + i] === prediction.bottomFive[i]) {
      bottomFive++;
    }
  }

  // --- Bonus ---
  let bonus = 0;
  if (prediction.bonus) {
    const { driverId, position } = prediction.bonus;
    if (actual[position - 1] === driverId) bonus = 1;
  }

  return {
    name: prediction.name,
    topFive,
    bottomFive,
    bonus,
    total: topFive + bottomFive + bonus,
  };
}
