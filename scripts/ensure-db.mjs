import { execSync } from 'node:child_process';
import { setTimeout } from 'node:timers/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  extractTcpDatabaseUrl,
  readPrismaDevLsOutput,
  syncDatabaseUrlInEnv,
} from './sync-prisma-dev-url.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const apiDir = path.join(__dirname, '..', 'apps', 'api');

function run(command, stdio = 'inherit') {
  execSync(command, { cwd: apiDir, stdio, shell: true });
}

function isDbRunning() {
  try {
    const output = readPrismaDevLsOutput();
    if (output.includes('not_running')) {
      return false;
    }
    return output.includes('running');
  } catch {
    return false;
  }
}

async function testConnection(databaseUrl) {
  try {
    execSync(
      `node -e "const {Pool}=require('pg');const p=new Pool({connectionString:process.argv[1],max:1});p.query('SELECT 1').then(()=>p.end()).catch(()=>process.exit(1))" "${databaseUrl}"`,
      { cwd: apiDir, stdio: 'pipe', shell: true },
    );
    return true;
  } catch {
    return false;
  }
}

async function waitForConnection(databaseUrl, attempts = 10, delayMs = 2000) {
  for (let i = 0; i < attempts; i += 1) {
    if (await testConnection(databaseUrl)) {
      return true;
    }
    if (i < attempts - 1) {
      console.log(`Waiting for database connection... (${i + 1}/${attempts})`);
      await setTimeout(delayMs);
    }
  }
  return false;
}

async function syncAndVerifyUrl({ attempts = 3, delayMs = 1000 } = {}) {
  const output = readPrismaDevLsOutput();
  const databaseUrl = extractTcpDatabaseUrl(output);

  if (!databaseUrl) {
    throw new Error(
      'Could not read DATABASE_URL from `prisma dev ls`. Is Prisma Dev running?',
    );
  }

  syncDatabaseUrlInEnv(databaseUrl);
  console.log(`DATABASE_URL synced → ${databaseUrl}`);

  if (await waitForConnection(databaseUrl, attempts, delayMs)) {
    return databaseUrl;
  }

  return null;
}

async function stopPrismaDev() {
  try {
    run('npx prisma dev stop default', 'pipe');
  } catch {
    // ignore if already stopped
  }
  await setTimeout(5000);
}

async function startPrismaDev() {
  console.log('Starting Prisma Dev database...');

  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      run('npx prisma dev -d');
      break;
    } catch {
      if (attempt < 4) {
        console.log(`Prisma Dev start failed, retrying... (${attempt + 1}/5)`);
        await setTimeout(3000);
        continue;
      }
      throw new Error('Prisma Dev failed to start after multiple attempts.');
    }
  }

  for (let i = 0; i < 15; i += 1) {
    if (isDbRunning()) {
      return;
    }
    console.log(`Waiting for Prisma Dev to start... (${i + 1}/15)`);
    await setTimeout(2000);
  }

  throw new Error('Prisma Dev did not start in time.');
}

async function restartPrismaDev() {
  console.log('Restarting Prisma Dev (connection was stale)...');
  await stopPrismaDev();
  await startPrismaDev();
}

async function ensureDatabaseUrl() {
  if (!isDbRunning()) {
    await startPrismaDev();
  }

  let databaseUrl = await syncAndVerifyUrl();
  if (databaseUrl) {
    return databaseUrl;
  }

  await restartPrismaDev();
  databaseUrl = await syncAndVerifyUrl({ attempts: 10, delayMs: 2000 });
  if (!databaseUrl) {
    // Last resort: stop, start fresh, retry with longer waits
    await stopPrismaDev();
    await startPrismaDev();
    databaseUrl = await syncAndVerifyUrl({ attempts: 10, delayMs: 2000 });
  }
  if (!databaseUrl) {
    throw new Error('Database did not accept connections after restart.');
  }

  return databaseUrl;
}

async function waitForMigrations() {
  for (let i = 0; i < 15; i += 1) {
    try {
      run('npx prisma migrate deploy', 'pipe');
      console.log('Migrations applied.');
      return;
    } catch {
      console.log(`Waiting for database... (${i + 1}/15)`);
      await setTimeout(2000);
    }
  }
  throw new Error('Database did not become ready in time.');
}

async function main() {
  console.log('Checking local Postgres (Prisma Dev)...');
  await ensureDatabaseUrl();
  await waitForMigrations();

  try {
    run('npx prisma db seed');
  } catch {
    console.log('Seed skipped or already applied.');
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
