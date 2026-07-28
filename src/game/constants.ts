import type { RobotStats } from './types/game';

export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;

/** Inner arena inset — leaves ~75% for playfield under HUD chrome. */
export const ARENA_MARGIN = 64;

/** Spec palette */
export const GUNMETAL = 0x1c1f2a;
export const DARK_STEEL = 0x242938;
export const PLAYER_CYAN = 0x27c5ff;
export const ENEMY_ORANGE = 0xff5c4d;
export const BLOODSPORT_RED = 0xc41e3a;
export const COBALT_GREEN = 0x2d7a52;
export const COPPERHEAD_COPPER = 0xc87830;
export const DEATHROLL_LIME = 0xb8ff2a;
export const DISARRAY_TEAL = 0x6eb8d4;
export const ENDGAME_ORANGE = 0xf07810;
export const GOLDENFURY_GOLD = 0xc8a038;
export const HUGE_BLUE = 0x2a58b0;
export const HYPERSHOCK_YELLOW = 0xe8d020;
export const JACKPOT_GREEN = 0x3aaa3a;
export const MADCATTER_RED = 0xd0322c;
export const MAGNITUDE_YELLOW = 0xdfff00;
export const MALICE_RED = 0xd01818;
export const MANTA_BLUE = 0x1e4a88;
export const MINOTAUR_GOLD = 0xc89830;
export const ORBITRON_WHITE = 0xd0d4dc;
export const ORBITRON_BLUE = 0x2a68c8;
export const RIBBOT_GREEN = 0x3a7028;
export const HAZARD_YELLOW = 0xf7d038;
export const HP_GREEN = 0x5dff7a;

export const PLAYER_SPAWN = { x: 180, y: GAME_HEIGHT / 2 };
export const ENEMY_SPAWN = { x: GAME_WIDTH - 180, y: GAME_HEIGHT / 2 };

export const READY_DURATION_MS = 1000;
export const FIGHT_FLASH_MS = 500;
export const ATTACK_VISUAL_MS = 140;
export const KNOCKBACK_DURATION_MS = 100;
export const STUN_DURATION_MS = 420;
export const GRIND_DURATION_MS = 1600;
export const GRIND_TICK_MS = 400;
export const GRIND_DAMAGE = 3;
export const IMPACT_FLASH_MS = 90;
export const DAMAGE_NUMBER_MS = 550;
export const SCREEN_SHAKE_DURATION_MS = 90;
export const SCREEN_SHAKE_INTENSITY = 0.005;
export const MATCH_DURATION_MS = 180_000;

export const PLAYER_STATS: RobotStats = {
  maxHealth: 100,
  moveSpeed: 180,
  reverseSpeed: 110,
  rotationSpeed: 180,
  attackDamage: 12,
  attackRange: 70,
  attackArc: 55,
  attackCooldown: 650,
  knockbackForce: 220,
  bodyRadius: 22,
};

export const ENEMY_STATS: RobotStats = {
  maxHealth: 100,
  moveSpeed: 145,
  reverseSpeed: 95,
  rotationSpeed: 145,
  attackDamage: 10,
  attackRange: 65,
  attackArc: 55,
  attackCooldown: 850,
  knockbackForce: 180,
  bodyRadius: 22,
};

export const AI = {
  attackEnterFactor: 0.95,
  attackExitFactor: 1.15,
  facingAttackDeg: 12,
  stuckSpeedThreshold: 15,
  stuckTimeMs: 400,
  tooCloseFactor: 2.1,
  tooCloseTimeMs: 200,
  minAttackStateMs: 200,
  repositionReverseMs: 200,
  repositionDurationMs: 450,
  repositionJitterMs: 50,
  repositionCooldownMs: 300,
  attackForwardCreep: 0.15,
};

