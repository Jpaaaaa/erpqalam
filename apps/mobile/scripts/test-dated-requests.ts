/**
 * Step 7: every records/report request must include fromDate and toDate.
 *
 *   npx tsx scripts/test-dated-requests.ts
 */
import { createApiClient } from '../src/api/clientCore';
import {
  datedAttendanceRequestLog,
  resetDatedAttendanceRequestLog,
} from '../src/api/datedAttendanceGuard';
import { getQuickRange, todayDateKey } from '../src/attendance/formatters';
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

function createMemorySession() {
  let session: Session | null = null;
  return {
    getAccessToken: async () => session?.tokens.accessToken ?? null,
    getRefreshToken: async () => session?.tokens.refreshToken ?? null,
    saveSession: async (next: Session) => {
      session = next;
    },
    clearSession: async () => {
      session = null;
    },
  };
}

async function main() {
  const env = loadApiEnv();
  const apiBaseUrl = 'http://127.0.0.1:3000/api/v1';
  const email = env.SEED_ADMIN_EMAIL;
  const password = env.SEED_ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error('SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD missing');
  }

  const captured: string[] = [];
  const countingFetch: typeof fetch = async (input, init) => {
    captured.push(String(input));
    return fetch(input, init);
  };

  const memory = createMemorySession();
  const client = createApiClient({
    apiBaseUrl,
    getAccessToken: memory.getAccessToken,
    getRefreshToken: memory.getRefreshToken,
    saveSession: memory.saveSession,
    clearSession: memory.clearSession,
    fetch: countingFetch,
  });

  await client.login({ email, password });
  resetDatedAttendanceRequestLog();
  captured.length = 0;

  let blocked = false;
  try {
    await client.apiRequest('/attendance/records?limit=500');
  } catch (err) {
    blocked = err instanceof Error && err.message.includes('Refusing');
  }
  if (!blocked) {
    throw new Error('undated /attendance/records was not blocked');
  }

  blocked = false;
  try {
    await client.apiRequest('/attendance/employee-report');
  } catch (err) {
    blocked = err instanceof Error && err.message.includes('Refusing');
  }
  if (!blocked) {
    throw new Error('undated /attendance/employee-report was not blocked');
  }

  const today = todayDateKey();
  const month = getQuickRange('month');
  const week = getQuickRange('week');

  // Same dated calls the screens make.
  await Promise.all([
    client.apiRequest(`/attendance/records?fromDate=${today}&toDate=${today}&limit=500`),
    client.apiRequest(`/attendance/employee-report?fromDate=${today}&toDate=${today}`),
  ]);
  await client.apiRequest(
    `/attendance/records?fromDate=${week.from}&toDate=${week.to}&limit=500`,
  );
  await client.apiRequest(
    `/attendance/records?fromDate=${month.from}&toDate=${month.to}&deviceUserId=101&limit=5000`,
  );

  const datedFetches = captured.filter(
    (url) =>
      url.includes('/attendance/records') ||
      url.includes('/attendance/employee-report'),
  );
  if (datedFetches.length === 0) {
    throw new Error('no dated attendance fetches captured');
  }

  for (const url of datedFetches) {
    const parsed = new URL(url);
    const fromDate = parsed.searchParams.get('fromDate');
    const toDate = parsed.searchParams.get('toDate');
    if (!fromDate || !toDate) {
      throw new Error(`missing date bounds: ${url}`);
    }
    console.log(`ok ${parsed.pathname} fromDate=${fromDate} toDate=${toDate}`);
  }

  if (datedAttendanceRequestLog.length !== datedFetches.length) {
    throw new Error(
      `log size ${datedAttendanceRequestLog.length} != fetch count ${datedFetches.length}`,
    );
  }

  console.log(
    `dated-request guard OK: ${datedFetches.length} records/report calls, all had fromDate+toDate; undated calls blocked`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
