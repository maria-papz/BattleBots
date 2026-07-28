import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Parse RobotStats exports from src/game/data/roster.ts.
 */
export function parseRosterStats(root) {
  const src = readFileSync(join(root, 'src/game/data/roster.ts'), 'utf8');
  const stats = {};
  const statBlocks = src.matchAll(/id: '(\w+)'[\s\S]*?stats: (\w+_STATS)/g);
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
