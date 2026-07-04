-- CreateTable
CREATE TABLE "DocumentRequestSettings" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "prefix" TEXT NOT NULL DEFAULT 'ب',
    "nextNumber" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentRequestSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentRequestLetter" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "documentNumber" TEXT NOT NULL,
    "documentDate" DATE NOT NULL,
    "studentFullName" TEXT NOT NULL,
    "previousSchoolName" TEXT NOT NULL,
    "pendingStudentId" TEXT,
    "studentId" TEXT,
    "generatedByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentRequestLetter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DocumentRequestSettings_schoolId_key" ON "DocumentRequestSettings"("schoolId");

-- CreateIndex
CREATE INDEX "DocumentRequestLetter_schoolId_createdAt_idx" ON "DocumentRequestLetter"("schoolId", "createdAt");

-- CreateIndex
CREATE INDEX "DocumentRequestLetter_studentId_idx" ON "DocumentRequestLetter"("studentId");

-- CreateIndex
CREATE INDEX "DocumentRequestLetter_pendingStudentId_idx" ON "DocumentRequestLetter"("pendingStudentId");

-- AddForeignKey
ALTER TABLE "DocumentRequestSettings" ADD CONSTRAINT "DocumentRequestSettings_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentRequestLetter" ADD CONSTRAINT "DocumentRequestLetter_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentRequestLetter" ADD CONSTRAINT "DocumentRequestLetter_pendingStudentId_fkey" FOREIGN KEY ("pendingStudentId") REFERENCES "PendingStudent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentRequestLetter" ADD CONSTRAINT "DocumentRequestLetter_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentRequestLetter" ADD CONSTRAINT "DocumentRequestLetter_generatedByUserId_fkey" FOREIGN KEY ("generatedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Seed default settings for existing schools
INSERT INTO "DocumentRequestSettings" ("id", "schoolId", "prefix", "nextNumber", "updatedAt")
SELECT
    'drs_' || "id",
    "id",
    'ب',
    1,
    CURRENT_TIMESTAMP
FROM "School"
WHERE NOT EXISTS (
    SELECT 1 FROM "DocumentRequestSettings" WHERE "DocumentRequestSettings"."schoolId" = "School"."id"
);
