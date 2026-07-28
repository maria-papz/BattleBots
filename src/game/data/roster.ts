import type { RobotStats } from '../types/game';
import {
  BLOODSPORT_RED,
  COBALT_GREEN,
  COPPERHEAD_COPPER,
  DEATHROLL_LIME,
  DISARRAY_TEAL,
  ENDGAME_ORANGE,
  GOLDENFURY_GOLD,
  HUGE_BLUE,
  HYPERSHOCK_YELLOW,
  JACKPOT_GREEN,
  MADCATTER_RED,
  MAGNITUDE_YELLOW,
  MALICE_RED,
  MANTA_BLUE,
  MINOTAUR_GOLD,
  ORBITRON_BLUE,
  RIBBOT_GREEN,
  TEXTURE_KEYS,
} from '../constants';

export type FighterId =
  | 'bloodsport'
  | 'cobalt'
  | 'copperhead'
  | 'deathroll'
  | 'disarray'
  | 'endgame'
  | 'goldenfury'
  | 'huge'
  | 'hypershock'
  | 'jackpot'
  | 'madcatter'
  | 'magnitude'
  | 'malice'
  | 'manta'
  | 'minotaur'
  | 'orbitron'
  | 'ribbot';

export interface FighterDef {
  id: FighterId;
  name: string;
  shortName: string;
  weaponLabel: string;
  blurb: string;
  accent: number;
  accentHex: string;
  bodyKey: string;
  weaponKey: string;
  hudKey: string;
  portraitKey: string;
  stats: RobotStats;
  selectable: boolean;
}

/** Overhead spinner — high damage, slightly slower turn. */
export const BLOODSPORT_STATS: RobotStats = {
  maxHealth: 100,
  moveSpeed: 168,
  reverseSpeed: 105,
  rotationSpeed: 155,
  attackDamage: 15,
  attackRange: 76,
  attackArc: 70,
  attackCooldown: 720,
  knockbackForce: 260,
  bodyRadius: 24,
};

/** Vertical spinner wedge — scoop forks, strong bite, agile. */
export const COBALT_STATS: RobotStats = {
  maxHealth: 100,
  moveSpeed: 175,
  reverseSpeed: 108,
  rotationSpeed: 170,
  attackDamage: 14,
  attackRange: 72,
  attackArc: 50,
  attackCooldown: 680,
  knockbackForce: 240,
  bodyRadius: 23,
};

/** Drum spinner — brutal bite, slower turn, high knockback. */
export const COPPERHEAD_STATS: RobotStats = {
  maxHealth: 105,
  moveSpeed: 158,
  reverseSpeed: 100,
  rotationSpeed: 140,
  attackDamage: 16,
  attackRange: 70,
  attackArc: 60,
  attackCooldown: 760,
  knockbackForce: 280,
  bodyRadius: 25,
};

/** Dino vertical disc — scoop forks, savage bite. */
export const DEATHROLL_STATS: RobotStats = {
  maxHealth: 100,
  moveSpeed: 162,
  reverseSpeed: 102,
  rotationSpeed: 150,
  attackDamage: 16,
  attackRange: 74,
  attackArc: 48,
  attackCooldown: 700,
  knockbackForce: 270,
  bodyRadius: 24,
};

/** Dual vertical discs — long forks, high control. */
export const DISARRAY_STATS: RobotStats = {
  maxHealth: 100,
  moveSpeed: 170,
  reverseSpeed: 108,
  rotationSpeed: 165,
  attackDamage: 14,
  attackRange: 78,
  attackArc: 45,
  attackCooldown: 690,
  knockbackForce: 250,
  bodyRadius: 24,
};

/** Orange-wedge vertical spinner — sturdy, strong bite. */
export const ENDGAME_STATS: RobotStats = {
  maxHealth: 110,
  moveSpeed: 155,
  reverseSpeed: 98,
  rotationSpeed: 145,
  attackDamage: 15,
  attackRange: 72,
  attackArc: 52,
  attackCooldown: 740,
  knockbackForce: 275,
  bodyRadius: 26,
};

