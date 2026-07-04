import { execSync } from 'node:child_process';
import { setTimeout } from 'node:timers/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DOCKER_DATABASE_URL,
  isDockerDaemonAvailable,
  isDockerUnavailableMessage,
  usesPrismaDevEnv,
} from './dev-database.mjs';
import {
  extractTcpDatabaseUrl,
  readPrismaDevLsOutput,
  syncDatabaseUrlInEnv,
} from './sync-prisma-dev-url.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');
const apiDir = path.join(rootDir, 'apps', 'api');
const composeFile = path.join(rootDir, 'docker', 'docker-compose.dev.yml');

export { DOCKER_DATABASE_URL };

function run(command, cwd = apiDir, stdio = 'inherit') {
  execSync(command, { cwd, stdio, shell: true });
}

function usesPrismaDevOnly() {
  return usesPrismaDevEnv();
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

async function waitForConnection(databaseUrl, attempts = 15, delayMs = 2000) {
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

function isDockerPostgresRunning() {
  if (!isDockerDaemonAvailable()) {
    return false;
  }

  try {
    const output = execSync(
      `docker compose -f "${composeFile}" ps --status running --services`,
      {
        cwd: rootDir,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
        shell: true,
      },
    );
    return output
      .split(/\r?\n/)
      .map((line) => line.trim())
      .includes('postgres');
  } catch {
    return false;
  }
}

async function startDockerPostgres() {
  console.log('Starting Docker Postgres (stable local dev database)...');
  run(`docker compose -f "${composeFile}" up postgres -d`, rootDir);
}

async function tryEnsureDockerDatabase() {
  if (!isDockerDaemonAvailable()) {
    return null;
  }

  syncDatabaseUrlInEnv(DOCKER_DATABASE_URL);

  if (await testConnection(DOCKER_DATABASE_URL)) {
    console.log(`DATABASE_URL set → ${DOCKER_DATABASE_URL}`);
    return DOCKER_DATABASE_URL;
  }

  try {
    if (!isDockerPostgresRunning()) {
      await startDockerPostgres();
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (isDockerUnavailableMessage(message)) {
      return null;
    }
    throw error;
  }

  if (await waitForConnection(DOCKER_DATABASE_URL)) {
    console.log(`DATABASE_URL set → ${DOCKER_DATABASE_URL}`);
    return DOCKER_DATABASE_URL;
  }

  console.warn(
    'Docker Postgres did not accept connections — trying Prisma Dev fallback...',
  );
  return null;
}

function isPrismaDevRunning() {
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

async function stopPrismaDev() {
  try {
    run('npx prisma dev stop default', apiDir, 'pipe');
  } catch {
    // ignore if already stopped
  }
  await setTimeout(5000);
}

async function startPrismaDev() {
  console.log('Starting Prisma Dev database...');

  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      run('npx prisma dev -d', apiDir);
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
    if (isPrismaDevRunning()) {
      return;
    }
    console.log(`Waiting for Prisma Dev to start... (${i + 1}/15)`);
    await setTimeout(2000);
  }

  throw new Error('Prisma Dev did not start in time.');
}

async function syncAndVerifyPrismaDevUrl({ attempts = 10, delayMs = 2000 } = {}) {
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

async function ensurePrismaDevDatabase() {
  if (!isPrismaDevRunning()) {
    await startPrismaDev();
  }

  let databaseUrl = await syncAndVerifyPrismaDevUrl();
  if (databaseUrl) {
    return databaseUrl;
  }

  console.log('Restarting Prisma Dev (connection was stale)...');
  await stopPrismaDev();
  await startPrismaDev();

  databaseUrl = await syncAndVerifyPrismaDevUrl({ attempts: 10, delayMs: 2000 });
  if (!databaseUrl) {
    throw new Error('Database did not accept connections after restart.');
  }

  return databaseUrl;
}

async function ensureDatabaseUrl() {
  if (usesPrismaDevOnly()) {
    console.log('Checking local Postgres (Prisma Dev — USE_PRISMA_DEV=1)...');
    return ensurePrismaDevDatabase();
  }

  console.log('Checking local Postgres (Docker preferred)...');
  const dockerUrl = await tryEnsureDockerDatabase();
  if (dockerUrl) {
    return dockerUrl;
  }

  console.log(
    'Docker unavailable or not ready — falling back to Prisma Dev...',
  );
  return ensurePrismaDevDatabase();
}

async function waitForMigrations() {
  for (let i = 0; i < 15; i += 1) {
    try {
      run('npx prisma migrate deploy', apiDir, 'pipe');
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
  await ensureDatabaseUrl();
  await waitForMigrations();

  try {
    run('npx prisma db seed', apiDir);
  } catch {
    console.log('Seed skipped or already applied.');
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
