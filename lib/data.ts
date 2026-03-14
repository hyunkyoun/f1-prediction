import { Driver, Race } from './types';

export const DRIVERS: Driver[] = [
  { id: 'norris',     name: 'Lando Norris',      shortName: 'NOR', number: 4,  team: 'McLaren',       teamId: 'mclaren',      teamColor: '#FF8000', flag: '🇬🇧' },
  { id: 'piastri',   name: 'Oscar Piastri',     shortName: 'PIA', number: 81, team: 'McLaren',       teamId: 'mclaren',      teamColor: '#FF8000', flag: '🇦🇺' },
  { id: 'russell',   name: 'George Russell',    shortName: 'RUS', number: 63, team: 'Mercedes',      teamId: 'mercedes',     teamColor: '#27F4D2', flag: '🇬🇧' },
  { id: 'antonelli', name: 'Kimi Antonelli',    shortName: 'ANT', number: 12, team: 'Mercedes',      teamId: 'mercedes',     teamColor: '#27F4D2', flag: '🇮🇹' },
  { id: 'leclerc',   name: 'Charles Leclerc',   shortName: 'LEC', number: 16, team: 'Ferrari',       teamId: 'ferrari',      teamColor: '#E8002D', flag: '🇲🇨' },
  { id: 'hamilton',  name: 'Lewis Hamilton',    shortName: 'HAM', number: 44, team: 'Ferrari',       teamId: 'ferrari',      teamColor: '#E8002D', flag: '🇬🇧' },
  { id: 'verstappen',name: 'Max Verstappen',    shortName: 'VER', number: 1,  team: 'Red Bull',      teamId: 'redbull',      teamColor: '#3671C6', flag: '🇳🇱' },
  { id: 'hadjar',    name: 'Isack Hadjar',      shortName: 'HAD', number: 6,  team: 'Red Bull',      teamId: 'redbull',      teamColor: '#3671C6', flag: '🇫🇷' },
  { id: 'lawson',    name: 'Liam Lawson',       shortName: 'LAW', number: 30, team: 'Racing Bulls',  teamId: 'racingbulls',  teamColor: '#6692FF', flag: '🇳🇿' },
  { id: 'lindblad',  name: 'Arvid Lindblad',   shortName: 'LIN', number: 40, team: 'Racing Bulls',  teamId: 'racingbulls',  teamColor: '#6692FF', flag: '🇸🇪' },
  { id: 'alonso',    name: 'Fernando Alonso',   shortName: 'ALO', number: 14, team: 'Aston Martin',  teamId: 'astonmartin',  teamColor: '#358C75', flag: '🇪🇸' },
  { id: 'stroll',    name: 'Lance Stroll',      shortName: 'STR', number: 18, team: 'Aston Martin',  teamId: 'astonmartin',  teamColor: '#358C75', flag: '🇨🇦' },
  { id: 'sainz',     name: 'Carlos Sainz',      shortName: 'SAI', number: 55, team: 'Williams',      teamId: 'williams',     teamColor: '#64C4FF', flag: '🇪🇸' },
  { id: 'albon',     name: 'Alex Albon',        shortName: 'ALB', number: 23, team: 'Williams',      teamId: 'williams',     teamColor: '#64C4FF', flag: '🇹🇭' },
  { id: 'gasly',     name: 'Pierre Gasly',      shortName: 'GAS', number: 10, team: 'Alpine',        teamId: 'alpine',       teamColor: '#0093CC', flag: '🇫🇷' },
  { id: 'colapinto', name: 'Franco Colapinto',  shortName: 'COL', number: 43, team: 'Alpine',        teamId: 'alpine',       teamColor: '#0093CC', flag: '🇦🇷' },
  { id: 'ocon',      name: 'Esteban Ocon',      shortName: 'OCO', number: 31, team: 'Haas',          teamId: 'haas',         teamColor: '#B6BABD', flag: '🇫🇷' },
  { id: 'bearman',   name: 'Ollie Bearman',     shortName: 'BEA', number: 87, team: 'Haas',          teamId: 'haas',         teamColor: '#B6BABD', flag: '🇬🇧' },
  { id: 'hulkenberg', name: 'Nico Hülkenberg',  shortName: 'HUL', number: 27, team: 'Audi',          teamId: 'audi',         teamColor: '#C0C0C0', flag: '🇩🇪' },
  { id: 'bortoleto', name: 'Gabriel Bortoleto', shortName: 'BOR', number: 5,  team: 'Audi',          teamId: 'audi',         teamColor: '#C0C0C0', flag: '🇧🇷' },
  { id: 'perez',     name: 'Sergio Pérez',      shortName: 'PER', number: 11, team: 'Cadillac',      teamId: 'cadillac',     teamColor: '#005AFF', flag: '🇲🇽' },
  { id: 'bottas',    name: 'Valtteri Bottas',   shortName: 'BOT', number: 77, team: 'Cadillac',      teamId: 'cadillac',     teamColor: '#005AFF', flag: '🇫🇮' },
];

