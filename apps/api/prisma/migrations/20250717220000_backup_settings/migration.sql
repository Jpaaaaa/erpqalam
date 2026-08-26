-- CreateTable
CREATE TABLE "BackupSettings" (
    "id" TEXT NOT NULL,
    "botToken" TEXT NOT NULL DEFAULT '',
    "chatIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "backupTime" TEXT NOT NULL DEFAULT '20:00',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BackupSettings_pkey" PRIMARY KEY ("id")
);
