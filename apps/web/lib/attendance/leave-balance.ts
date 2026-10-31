import type { EmployeeHoliday, LeaveBalance, TimeLeaveUsage } from '@/lib/types/attendance';

export interface LeaveBalanceContext {
  tempHolidaysPerFullHoliday: number;
  annualHolidaysDays: number;
}

export function countTimeLeaveForUser(
  deviceUserId: string,
  timeLeaveUsage: TimeLeaveUsage[],
): number {
  return timeLeaveUsage.filter((u) => u.deviceUserId === deviceUserId).length;
}

export function countEmployeeHolidaysForUser(
  deviceUserId: string,
  employeeHolidays: EmployeeHoliday[],
): number {
  return employeeHolidays.filter((h) => h.deviceUserId === deviceUserId).length;
}

export function getBalanceDays(
  deviceUserId: string,
  leaveBalances: LeaveBalance[],
): number {
  return leaveBalances.find((b) => b.deviceUserId === deviceUserId)?.balanceDays ?? 0;
}

export function fullHolidaysFromTempLeave(
  tempCount: number,
  ratio: number,
): number {
  if (ratio <= 0) return 0;
  return Math.floor(tempCount / ratio);
}

export function totalFullLeaveUsed(
  deviceUserId: string,
  ctx: LeaveBalanceContext,
  timeLeaveUsage: TimeLeaveUsage[],
  employeeHolidays: EmployeeHoliday[],
): number {
  const empCount = countEmployeeHolidaysForUser(deviceUserId, employeeHolidays);
  const tempCount = countTimeLeaveForUser(deviceUserId, timeLeaveUsage);
  const tempFull = fullHolidaysFromTempLeave(
    tempCount,
    ctx.tempHolidaysPerFullHoliday,
  );
  return empCount + tempFull;
}

export function remainingLeaveDays(
  deviceUserId: string,
  ctx: LeaveBalanceContext,
  leaveBalances: LeaveBalance[],
  timeLeaveUsage: TimeLeaveUsage[],
  employeeHolidays: EmployeeHoliday[],
): number {
  const balanceDays = getBalanceDays(deviceUserId, leaveBalances);
  const totalFullUsed = totalFullLeaveUsed(
    deviceUserId,
    ctx,
    timeLeaveUsage,
    employeeHolidays,
  );
  if (balanceDays > 0) return balanceDays;
  return Math.max(0, ctx.annualHolidaysDays - totalFullUsed);
}

/** Whether adding one time-leave would exceed full-holiday allowance (matches API). */
export function canCoverWithTimeLeave(
  deviceUserId: string,
  ctx: LeaveBalanceContext,
  leaveBalances: LeaveBalance[],
  timeLeaveUsage: TimeLeaveUsage[],
): boolean {
  const tempCount = countTimeLeaveForUser(deviceUserId, timeLeaveUsage);
  const tempCountAfter = tempCount + 1;
  const ratio = ctx.tempHolidaysPerFullHoliday || 3;
  const fullUsedAfter = fullHolidaysFromTempLeave(tempCountAfter, ratio);
  const hasBalanceRow = leaveBalances.some(
    (b) => b.deviceUserId === deviceUserId,
  );
  const balanceDays = hasBalanceRow
    ? getBalanceDays(deviceUserId, leaveBalances)
    : ctx.annualHolidaysDays;
  return fullUsedAfter <= balanceDays;
}
