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

const hasOpenRouter = Boolean(process.env.OPENROUTER_API_KEY);
const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);
const hasElevenLabs = Boolean(process.env.ELEVENLABS_API_KEY);

// Voice requires ElevenLabs. LLM keys are optional (local script + TTS still works).
const commentaryEnabled =
  process.env.ENABLE_COMMENTARY === 'true' && hasElevenLabs;

/** Preferred LLM: openrouter (default) | openai | auto */
const preferredLlm = (
  process.env.COMMENTARY_LLM || 'openrouter'
).toLowerCase();

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

function fallbackCommentary(body) {
  const { type, player, opponent, trailingBot } = body;
  if (type === 'intro') {
    return `${player.name}, armed with a ${player.weapon}, faces ${opponent.name} and their ${opponent.weapon}. It's robot fighting time!`;
  }
  return `${trailingBot} is getting crushed — dig in and fight back!`;
}

function buildPrompts(body) {
  const { type, player, opponent, trailingBot } = body;
  const system =
    'You are Faruq Tauheed, the BattleBots arena announcer. Write ONE or TWO short sentences. Energetic, factual, no markdown.';

  let user;
  if (type === 'intro') {
    user = `Introduce this Pro League matchup:
${player.name} (${player.weapon}, record ${player.record ?? 'unknown'}) — ${player.strategyNotes}
vs
${opponent.name} (${opponent.weapon}, record ${opponent.record ?? 'unknown'}) — ${opponent.strategyNotes}
End with something like "It's robot fighting time!"`;
  } else {
    user = `${trailingBot} is falling behind in this fight. Urge them to keep up and fight back. Reference their weapon style briefly.`;
  }

  return { system, user };
}

async function chatCompletion({
  label,
  url,
  apiKey,
  model,
  system,
  user,
  extraHeaders = {},
  useMaxCompletionTokens = false,
}) {
  const tokenField = useMaxCompletionTokens
    ? { max_completion_tokens: 120 }
    : { max_tokens: 120 };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...extraHeaders,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.9,
      ...tokenField,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`${label} ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content?.trim() ?? '';
  if (!text) throw new Error(`${label} returned empty content`);
  return text;
}

async function generateViaOpenRouter(system, user) {
  const model = process.env.OPENROUTER_MODEL || 'openrouter/free';
  return chatCompletion({
    label: 'OpenRouter',
    url: 'https://openrouter.ai/api/v1/chat/completions',
    apiKey: process.env.OPENROUTER_API_KEY,
    model,
    system,
    user,
    extraHeaders: {
      'HTTP-Referer': process.env.OPENROUTER_HTTP_REFERER || 'http://localhost:5173',
      'X-Title': process.env.OPENROUTER_APP_TITLE || 'BattleBots',
    },
  });
}

async function generateViaOpenAI(system, user) {
  const model = process.env.OPENAI_MODEL || 'gpt-5.4';
  return chatCompletion({
    label: 'OpenAI',
    url: 'https://api.openai.com/v1/chat/completions',
    apiKey: process.env.OPENAI_API_KEY,
    model,
    system,
    user,
    useMaxCompletionTokens: true,
  });
}

function providerOrder() {
  const order = [];
  const push = (name) => {
    if (!order.includes(name)) order.push(name);
  };

  if (preferredLlm === 'openai') {
    if (hasOpenAI) push('openai');
    if (hasOpenRouter) push('openrouter');
  } else if (preferredLlm === 'auto') {
    if (hasOpenRouter) push('openrouter');
    if (hasOpenAI) push('openai');
  } else {
    // default: openrouter first (free model), OpenAI fallback
    if (hasOpenRouter) push('openrouter');
    if (hasOpenAI) push('openai');
  }
  return order;
}

async function generateCommentary(body) {
  const { system, user } = buildPrompts(body);
  const order = providerOrder();

  for (const provider of order) {
    try {
      if (provider === 'openrouter') {
        const text = await generateViaOpenRouter(system, user);
        console.log(`[commentary] via OpenRouter (${process.env.OPENROUTER_MODEL || 'openrouter/free'})`);
        return text;
      }
      if (provider === 'openai') {
        const text = await generateViaOpenAI(system, user);
        console.log(`[commentary] via OpenAI (${process.env.OPENAI_MODEL || 'gpt-5.4'})`);
        return text;
      }
    } catch (err) {
      console.warn(err.message || err);
    }
  }

  console.warn('[commentary] all LLM providers failed — using local fallback');
  return fallbackCommentary(body);
}

async function synthesizeSpeech(text) {
  const preferredVoice =
    process.env.ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB';
  // Adam — clear sports-announcer style public voice as safety net
  const fallbackVoice = 'pNInz6obpgDQGcFmaJgB';
  const voiceIds = [...new Set([preferredVoice, fallbackVoice])];
  const modelId = process.env.ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2';
  const stability = Number(process.env.ELEVENLABS_STABILITY ?? 0.28);
  const similarity = Number(process.env.ELEVENLABS_SIMILARITY ?? 0.85);
  const style = Number(process.env.ELEVENLABS_STYLE ?? 0.55);

  let lastError = 'ElevenLabs request failed';
  for (const voiceId of voiceIds) {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id: modelId,
          voice_settings: {
            stability: Number.isFinite(stability) ? stability : 0.28,
            similarity_boost: Number.isFinite(similarity) ? similarity : 0.85,
            style: Number.isFinite(style) ? style : 0.55,
            use_speaker_boost: true,
          },
        }),
      },
    );

    if (res.ok) {
      return Buffer.from(await res.arrayBuffer());
    }

    const err = await res.text();
    lastError = `ElevenLabs ${res.status}: ${err.slice(0, 200)}`;
    console.warn(lastError);
    // Retry with fallback voice on missing/invalid voice ids.
    if (!/voice_not_found|voice_id/i.test(err)) {
      break;
    }
  }

  throw new Error(lastError);
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
    json(res, 200, {
      commentaryEnabled,
      llmPreference: preferredLlm,
      providers: {
        openrouter: hasOpenRouter,
        openai: hasOpenAI,
        elevenlabs: hasElevenLabs,
      },
    });
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
  const llmBits = [];
  if (hasOpenRouter) llmBits.push('openrouter');
  if (hasOpenAI) llmBits.push('openai');
  console.log(
    `API http://localhost:${PORT} — commentary ${commentaryEnabled ? 'ON' : 'OFF'}` +
      (commentaryEnabled
        ? ` (prefer ${preferredLlm}; keys: ${llmBits.join('+') || 'none'})`
        : ''),
  );
});
