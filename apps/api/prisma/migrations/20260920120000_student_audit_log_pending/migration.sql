-- AlterTable
ALTER TABLE "StudentAuditLog" ADD COLUMN "pendingStudentId" TEXT;

-- DropForeignKey
ALTER TABLE "StudentAuditLog" DROP CONSTRAINT "StudentAuditLog_studentId_fkey";

-- AlterTable
ALTER TABLE "StudentAuditLog" ALTER COLUMN "studentId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "StudentAuditLog" ADD CONSTRAINT "StudentAuditLog_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAuditLog" ADD CONSTRAINT "StudentAuditLog_pendingStudentId_fkey" FOREIGN KEY ("pendingStudentId") REFERENCES "PendingStudent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "StudentAuditLog_pendingStudentId_createdAt_idx" ON "StudentAuditLog"("pendingStudentId", "createdAt");

-- Exactly one of studentId or pendingStudentId must be set
ALTER TABLE "StudentAuditLog" ADD CONSTRAINT "StudentAuditLog_student_or_pending_check" CHECK (
  ("studentId" IS NOT NULL AND "pendingStudentId" IS NULL)
  OR
  ("studentId" IS NULL AND "pendingStudentId" IS NOT NULL)
);
