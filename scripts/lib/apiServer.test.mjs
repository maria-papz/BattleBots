import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { describe, it } from 'node:test';

const API_PORT = 8787;

function waitForHealth(maxMs = 5000) {
  const start = Date.now();
  return new Promise((resolve) => {
    const tick = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:${API_PORT}/api/health`);
        if (res.ok) {
          resolve(true);
          return;
        }
      } catch {
        // retry
      }
      if (Date.now() - start >= maxMs) {
        resolve(false);
        return;
      }
      setTimeout(tick, 150);
    };
    void tick();
  });
}

describe('commentary API', () => {
  it('GET /api/health returns commentaryEnabled flag', async () => {
    const proc = spawn('node', ['server/index.mjs'], {
      env: { ...process.env, ENABLE_COMMENTARY: 'false' },
      stdio: 'pipe',
    });

    try {
      const ready = await waitForHealth();
      assert.equal(ready, true, 'API server did not start');

      const res = await fetch(`http://127.0.0.1:${API_PORT}/api/health`);
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(typeof data.commentaryEnabled, 'boolean');
      assert.equal(data.commentaryEnabled, false);
    } finally {
      proc.kill('SIGTERM');
    }
  });
});
