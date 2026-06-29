import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { DatabaseRefreshTokenStore } from './stores/database-refresh-token.store';
import { REFRESH_TOKEN_STORE } from './interfaces/refresh-token.store';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('jwt.secret'),
        signOptions: {
          expiresIn: config.get<string>('jwt.expiresIn', '15m') as `${number}m`,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    DatabaseRefreshTokenStore,
    {
      provide: REFRESH_TOKEN_STORE,
      useFactory: (config: ConfigService, dbStore: DatabaseRefreshTokenStore) => {
        const store = config.get<string>('auth.refreshTokenStore', 'database');
        if (store === 'redis') {
          // Swap to RedisRefreshTokenStore when Redis is enabled
          return dbStore;
        }
        return dbStore;
      },
      inject: [ConfigService, DatabaseRefreshTokenStore],
    },
  ],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
