import { parseWorkingDays } from './report-days';
import type { AttendanceSettings, AttendanceUser } from '../types/attendance';

export type ShiftScheduleFormUpdater =
  | ShiftScheduleForm
  | ((prev: ShiftScheduleForm) => ShiftScheduleForm);

export function applyShiftScheduleUpdate(
  prev: ShiftScheduleForm,
  update: ShiftScheduleFormUpdater,
): ShiftScheduleForm {
  return typeof update === 'function' ? update(prev) : update;
}

export type ShiftScheduleForm = {
  shiftStartTime: string;
  shiftEndTime: string;
  entryZoneStart: string;
  entryZoneEnd: string;
  lateZoneStartTime: string;
  lateZoneEndTime: string;
  exitZoneStart: string;
  exitZoneEnd: string;
  earlyLeftZoneStartTime: string;
  earlyLeftZoneEndTime: string;
  workingDays: number[];
};

export function scheduleFromSettings(s: AttendanceSettings): ShiftScheduleForm {
  return {
    shiftStartTime: s.shiftStartTime,
    shiftEndTime: s.shiftEndTime,
    entryZoneStart: s.entryZoneStart,
    entryZoneEnd: s.entryZoneEnd,
    lateZoneStartTime: s.lateZoneStartTime,
    lateZoneEndTime: s.lateZoneEndTime,
    exitZoneStart: s.exitZoneStart,
    exitZoneEnd: s.exitZoneEnd,
    earlyLeftZoneStartTime: s.earlyLeftZoneStartTime,
    earlyLeftZoneEndTime: s.earlyLeftZoneEndTime,
    workingDays: [...s.workingDays],
  };
}

function trimmedOrEmpty(v?: string | null): string {
  return v?.trim() ?? '';
}

export function employeeUsesGlobalSchedule(user: AttendanceUser): boolean {
  if (parseWorkingDays(user.workingDays) != null) return false;
  const fields = [
    user.shiftStartTime,
    user.shiftEndTime,
    user.entryZoneStart,
    user.entryZoneEnd,
    user.lateZoneStartTime,
    user.lateZoneEndTime,
    user.exitZoneStart,
    user.exitZoneEnd,
    user.earlyLeftZoneStartTime,
    user.earlyLeftZoneEndTime,
  ];
  return fields.every((f) => trimmedOrEmpty(f) === '');
}

export function scheduleFromUser(
  user: AttendanceUser,
  global: AttendanceSettings,
): ShiftScheduleForm {
  const base = scheduleFromSettings(global);
  return {
    shiftStartTime: trimmedOrEmpty(user.shiftStartTime) || base.shiftStartTime,
    shiftEndTime: trimmedOrEmpty(user.shiftEndTime) || base.shiftEndTime,
    entryZoneStart: trimmedOrEmpty(user.entryZoneStart) || base.entryZoneStart,
    entryZoneEnd: trimmedOrEmpty(user.entryZoneEnd) || base.entryZoneEnd,
    lateZoneStartTime:
      trimmedOrEmpty(user.lateZoneStartTime) || base.lateZoneStartTime,
    lateZoneEndTime:
      trimmedOrEmpty(user.lateZoneEndTime) || base.lateZoneEndTime,
    exitZoneStart: trimmedOrEmpty(user.exitZoneStart) || base.exitZoneStart,
    exitZoneEnd: trimmedOrEmpty(user.exitZoneEnd) || base.exitZoneEnd,
    earlyLeftZoneStartTime:
      trimmedOrEmpty(user.earlyLeftZoneStartTime) ||
      base.earlyLeftZoneStartTime,
    earlyLeftZoneEndTime:
      trimmedOrEmpty(user.earlyLeftZoneEndTime) || base.earlyLeftZoneEndTime,
    workingDays:
      parseWorkingDays(user.workingDays) ?? [...base.workingDays],
  };
}

export function emptyToNull(value: string): string | null {
  const t = value.trim();
  return t === '' ? null : t;
}

export function globalSchedulePayload(form: ShiftScheduleForm): Partial<AttendanceSettings> {
  return {
    shiftStartTime: form.shiftStartTime.trim(),
    shiftEndTime: form.shiftEndTime.trim(),
    entryZoneStart: form.entryZoneStart.trim(),
    entryZoneEnd: form.entryZoneEnd.trim(),
    lateZoneStartTime: form.lateZoneStartTime.trim(),
    lateZoneEndTime: form.lateZoneEndTime.trim(),
    exitZoneStart: form.exitZoneStart.trim(),
    exitZoneEnd: form.exitZoneEnd.trim(),
    earlyLeftZoneStartTime: form.earlyLeftZoneStartTime.trim(),
    earlyLeftZoneEndTime: form.earlyLeftZoneEndTime.trim(),
    workingDays: [...form.workingDays].sort((a, b) => a - b),
  };
}

export function employeeSchedulePayload(
  useGlobal: boolean,
  form: ShiftScheduleForm,
): Partial<
  Omit<AttendanceUser, 'id' | 'deviceUserId' | 'linkedUserId' | 'name'>
> {
  if (useGlobal) {
    return {
      workingDays: null,
      shiftStartTime: null,
      shiftEndTime: null,
      entryZoneStart: null,
      entryZoneEnd: null,
      lateZoneStartTime: null,
      lateZoneEndTime: null,
      exitZoneStart: null,
      exitZoneEnd: null,
      earlyLeftZoneStartTime: null,
      earlyLeftZoneEndTime: null,
    };
  }
  return {
    workingDays: JSON.stringify(
      [...form.workingDays].sort((a, b) => a - b),
    ),
    shiftStartTime: emptyToNull(form.shiftStartTime),
    shiftEndTime: emptyToNull(form.shiftEndTime),
    entryZoneStart: emptyToNull(form.entryZoneStart),
    entryZoneEnd: emptyToNull(form.entryZoneEnd),
    lateZoneStartTime: emptyToNull(form.lateZoneStartTime),
    lateZoneEndTime: emptyToNull(form.lateZoneEndTime),
    exitZoneStart: emptyToNull(form.exitZoneStart),
    exitZoneEnd: emptyToNull(form.exitZoneEnd),
    earlyLeftZoneStartTime: emptyToNull(form.earlyLeftZoneStartTime),
    earlyLeftZoneEndTime: emptyToNull(form.earlyLeftZoneEndTime),
  };
}

export const WORKING_DAY_KEYS = [0, 1, 2, 3, 4, 5, 6] as const;
