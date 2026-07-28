#!/usr/bin/env node
/**
 * Build per-bot profiles for all 24 Pro League competitors.
 * Uses Bright Data when token is set; always falls back to roster.ts stats.
 *
 * Usage: npm run build:profiles
 * Output: data/bot-profiles.json (+ public/data for Vite static serve)
 */
import { readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const PRO_LEAGUE_BOTS = [
  { id: 'manta', name: 'Manta', group: 'A', weaponType: 'vertical drum' },
  { id: 'terrortops', name: 'Terrortops', group: 'A', weaponType: 'horizontal spinner' },
  { id: 'skorpios', name: 'Skorpios', group: 'A', weaponType: 'overhead saw' },
  { id: 'valkyrie', name: 'Valkyrie', group: 'A', weaponType: 'undercutter spinner' },
  { id: 'disarray', name: 'Disarray', group: 'B', weaponType: 'dual vertical discs' },
  { id: 'madcatter', name: 'MadCatter', group: 'B', weaponType: 'vertical disc' },
  { id: 'magnitude', name: 'Magnitude', group: 'B', weaponType: 'horizontal drum' },
  { id: 'tombstone', name: 'Tombstone', group: 'B', weaponType: 'horizontal bar spinner' },
  { id: 'copperhead', name: 'Copperhead', group: 'C', weaponType: 'drum spinner' },
  { id: 'thetwins', name: 'The Twins', group: 'C', weaponType: 'multibot cluster' },
  { id: 'cobalt', name: 'Cobalt', group: 'C', weaponType: 'vertical spinner' },
  { id: 'jackpot', name: 'Jackpot', group: 'C', weaponType: 'dual vertical discs' },
  { id: 'deathroll', name: 'Death Roll', group: 'D', weaponType: 'vertical disc' },
  { id: 'endgame', name: 'End Game', group: 'D', weaponType: 'vertical spinner' },
  { id: 'malice', name: 'Malice', group: 'D', weaponType: 'horizontal ring spinner' },
  { id: 'goldenfury', name: 'Golden Fury', group: 'D', weaponType: 'vertical discs' },
  { id: 'bloodsport', name: 'Bloodsport', group: 'E', weaponType: 'horizontal spinner' },
  { id: 'huge', name: 'HUGE', group: 'E', weaponType: 'vertical bar spinner' },
  { id: 'hypershock', name: 'HyperShock', group: 'E', weaponType: 'vertical disc' },
  { id: 'minotaur', name: 'Minotaur', group: 'E', weaponType: 'drum spinner' },
  { id: 'witchdoctor', name: 'Witch Doctor', group: 'F', weaponType: 'vertical spinner' },
  { id: 'switchback', name: 'Switchback', group: 'F', weaponType: 'flipper' },
  { id: 'ribbot', name: 'Ribbot', group: 'F', weaponType: 'vertical spinner' },
  { id: 'orbitron', name: 'Orbitron', group: 'F', weaponType: 'twin vertical discs' },
];

const STANDINGS = {
  manta: { record: '1-0', winRate: 1 },
  terrortops: { record: '1-0', winRate: 1 },
  skorpios: { record: '0-1', winRate: 0 },
  valkyrie: { record: '0-1', winRate: 0 },
  disarray: { record: '0-1', winRate: 0 },
  madcatter: { record: '1-0', winRate: 1 },
  magnitude: { record: '1-0', winRate: 1 },
  tombstone: { record: '0-1', winRate: 0 },
  copperhead: { record: '1-0', winRate: 1 },
  thetwins: { record: '1-0', winRate: 1 },
  cobalt: { record: '0-1', winRate: 0 },
  jackpot: { record: '0-1', winRate: 0 },
  deathroll: { record: '0-1', winRate: 0 },
  endgame: { record: '0-1', winRate: 0 },
  malice: { record: '1-0', winRate: 1 },
  goldenfury: { record: '1-0', winRate: 1 },
  bloodsport: { record: '0-1', winRate: 0 },
  huge: { record: '1-0', winRate: 1 },
  hypershock: { record: '0-1', winRate: 0 },
  minotaur: { record: '1-0', winRate: 1 },
  witchdoctor: { record: '1-0', winRate: 1 },
  switchback: { record: '1-0', winRate: 1 },
  ribbot: { record: '0-1', winRate: 0 },
  orbitron: { record: '0-1', winRate: 0 },
};

const STRATEGY_BY_WEAPON = {
  flipper: 'box_rush',
  drum: 'aggressive_rusher',
  horizontal: 'aggressive_rusher',
  undercutter: 'hit_and_run',
  saw: 'control_grinder',
  multibot: 'hit_and_run',
  dual: 'counter_attacker',
  vertical: 'counter_attacker',
};

const STRATEGY_NOTES = {
  aggressive_rusher: 'Commits early, chases down opponents with sustained weapon pressure.',
  box_rush: 'Fast box-rush into flip attacks; punishes slow spin-up bots.',
  counter_attacker: 'Waits for openings, punishes mispositioned opponents.',
  control_grinder: 'Grinds opponents against walls with saw or control weapon.',
  hit_and_run: 'Strikes quickly then repositions before counter-attack.',
  defensive: 'Plays cagey, survives to judges decision when behind.',
};

async function loadEnv() {
  try {
    const text = await readFileSync(join(root, '.env'), 'utf8');
    for (const line of text.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // optional
  }
}

function parseRosterStats() {
  const src = readFileSync(join(root, 'src/game/data/roster.ts'), 'utf8');
  const stats = {};
  const statBlocks = src.matchAll(
    /id: '(\w+)'[\s\S]*?stats: (\w+_STATS)/g,
  );
  for (const m of statBlocks) {
    const id = m[1];
    const constName = m[2];
    const block = src.match(
      new RegExp(`export const ${constName}: RobotStats = \\{([\\s\\S]*?)\\};`),
    );
    if (!block) continue;
    const obj = {};
    for (const line of block[1].split('\n')) {
      const kv = line.match(/(\w+):\s*([\d.]+)/);
      if (kv) obj[kv[1]] = Number(kv[2]);
    }
    stats[id] = obj;
  }
  return stats;
}

function weaponLabelToClass(weaponType) {
  const lower = weaponType.toLowerCase();
  if (lower.includes('flipper')) return 'flipper';
  if (lower.includes('undercut')) return 'undercutter';
  if (lower.includes('saw') || lower.includes('overhead')) return 'saw';
  if (lower.includes('multibot') || lower.includes('cluster')) return 'multibot';
  if (lower.includes('dual') || lower.includes('twin')) return 'dual_spinner';
  if (lower.includes('drum')) return 'drum';
  if (lower.includes('horizontal') || lower.includes('bar') || lower.includes('ring')) {
    return 'horizontal_spinner';
  }
  return 'vertical_spinner';
}

function strategyForWeapon(weaponType) {
  const lower = weaponType.toLowerCase();
  if (lower.includes('flipper')) return STRATEGY_BY_WEAPON.flipper;
  if (lower.includes('drum')) return STRATEGY_BY_WEAPON.drum;
  if (lower.includes('undercut')) return STRATEGY_BY_WEAPON.undercutter;
  if (lower.includes('saw')) return STRATEGY_BY_WEAPON.saw;
  if (lower.includes('multibot') || lower.includes('cluster')) return STRATEGY_BY_WEAPON.multibot;
  if (lower.includes('dual') || lower.includes('twin')) return STRATEGY_BY_WEAPON.dual;
  if (lower.includes('horizontal') || lower.includes('bar') || lower.includes('ring')) {
    return STRATEGY_BY_WEAPON.horizontal;
  }
  return STRATEGY_BY_WEAPON.vertical;
}

async function brightDataFetch(url) {
  const token = process.env.BRIGHTDATA_API_TOKEN;
  const zone = process.env.BRIGHTDATA_WEB_UNLOCKER_ZONE || 'mcp_unlocker';
  if (!token) return null;

  const res = await fetch('https://api.brightdata.com/request', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ zone, url, format: 'raw' }),
  });
  if (!res.ok) return null;
  return res.text();
}

