#!/usr/bin/env node
/**
 * Fails if playable roster count !== 24 Pro League bots.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const rosterSrc = readFileSync(join(root, 'src/game/data/roster.ts'), 'utf8');
const proLeagueSrc = readFileSync(join(root, 'src/game/data/proLeague.ts'), 'utf8');

const fighterIds = [...rosterSrc.matchAll(/id: '([^']+)'/g)].map((m) => m[1]);
const proIds = [...proLeagueSrc.matchAll(/id: '([^']+)'/g)].map((m) => m[1]);

const playable = new Set(fighterIds);
const expected = new Set(proIds);

const missing = proIds.filter((id) => !playable.has(id));
const extra = fighterIds.filter((id) => !expected.has(id));

console.log(`Playable fighters: ${fighterIds.length}`);
console.log(`Pro League bots:   ${proIds.length}`);

if (missing.length) {
  console.error('Missing from roster:', missing.join(', '));
}
if (extra.length) {
  console.error('Extra (not in Pro League):', extra.join(', '));
}

if (fighterIds.length !== 24 || missing.length || extra.length) {
  process.exit(1);
}

console.log('✓ All 24 Pro League bots are in the roster.');
