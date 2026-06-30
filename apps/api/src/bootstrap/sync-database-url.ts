import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Sync DATABASE_URL from the running Prisma Dev instance before the API connects.
 * No-op when not using Prisma Dev or in production.
 */
export function syncDevDatabaseUrl() {
  if (process.env.NODE_ENV === 'production') {
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
