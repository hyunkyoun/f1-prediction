export interface Driver {
  id: string;
  name: string;
  shortName: string;
  number: number;
  team: string;
  teamId: string;
  teamColor: string;
  flag: string;
}

export interface Race {
  round: number;
  name: string;
  circuit: string;
  country: string;
  flag: string;
  qualDate: string; // YYYY-MM-DD (Saturday qualifying)
  raceDate: string; // YYYY-MM-DD
  sprint: boolean;
}

export interface Prediction {
  name: string;
  round: number;
  topFive: string[]; // 5 driver IDs for positions 1–5
  bottomFive: string[]; // 5 driver IDs for the last 5 positions (18–22)
  bonus: { driverId: string; position: number } | null; // position 6–17
  submittedAt: string;
}

export interface RaceResult {
  round: number;
  order: string[]; // 22 driver IDs ordered 1st → 22nd
}

export interface Score {
  name: string;
  topFive: number;
  bottomFive: number;
  bonus: number;
  total: number;
}

export interface SeasonStanding {
  name: string;
  totalPoints: number;
  roundScores: Record<number, Score>;
}
