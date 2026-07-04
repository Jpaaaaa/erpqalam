import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@generated/prisma/client';

const CONNECTION_ERROR_CODES = new Set(['P1001', 'P1017', 'P1008', 'P1014', 'P2010']);

const TCP_URL_PATTERN =
  /postgres:\/\/postgres:postgres@localhost:\d+\/template1\?sslmode=disable/;

function isConnectionError(error: unknown): boolean {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code: unknown }).code === 'string' &&
    CONNECTION_ERROR_CODES.has((error as { code: string }).code)
  ) {
    return true;
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('connection terminated') ||
      message.includes('connection closed') ||
      message.includes('server has closed the connection') ||
      message.includes('connectionclosed') ||
      message.includes('econnreset') ||
      message.includes('socket hang up') ||
      message.includes('connection refused') ||
      message.includes('client has encountered a connection error') ||
      message.includes('pool after calling end') ||
      message.includes('timeout exceeded when trying to connect')
    );
  }

  return false;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function resolveApiDir() {
  if (existsSync(join(process.cwd(), 'prisma', 'schema.prisma'))) {
    return process.cwd();
  }

  return join(process.cwd(), 'apps', 'api');
}

function syncRuntimeDatabaseUrl(logger: Logger): string | null {
  const flag = process.env.USE_PRISMA_DEV;
  const usesPrismaDev = flag === '1' || flag === 'true';
  const usesPrismaDevUrl = TCP_URL_PATTERN.test(process.env.DATABASE_URL ?? '');

  if (!usesPrismaDev && !usesPrismaDevUrl) {
    return process.env.DATABASE_URL ?? null;
  }

  try {
    const output = execSync('npx prisma dev ls', {
      cwd: resolveApiDir(),
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    const match = output.match(TCP_URL_PATTERN);
    if (!match) {
      return null;
    }

    const databaseUrl = match[0];
    if (process.env.DATABASE_URL !== databaseUrl) {
      logger.warn(`DATABASE_URL updated → ${databaseUrl}`);
      process.env.DATABASE_URL = databaseUrl;
    }

    return databaseUrl;
  } catch {
    return null;
  }
}

function createPgAdapter(logger: Logger) {
  return new PrismaPg(
    {
      connectionString: process.env.DATABASE_URL,
      max: 5,
      idleTimeoutMillis: 0,
      connectionTimeoutMillis: 10_000,
      keepAlive: true,
      keepAliveInitialDelayMillis: 10_000,
    },
    {
      onPoolError: (error) => {
        logger.error(`Postgres pool error: ${error.message}`);
      },
    },
  );
}

type ClientState = {
  base: PrismaClient;
};

function createClientState(logger: Logger): ClientState {
  return {
    base: new PrismaClient({ adapter: createPgAdapter(logger) }),
  };
}

function buildRuntime(logger: Logger, onClientSwap: () => void) {
  let state = createClientState(logger);
  let recoveryLock: Promise<void> | null = null;

  async function disposeClient(client: PrismaClient) {
    try {
      await client.$disconnect();
    } catch {
      // ignore teardown errors
    }
  }

  async function verifyConnection(client: PrismaClient) {
    await client.$connect();
    await client.$queryRaw`SELECT 1`;
  }

  async function recover(): Promise<void> {
    if (recoveryLock) {
      await recoveryLock;
      return;
    }

    recoveryLock = (async () => {
      logger.warn('Database connection lost — recreating client…');
      const previous = state.base;

      for (let attempt = 1; attempt <= 3; attempt += 1) {
        syncRuntimeDatabaseUrl(logger);
        state = createClientState(logger);
        onClientSwap();

        try {
          await verifyConnection(state.base);
          logger.log('Database connection restored');
          void disposeClient(previous);
          return;
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Unknown database error';
          logger.warn(`Reconnect attempt ${attempt}/3 failed: ${message}`);
          void disposeClient(state.base);

          if (attempt === 3) {
            throw error;
          }

          await sleep(attempt * 1_000);
        }
      }
    })();

    try {
      await recoveryLock;
    } finally {
      recoveryLock = null;
    }
  }

  async function withConnectionRetry<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (!isConnectionError(error)) {
        throw error;
      }

      await recover();
      return operation();
    }
  }

  async function connectWithRetry(maxAttempts = 5) {
    syncRuntimeDatabaseUrl(logger);

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        await verifyConnection(state.base);
        return;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown database error';
        logger.warn(
          `Database connect attempt ${attempt}/${maxAttempts} failed: ${message}`,
        );

        if (attempt === maxAttempts) {
          throw error;
        }

        const previous = state.base;
        syncRuntimeDatabaseUrl(logger);
        state = createClientState(logger);
        onClientSwap();
        void disposeClient(previous);
        await sleep(attempt * 1_000);
      }
    }
  }

  return {
    get base() {
      return state.base;
    },
    withConnectionRetry,
    connectWithRetry,
    recover,
  };
}

function applyClient(
  target: PrismaService,
  runtime: ReturnType<typeof buildRuntime>,
) {
  Object.assign(target, runtime.base);
}

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private readonly runtime = buildRuntime(this.logger, () =>
    applyClient(this, this.runtime),
  );

  constructor() {
    syncRuntimeDatabaseUrl(this.logger);
    applyClient(this, this.runtime);
  }

  withConnectionRetry<T>(operation: () => Promise<T>): Promise<T> {
    return this.runtime.withConnectionRetry(operation);
  }

  async onModuleInit() {
    await this.runtime.connectWithRetry();
    applyClient(this, this.runtime);
    this.logger.log('Database connection verified');
  }

  async onModuleDestroy() {
    await this.runtime.base.$disconnect();
  }
}

export interface PrismaService extends PrismaClient {}
