import { spawn, type ChildProcess } from 'node:child_process';
import type { Plugin } from 'vite';

const API_PORT = Number(process.env.API_PORT || 8787);
const API_ORIGIN = `http://127.0.0.1:${API_PORT}`;

async function fetchHealth(): Promise<Response | null> {
  try {
    const res = await fetch(`${API_ORIGIN}/api/health`, {
      signal: AbortSignal.timeout(500),
    });
    return res.ok ? res : null;
  } catch {
    return null;
  }
}

async function waitForApi(maxMs = 5000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    const res = await fetchHealth();
    if (res) return true;
    await new Promise((r) => setTimeout(r, 150));
  }
  return false;
}

/**
 * Starts the local commentary API during `vite` dev and serves /api/health
 * without noisy proxy errors when the API is still starting or disabled.
 */
export function apiServerPlugin(): Plugin {
  let proc: ChildProcess | undefined;
  let spawnedByPlugin = false;

  return {
    name: 'battlebots-api-server',
    apply: 'serve',
    configureServer(server) {
      void (async () => {
        if (await fetchHealth()) {
          console.log(`[api] reusing existing server at ${API_ORIGIN}`);
          return;
        }

        proc = spawn('node', ['server/index.mjs'], {
          stdio: 'inherit',
          env: process.env,
        });
        spawnedByPlugin = true;

        proc.on('error', (err) => {
          console.warn(`[api] failed to start: ${err.message}`);
        });

        proc.on('exit', (code, signal) => {
          if (!spawnedByPlugin) return;
          if (code === 0 || signal === 'SIGTERM') return;
          console.warn(
            `[api] exited unexpectedly (code=${code ?? 'null'}, signal=${signal ?? 'null'})`,
          );
        });

        const ready = await waitForApi();
        if (!ready && spawnedByPlugin) {
          console.warn(
            `[api] server did not become ready on port ${API_PORT} — commentary may be unavailable`,
          );
        }
      })();

      server.httpServer?.on('close', () => {
        if (spawnedByPlugin && proc && !proc.killed) {
          proc.kill('SIGTERM');
        }
      });

      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/health')) {
          next();
          return;
        }

        const health = await fetchHealth();
        res.setHeader('Content-Type', 'application/json');
        if (health) {
          res.end(await health.text());
          return;
        }

        res.end(JSON.stringify({ commentaryEnabled: false }));
      });
    },
    async buildStart() {
      // no-op for build
    },
  };
}

export async function startApiForTests(): Promise<ChildProcess> {
  const proc = spawn('node', ['server/index.mjs'], {
    stdio: 'pipe',
    env: { ...process.env, ENABLE_COMMENTARY: 'false' },
  });
  const ready = await waitForApi();
  if (!ready) {
    proc.kill('SIGTERM');
    throw new Error('API server did not become ready');
  }
  return proc;
}