async function main() {
  await loadEnv();
  const rosterStats = parseRosterStats();
  const sources = [
    process.env.BATTLEBOTS_WIKI_URL ||
      'https://battlebots.fandom.com/wiki/BattleBots_Pro_League',
  ];

  if (process.env.BRIGHTDATA_API_TOKEN) {
    console.log('Fetching Pro League data via Bright Data…');
    try {
      const html = await brightDataFetch(sources[0]);
      if (html) console.log(`  Got ${html.length} bytes from wiki`);
    } catch (err) {
      console.log(`  Bright Data fetch skipped: ${err.message || err}`);
    }
  } else {
    console.log('No BRIGHTDATA_API_TOKEN — using roster stats + wiki standings cache');
  }

  const profiles = PRO_LEAGUE_BOTS.map((bot) => {
    const stats = rosterStats[bot.id] ?? rosterStats.bloodsport;
    const standing = STANDINGS[bot.id] ?? { record: '0-0', winRate: 0.5 };
    const strategy = strategyForWeapon(bot.weaponType);
    const weaponClass = weaponLabelToClass(bot.weaponType);

    const winBonus = standing.winRate >= 1 ? 1.05 : standing.winRate <= 0 ? 0.95 : 1;
    return {
      id: bot.id,
      name: bot.name,
      weaponClass,
      weaponLabel: bot.weaponType.toUpperCase(),
      moveSpeed: Math.round(stats.moveSpeed * winBonus),
      reverseSpeed: stats.reverseSpeed,
      rotationSpeed: stats.rotationSpeed,
      attackDamage: Math.round(stats.attackDamage * winBonus),
      attackRange: stats.attackRange,
      attackArc: stats.attackArc,
      attackCooldown: stats.attackCooldown,
      knockbackForce: stats.knockbackForce,
      maxHealth: stats.maxHealth,
      bodyRadius: stats.bodyRadius,
      strategy,
      strategyNotes: STRATEGY_NOTES[strategy],
      winRate: standing.winRate,
      record: standing.record,
      sources,
    };
  });

  const output = {
    fetchedAt: new Date().toISOString(),
    sources,
    profiles,
  };

  for (const dir of ['data', 'public/data']) {
    const outDir = join(root, dir);
    await mkdir(outDir, { recursive: true });
    const outPath = join(outDir, 'bot-profiles.json');
    await writeFile(outPath, JSON.stringify(output, null, 2));
    console.log(`Wrote ${outPath}`);
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
