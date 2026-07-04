import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { PrismaModule } from './database/prisma.module';
import { AppCacheModule } from './common/cache/cache.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StudentsModule } from './students/students.module';
import { HealthModule } from './health/health.module';
import { DocumentRequestsModule } from './document-requests/document-requests.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    PrismaModule,
    AppCacheModule,
    AuthModule,
    UsersModule,
    StudentsModule,
    DocumentRequestsModule,
    HealthModule,
  ],
})
export class AppModule {}
