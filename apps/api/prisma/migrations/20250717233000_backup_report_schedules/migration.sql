-- AlterTable
ALTER TABLE "BackupSettings" ADD COLUMN "dailyReportEnabled" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "BackupSettings" ADD COLUMN "dailyReportTime" TEXT NOT NULL DEFAULT '20:00';
ALTER TABLE "BackupSettings" ADD COLUMN "weeklyReportEnabled" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "BackupSettings" ADD COLUMN "weeklyReportDay" INTEGER NOT NULL DEFAULT 6;
ALTER TABLE "BackupSettings" ADD COLUMN "weeklyReportTime" TEXT NOT NULL DEFAULT '20:00';
ALTER TABLE "BackupSettings" ADD COLUMN "monthlyReportEnabled" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "BackupSettings" ADD COLUMN "monthlyReportDay" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "BackupSettings" ADD COLUMN "monthlyReportTime" TEXT NOT NULL DEFAULT '20:00';
