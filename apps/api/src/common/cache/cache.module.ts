import { Global, Module } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const store = config.get<string>('cache.store', 'memory');
        const redisUrl = config.get<string>('cache.redisUrl');

        if (store === 'redis' && redisUrl) {
          // Wire Redis store here when enabled (e.g. cache-manager-redis-yet)
          return { ttl: 60_000 };
        }

        return { ttl: 60_000 };
      },
    }),
  ],
  exports: [NestCacheModule],
})
export class AppCacheModule {}
