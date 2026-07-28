import type { BotProfile, BotProfilesFile, WeaponClass } from './botProfile';
import { profileToStats, weaponLabelToClass } from './botProfile';
import type { FighterDef } from './roster';
import { FIGHTERS } from './roster';
import type { StrategyStyle } from './botProfile';

export interface LoadedFighter extends FighterDef {
  weaponClass: WeaponClass;
  strategy: StrategyStyle;
  strategyNotes: string;
  record?: string;
  winRate?: number;
}

export const REGISTRY_PLAYER_FIGHTER = 'playerFighter';
export const REGISTRY_OPPONENT_FIGHTER = 'opponentFighter';
export const REGISTRY_BOT_PROFILES = 'botProfiles';

let cachedProfiles: Map<string, BotProfile> | null = null;

export async function loadBotProfiles(): Promise<Map<string, BotProfile>> {
  if (cachedProfiles) return cachedProfiles;

  try {
    const res = await fetch('/data/bot-profiles.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as BotProfilesFile;
    cachedProfiles = new Map(data.profiles.map((p) => [p.id, p]));
    return cachedProfiles;
  } catch {
    cachedProfiles = buildFallbackProfiles();
    return cachedProfiles;
  }
}

export function buildFallbackProfiles(): Map<string, BotProfile> {
  const map = new Map<string, BotProfile>();
  for (const f of FIGHTERS) {
    map.set(f.id, fighterToFallbackProfile(f));
  }
  return map;
}

function fighterToFallbackProfile(f: FighterDef): BotProfile {
  return {
    id: f.id,
    name: f.name,
    weaponClass: weaponLabelToClass(f.weaponLabel),
    weaponLabel: f.weaponLabel,
    ...f.stats,
    strategy: defaultStrategyForWeapon(f.weaponLabel),
    strategyNotes: f.blurb,
    sources: [],
  };
}

function defaultStrategyForWeapon(weaponLabel: string): StrategyStyle {
  const lower = weaponLabel.toLowerCase();
  if (lower.includes('flipper')) return 'box_rush';
  if (lower.includes('drum') || lower.includes('horizontal')) return 'aggressive_rusher';
  if (lower.includes('undercut')) return 'hit_and_run';
  if (lower.includes('saw')) return 'control_grinder';
  return 'counter_attacker';
}

export function mergeProfileIntoFighter(
  fighter: FighterDef,
  profile: BotProfile | undefined,
): LoadedFighter {
  if (!profile) {
    return {
      ...fighter,
      weaponClass: weaponLabelToClass(fighter.weaponLabel),
      strategy: defaultStrategyForWeapon(fighter.weaponLabel),
      strategyNotes: fighter.blurb,
    };
  }

  return {
    ...fighter,
    weaponLabel: profile.weaponLabel,
    stats: profileToStats(profile),
    weaponClass: profile.weaponClass,
    strategy: profile.strategy,
    strategyNotes: profile.strategyNotes,
    record: profile.record,
    winRate: profile.winRate,
  };
}

export function loadFighterWithProfile(
  id: string | undefined | null,
  profiles: Map<string, BotProfile>,
): LoadedFighter {
  const fighter = FIGHTERS.find((f) => f.id === id && f.selectable) ?? FIGHTERS[0]!;
  return mergeProfileIntoFighter(fighter, profiles.get(fighter.id));
}
