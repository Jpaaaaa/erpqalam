import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import configuration from './config/configuration';
import { PrismaModule } from './database/prisma.module';
import { AppCacheModule } from './common/cache/cache.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StudentsModule } from './students/students.module';
import { HealthModule } from './health/health.module';
import { DocumentRequestsModule } from './document-requests/document-requests.module';
import { BackupSettingsModule } from './backup-settings/backup-settings.module';
import { AttendanceModule } from './attendance/attendance.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AppCacheModule,
    AuthModule,
    UsersModule,
    StudentsModule,
    DocumentRequestsModule,
    BackupSettingsModule,
    AttendanceModule,
    HealthModule,
  ],
})
export class AppModule {}
