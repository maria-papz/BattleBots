#!/usr/bin/env node
/**
 * Pull Pro League standings / fight data via Bright Data Web Unlocker.
 *
 * Usage:
 *   npm run sync:data
 *   npm run sync:data -- --offline   # use cached snapshot only (for CI)
 *
 * Output: data/pro-league-snapshot.json
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchPage } from './lib/brightData.mjs';
import { loadEnv } from './lib/env.mjs';
import { buildFixtureSnapshot } from './lib/fixtureSnapshot.mjs';
import { loadProLeagueBots } from './lib/proLeagueBots.mjs';
import {
  mergeStandings,
  parseProLeaguePage,
  standingsCoverage,
} from './lib/proLeagueParser.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const offline = process.argv.includes('--offline');

const DEFAULT_SOURCES = {
  proLeague:
    process.env.BATTLEBOTS_PRO_LEAGUE_URL || 'https://battlebots.com/proleague/',
  wiki:
    process.env.BATTLEBOTS_WIKI_URL ||
    'https://battlebots.fandom.com/wiki/BattleBots_Pro_League',
};

async function main() {
  await loadEnv(root);
  const bots = loadProLeagueBots(root);
  const sources = [DEFAULT_SOURCES.wiki, DEFAULT_SOURCES.proLeague];

  let wikiHtml = '';
  let proLeagueHtml = '';
  let fetchMeta = { via: 'offline', zone: null };

  if (offline) {
    const snapPath = join(root, 'data/pro-league-snapshot.json');
    try {
      const snap = JSON.parse(await readFile(snapPath, 'utf8'));
      wikiHtml = snap.pages?.[DEFAULT_SOURCES.wiki] ?? '';
      proLeagueHtml = snap.pages?.[DEFAULT_SOURCES.proLeague] ?? '';
      console.log('Using cached snapshot (--offline)');
    } catch {
      throw new Error(`No cached snapshot at ${snapPath}. Run sync:data without --offline first.`);
    }
  } else {
    try {
      console.log(`Fetching wiki: ${DEFAULT_SOURCES.wiki}`);
      const wiki = await fetchPage(DEFAULT_SOURCES.wiki);
      wikiHtml = wiki.html;
      fetchMeta = { via: wiki.via, zone: wiki.zone ?? null };
      console.log(
        `  via ${wiki.via}${wiki.zone ? ` (zone: ${wiki.zone})` : ''} — ${wikiHtml.length} bytes`,
      );

      try {
        console.log(`Fetching pro league site: ${DEFAULT_SOURCES.proLeague}`);
        const site = await fetchPage(DEFAULT_SOURCES.proLeague);
        proLeagueHtml = site.html;
        console.log(`  via ${site.via} — ${proLeagueHtml.length} bytes`);
      } catch (err) {
        console.warn(`  Pro league site skipped: ${err.message}`);
      }
    } catch (err) {
      console.warn(`Live fetch failed (${err.message}) — using wiki standings fixture.`);
      const fixture = buildFixtureSnapshot();
      wikiHtml = fixture.pages[DEFAULT_SOURCES.wiki];
      fetchMeta = fixture.fetchMeta;
    }
  }

  const parsed = parseProLeaguePage(wikiHtml, bots);
  const standings = mergeStandings(parsed.standings);
  const coverage = standingsCoverage(standings, bots);

  const snapshot = {
    fetchedAt: new Date().toISOString(),
    sources,
    fetchMeta,
    groups: parsed.groups,
    standings,
    coverage,
    pages: {
      [DEFAULT_SOURCES.wiki]: wikiHtml,
      [DEFAULT_SOURCES.proLeague]: proLeagueHtml,
    },
    botCount: bots.length,
  };

  const outDir = join(root, 'data');
  await mkdir(outDir, { recursive: true });
  const outPath = join(outDir, 'pro-league-snapshot.json');
  await writeFile(outPath, JSON.stringify(snapshot, null, 2));
  console.log(`Wrote ${outPath}`);
  console.log(
    `Standings parsed: ${coverage.found}/${coverage.total} bots` +
      (coverage.complete ? ' ✓' : ' (partial — using defaults for missing)'),
  );
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
