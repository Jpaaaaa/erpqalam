import {
  formatWallClockTime12h,
  joinWallClockHour12,
  localDateToWallClockTime,
  splitWallClockTime,
  wallClockTimeToLocalDate,
} from '../src/attendance/wallClockTime';

function assertEqual(actual: string, expected: string, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: expected "${expected}", got "${actual}"`);
  }
}

assertEqual(formatWallClockTime12h('13:40'), '1:40 PM', '13:40 display');
assertEqual(formatWallClockTime12h('00:00'), '12:00 AM', '00:00 display');
assertEqual(formatWallClockTime12h('12:00'), '12:00 PM', '12:00 display');

const fromDate = localDateToWallClockTime(wallClockTimeToLocalDate('13:40'));
assertEqual(fromDate, '13:40', '13:40 storage round-trip');

const { hour, minute } = splitWallClockTime(joinWallClockHour12(1, 40, true));
if (hour !== 13 || minute !== 40) {
  throw new Error(`joinWallClockHour12 1:40 PM: expected 13:40, got ${hour}:${minute}`);
}

console.log('wall-clock-time: ok');
