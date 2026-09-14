-- AlterTable
ALTER TABLE "PendingStudent"
ADD COLUMN "originalStudentId" TEXT,
ADD COLUMN "restoreReason" TEXT,
ADD COLUMN "restoredAt" TIMESTAMP(3),
ADD COLUMN "restoredById" TEXT;

-- CreateIndex
CREATE INDEX "PendingStudent_restoredById_idx" ON "PendingStudent"("restoredById");

-- CreateIndex
CREATE INDEX "PendingStudent_originalStudentId_idx" ON "PendingStudent"("originalStudentId");

-- AddForeignKey
ALTER TABLE "PendingStudent"
ADD CONSTRAINT "PendingStudent_restoredById_fkey"
FOREIGN KEY ("restoredById") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
