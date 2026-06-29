-- CreateEnum
CREATE TYPE "UserPermission" AS ENUM ('STUDENT_REGISTRATION');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "permissions" "UserPermission"[] DEFAULT ARRAY[]::"UserPermission"[];
