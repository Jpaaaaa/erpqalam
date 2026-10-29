import type { ShiftScheduleForm } from './scheduleModel';
import { isValidWallClockTime, parseWallClockMinutes } from './wallClockTime';

export type ScheduleFieldKey = keyof ShiftScheduleForm;

export type ScheduleValidationErrors = Partial<
  Record<Exclude<ScheduleFieldKey, 'workingDays'>, string>
> & { form?: string };

function pairError(
  startKey: Exclude<ScheduleFieldKey, 'workingDays'>,
  endKey: Exclude<ScheduleFieldKey, 'workingDays'>,
  start: number,
  end: number,
  errors: ScheduleValidationErrors,
  code: string,
) {
  if (end <= start) {
    errors[endKey] = code;
  }
}

export function validateShiftSchedule(
  form: ShiftScheduleForm,
): ScheduleValidationErrors {
  const errors: ScheduleValidationErrors = {};
  const timeFields: Exclude<ScheduleFieldKey, 'workingDays'>[] = [
    'shiftStartTime',
    'shiftEndTime',
    'entryZoneStart',
    'entryZoneEnd',
    'lateZoneStartTime',
    'lateZoneEndTime',
    'exitZoneStart',
    'exitZoneEnd',
    'earlyLeftZoneStartTime',
    'earlyLeftZoneEndTime',
  ];

  const mins: Partial<Record<Exclude<ScheduleFieldKey, 'workingDays'>, number>> =
    {};

  for (const key of timeFields) {
    const raw = form[key];
    if (!isValidWallClockTime(raw)) {
      errors[key] = 'invalidTime';
      continue;
    }
    mins[key] = parseWallClockMinutes(raw)!;
  }

  if (Object.keys(errors).length > 0) return errors;

  const shiftStart = mins.shiftStartTime!;
  const shiftEnd = mins.shiftEndTime!;
  if (shiftEnd <= shiftStart) {
    errors.shiftEndTime = 'shiftEndAfterStart';
  }

  pairError(
    'entryZoneStart',
    'entryZoneEnd',
    mins.entryZoneStart!,
    mins.entryZoneEnd!,
    errors,
    'zoneEndAfterStart',
  );
  pairError(
    'lateZoneStartTime',
    'lateZoneEndTime',
    mins.lateZoneStartTime!,
    mins.lateZoneEndTime!,
    errors,
    'zoneEndAfterStart',
  );
  pairError(
    'exitZoneStart',
    'exitZoneEnd',
    mins.exitZoneStart!,
    mins.exitZoneEnd!,
    errors,
    'zoneEndAfterStart',
  );
  pairError(
    'earlyLeftZoneStartTime',
    'earlyLeftZoneEndTime',
    mins.earlyLeftZoneStartTime!,
    mins.earlyLeftZoneEndTime!,
    errors,
    'zoneEndAfterStart',
  );

  if (mins.entryZoneEnd! > shiftStart) {
    errors.entryZoneEnd = 'entryBeforeShiftStart';
  }
  if (mins.lateZoneStartTime! < shiftStart) {
    errors.lateZoneStartTime = 'lateAfterShiftStart';
  }
  if (mins.lateZoneEndTime! > shiftEnd) {
    errors.lateZoneEndTime = 'lateBeforeShiftEnd';
  }
  if (mins.earlyLeftZoneEndTime! > shiftEnd) {
    errors.earlyLeftZoneEndTime = 'earlyBeforeShiftEnd';
  }
  if (mins.exitZoneStart! < shiftStart) {
    errors.exitZoneStart = 'exitAfterShiftStart';
  }

  if (form.workingDays.length === 0) {
    errors.form = 'workingDaysRequired';
  }

  return errors;
}
