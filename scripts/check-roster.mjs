#!/usr/bin/env node
/**
 * Fails if any Pro League bot is missing from the playable roster.
 * Bonus fighters (alternates) are allowed in addition to the core 24.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const BONUS_IDS = new Set(['banshee', 'calypso', 'nemesis']);

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const rosterSrc = readFileSync(join(root, 'src/game/data/roster.ts'), 'utf8');
const proLeagueSrc = readFileSync(join(root, 'src/game/data/proLeague.ts'), 'utf8');

const fighterIds = [
  ...rosterSrc.matchAll(/id: '([^']+)'[\s\S]*?selectable: true/g),
].map((m) => m[1]);
const proIds = [...proLeagueSrc.matchAll(/id: '([^']+)'/g)].map((m) => m[1]);

const playable = new Set(fighterIds);
const expected = new Set(proIds);

const missing = proIds.filter((id) => !playable.has(id));
const extra = fighterIds.filter((id) => !expected.has(id));
const bonus = extra.filter((id) => BONUS_IDS.has(id));
const unexpected = extra.filter((id) => !BONUS_IDS.has(id));

console.log(`Playable fighters: ${fighterIds.length}`);
console.log(`Pro League bots:   ${proIds.length}`);
if (bonus.length) {
  console.log(`Bonus fighters:    ${bonus.join(', ')}`);
}

if (missing.length) {
  console.error('Missing from roster:', missing.join(', '));
}
if (unexpected.length) {
  console.error('Unexpected extras (not in Pro League):', unexpected.join(', '));
}

if (missing.length || unexpected.length) {
  process.exit(1);
}

console.log('✓ All 24 Pro League bots are in the roster.');
