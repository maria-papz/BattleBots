#!/usr/bin/env node
/**
 * Pull Pro League standings / fight data via Bright Data Web Unlocker.
 *
 * Usage:
 *   1. Fill BRIGHTDATA_API_TOKEN in .env
 *   2. npm run sync:data
 *
 * Output: data/pro-league-snapshot.json
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

async function loadEnv() {
  try {
    const text = await import('node:fs/promises').then((fs) =>
      fs.readFile(join(root, '.env'), 'utf8'),
    );
    for (const line of text.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // .env optional if vars already exported
  }
}

async function brightDataFetch(url) {
  const token = process.env.BRIGHTDATA_API_TOKEN;
  const zone = process.env.BRIGHTDATA_WEB_UNLOCKER_ZONE || 'mcp_unlocker';

  if (!token) {
    throw new Error(
      'Set BRIGHTDATA_API_TOKEN in .env — get it from https://brightdata.com/cp/setting/users',
    );
  }

  const res = await fetch('https://api.brightdata.com/request', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      zone,
      url,
      format: 'raw',
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Bright Data ${res.status}: ${body.slice(0, 400)}`);
  }

  return res.text();
}

function extractStandings(html) {
  const groups = {};
  const groupRe = /Group ([A-F])[\s\S]*?(?=Group [A-F]|$)/gi;
  let m;
  while ((m = groupRe.exec(html)) !== null) {
    const label = m[1];
    const block = m[0];
    const bots = [...block.matchAll(/\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)\b/g)]
      .map((x) => x[1])
      .filter((name) =>
        ['Manta', 'Terrortops', 'Skorpios', 'Valkyrie', 'Disarray', 'MadCatter', 'Magnitude', 'Tombstone',
          'Copperhead', 'The Twins', 'Cobalt', 'Jackpot', 'Death Roll', 'End Game', 'Malice', 'Golden Fury',
          'Bloodsport', 'HUGE', 'HyperShock', 'Minotaur', 'Witch Doctor', 'Switchback', 'Ribbot', 'Orbitron',
        ].some((known) => known.toLowerCase() === name.toLowerCase()),
      );
    if (bots.length) groups[label] = [...new Set(bots)];
  }
  return groups;
}

async function main() {
  await loadEnv();

  const sources = [
    process.env.BATTLEBOTS_PRO_LEAGUE_URL || 'https://battlebots.com/proleague/',
    process.env.BATTLEBOTS_WIKI_URL ||
      'https://battlebots.fandom.com/wiki/BattleBots_Pro_League',
  ];

  const pages = {};
  for (const url of sources) {
    console.log(`Fetching via Bright Data: ${url}`);
    pages[url] = await brightDataFetch(url);
  }

  const wikiHtml = pages[sources[1]] || '';
  const snapshot = {
    fetchedAt: new Date().toISOString(),
    sources,
    groups: extractStandings(wikiHtml),
    botCount: 24,
    note: 'Parse fight results from HTML or pipe to an LLM for win-rate / sentiment analysis.',
  };

  const outDir = join(root, 'data');
  await mkdir(outDir, { recursive: true });
  const outPath = join(outDir, 'pro-league-snapshot.json');
  await writeFile(outPath, JSON.stringify(snapshot, null, 2));
  console.log(`Wrote ${outPath}`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
