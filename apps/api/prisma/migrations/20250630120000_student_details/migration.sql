-- AlterTable
ALTER TABLE "PendingStudent"
ADD COLUMN "homeAddress" TEXT,
ADD COLUMN "birthPlace" TEXT,
ADD COLUMN "birthDate" TIMESTAMP(3),
ADD COLUMN "nationalIdNumber" TEXT,
ADD COLUMN "residenceCardNumber" TEXT,
ADD COLUMN "foodRationCardNumber" TEXT,
ADD COLUMN "guardianName" TEXT,
ADD COLUMN "guardianMobile" TEXT,
ADD COLUMN "stage" TEXT,
ADD COLUMN "detailsCompletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Student"
ADD COLUMN "homeAddress" TEXT,
ADD COLUMN "birthPlace" TEXT,
ADD COLUMN "birthDate" TIMESTAMP(3),
ADD COLUMN "nationalIdNumber" TEXT,
ADD COLUMN "residenceCardNumber" TEXT,
ADD COLUMN "foodRationCardNumber" TEXT,
ADD COLUMN "guardianName" TEXT,
ADD COLUMN "guardianMobile" TEXT,
ADD COLUMN "stage" TEXT,
ADD COLUMN "detailsCompletedAt" TIMESTAMP(3);
