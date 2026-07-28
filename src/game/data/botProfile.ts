import type { RobotStats } from '../types/game';

export type WeaponClass =
  | 'horizontal_spinner'
  | 'vertical_spinner'
  | 'undercutter'
  | 'drum'
  | 'flipper'
  | 'saw'
  | 'multibot'
  | 'dual_spinner';

export type StrategyStyle =
  | 'aggressive_rusher'
  | 'box_rush'
  | 'counter_attacker'
  | 'control_grinder'
  | 'hit_and_run'
  | 'defensive';

export interface BotProfile {
  id: string;
  name: string;
  weaponClass: WeaponClass;
  weaponLabel: string;
  moveSpeed: number;
  reverseSpeed: number;
  rotationSpeed: number;
  attackDamage: number;
  attackRange: number;
  attackArc: number;
  attackCooldown: number;
  knockbackForce: number;
  maxHealth: number;
  bodyRadius: number;
  strategy: StrategyStyle;
  strategyNotes: string;
  winRate?: number;
  record?: string;
  sources: string[];
}

export interface BotProfilesFile {
  fetchedAt: string;
  sources: string[];
  profiles: BotProfile[];
}

export function profileToStats(profile: BotProfile): RobotStats {
  return {
    maxHealth: profile.maxHealth,
    moveSpeed: profile.moveSpeed,
    reverseSpeed: profile.reverseSpeed,
    rotationSpeed: profile.rotationSpeed,
    attackDamage: profile.attackDamage,
    attackRange: profile.attackRange,
    attackArc: profile.attackArc,
    attackCooldown: profile.attackCooldown,
    knockbackForce: profile.knockbackForce,
    bodyRadius: profile.bodyRadius,
  };
}

export function weaponLabelToClass(label: string): WeaponClass {
  const lower = label.toLowerCase();
  if (lower.includes('flipper')) return 'flipper';
  if (lower.includes('undercut')) return 'undercutter';
  if (lower.includes('saw') || lower.includes('overhead')) return 'saw';
  if (lower.includes('multibot') || lower.includes('cluster')) return 'multibot';
  if (lower.includes('dual') || lower.includes('twin') || lower.includes('heart')) return 'dual_spinner';
  if (lower.includes('drum')) return 'drum';
  if (lower.includes('horizontal') || lower.includes('bar') || lower.includes('ring')) {
    return 'horizontal_spinner';
  }
  return 'vertical_spinner';
}
