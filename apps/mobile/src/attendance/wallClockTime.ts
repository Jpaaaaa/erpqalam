/** Local wall-clock times as "HH:mm" (24h), never UTC. */

const TIME_RE = /^([01]?\d|2[0-3]):([0-5]\d)$/;

export function isValidWallClockTime(value: string): boolean {
  return TIME_RE.test(value.trim());
}

export function parseWallClockMinutes(value: string): number | null {
  const m = value.trim().match(TIME_RE);
  if (!m) return null;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}

export function formatWallClockTime(hour: number, minute: number): string {
  const h = ((hour % 24) + 24) % 24;
  const min = ((minute % 60) + 60) % 60;
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

export function splitWallClockTime(value: string): { hour: number; minute: number } {
  const mins = parseWallClockMinutes(value);
  if (mins == null) return { hour: 8, minute: 0 };
  return { hour: Math.floor(mins / 60), minute: mins % 60 };
}

export function joinWallClockTime(hour: number, minute: number): string {
  return formatWallClockTime(hour, minute);
}

/** Fixed local calendar day — use getHours/getMinutes only, never UTC/ISO. */
export function wallClockTimeToLocalDate(value: string): Date {
  const { hour, minute } = splitWallClockTime(value || '08:00');
  return new Date(2000, 0, 1, hour, minute);
}

export function localDateToWallClockTime(date: Date): string {
  return formatWallClockTime(date.getHours(), date.getMinutes());
}

/** 12-hour display for settings UI; storage/API remain `HH:mm`. */
export function formatWallClockTime12h(
  value: string,
  amLabel = 'AM',
  pmLabel = 'PM',
): string {
  const trimmed = value?.trim();
  if (!trimmed || !isValidWallClockTime(trimmed)) return '--:--';
  const { hour, minute } = splitWallClockTime(trimmed);
  const pm = hour >= 12;
  const h12 = hour % 12 || 12;
  return `${h12}:${String(minute).padStart(2, '0')} ${pm ? pmLabel : amLabel}`;
}

export function splitWallClockHour12(hour24: number): { hour12: number; pm: boolean } {
  const pm = hour24 >= 12;
  const hour12 = hour24 % 12 || 12;
  return { hour12, pm };
}

export function joinWallClockHour12(hour12: number, minute: number, pm: boolean): string {
  let hour24: number;
  if (hour12 === 12) {
    hour24 = pm ? 12 : 0;
  } else {
    hour24 = pm ? hour12 + 12 : hour12;
  }
  return joinWallClockTime(hour24, minute);
}
