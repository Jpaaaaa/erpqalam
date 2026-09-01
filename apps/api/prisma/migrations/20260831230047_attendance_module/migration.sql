/*
  Warnings:

  - Made the column `registeredAt` on table `Student` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "AttendanceHolidayType" AS ENUM ('early_exit', 'entry_late', 'day_off');

-- CreateEnum
CREATE TYPE "TimeLeaveUsageType" AS ENUM ('late_arrival', 'early_exit');

-- AlterTable
ALTER TABLE "Student" ALTER COLUMN "registeredAt" SET NOT NULL;

-- CreateTable
CREATE TABLE "AttendanceDevice" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "serial_number" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "last_seen_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "AttendanceDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceUser" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "device_user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "working_days" TEXT,
    "shift_start_time" TEXT,
    "shift_end_time" TEXT,
    "entry_zone_start" TEXT,
    "entry_zone_end" TEXT,
    "exit_zone_start" TEXT,
    "exit_zone_end" TEXT,
    "late_zone_start_time" TEXT,
    "late_zone_end_time" TEXT,
    "early_left_zone_start_time" TEXT,
    "early_left_zone_end_time" TEXT,
    "linked_user_id" TEXT,

    CONSTRAINT "AttendanceUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceRecord" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "device_user_id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "verify_type" TEXT NOT NULL,
    "device_serial" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AttendanceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceSettings" (
    "school_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "AttendanceSettings_pkey" PRIMARY KEY ("school_id","key")
);

-- CreateTable
CREATE TABLE "AttendanceHoliday" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "type" "AttendanceHolidayType" NOT NULL,

    CONSTRAINT "AttendanceHoliday_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeLeaveUsage" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "device_user_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "type" "TimeLeaveUsageType" NOT NULL,

    CONSTRAINT "TimeLeaveUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeLeaveBalance" (
    "school_id" TEXT NOT NULL,
    "device_user_id" TEXT NOT NULL,
    "balance_days" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "EmployeeLeaveBalance_pkey" PRIMARY KEY ("school_id","device_user_id")
);

-- CreateTable
CREATE TABLE "EmployeeHoliday" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "device_user_id" TEXT NOT NULL,
    "date" DATE NOT NULL,

    CONSTRAINT "EmployeeHoliday_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceDevice_serial_number_key" ON "AttendanceDevice"("serial_number");

-- CreateIndex
CREATE INDEX "AttendanceDevice_school_id_idx" ON "AttendanceDevice"("school_id");

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceUser_linked_user_id_key" ON "AttendanceUser"("linked_user_id");

-- CreateIndex
CREATE INDEX "AttendanceUser_school_id_idx" ON "AttendanceUser"("school_id");

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceUser_school_id_device_user_id_key" ON "AttendanceUser"("school_id", "device_user_id");

-- CreateIndex
CREATE INDEX "AttendanceRecord_school_id_timestamp_idx" ON "AttendanceRecord"("school_id", "timestamp");

-- CreateIndex
CREATE INDEX "AttendanceRecord_school_id_device_user_id_idx" ON "AttendanceRecord"("school_id", "device_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceRecord_school_id_device_user_id_timestamp_device__key" ON "AttendanceRecord"("school_id", "device_user_id", "timestamp", "device_serial");

-- CreateIndex
CREATE INDEX "AttendanceHoliday_school_id_date_idx" ON "AttendanceHoliday"("school_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceHoliday_school_id_date_type_key" ON "AttendanceHoliday"("school_id", "date", "type");

-- CreateIndex
CREATE INDEX "TimeLeaveUsage_school_id_device_user_id_date_idx" ON "TimeLeaveUsage"("school_id", "device_user_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "TimeLeaveUsage_school_id_device_user_id_timestamp_type_key" ON "TimeLeaveUsage"("school_id", "device_user_id", "timestamp", "type");

-- CreateIndex
CREATE INDEX "EmployeeHoliday_school_id_device_user_id_date_idx" ON "EmployeeHoliday"("school_id", "device_user_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeHoliday_school_id_device_user_id_date_key" ON "EmployeeHoliday"("school_id", "device_user_id", "date");

-- AddForeignKey
ALTER TABLE "AttendanceDevice" ADD CONSTRAINT "AttendanceDevice_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceUser" ADD CONSTRAINT "AttendanceUser_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceSettings" ADD CONSTRAINT "AttendanceSettings_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceHoliday" ADD CONSTRAINT "AttendanceHoliday_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeLeaveUsage" ADD CONSTRAINT "TimeLeaveUsage_school_id_device_user_id_fkey" FOREIGN KEY ("school_id", "device_user_id") REFERENCES "AttendanceUser"("school_id", "device_user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeLeaveBalance" ADD CONSTRAINT "EmployeeLeaveBalance_school_id_device_user_id_fkey" FOREIGN KEY ("school_id", "device_user_id") REFERENCES "AttendanceUser"("school_id", "device_user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeHoliday" ADD CONSTRAINT "EmployeeHoliday_school_id_device_user_id_fkey" FOREIGN KEY ("school_id", "device_user_id") REFERENCES "AttendanceUser"("school_id", "device_user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
