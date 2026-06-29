-- AlterTable
ALTER TABLE "Student" RENAME COLUMN "lastName" TO "secondName";

ALTER TABLE "Student"
ADD COLUMN "thirdName" TEXT,
ADD COLUMN "mobilePrimary" TEXT,
ADD COLUMN "mobileSecondary" TEXT,
ADD COLUMN "comeViaWho" TEXT,
ADD COLUMN "registeredByUserId" TEXT;

-- CreateIndex
CREATE INDEX "Student_registeredByUserId_idx" ON "Student"("registeredByUserId");

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_registeredByUserId_fkey" FOREIGN KEY ("registeredByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
