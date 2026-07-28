import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import { buildFixtureSnapshot } from './fixtureSnapshot.mjs';
import { loadProLeagueBots } from './proLeagueBots.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');

describe('integration: offline data pipeline', () => {
  it('fixture snapshot has standings for every pro league bot', () => {
    const bots = loadProLeagueBots(root);
    const snap = buildFixtureSnapshot();
    for (const bot of bots) {
      assert.ok(snap.standings[bot.id], `missing standings for ${bot.id}`);
    }
  });

  it('committed snapshot file parses when present', async () => {
    const snapPath = join(root, 'data/pro-league-snapshot.json');
    const raw = await readFile(snapPath, 'utf8');
    const snap = JSON.parse(raw);
    assert.equal(snap.botCount, 24);
    assert.equal(snap.coverage.complete, true);
    assert.ok(snap.standings.tombstone);
  });

  it('bot-profiles.json matches 24 fighters', async () => {
    const profilesPath = join(root, 'public/data/bot-profiles.json');
    const raw = await readFile(profilesPath, 'utf8');
    const data = JSON.parse(raw);
    assert.equal(data.profiles.length, 24);
    assert.ok(data.profiles.every((p) => p.record && p.strategy));
  });
});