export const COLORS = {
  wallDark: GUNMETAL,
  wallMid: DARK_STEEL,
  wallBrick: 0x181b24,
  wallHighlight: 0x323848,
  floorDark: 0x161922,
  floorMid: 0x1e222e,
  floorLight: 0x2a3040,
  floorRivet: 0x4a5160,
  steel: 0x8a93a5,
  steelDark: 0x3a4254,
  steelLight: 0xd0d6e0,
  cage: 0xa8b0c0,
  hazard: HAZARD_YELLOW,
  hazardGlow: 0xffe06a,
  hazardBlack: 0x12141a,
  pipe: 0x2a4058,
  pipeGlow: PLAYER_CYAN,
  vent: 0x141820,
  centerRing: HAZARD_YELLOW,
  bbRed: ENEMY_ORANGE,
  bbBlue: PLAYER_CYAN,
  bbYellow: HAZARD_YELLOW,
  neonPink: 0xff5c8a,
  neonCyan: PLAYER_CYAN,
  neonLime: HP_GREEN,
  player: PLAYER_CYAN,
  playerMid: 0x1a9ecc,
  playerDark: 0x0e5a78,
  playerEye: HAZARD_YELLOW,
  enemy: ENEMY_ORANGE,
  enemyMid: 0xcc3a30,
  enemyDark: 0x7a1e18,
  enemyEye: HAZARD_YELLOW,
  metal: 0xd0d6e0,
  metalDark: 0x5a6274,
  weapon: 0xe8f0ff,
  weaponHot: HAZARD_YELLOW,
  hudPanel: 0x141820,
  hudPanelAlt: 0x1a2030,
  hudPanelShadow: 0x0a0c12,
  hudBorder: 0x0a0c12,
  hudBorderLight: 0xffffff,
  hudNeon: PLAYER_CYAN,
  healthBg: 0x0e121a,
  healthHigh: HP_GREEN,
  healthMid: HAZARD_YELLOW,
  healthLow: ENEMY_ORANGE,
  healthPlayer: PLAYER_CYAN,
  healthEnemy: ENEMY_ORANGE,
  cooldown: PLAYER_CYAN,
  text: '#ffffff',
  textLight: '#ffffff',
  textMuted: '#8a93a5',
  textNeon: '#27c5ff',
  impact: 0xfff2a8,
};

export const DEPTH = {
  studio: 0,
  wall: 1,
  floor: 2,
  marks: 3,
  glow: 4,
  decor: 5,
  border: 6,
  robots: 10,
  weapon: 11,
  fx: 20,
  scanlines: 90,
  hud: 100,
  overlay: 110,
};

