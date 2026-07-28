import { botNameToId, normalizeBotName } from './proLeagueBots.mjs';
import { recordToWinRate } from './strategy.mjs';

/** Fallback standings when scrape/parse is unavailable. */
export const DEFAULT_STANDINGS = {
  manta: { record: '1-0', winRate: 1 },
  terrortops: { record: '1-0', winRate: 1 },
  skorpios: { record: '0-1', winRate: 0 },
  valkyrie: { record: '0-1', winRate: 0 },
  disarray: { record: '0-1', winRate: 0 },
  madcatter: { record: '1-0', winRate: 1 },
  magnitude: { record: '1-0', winRate: 1 },
  tombstone: { record: '0-1', winRate: 0 },
  copperhead: { record: '1-0', winRate: 1 },
  thetwins: { record: '1-0', winRate: 1 },
  cobalt: { record: '0-1', winRate: 0 },
  jackpot: { record: '0-1', winRate: 0 },
  deathroll: { record: '0-1', winRate: 0 },
  endgame: { record: '0-1', winRate: 0 },
  malice: { record: '1-0', winRate: 1 },
  goldenfury: { record: '1-0', winRate: 1 },
  bloodsport: { record: '0-1', winRate: 0 },
  huge: { record: '1-0', winRate: 1 },
  hypershock: { record: '0-1', winRate: 0 },
  minotaur: { record: '1-0', winRate: 1 },
  witchdoctor: { record: '1-0', winRate: 1 },
  switchback: { record: '1-0', winRate: 1 },
  ribbot: { record: '0-1', winRate: 0 },
  orbitron: { record: '0-1', winRate: 0 },
};

const ROW_RE =
  /\|\s*(?:\d+(?:st|nd|rd|th)|TBC)\s*\|\s*([^|]+?)\s*\|\s*(\d+-\d+)\s*\|/gi;

/**
 * Parse Pro League group standings from wiki HTML or markdown tables.
 * Returns { standings: Record<id, {record, winRate}>, groups: Record<group, id[]> }
 */
export function parseProLeaguePage(html, bots) {
  const nameToId = botNameToId(bots);
  const standings = {};
  const groups = {};

  const groupSections = splitGroupSections(html);
  for (const [group, section] of Object.entries(groupSections)) {
    const groupBots = [];
    let m;
    ROW_RE.lastIndex = 0;
    while ((m = ROW_RE.exec(section)) !== null) {
      const rawName = m[1].replace(/<[^>]+>/g, '').trim();
      const record = m[2].trim();
      const id = resolveBotId(rawName, nameToId);
      if (!id) continue;
      standings[id] = { record, winRate: recordToWinRate(record) };
      groupBots.push(id);
    }
    if (groupBots.length) groups[group] = groupBots;
  }

  // Fallback: scan full page if group headers were not found
  if (Object.keys(standings).length === 0) {
    let m;
    ROW_RE.lastIndex = 0;
    while ((m = ROW_RE.exec(html)) !== null) {
      const rawName = m[1].replace(/<[^>]+>/g, '').trim();
      const record = m[2].trim();
      const id = resolveBotId(rawName, nameToId);
      if (!id) continue;
      standings[id] = { record, winRate: recordToWinRate(record) };
    }
  }

  return { standings, groups };
}

function splitGroupSections(html) {
  const sections = {};
  const headerRe = /###\s*Group\s+([A-F])\b|<h[23][^>]*>\s*Group\s+([A-F])\b/gi;
  const matches = [...html.matchAll(headerRe)];
  if (matches.length === 0) return sections;

  for (let i = 0; i < matches.length; i++) {
    const group = (matches[i][1] || matches[i][2]).toUpperCase();
    const start = matches[i].index;
    const end = i + 1 < matches.length ? matches[i + 1].index : html.length;
    sections[group] = html.slice(start, end);
  }
  return sections;
}

function resolveBotId(rawName, nameToId) {
  const cleaned = rawName.replace(/\s*\([^)]*\)\s*/g, '').trim();
  const direct = nameToId.get(normalizeBotName(cleaned));
  if (direct) return direct;

  // Wiki sometimes uses "JackPot" vs roster "Jackpot"
  for (const [name, id] of nameToId.entries()) {
    if (name === normalizeBotName(cleaned)) return id;
  }
  return null;
}

export function mergeStandings(parsed, fallback = DEFAULT_STANDINGS) {
  const merged = { ...fallback };
  for (const [id, data] of Object.entries(parsed)) {
    merged[id] = data;
  }
  return merged;
}

export function standingsCoverage(standings, bots) {
  const found = bots.filter((b) => standings[b.id]).length;
  return { found, total: bots.length, complete: found === bots.length };
}
