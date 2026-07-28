import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildBotProfiles } from './buildProfiles.mjs';
import { loadProLeagueBots } from './proLeagueBots.mjs';
import { parseRosterStats } from './parseRosterStats.mjs';
import {
  mergeStandings,
  parseProLeaguePage,
  standingsCoverage,
} from './proLeagueParser.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const fixture = readFileSync(
  join(root, 'scripts/fixtures/wiki-standings.md'),
  'utf8',
);

describe('proLeagueParser', () => {
  const bots = loadProLeagueBots(root);

  it('parses all 24 bots from wiki standings fixture', () => {
    const { standings, groups } = parseProLeaguePage(fixture, bots);
    const coverage = standingsCoverage(standings, bots);

    assert.equal(coverage.found, 24);
    assert.equal(coverage.complete, true);
    assert.equal(standings.manta.record, '1-0');
    assert.equal(standings.manta.winRate, 1);
    assert.equal(standings.tombstone.record, '0-1');
    assert.equal(standings.jackpot.record, '0-1');
    assert.equal(Object.keys(groups).length, 6);
    assert.deepEqual(groups.A, ['manta', 'terrortops', 'valkyrie', 'skorpios']);
  });

  it('mergeStandings keeps defaults for missing bots', () => {
    const partial = { manta: { record: '2-0', winRate: 1 } };
    const merged = mergeStandings(partial);
    assert.equal(merged.manta.record, '2-0');
    assert.equal(merged.tombstone.record, '0-1');
  });
});

describe('buildProfiles', () => {
  it('builds 24 profiles with win-rate stat scaling', () => {
    const bots = loadProLeagueBots(root);
    const rosterStats = parseRosterStats(root);
    const { standings } = parseProLeaguePage(fixture, bots);

    const profiles = buildBotProfiles({
      bots,
      rosterStats,
      standings,
      sources: ['fixture'],
    });

    assert.equal(profiles.length, 24);

    const manta = profiles.find((p) => p.id === 'manta');
    const skorpios = profiles.find((p) => p.id === 'skorpios');
    const baseManta = rosterStats.manta;
    const baseSkorpios = rosterStats.skorpios;

    assert.equal(manta.moveSpeed, Math.round(baseManta.moveSpeed * 1.05));
    assert.equal(skorpios.moveSpeed, Math.round(baseSkorpios.moveSpeed * 0.95));
    assert.equal(manta.strategy, 'aggressive_rusher');
    assert.equal(skorpios.strategy, 'control_grinder');
    assert.equal(manta.record, '1-0');
  });
});
