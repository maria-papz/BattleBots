import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadProLeagueBots } from './proLeagueBots.mjs';
import { mergeStandings, parseProLeaguePage } from './proLeagueParser.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '../..');

const WIKI_URL =
  process.env.BATTLEBOTS_WIKI_URL ||
  'https://battlebots.fandom.com/wiki/BattleBots_Pro_League';

export function loadWikiFixture() {
  return readFileSync(join(root, 'scripts/fixtures/wiki-standings.md'), 'utf8');
}

/**
 * Build a snapshot object from the checked-in wiki standings fixture.
 */
export function buildFixtureSnapshot() {
  const bots = loadProLeagueBots(root);
  const html = loadWikiFixture();
  const parsed = parseProLeaguePage(html, bots);
  const standings = mergeStandings(parsed.standings);

  return {
    fetchedAt: new Date().toISOString(),
    sources: [WIKI_URL],
    fetchMeta: { via: 'fixture', zone: null },
    groups: parsed.groups,
    standings,
    coverage: { found: bots.length, total: bots.length, complete: true },
    pages: { [WIKI_URL]: html },
    botCount: bots.length,
    note: 'Generated from scripts/fixtures/wiki-standings.md (offline fallback)',
  };
}
