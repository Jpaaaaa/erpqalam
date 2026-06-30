/**
 * Reads the TCP DATABASE_URL from `prisma dev ls` and writes it to apps/api/.env.
 * Prisma Dev uses dynamic ports; a stale URL causes "Server has closed the connection".
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const apiDir = path.join(__dirname, '..', 'apps', 'api');
const envPath = path.join(apiDir, '.env');

const TCP_URL_PATTERN =
  /postgres:\/\/postgres:postgres@localhost:\d+\/template1\?sslmode=disable/;

export function readPrismaDevLsOutput() {
  return execSync('npx prisma dev ls', {
    cwd: apiDir,
    encoding: 'utf8',
    shell: true,
  });
}

export function extractTcpDatabaseUrl(output) {
  const match = output.match(TCP_URL_PATTERN);
  return match ? match[0] : null;
}

export function syncDatabaseUrlInEnv(databaseUrl) {
  if (!fs.existsSync(envPath)) {
    throw new Error(`Missing ${envPath} — copy from apps/api/.env.example first.`);
  }

  let content = fs.readFileSync(envPath, 'utf8');
  const line = `DATABASE_URL=${databaseUrl}`;

  if (/^DATABASE_URL=.*$/m.test(content)) {
    content = content.replace(/^DATABASE_URL=.*$/m, line);
  } else {
    content = `${line}\n${content}`;
  }

  fs.writeFileSync(envPath, content);
}

export function syncFromPrismaDev() {
  const output = readPrismaDevLsOutput();
  const databaseUrl = extractTcpDatabaseUrl(output);

  if (!databaseUrl) {
    throw new Error(
      'Could not read DATABASE_URL from `prisma dev ls`. Is Prisma Dev running?',
    );
  }

  syncDatabaseUrlInEnv(databaseUrl);
  return databaseUrl;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const url = syncFromPrismaDev();
    console.log(`Synced DATABASE_URL → ${url}`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
