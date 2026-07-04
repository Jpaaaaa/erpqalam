import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const PRISMA_DEV_URL_PATTERN =
  /postgres:\/\/postgres:postgres@localhost:\d+\/template1\?sslmode=disable/;

/**
 * Sync DATABASE_URL from Prisma Dev only when explicitly enabled.
 * Default dev uses Docker Postgres (fixed port) — no sync on every API restart.
 */
export function syncDevDatabaseUrl() {
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  const flag = process.env.USE_PRISMA_DEV;
  const usesPrismaDev = flag === '1' || flag === 'true';
  const usesPrismaDevUrl = PRISMA_DEV_URL_PATTERN.test(
    process.env.DATABASE_URL ?? '',
  );

  if (!usesPrismaDev && !usesPrismaDevUrl) {
    return;
  }

  const scriptPath = resolve(process.cwd(), '../../scripts/sync-prisma-dev-url.mjs');
  if (!existsSync(scriptPath)) {
    return;
  }

  try {
    execSync(`node "${scriptPath}"`, { stdio: 'pipe' });
  } catch {
    // Prisma Dev may be unavailable; existing DATABASE_URL is used.
  }
}
