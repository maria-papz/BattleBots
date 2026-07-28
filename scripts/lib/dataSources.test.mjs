import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { loadProLeagueBots, normalizeBotName } from './proLeagueBots.mjs';
import { parseRosterStats } from './parseRosterStats.mjs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');

describe('proLeagueBots', () => {
  it('loads 24 bots from proLeague.ts', () => {
    const bots = loadProLeagueBots(root);
    assert.equal(bots.length, 24);
    assert.ok(bots.some((b) => b.id === 'orbitron' && b.name === 'Orbitron'));
  });

  it('normalizes bot names for lookup', () => {
    assert.equal(normalizeBotName('JackPot'), 'jackpot');
    assert.equal(normalizeBotName('The Twins'), 'thetwins');
  });
});

describe('parseRosterStats', () => {
  it('parses stats for all roster fighters', () => {
    const stats = parseRosterStats(root);
    assert.ok(stats.tombstone);
    assert.equal(typeof stats.tombstone.moveSpeed, 'number');
    assert.equal(typeof stats.tombstone.attackDamage, 'number');
    assert.ok(Object.keys(stats).length >= 24);
  });
});
