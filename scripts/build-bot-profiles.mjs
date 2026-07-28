#!/usr/bin/env node
/**
 * Build per-bot profiles for all 24 Pro League competitors.
 * Uses snapshot from sync:data when available; fetches wiki otherwise.
 *
 * Usage:
 *   npm run build:profiles
 *   npm run build:profiles -- --offline
 *
 * Output: data/bot-profiles.json (+ public/data for Vite static serve)
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchPage } from './lib/brightData.mjs';
import { buildBotProfiles } from './lib/buildProfiles.mjs';
import { loadEnv } from './lib/env.mjs';
import { loadProLeagueBots } from './lib/proLeagueBots.mjs';
import { parseRosterStats } from './lib/parseRosterStats.mjs';
import {
  mergeStandings,
  parseProLeaguePage,
  standingsCoverage,
} from './lib/proLeagueParser.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const offline = process.argv.includes('--offline');

const WIKI_URL =
  process.env.BATTLEBOTS_WIKI_URL ||
  'https://battlebots.fandom.com/wiki/BattleBots_Pro_League';

async function loadSnapshotStandings() {
  const snapPath = join(root, 'data/pro-league-snapshot.json');
  try {
    const snap = JSON.parse(await readFile(snapPath, 'utf8'));
    if (snap.standings && Object.keys(snap.standings).length > 0) {
      console.log(`Using standings from ${snapPath} (${snap.fetchedAt})`);
      return { standings: snap.standings, sources: snap.sources ?? [WIKI_URL] };
    }
    if (snap.pages?.[WIKI_URL]) {
      const bots = loadProLeagueBots(root);
      const parsed = parseProLeaguePage(snap.pages[WIKI_URL], bots);
      return {
        standings: mergeStandings(parsed.standings),
        sources: snap.sources ?? [WIKI_URL],
      };
    }
  } catch {
    // no snapshot
  }
  return null;
}

async function fetchStandings(bots) {
  if (offline) {
    const cached = await loadSnapshotStandings();
    if (cached) return cached;
    throw new Error('No snapshot found. Run: npm run sync:data');
  }

  const cached = await loadSnapshotStandings();
  if (cached) return cached;

  console.log('No snapshot found — fetching wiki for standings…');
  const { html, via, zone } = await fetchPage(WIKI_URL);
  console.log(`  via ${via}${zone ? ` (zone: ${zone})` : ''} — ${html.length} bytes`);

  const parsed = parseProLeaguePage(html, bots);
  const standings = mergeStandings(parsed.standings);
  const coverage = standingsCoverage(standings, bots);
  console.log(`  Parsed ${coverage.found}/${coverage.total} bot records`);

  return { standings, sources: [WIKI_URL] };
}

async function main() {
  await loadEnv(root);
  const bots = loadProLeagueBots(root);
  const rosterStats = parseRosterStats(root);
  const { standings, sources } = await fetchStandings(bots);

  const profiles = buildBotProfiles({ bots, rosterStats, standings, sources });
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
