#!/usr/bin/env node
/**
 * Local API for GPT commentary scripts + ElevenLabs TTS.
 * Keys stay server-side; disabled when ENABLE_COMMENTARY=false or keys missing.
 */
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const PORT = Number(process.env.API_PORT || 8787);

function loadEnv() {
  try {
    const text = readFileSync(join(root, '.env'), 'utf8');
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
    // optional
  }
}

loadEnv();

const commentaryEnabled =
  process.env.ENABLE_COMMENTARY === 'true' &&
  Boolean(process.env.OPENAI_API_KEY) &&
  Boolean(process.env.ELEVENLABS_API_KEY);

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function json(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  });
  res.end(JSON.stringify(data));
}

async function generateCommentary(body) {
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const { type, player, opponent, trailingBot } = body;

  const system =
    'You are Faruq Tauheed, the BattleBots arena announcer. Write ONE or TWO short sentences. Energetic, factual, no markdown.';

  let userPrompt;
  if (type === 'intro') {
    userPrompt = `Introduce this Pro League matchup:
${player.name} (${player.weapon}, record ${player.record ?? 'unknown'}) — ${player.strategyNotes}
vs
${opponent.name} (${opponent.weapon}, record ${opponent.record ?? 'unknown'}) — ${opponent.strategyNotes}
End with something like "It's robot fighting time!"`;
  } else {
    userPrompt = `${trailingBot} is falling behind in this fight. Urge them to keep up and fight back. Reference their weapon style briefly.`;
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 120,
      temperature: 0.9,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() ?? '';
}

async function synthesizeSpeech(text) {
  const voiceId = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    },
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`ElevenLabs ${res.status}: ${err.slice(0, 200)}`);
  }

  return Buffer.from(await res.arrayBuffer());
}

const server = createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (req.method === 'GET' && url.pathname === '/api/health') {
    json(res, 200, { commentaryEnabled });
    return;
  }

  if (!commentaryEnabled) {
    json(res, 503, { error: 'Commentary disabled' });
    return;
  }

  try {
    if (req.method === 'POST' && url.pathname === '/api/commentary') {
      const raw = await readBody(req);
      const body = JSON.parse(raw);
      const text = await generateCommentary(body);
      json(res, 200, { text });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/tts') {
      const raw = await readBody(req);
      const { text } = JSON.parse(raw);
      const audio = await synthesizeSpeech(text);
      res.writeHead(200, {
        'Content-Type': 'audio/mpeg',
        'Access-Control-Allow-Origin': '*',
      });
      res.end(audio);
      return;
    }

    json(res, 404, { error: 'Not found' });
  } catch (err) {
    json(res, 500, { error: err.message || 'Server error' });
  }
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `API port ${PORT} is already in use. Stop the other process or set API_PORT in .env.`,
    );
    process.exit(1);
  }
  throw err;
});

server.listen(PORT, () => {
  console.log(
    `API http://localhost:${PORT} — commentary ${commentaryEnabled ? 'ON' : 'OFF'}`,
  );
});