export const TEXTURE_KEYS = {
  playerBody: 'tex-player-body',
  enemyBody: 'tex-enemy-body',
  playerWeapon: 'tex-player-weapon',
  enemyWeapon: 'tex-enemy-weapon',
  bloodsportBody: 'tex-bloodsport-body',
  bloodsportWeapon: 'tex-bloodsport-weapon',
  bloodsportPortrait: 'tex-bloodsport-portrait',
  hudBloodsport: 'tex-hud-bloodsport',
  cobaltBody: 'tex-cobalt-body',
  cobaltWeapon: 'tex-cobalt-weapon',
  cobaltPortrait: 'tex-cobalt-portrait',
  hudCobalt: 'tex-hud-cobalt',
  copperheadBody: 'tex-copperhead-body',
  copperheadWeapon: 'tex-copperhead-weapon',
  copperheadPortrait: 'tex-copperhead-portrait',
  hudCopperhead: 'tex-hud-copperhead',
  deathrollBody: 'tex-deathroll-body',
  deathrollWeapon: 'tex-deathroll-weapon',
  deathrollPortrait: 'tex-deathroll-portrait',
  hudDeathroll: 'tex-hud-deathroll',
  disarrayBody: 'tex-disarray-body',
  disarrayWeapon: 'tex-disarray-weapon',
  disarrayPortrait: 'tex-disarray-portrait',
  hudDisarray: 'tex-hud-disarray',
  endgameBody: 'tex-endgame-body',
  endgameWeapon: 'tex-endgame-weapon',
  endgamePortrait: 'tex-endgame-portrait',
  hudEndgame: 'tex-hud-endgame',
  goldenfuryBody: 'tex-goldenfury-body',
  goldenfuryWeapon: 'tex-goldenfury-weapon',
  goldenfuryPortrait: 'tex-goldenfury-portrait',
  hudGoldenfury: 'tex-hud-goldenfury',
  hugeBody: 'tex-huge-body',
  hugeWeapon: 'tex-huge-weapon',
  hugePortrait: 'tex-huge-portrait',
  hudHuge: 'tex-hud-huge',
  hypershockBody: 'tex-hypershock-body',
  hypershockWeapon: 'tex-hypershock-weapon',
  hypershockPortrait: 'tex-hypershock-portrait',
  hudHypershock: 'tex-hud-hypershock',
  jackpotBody: 'tex-jackpot-body',
  jackpotWeapon: 'tex-jackpot-weapon',
  jackpotPortrait: 'tex-jackpot-portrait',
  hudJackpot: 'tex-hud-jackpot',
  madcatterBody: 'tex-madcatter-body',
  madcatterWeapon: 'tex-madcatter-weapon',
  madcatterPortrait: 'tex-madcatter-portrait',
  hudMadcatter: 'tex-hud-madcatter',
  magnitudeBody: 'tex-magnitude-body',
  magnitudeWeapon: 'tex-magnitude-weapon',
  magnitudePortrait: 'tex-magnitude-portrait',
  hudMagnitude: 'tex-hud-magnitude',
  maliceBody: 'tex-malice-body',
  maliceWeapon: 'tex-malice-weapon',
  malicePortrait: 'tex-malice-portrait',
  hudMalice: 'tex-hud-malice',
  mantaBody: 'tex-manta-body',
  mantaWeapon: 'tex-manta-weapon',
  mantaPortrait: 'tex-manta-portrait',
  hudManta: 'tex-hud-manta',
  minotaurBody: 'tex-minotaur-body',
  minotaurWeapon: 'tex-minotaur-weapon',
  minotaurPortrait: 'tex-minotaur-portrait',
  hudMinotaur: 'tex-hud-minotaur',
  orbitronBody: 'tex-orbitron-body',
  orbitronWeapon: 'tex-orbitron-weapon',
  orbitronPortrait: 'tex-orbitron-portrait',
  hudOrbitron: 'tex-hud-orbitron',
  ribbotBody: 'tex-ribbot-body',
  ribbotWeapon: 'tex-ribbot-weapon',
  ribbotPortrait: 'tex-ribbot-portrait',
  hudRibbot: 'tex-hud-ribbot',
  floorTile: 'tex-floor-tile',
  floorTileAlt: 'tex-floor-tile-alt',
  wallTile: 'tex-wall-tile',
  hazardStripe: 'tex-hazard-stripe',
  sawtooth: 'tex-sawtooth',
  bbLogo: 'tex-bb-logo',
  startRed: 'tex-start-red',
  startBlue: 'tex-start-blue',
  hazardPad: 'tex-hazard-pad',
  pulverizer: 'tex-pulverizer',
  cagePost: 'tex-cage-post',
  impact: 'tex-impact',
  hudPanel: 'tex-hud-panel',
  glowBlue: 'tex-glow-blue',
  glowRed: 'tex-glow-red',
  glowYellow: 'tex-glow-yellow',
  star: 'tex-star',
  crowd: 'tex-crowd',
  spark: 'tex-spark',
  neonDot: 'tex-neon-dot',
  smoke: 'tex-smoke',
  warnLight: 'tex-warn-light',
  hudPlayer: 'tex-hud-player',
  hudEnemy: 'tex-hud-enemy',
  legendYou: 'tex-legend-you',
  legendEnemy: 'tex-legend-enemy',
  legendHazard: 'tex-legend-hazard',
  legendSpike: 'tex-legend-spike',
  wallFace: 'tex-wall-face',
  floorLightBlue: 'tex-floor-light-blue',
  floorLightRed: 'tex-floor-light-red',
} as const;

export const PIXEL_FONT =
  '"Press Start 2P", "Courier New", Courier, monospace';

/** Desired mockup HUD type — clean tech sans, not arcade pixel. */
export const HUD_FONT = 'Orbitron, "Segoe UI", Tahoma, sans-serif';
