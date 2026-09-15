/**
 * Integration test: expired access token + 5 parallel requests
 * must issue exactly one POST /auth/refresh, and all five must succeed.
 *
 * Run from apps/mobile:
 *   npx tsx scripts/test-single-flight.ts
 */
import { createApiClient } from '../src/api/clientCore';
import type { Session } from '../src/types/auth';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function loadApiEnv(): Record<string, string> {
  const env: Record<string, string> = {};
  const raw = readFileSync(resolve(__dirname, '../../api/.env'), 'utf8');
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const eq = trimmed.indexOf('=');
    env[trimmed.slice(0, eq)] = trimmed.slice(eq + 1);
  }
  return env;
}

function createMemorySession(initial?: Session) {
  let session: Session | null = initial ?? null;
  return {
    getAccessToken: async () => session?.tokens.accessToken ?? null,
    getRefreshToken: async () => session?.tokens.refreshToken ?? null,
    saveSession: async (next: Session) => {
      session = next;
    },
    clearSession: async () => {
      session = null;
    },
    setAccessToken: (accessToken: string) => {
      if (!session) throw new Error('no session');
      session = {
        ...session,
        tokens: { ...session.tokens, accessToken },
      };
    },
    getSession: () => session,
  };
}

async function main() {
  const env = loadApiEnv();
  const apiBaseUrl = 'http://127.0.0.1:3000/api/v1';
  const email = env.SEED_ADMIN_EMAIL;
  const password = env.SEED_ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error('SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD missing in apps/api/.env');
  }

  const memory = createMemorySession();
  let refreshPosts = 0;
  const countingFetch: typeof fetch = async (input, init) => {
    const url = String(input);
    if (url.endsWith('/auth/refresh') && init?.method === 'POST') {
      refreshPosts += 1;
    }
    return fetch(input, init);
  };

  const client = createApiClient({
    apiBaseUrl,
    getAccessToken: memory.getAccessToken,
    getRefreshToken: memory.getRefreshToken,
    saveSession: memory.saveSession,
    clearSession: memory.clearSession,
    fetch: countingFetch,
  });

  const session = await client.login({ email, password });
  memory.setAccessToken('expired.invalid.token');
  client.resetRefreshCallCount();
  refreshPosts = 0;

  const results = await Promise.all([
    client.getCurrentUser(),
    client.getCurrentUser(),
    client.apiRequest('/attendance/users'),
    client.apiRequest('/attendance/users'),
    client.apiRequest('/auth/me'),
  ]);

  const refreshFromClient = client.getRefreshCallCount();
  if (refreshPosts !== 1 || refreshFromClient !== 1) {
    throw new Error(
      `expected 1 refresh POST, got fetch=${refreshPosts} client=${refreshFromClient}`,
    );
  }
  if (results.length !== 5) {
    throw new Error('expected 5 successful responses');
  }
  if (results[0].email !== session.user.email) {
    throw new Error('refreshed /auth/me user mismatch');
  }
  if (!memory.getSession()?.tokens.accessToken || memory.getSession()?.tokens.accessToken === 'expired.invalid.token') {
    throw new Error('access token was not replaced');
  }

  console.log('single-flight refresh OK: 5 parallel 401s → 1 POST /auth/refresh, all succeeded');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
