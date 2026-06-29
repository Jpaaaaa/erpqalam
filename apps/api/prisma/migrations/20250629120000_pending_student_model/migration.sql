-- CreateTable
CREATE TABLE "PendingStudent" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "secondName" TEXT NOT NULL,
    "thirdName" TEXT,
    "fourthName" TEXT,
    "section" TEXT,
    "phoneNumbers" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "guardianInfo" TEXT,
    "schoolId" TEXT NOT NULL,
    "submittedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PendingStudent_pkey" PRIMARY KEY ("id")
);

-- Migrate pending rows from Student into PendingStudent
INSERT INTO "PendingStudent" (
    "id",
    "firstName",
    "secondName",
    "thirdName",
    "fourthName",
    "section",
    "phoneNumbers",
    "guardianInfo",
    "schoolId",
    "submittedByUserId",
    "createdAt",
    "updatedAt"
)
SELECT
    "id",
    "firstName",
    "secondName",
    "thirdName",
    NULL,
    NULL,
    ARRAY_REMOVE(ARRAY["mobilePrimary", "mobileSecondary"]::TEXT[], NULL::TEXT),
    "comeViaWho",
    "schoolId",
    NULL,
    "createdAt",
    "updatedAt"
FROM "Student"
WHERE "status" = 'PENDING';

DELETE FROM "Student" WHERE "status" = 'PENDING';

-- Add new columns on Student (registered records)
ALTER TABLE "Student"
ADD COLUMN "fourthName" TEXT,
ADD COLUMN "section" TEXT,
ADD COLUMN "phoneNumbers" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "guardianInfo" TEXT,
ADD COLUMN "pendingStudentId" TEXT;

UPDATE "Student"
SET
    "phoneNumbers" = ARRAY_REMOVE(ARRAY["mobilePrimary", "mobileSecondary"]::TEXT[], NULL::TEXT),
    "guardianInfo" = "comeViaWho",
    "section" = COALESCE(NULLIF("section", ''), 'Unassigned');

ALTER TABLE "Student"
DROP COLUMN "status",
DROP COLUMN "mobilePrimary",
DROP COLUMN "mobileSecondary",
DROP COLUMN "comeViaWho";

ALTER TABLE "Student" ALTER COLUMN "section" SET NOT NULL;
ALTER TABLE "Student" ALTER COLUMN "registeredAt" SET DEFAULT CURRENT_TIMESTAMP;

DROP TYPE "StudentStatus";

CREATE UNIQUE INDEX "Student_pendingStudentId_key" ON "Student"("pendingStudentId");

CREATE INDEX "PendingStudent_schoolId_idx" ON "PendingStudent"("schoolId");
CREATE INDEX "PendingStudent_submittedByUserId_idx" ON "PendingStudent"("submittedByUserId");
CREATE INDEX "PendingStudent_schoolId_createdAt_idx" ON "PendingStudent"("schoolId", "createdAt");

CREATE INDEX "Student_schoolId_registeredAt_idx" ON "Student"("schoolId", "registeredAt");

ALTER TABLE "PendingStudent" ADD CONSTRAINT "PendingStudent_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PendingStudent" ADD CONSTRAINT "PendingStudent_submittedByUserId_fkey" FOREIGN KEY ("submittedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

DROP INDEX IF EXISTS "Student_status_idx";
DROP INDEX IF EXISTS "Student_schoolId_status_idx";
