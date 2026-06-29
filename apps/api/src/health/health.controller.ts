import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Health check' })
  async check() {
    let postgres: 'up' | 'down' = 'down';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      postgres = 'up';
    } catch {
      postgres = 'down';
    }

    const cacheStore = this.config.get<string>('cache.store', 'memory');
    const redisUrl = this.config.get<string>('cache.redisUrl');

    return {
      status: postgres === 'up' ? 'ok' : 'degraded',
      postgres,
      cache: cacheStore,
      redis: redisUrl ? 'configured' : 'skipped',
    };
  }
}