/** Gold-side / red-scoop vertical twin discs. */
export const GOLDENFURY_STATS: RobotStats = {
  maxHealth: 105,
  moveSpeed: 160,
  reverseSpeed: 100,
  rotationSpeed: 148,
  attackDamage: 15,
  attackRange: 72,
  attackArc: 50,
  attackCooldown: 710,
  knockbackForce: 265,
  bodyRadius: 25,
};

/** Giant-wheel vertical bar spinner — reach and bite. */
export const HUGE_STATS: RobotStats = {
  maxHealth: 100,
  moveSpeed: 150,
  reverseSpeed: 95,
  rotationSpeed: 135,
  attackDamage: 17,
  attackRange: 82,
  attackArc: 55,
  attackCooldown: 780,
  knockbackForce: 300,
  bodyRadius: 28,
};

/** Neon vertical disc — fast undercuts, high bite. */
export const HYPERSHOCK_STATS: RobotStats = {
  maxHealth: 95,
  moveSpeed: 178,
  reverseSpeed: 110,
  rotationSpeed: 175,
  attackDamage: 16,
  attackRange: 76,
  attackArc: 48,
  attackCooldown: 660,
  knockbackForce: 255,
  bodyRadius: 23,
};

/** Twin heart vertical discs — Vegas bite, tall srimech. */
export const JACKPOT_STATS: RobotStats = {
  maxHealth: 100,
  moveSpeed: 165,
  reverseSpeed: 105,
  rotationSpeed: 155,
  attackDamage: 15,
  attackRange: 74,
  attackArc: 50,
  attackCooldown: 700,
  knockbackForce: 270,
  bodyRadius: 24,
};

/** Vertical disc wedge — aggressive undercut, cat-eyed plow. */
export const MADCATTER_STATS: RobotStats = {
  maxHealth: 100,
  moveSpeed: 170,
  reverseSpeed: 108,
  rotationSpeed: 160,
  attackDamage: 15,
  attackRange: 72,
  attackArc: 48,
  attackCooldown: 680,
  knockbackForce: 260,
  bodyRadius: 24,
};

/** Horizontal drum spinner — heavy bite, neon seismic accents. */
export const MAGNITUDE_STATS: RobotStats = {
  maxHealth: 105,
  moveSpeed: 160,
  reverseSpeed: 100,
  rotationSpeed: 145,
  attackDamage: 16,
  attackRange: 70,
  attackArc: 55,
  attackCooldown: 720,
  knockbackForce: 280,
  bodyRadius: 25,
};

/** Horizontal ring spinner — wide bite, feeder forks. */
export const MALICE_STATS: RobotStats = {
  maxHealth: 100,
  moveSpeed: 165,
  reverseSpeed: 105,
  rotationSpeed: 150,
  attackDamage: 16,
  attackRange: 78,
  attackArc: 70,
  attackCooldown: 690,
  knockbackForce: 275,
  bodyRadius: 25,
};

/** Gold vertical drum — blue chassis, asymmetric feeder forks. */
export const MANTA_STATS: RobotStats = {
  maxHealth: 100,
  moveSpeed: 168,
  reverseSpeed: 106,
  rotationSpeed: 155,
  attackDamage: 15,
  attackRange: 74,
  attackArc: 50,
  attackCooldown: 680,
  knockbackForce: 265,
  bodyRadius: 24,
};

/** Gold drum spinner — black chassis, white bull mark. */
export const MINOTAUR_STATS: RobotStats = {
  maxHealth: 105,
  moveSpeed: 158,
  reverseSpeed: 98,
  rotationSpeed: 140,
  attackDamage: 17,
  attackRange: 70,
  attackArc: 55,
  attackCooldown: 740,
  knockbackForce: 290,
  bodyRadius: 25,
};

/** Twin flared discs — white wedge, blue + gold vertical spinners. */
export const ORBITRON_STATS: RobotStats = {
  maxHealth: 100,
  moveSpeed: 162,
  reverseSpeed: 102,
  rotationSpeed: 148,
  attackDamage: 16,
  attackRange: 76,
  attackArc: 60,
  attackCooldown: 700,
  knockbackForce: 270,
  bodyRadius: 25,
};

