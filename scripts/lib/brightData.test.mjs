import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  brightDataFetch,
  fetchPage,
  resolveUnlockerZone,
} from './brightData.mjs';
import { buildFixtureSnapshot } from './fixtureSnapshot.mjs';
import { recordToWinRate, strategyForWeapon, weaponLabelToClass } from './strategy.mjs';

describe('strategy', () => {
  it('maps weapon types to classes and strategies', () => {
    assert.equal(weaponLabelToClass('horizontal bar spinner'), 'horizontal_spinner');
    assert.equal(weaponLabelToClass('flipper'), 'flipper');
    assert.equal(strategyForWeapon('overhead saw'), 'control_grinder');
    assert.equal(strategyForWeapon('dual vertical discs'), 'counter_attacker');
  });

  it('converts records to win rates', () => {
    assert.equal(recordToWinRate('1-0'), 1);
    assert.equal(recordToWinRate('0-1'), 0);
    assert.equal(recordToWinRate('1-1'), 0.5);
  });
});

describe('brightData', () => {
  it('resolveUnlockerZone uses env zone when active', async () => {
    const mockFetch = async () =>
      new Response(
        JSON.stringify([
          { name: 'web_unlocker1', type: 'unblocker', status: 'active' },
          { name: 'mcp_unlocker', type: 'unblocker', status: 'deleted' },
        ]),
        { status: 200 },
      );

    const zone = await resolveUnlockerZone('token', 'web_unlocker1', mockFetch);
    assert.equal(zone, 'web_unlocker1');
  });

  it('resolveUnlockerZone falls back to first active unblocker', async () => {
    const mockFetch = async () =>
      new Response(
        JSON.stringify([
          { name: 'serp_api1', type: 'serp', status: 'active' },
          { name: 'web_unlocker1', type: 'unblocker', status: 'active' },
        ]),
        { status: 200 },
      );

    const zone = await resolveUnlockerZone('token', 'missing_zone', mockFetch);
    assert.equal(zone, 'web_unlocker1');
  });

  it('resolveUnlockerZone throws helpful error when auto-create disabled', async () => {
    const prev = process.env.BRIGHTDATA_AUTO_CREATE_ZONE;
    process.env.BRIGHTDATA_AUTO_CREATE_ZONE = 'false';
    const mockFetch = async () =>
      new Response(JSON.stringify([]), { status: 200 });

    try {
      await assert.rejects(
        () => resolveUnlockerZone('token', 'mcp_unlocker', mockFetch),
        /Web Unlocker zone/,
      );
    } finally {
      if (prev === undefined) delete process.env.BRIGHTDATA_AUTO_CREATE_ZONE;
      else process.env.BRIGHTDATA_AUTO_CREATE_ZONE = prev;
    }
  });

  it('fetchPage falls back to direct fetch when Bright Data fails', async () => {
    let call = 0;
    const mockFetch = async (url, init) => {
      call += 1;
      if (url.includes('get_all_zones')) {
        return new Response(JSON.stringify([]), { status: 200 });
      }
      if (url.includes('api.brightdata.com/request')) {
        return new Response('zone not found', { status: 400 });
      }
      if (url === 'https://example.com/wiki') {
        return new Response('<html>wiki</html>', { status: 200 });
      }
      return new Response('not found', { status: 404 });
    };

    const result = await fetchPage('https://example.com/wiki', {
      token: 'test-token',
      preferredZone: 'mcp_unlocker',
      fetchImpl: mockFetch,
      allowDirectFallback: true,
    });

    assert.equal(result.via, 'direct');
    assert.match(result.html, /wiki/);
    assert.ok(call >= 2);
  });

  it('brightDataFetch sends correct payload', async () => {
    let body;
    const mockFetch = async (_url, init) => {
      body = JSON.parse(init.body);
      return new Response('<html>ok</html>', { status: 200 });
    };

    const html = await brightDataFetch('https://example.com', {
      token: 'tok',
      zone: 'web_unlocker1',
      fetchImpl: mockFetch,
    });

    assert.equal(html, '<html>ok</html>');
    assert.deepEqual(body, {
      zone: 'web_unlocker1',
      url: 'https://example.com',
      format: 'raw',
    });
  });
});

describe('fixtureSnapshot', () => {
  it('builds a complete offline snapshot', () => {
    const snap = buildFixtureSnapshot();
    assert.equal(snap.botCount, 24);
    assert.equal(snap.coverage.complete, true);
    assert.equal(snap.fetchMeta.via, 'fixture');
    assert.equal(snap.standings.manta.record, '1-0');
  });
});
