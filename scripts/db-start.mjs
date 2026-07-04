/**
 * Starts Docker Postgres when available; otherwise prints fallback instructions.
 */
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDockerDaemonAvailable } from './dev-database.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');
const composeFile = path.join(rootDir, 'docker', 'docker-compose.dev.yml');

if (!isDockerDaemonAvailable()) {
  console.warn('Docker is not running.');
  console.warn('Run `npm run dev` — it will fall back to Prisma Dev automatically.');
  console.warn('Or start Docker Desktop and run `npm run db:start` again.');
  process.exit(0);
}

execSync(`docker compose -f "${composeFile}" up postgres -d`, {
  cwd: rootDir,
  stdio: 'inherit',
  shell: true,
});

console.log('Docker Postgres started.');
