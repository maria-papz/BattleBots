import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Parse PRO_LEAGUE_BOTS from src/game/data/proLeague.ts.
 */
export function loadProLeagueBots(root) {
  const src = readFileSync(join(root, 'src/game/data/proLeague.ts'), 'utf8');
  const bots = [];
  const blockRe =
    /\{\s*id:\s*'([^']+)',\s*name:\s*'([^']+)',\s*group:\s*'([A-F])',\s*weaponType:\s*'([^']+)'(?:,\s*country:\s*'([^']*)')?\s*\}/g;
  let m;
  while ((m = blockRe.exec(src)) !== null) {
    bots.push({
      id: m[1],
      name: m[2],
      group: m[3],
      weaponType: m[4],
      country: m[5],
    });
  }
  return bots;
}

export function botNameToId(bots) {
  const map = new Map();
  for (const bot of bots) {
    map.set(normalizeBotName(bot.name), bot.id);
  }
  return map;
}

export function normalizeBotName(name) {
  return name.toLowerCase().replace(/\s+/g, '');
}
