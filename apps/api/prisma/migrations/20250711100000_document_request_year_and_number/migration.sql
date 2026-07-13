-- AlterTable
ALTER TABLE "DocumentRequestSettings" ADD COLUMN "defaultAcademicYear" TEXT;

-- AlterTable
ALTER TABLE "DocumentRequestLetter" ADD COLUMN "academicYear" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "DocumentRequestLetter_schoolId_documentNumber_key" ON "DocumentRequestLetter"("schoolId", "documentNumber");