export const RACES: Race[] = [
  { round: 1,  name: 'Australian Grand Prix',    circuit: 'Albert Park Circuit',              country: 'Australia',       flag: '🇦🇺', qualDate: '2026-03-07', raceDate: '2026-03-08', sprint: false },
  { round: 2,  name: 'Chinese Grand Prix',       circuit: 'Shanghai International Circuit',   country: 'China',           flag: '🇨🇳', qualDate: '2026-03-14', raceDate: '2026-03-15', sprint: true  },
  { round: 3,  name: 'Japanese Grand Prix',      circuit: 'Suzuka International Racing Course',country: 'Japan',           flag: '🇯🇵', qualDate: '2026-03-28', raceDate: '2026-03-29', sprint: false },
  { round: 4,  name: 'Bahrain Grand Prix',       circuit: 'Bahrain International Circuit',    country: 'Bahrain',         flag: '🇧🇭', qualDate: '2026-04-11', raceDate: '2026-04-12', sprint: false, cancelled: true },
  { round: 5,  name: 'Saudi Arabian Grand Prix', circuit: 'Jeddah Corniche Circuit',          country: 'Saudi Arabia',    flag: '🇸🇦', qualDate: '2026-04-18', raceDate: '2026-04-19', sprint: false, cancelled: true },
  { round: 6,  name: 'Miami Grand Prix',         circuit: 'Miami International Autodrome',    country: 'United States',   flag: '🇺🇸', qualDate: '2026-05-02', raceDate: '2026-05-03', sprint: true  },
  { round: 7,  name: 'Canadian Grand Prix',      circuit: 'Circuit Gilles-Villeneuve',        country: 'Canada',          flag: '🇨🇦', qualDate: '2026-05-23', raceDate: '2026-05-24', sprint: true  },
  { round: 8,  name: 'Monaco Grand Prix',        circuit: 'Circuit de Monaco',                country: 'Monaco',          flag: '🇲🇨', qualDate: '2026-06-06', raceDate: '2026-06-07', sprint: false },
  { round: 9,  name: 'Spanish Grand Prix',       circuit: 'Circuit de Barcelona-Catalunya',   country: 'Spain',           flag: '🇪🇸', qualDate: '2026-06-13', raceDate: '2026-06-14', sprint: false },
  { round: 10, name: 'Austrian Grand Prix',      circuit: 'Red Bull Ring',                    country: 'Austria',         flag: '🇦🇹', qualDate: '2026-06-27', raceDate: '2026-06-28', sprint: false },
  { round: 11, name: 'British Grand Prix',       circuit: 'Silverstone Circuit',              country: 'United Kingdom',  flag: '🇬🇧', qualDate: '2026-07-04', raceDate: '2026-07-05', sprint: true  },
  { round: 12, name: 'Belgian Grand Prix',       circuit: 'Circuit de Spa-Francorchamps',     country: 'Belgium',         flag: '🇧🇪', qualDate: '2026-07-18', raceDate: '2026-07-19', sprint: false },
  { round: 13, name: 'Hungarian Grand Prix',     circuit: 'Hungaroring',                      country: 'Hungary',         flag: '🇭🇺', qualDate: '2026-07-25', raceDate: '2026-07-26', sprint: false },
  { round: 14, name: 'Dutch Grand Prix',         circuit: 'Circuit Zandvoort',                country: 'Netherlands',     flag: '🇳🇱', qualDate: '2026-08-22', raceDate: '2026-08-23', sprint: true  },
  { round: 15, name: 'Italian Grand Prix',       circuit: 'Autodromo Nazionale Monza',        country: 'Italy',           flag: '🇮🇹', qualDate: '2026-09-05', raceDate: '2026-09-06', sprint: false },
  { round: 16, name: 'Madrid Grand Prix',        circuit: 'IFEMA Madrid Circuit',             country: 'Spain',           flag: '🇪🇸', qualDate: '2026-09-12', raceDate: '2026-09-13', sprint: false },
  { round: 17, name: 'Azerbaijan Grand Prix',    circuit: 'Baku City Circuit',                country: 'Azerbaijan',      flag: '🇦🇿', qualDate: '2026-09-25', raceDate: '2026-09-26', sprint: false },
  { round: 18, name: 'Singapore Grand Prix',     circuit: 'Marina Bay Street Circuit',        country: 'Singapore',       flag: '🇸🇬', qualDate: '2026-10-10', raceDate: '2026-10-11', sprint: true  },
  { round: 19, name: 'United States Grand Prix', circuit: 'Circuit of the Americas',          country: 'United States',   flag: '🇺🇸', qualDate: '2026-10-24', raceDate: '2026-10-25', sprint: false },
  { round: 20, name: 'Mexico City Grand Prix',   circuit: 'Autódromo Hermanos Rodríguez',     country: 'Mexico',          flag: '🇲🇽', qualDate: '2026-10-31', raceDate: '2026-11-01', sprint: false },
  { round: 21, name: 'São Paulo Grand Prix',     circuit: 'Autódromo José Carlos Pace',       country: 'Brazil',          flag: '🇧🇷', qualDate: '2026-11-07', raceDate: '2026-11-08', sprint: false },
  { round: 22, name: 'Las Vegas Grand Prix',     circuit: 'Las Vegas Strip Circuit',          country: 'United States',   flag: '🇺🇸', qualDate: '2026-11-20', raceDate: '2026-11-21', sprint: false },
  { round: 23, name: 'Qatar Grand Prix',         circuit: 'Lusail International Circuit',     country: 'Qatar',           flag: '🇶🇦', qualDate: '2026-11-28', raceDate: '2026-11-29', sprint: false },
  { round: 24, name: 'Abu Dhabi Grand Prix',     circuit: 'Yas Marina Circuit',               country: 'United Arab Emirates', flag: '🇦🇪', qualDate: '2026-12-05', raceDate: '2026-12-06', sprint: false },
];

// With 22 drivers:
// Positions 1–5   → Top 5 zone
// Positions 6–16  → Bonus zone
// Positions 17–22 → Bottom 6 zone
export const TOTAL_DRIVERS = DRIVERS.length; // 22
export const TOP_ZONE_END = 5;
export const BOTTOM_ZONE_START = TOTAL_DRIVERS - 5; // 17
export const BONUS_MIN = TOP_ZONE_END + 1; // 6
export const BONUS_MAX = BOTTOM_ZONE_START - 1; // 16

export function getDriver(id: string): Driver | undefined {
  return DRIVERS.find((d) => d.id === id);
}

export function getRace(round: number): Race | undefined {
  return RACES.find((r) => r.round === round);
}
