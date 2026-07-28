/**
 * Canonical BattleBots Pro League roster — 24 bots in 6 groups of 4.
 * Source: battlebots.com / BattleBots Wiki (April 2026 group reveal).
 */
export type ProLeagueGroup = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export interface ProLeagueBot {
  id: string;
  name: string;
  group: ProLeagueGroup;
  weaponType: string;
  country?: string;
}

/** All 24 Pro League competitors — use this to validate roster completeness. */
export const PRO_LEAGUE_BOTS: ProLeagueBot[] = [
  { id: 'manta', name: 'Manta', group: 'A', weaponType: 'vertical drum', country: 'UK' },
  { id: 'terrortops', name: 'Terrortops', group: 'A', weaponType: 'horizontal spinner', country: 'US' },
  { id: 'skorpios', name: 'Skorpios', group: 'A', weaponType: 'overhead saw', country: 'US' },
  { id: 'valkyrie', name: 'Valkyrie', group: 'A', weaponType: 'undercutter spinner', country: 'US' },
  { id: 'disarray', name: 'Disarray', group: 'B', weaponType: 'dual vertical discs', country: 'US' },
  { id: 'madcatter', name: 'MadCatter', group: 'B', weaponType: 'vertical disc', country: 'US' },
  { id: 'magnitude', name: 'Magnitude', group: 'B', weaponType: 'horizontal drum', country: 'US' },
  { id: 'tombstone', name: 'Tombstone', group: 'B', weaponType: 'horizontal bar spinner', country: 'US' },
  { id: 'copperhead', name: 'Copperhead', group: 'C', weaponType: 'drum spinner', country: 'US' },
  { id: 'thetwins', name: 'The Twins', group: 'C', weaponType: 'multibot cluster', country: 'US' },
  { id: 'cobalt', name: 'Cobalt', group: 'C', weaponType: 'vertical spinner', country: 'US' },
  { id: 'jackpot', name: 'Jackpot', group: 'C', weaponType: 'dual vertical discs', country: 'US' },
  { id: 'deathroll', name: 'Death Roll', group: 'D', weaponType: 'vertical disc', country: 'AU' },
  { id: 'endgame', name: 'End Game', group: 'D', weaponType: 'vertical spinner', country: 'NZ' },
  { id: 'malice', name: 'Malice', group: 'D', weaponType: 'horizontal ring spinner', country: 'UK' },
  { id: 'goldenfury', name: 'Golden Fury', group: 'D', weaponType: 'vertical discs', country: 'IN' },
  { id: 'bloodsport', name: 'Bloodsport', group: 'E', weaponType: 'horizontal spinner', country: 'US' },
  { id: 'huge', name: 'HUGE', group: 'E', weaponType: 'vertical bar spinner', country: 'US' },
  { id: 'hypershock', name: 'HyperShock', group: 'E', weaponType: 'vertical disc', country: 'US' },
  { id: 'minotaur', name: 'Minotaur', group: 'E', weaponType: 'drum spinner', country: 'BR' },
  { id: 'witchdoctor', name: 'Witch Doctor', group: 'F', weaponType: 'vertical spinner', country: 'US' },
  { id: 'switchback', name: 'Switchback', group: 'F', weaponType: 'flipper', country: 'US' },
  { id: 'ribbot', name: 'Ribbot', group: 'F', weaponType: 'vertical spinner', country: 'US' },
  { id: 'orbitron', name: 'Orbitron', group: 'F', weaponType: 'twin vertical discs (AI)', country: 'CA' },
];

export const PRO_LEAGUE_BOT_COUNT = PRO_LEAGUE_BOTS.length;

export function getProLeagueBot(id: string): ProLeagueBot | undefined {
  return PRO_LEAGUE_BOTS.find((b) => b.id === id);
}

export function botsByGroup(group: ProLeagueGroup): ProLeagueBot[] {
  return PRO_LEAGUE_BOTS.filter((b) => b.group === group);
}
