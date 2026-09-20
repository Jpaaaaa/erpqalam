-- CreateTable
CREATE TABLE "StudentAuditLog" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "changedById" TEXT,
    "changedByName" TEXT NOT NULL,
    "changes" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudentAuditLog_studentId_createdAt_idx" ON "StudentAuditLog"("studentId", "createdAt");

-- CreateIndex
CREATE INDEX "StudentAuditLog_schoolId_idx" ON "StudentAuditLog"("schoolId");

-- AddForeignKey
ALTER TABLE "StudentAuditLog" ADD CONSTRAINT "StudentAuditLog_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