/** Vertical spinner — green camo, orange wheels, red frame. */
export const RIBBOT_STATS: RobotStats = {
  maxHealth: 100,
  moveSpeed: 166,
  reverseSpeed: 105,
  rotationSpeed: 152,
  attackDamage: 16,
  attackRange: 74,
  attackArc: 50,
  attackCooldown: 690,
  knockbackForce: 275,
  bodyRadius: 24,
};

export const FIGHTERS: FighterDef[] = [
  {
    id: 'bloodsport',
    name: 'BLOODSPORT',
    shortName: 'BLOODSPORT',
    weaponLabel: 'HORIZONTAL SPINNER',
    blurb: 'Three-blade overhead spinner. White armor, black steel, red carnage.',
    accent: BLOODSPORT_RED,
    accentHex: '#c41e3a',
    bodyKey: TEXTURE_KEYS.bloodsportBody,
    weaponKey: TEXTURE_KEYS.bloodsportWeapon,
    hudKey: TEXTURE_KEYS.hudBloodsport,
    portraitKey: TEXTURE_KEYS.bloodsportPortrait,
    stats: BLOODSPORT_STATS,
    selectable: true,
  },
  {
    id: 'cobalt',
    name: 'COBALT',
    shortName: 'COBALT',
    weaponLabel: 'VERTICAL SPINNER',
    blurb: 'Black wedge, forest-green disc & forks. Holo branding, ruthless undercuts.',
    accent: COBALT_GREEN,
    accentHex: '#2d7a52',
    bodyKey: TEXTURE_KEYS.cobaltBody,
    weaponKey: TEXTURE_KEYS.cobaltWeapon,
    hudKey: TEXTURE_KEYS.hudCobalt,
    portraitKey: TEXTURE_KEYS.cobaltPortrait,
    stats: COBALT_STATS,
    selectable: true,
  },
  {
    id: 'copperhead',
    name: 'COPPERHEAD',
    shortName: 'COPPERHEAD',
    weaponLabel: 'DRUM SPINNER',
    blurb: 'SVG drum spinner — copper weapon, carbon deck, serrated tooth.',
    accent: COPPERHEAD_COPPER,
    accentHex: '#c87830',
    bodyKey: TEXTURE_KEYS.copperheadBody,
    weaponKey: TEXTURE_KEYS.copperheadWeapon,
    hudKey: TEXTURE_KEYS.hudCopperhead,
    portraitKey: TEXTURE_KEYS.copperheadPortrait,
    stats: COPPERHEAD_STATS,
    selectable: true,
  },
  {
    id: 'deathroll',
    name: 'DEATH ROLL',
    shortName: 'DEATHROLL',
    weaponLabel: 'VERTICAL DISC',
    blurb: 'Camo croc-wedge. Mustard hide, red saw in the jaws.',
    accent: DEATHROLL_LIME,
    accentHex: '#b8ff2a',
    bodyKey: TEXTURE_KEYS.deathrollBody,
    weaponKey: TEXTURE_KEYS.deathrollWeapon,
    hudKey: TEXTURE_KEYS.hudDeathroll,
    portraitKey: TEXTURE_KEYS.deathrollPortrait,
    stats: DEATHROLL_STATS,
    selectable: true,
  },
  {
    id: 'disarray',
    name: 'DISARRAY',
    shortName: 'DISARRAY',
    weaponLabel: 'DUAL VERTICAL',
    blurb: 'Teal wedge, scalloped white discs, four forks, jagged crest.',
    accent: DISARRAY_TEAL,
    accentHex: '#6eb8d4',
    bodyKey: TEXTURE_KEYS.disarrayBody,
    weaponKey: TEXTURE_KEYS.disarrayWeapon,
    hudKey: TEXTURE_KEYS.hudDisarray,
    portraitKey: TEXTURE_KEYS.disarrayPortrait,
    stats: DISARRAY_STATS,
    selectable: true,
  },
  {
    id: 'endgame',
    name: 'END GAME',
    shortName: 'END GAME',
    weaponLabel: 'VERTICAL SPINNER',
    blurb: 'Orange END/GAME wedges, blue spinner & srimech. Torqas steel.',
    accent: ENDGAME_ORANGE,
    accentHex: '#f07810',
    bodyKey: TEXTURE_KEYS.endgameBody,
    weaponKey: TEXTURE_KEYS.endgameWeapon,
    hudKey: TEXTURE_KEYS.hudEndgame,
    portraitKey: TEXTURE_KEYS.endgamePortrait,
    stats: ENDGAME_STATS,
    selectable: true,
  },
  {
    id: 'goldenfury',
    name: 'GOLDEN FURY',
    shortName: 'G. FURY',
    weaponLabel: 'VERTICAL DISCS',
    blurb: 'Gold Overkill armor, red scoop, twin red vertical discs.',
    accent: GOLDENFURY_GOLD,
    accentHex: '#c8a038',
    bodyKey: TEXTURE_KEYS.goldenfuryBody,
    weaponKey: TEXTURE_KEYS.goldenfuryWeapon,
    hudKey: TEXTURE_KEYS.hudGoldenfury,
    portraitKey: TEXTURE_KEYS.goldenfuryPortrait,
    stats: GOLDENFURY_STATS,
    selectable: true,
  },
  {
    id: 'huge',
    name: 'HUGE',
    shortName: 'HUGE',
    weaponLabel: 'VERTICAL BAR',
    blurb: 'Giant spoke wheels, blue/gold bar spinner, twin angry eyes.',
    accent: HUGE_BLUE,
    accentHex: '#2a58b0',
    bodyKey: TEXTURE_KEYS.hugeBody,
    weaponKey: TEXTURE_KEYS.hugeWeapon,
    hudKey: TEXTURE_KEYS.hudHuge,
    portraitKey: TEXTURE_KEYS.hugePortrait,
    stats: HUGE_STATS,
    selectable: true,
  },
  {
    id: 'hypershock',
    name: 'HYPERSHOCK',
    shortName: 'H.SHOCK',
    weaponLabel: 'VERTICAL DISC',
    blurb: 'Neon yellow + pink splat, huge tires, single-tooth silver disc.',
    accent: HYPERSHOCK_YELLOW,
    accentHex: '#e8d020',
    bodyKey: TEXTURE_KEYS.hypershockBody,
    weaponKey: TEXTURE_KEYS.hypershockWeapon,
    hudKey: TEXTURE_KEYS.hudHypershock,
    portraitKey: TEXTURE_KEYS.hypershockPortrait,
    stats: HYPERSHOCK_STATS,
    selectable: true,
  },
  {
    id: 'jackpot',
    name: 'JACKPOT',
    shortName: 'JACKPOT',
    weaponLabel: 'HEART DISCS',
    blurb: 'Green frame, red/black stripes, twin glittery heart spinners.',
    accent: JACKPOT_GREEN,
    accentHex: '#3aaa3a',
    bodyKey: TEXTURE_KEYS.jackpotBody,
    weaponKey: TEXTURE_KEYS.jackpotWeapon,
    hudKey: TEXTURE_KEYS.hudJackpot,
    portraitKey: TEXTURE_KEYS.jackpotPortrait,
    stats: JACKPOT_STATS,
    selectable: true,
  },
  {
    id: 'madcatter',
    name: 'MADCATTER',
    shortName: 'M.CATTER',
    weaponLabel: 'VERTICAL DISC',
    blurb: 'Grey plow with blue cat eyes, red/blue splat sides, blue vertical disc.',
    accent: MADCATTER_RED,
    accentHex: '#d0322c',
    bodyKey: TEXTURE_KEYS.madcatterBody,
    weaponKey: TEXTURE_KEYS.madcatterWeapon,
    hudKey: TEXTURE_KEYS.hudMadcatter,
    portraitKey: TEXTURE_KEYS.madcatterPortrait,
    stats: MADCATTER_STATS,
    selectable: true,
  },
  {
    id: 'magnitude',
    name: 'MAGNITUDE',
    shortName: 'MAGNITUDE',
    weaponLabel: 'DRUM SPINNER',
    blurb: 'Blue deck, grey pods, neon-yellow drum band and seismic marks.',
    accent: MAGNITUDE_YELLOW,
    accentHex: '#dfff00',
    bodyKey: TEXTURE_KEYS.magnitudeBody,
    weaponKey: TEXTURE_KEYS.magnitudeWeapon,
    hudKey: TEXTURE_KEYS.hudMagnitude,
    portraitKey: TEXTURE_KEYS.magnitudePortrait,
    stats: MAGNITUDE_STATS,
    selectable: true,
  },
  {
    id: 'malice',
    name: 'MALICE',
    shortName: 'MALICE',
    weaponLabel: 'HORIZONTAL RING',
    blurb: 'Grey chassis, huge red ring spinner, red feeder forks.',
    accent: MALICE_RED,
    accentHex: '#d01818',
    bodyKey: TEXTURE_KEYS.maliceBody,
    weaponKey: TEXTURE_KEYS.maliceWeapon,
    hudKey: TEXTURE_KEYS.hudMalice,
    portraitKey: TEXTURE_KEYS.malicePortrait,
    stats: MALICE_STATS,
    selectable: true,
  },
  {
    id: 'manta',
    name: 'MANTA',
    shortName: 'MANTA',
    weaponLabel: 'VERTICAL DRUM',
    blurb: 'Blue chassis, gold drum with teeth, asymmetric feeder forks.',
    accent: MANTA_BLUE,
    accentHex: '#1e4a88',
    bodyKey: TEXTURE_KEYS.mantaBody,
    weaponKey: TEXTURE_KEYS.mantaWeapon,
    hudKey: TEXTURE_KEYS.hudManta,
    portraitKey: TEXTURE_KEYS.mantaPortrait,
    stats: MANTA_STATS,
    selectable: true,
  },
  {
    id: 'minotaur',
    name: 'MINOTAUR',
    shortName: 'MINOTAUR',
    weaponLabel: 'DRUM SPINNER',
    blurb: 'Black chassis, gold drum with teeth, white bull head mark.',
    accent: MINOTAUR_GOLD,
    accentHex: '#c89830',
    bodyKey: TEXTURE_KEYS.minotaurBody,
    weaponKey: TEXTURE_KEYS.minotaurWeapon,
    hudKey: TEXTURE_KEYS.hudMinotaur,
    portraitKey: TEXTURE_KEYS.minotaurPortrait,
    stats: MINOTAUR_STATS,
    selectable: true,
  },
  {
    id: 'orbitron',
    name: 'ORBITRON',
    shortName: 'ORBITRON',
    weaponLabel: 'TWIN DISCS',
    blurb: 'White wedge, twin flared blue and gold vertical discs.',
    accent: ORBITRON_BLUE,
    accentHex: '#2a68c8',
    bodyKey: TEXTURE_KEYS.orbitronBody,
    weaponKey: TEXTURE_KEYS.orbitronWeapon,
    hudKey: TEXTURE_KEYS.hudOrbitron,
    portraitKey: TEXTURE_KEYS.orbitronPortrait,
    stats: ORBITRON_STATS,
    selectable: true,
  },
  {
    id: 'ribbot',
    name: 'RIBBOT',
    shortName: 'RIBBOT',
    weaponLabel: 'VERTICAL SPINNER',
    blurb: 'Green camo, orange wheels, red spinner frame, orange wedge.',
    accent: RIBBOT_GREEN,
    accentHex: '#3a7028',
    bodyKey: TEXTURE_KEYS.ribbotBody,
    weaponKey: TEXTURE_KEYS.ribbotWeapon,
    hudKey: TEXTURE_KEYS.hudRibbot,
    portraitKey: TEXTURE_KEYS.ribbotPortrait,
    stats: RIBBOT_STATS,
    selectable: true,
  },
];

/** Locked roster slots shown on the select screen. */
export const LOCKED_SLOTS: ReadonlyArray<{ label: string; accent: number }> = [];

export function getFighter(id: string | undefined | null): FighterDef {
  const found = FIGHTERS.find((f) => f.id === id && f.selectable);
  return found ?? FIGHTERS[0]!;
}

export const REGISTRY_SELECTED_FIGHTER = 'selectedFighter';
