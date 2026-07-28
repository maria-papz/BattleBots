#!/usr/bin/env node
/**
 * Capture the running Vite game and write .compare/game-current.png
 * Usage: node scripts/compare-screenshot.mjs
 * Requires: npm run dev on :5173, and `ws` installed.
 */
import { spawn } from 'child_process';
import fs from 'fs';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import WebSocket from 'ws';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const out = path.join(root, '.compare/game-current.png');
const chrome =
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const userData = path.join(root, '.compare/chrome-profile-compare');
const port = 9340;

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.mkdirSync(userData, { recursive: true });

const proc = spawn(
  chrome,
  [
    '--headless=new',
    '--disable-gpu',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userData}`,
    '--window-size=960,540',
    'about:blank',
  ],
  { stdio: 'ignore' },
);

function getJson(url) {
  return new Promise((resolve, reject) => {
    http
      .get(url, (res) => {
        let d = '';
        res.on('data', (c) => (d += c));
        res.on('end', () => {
          try {
            resolve(JSON.parse(d));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on('error', reject);
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

try {
  for (let i = 0; i < 50; i++) {
    try {
      await getJson(`http://127.0.0.1:${port}/json/version`);
      break;
    } catch {
      await sleep(100);
    }
  }
  const targets = await getJson(`http://127.0.0.1:${port}/json/list`);
  const page = targets.find((t) => t.type === 'page') || targets[0];
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((r) => ws.once('open', r));
  let id = 1;
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const msgId = id++;
      const onMsg = (raw) => {
        const msg = JSON.parse(raw.toString());
        if (msg.id === msgId) {
          ws.off('message', onMsg);
          if (msg.error) reject(new Error(JSON.stringify(msg.error)));
          else resolve(msg.result);
        }
      };
      ws.on('message', onMsg);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });

  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 960,
    height: 540,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await send('Page.navigate', {
    url: 'http://127.0.0.1:5173/?skipReady=1',
  });
  // Wait for fonts + Phaser boot
  await sleep(2200);
  const shot = await send('Page.captureScreenshot', {
    format: 'png',
    fromSurface: true,
  });
  fs.writeFileSync(out, Buffer.from(shot.data, 'base64'));
  console.log('wrote', out);
  ws.close();
} finally {
  proc.kill('SIGKILL');
}
