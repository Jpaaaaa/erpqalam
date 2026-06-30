import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@generated/prisma/client';

const CONNECTION_ERROR_CODES = new Set(['P1001', 'P1017', 'P1008', 'P1014']);

function isConnectionError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code: unknown }).code === 'string' &&
    CONNECTION_ERROR_CODES.has((error as { code: string }).code)
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const logger = new Logger(PrismaService.name);

    super({
      adapter: new PrismaPg(
        {
          connectionString: process.env.DATABASE_URL,
          max: 5,
          idleTimeoutMillis: 20_000,
          connectionTimeoutMillis: 10_000,
          keepAlive: true,
        },
        {
          onPoolError: (error) => {
            logger.error(`Postgres pool error: ${error.message}`);
          },
        },
      ),
    });
  }

  async onModuleInit() {
    await this.connectWithRetry();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  private async connectWithRetry(maxAttempts = 5) {
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        await this.$connect();
        await this.$queryRaw`SELECT 1`;
        this.logger.log('Database connection verified');
        return;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown database error';
        this.logger.warn(
          `Database connect attempt ${attempt}/${maxAttempts} failed: ${message}`,
        );

        try {
          await this.$disconnect();
        } catch {
          // ignore disconnect errors while retrying
        }

        if (attempt === maxAttempts) {
          throw error;
        }

        await sleep(attempt * 1_000);
      }
    }
  }

  /** Retry once after stale Prisma Dev connections drop mid-session. */
  async withConnectionRetry<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (!isConnectionError(error)) {
        throw error;
      }

      this.logger.warn('Stale database connection — reconnecting…');
      await this.connectWithRetry(3);
      return operation();
    }
  }
}
