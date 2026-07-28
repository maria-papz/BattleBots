const BRIGHT_DATA_REQUEST_URL = 'https://api.brightdata.com/request';
const BRIGHT_DATA_ZONES_URL = 'https://api.brightdata.com/zone/get_all_zones';
const BRIGHT_DATA_CREATE_ZONE_URL = 'https://api.brightdata.com/zone';
const DEFAULT_ZONE_NAME = 'battlebots_unlocker';

/**
 * List all zones on the Bright Data account.
 */
export async function listZones(token, fetchImpl = fetch) {
  const res = await fetchImpl(BRIGHT_DATA_ZONES_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Bright Data zones ${res.status}: ${body.slice(0, 400)}`);
  }
  return res.json();
}

/**
 * Create a Web Unlocker zone when the account has none.
 */
export async function createUnlockerZone(token, name = DEFAULT_ZONE_NAME, fetchImpl = fetch) {
  const res = await fetchImpl(BRIGHT_DATA_CREATE_ZONE_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      zone: { name, type: 'unblocker' },
      plan: {
        type: 'unblocker',
        country: 'any',
        solve_captcha_disable: false,
        custom_headers: false,
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Could not create Web Unlocker zone: ${body.slice(0, 400)}`);
  }

  return name;
}

/**
 * Pick an active Web Unlocker zone: env override → first active unblocker → auto-create.
 */
export async function resolveUnlockerZone(token, preferredZone, fetchImpl = fetch) {
  const zones = await listZones(token, fetchImpl);
  const active = zones.filter((z) => z.status === 'active');

  if (preferredZone) {
    const match = active.find((z) => z.name === preferredZone);
    if (match) return match.name;
  }

  const unblocker = active.find((z) => z.type === 'unblocker');
  if (unblocker) return unblocker.name;

  if (process.env.BRIGHTDATA_AUTO_CREATE_ZONE !== 'false') {
    console.log(`No Web Unlocker zone found — creating "${DEFAULT_ZONE_NAME}"…`);
    return createUnlockerZone(token, DEFAULT_ZONE_NAME, fetchImpl);
  }

  const names = active.map((z) => `${z.name} (${z.type})`).join(', ');
  throw new Error(
    preferredZone
      ? `Web Unlocker zone "${preferredZone}" not found. Active zones: ${names || 'none'}. ` +
          'Create a Web Unlocker zone at https://brightdata.com/cp/zones or set BRIGHTDATA_WEB_UNLOCKER_ZONE.'
      : `No active Web Unlocker zone found. Active zones: ${names || 'none'}. ` +
          'Create one in the Bright Data dashboard and set BRIGHTDATA_WEB_UNLOCKER_ZONE in .env.',
  );
}

/**
 * Fetch a URL through Bright Data Web Unlocker.
 */
export async function brightDataFetch(url, { token, zone, fetchImpl = fetch }) {
  const res = await fetchImpl(BRIGHT_DATA_REQUEST_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ zone, url, format: 'raw' }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Bright Data ${res.status}: ${body.slice(0, 400)}`);
  }

  return res.text();
}

/**
 * Direct HTTP fetch fallback when Bright Data is unavailable.
 */
export async function directFetch(url, fetchImpl = fetch) {
  const res = await fetchImpl(url, {
    headers: {
      'User-Agent':
        'BattleBotsHackathon/1.0 (+https://github.com; educational project)',
      Accept: 'text/html,application/xhtml+xml',
    },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  return res.text();
}

/**
 * Fetch page content: Bright Data (with zone auto-resolve) → direct fetch fallback.
 */
export async function fetchPage(url, options = {}) {
  const {
    token = process.env.BRIGHTDATA_API_TOKEN,
    preferredZone = process.env.BRIGHTDATA_WEB_UNLOCKER_ZONE,
    fetchImpl = fetch,
    allowDirectFallback = true,
  } = options;

  if (token) {
    try {
      const zone = await resolveUnlockerZone(token, preferredZone, fetchImpl);
      const html = await brightDataFetch(url, { token, zone, fetchImpl });
      return { html, via: 'brightdata', zone };
    } catch (err) {
      if (!allowDirectFallback) throw err;
      console.warn(`Bright Data fetch failed (${err.message}); trying direct fetch…`);
    }
  }

  if (!allowDirectFallback) {
    throw new Error(
      'BRIGHTDATA_API_TOKEN is not set. Add it to .env or pass --offline with a snapshot.',
    );
  }

  const html = await directFetch(url, fetchImpl);
  return { html, via: 'direct' };
}
