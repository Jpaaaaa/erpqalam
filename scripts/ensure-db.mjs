import { execSync } from 'node:child_process';
import { setTimeout } from 'node:timers/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const apiDir = path.join(__dirname, '..', 'apps', 'api');

function run(command, stdio = 'inherit') {
  execSync(command, { cwd: apiDir, stdio, shell: true });
}

function isDbRunning() {
  try {
    const output = execSync('npx prisma dev ls', {
      cwd: apiDir,
      encoding: 'utf8',
      shell: true,
    });
    if (output.includes('not_running')) {
      return false;
    }
    return output.includes('running');
  } catch {
    return false;
  }
}

async function waitForDb() {
  for (let i = 0; i < 15; i += 1) {
    try {
      run('npx prisma migrate deploy', 'pipe');
      console.log('Database is ready.');
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

  if (!isDbRunning()) {
    console.log('Starting Prisma Dev database...');
    run('npx prisma dev -d');
    await setTimeout(3000);
  }

  await waitForDb();

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
