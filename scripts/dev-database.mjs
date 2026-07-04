/**
 * Shared dev database helpers — Docker Postgres (default) vs Prisma Dev (opt-in).
 */

import { execSync } from 'node:child_process';

export const DOCKER_DATABASE_URL =
  'postgresql://erp:erp@localhost:5432/erpqalam';

export const PRISMA_DEV_URL_PATTERN =
  /postgres:\/\/postgres:postgres@localhost:\d+\/template1\?sslmode=disable/;

export function usesPrismaDevEnv() {
  const flag = process.env.USE_PRISMA_DEV;
  return flag === '1' || flag === 'true';
}

export function isPrismaDevDatabaseUrl(databaseUrl) {
  return PRISMA_DEV_URL_PATTERN.test(databaseUrl ?? '');
}

export function shouldSyncPrismaDevUrl(databaseUrl = process.env.DATABASE_URL) {
  return usesPrismaDevEnv() || isPrismaDevDatabaseUrl(databaseUrl);
}

export function isDockerUnavailableMessage(message) {
  return (
    message.includes('dockerDesktopLinuxEngine') ||
    message.includes('docker daemon') ||
    message.includes('Cannot connect to the Docker daemon') ||
    message.includes('Docker is not running')
  );
}

export function isDockerDaemonAvailable() {
  try {
    execSync('docker info', { stdio: 'pipe', shell: true });
    return true;
  } catch {
    return false;
  }
}
