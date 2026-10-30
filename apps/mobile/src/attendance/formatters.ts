import type { DateFilter, QuickRangeKey } from '../types/attendance';

export function formatLocalDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayDateKey(): string {
  return formatLocalDateKey(new Date());
}

export function formatDisplayDate(dateStr: string): string {
  const parts = dateStr.trim().split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

const LRI = '\u2066';
const PDI = '\u2069';

/** Compact range for filter chips; wrapped in LTR isolate for RTL UI. */
export function formatChipRangeSubtitle(fromDate: string, toDate: string): string {
  if (fromDate === toDate) {
    return `${LRI}${formatDisplayDate(fromDate)}${PDI}`;
  }
  const fromParts = fromDate.trim().split('-');
  const toParts = toDate.trim().split('-');
  if (fromParts.length !== 3 || toParts.length !== 3) {
    return `${LRI}${formatDisplayDate(fromDate)} – ${formatDisplayDate(toDate)}${PDI}`;
  }
  const [fy, fm, fd] = fromParts;
  const [ty, tm, td] = toParts;
  let inner: string;
  if (fy === ty && fm === tm) {
    inner = `${parseInt(fd, 10)} – ${td}/${tm}`;
  } else if (fy === ty) {
    inner = `${parseInt(fd, 10)}/${fm} – ${td}/${tm}`;
  } else {
    inner = `${formatDisplayDate(fromDate)} – ${formatDisplayDate(toDate)}`;
  }
  return `${LRI}${inner}${PDI}`;
}

export function formatDisplayTime(ts: string): string {
  const match = ts.match(/T(\d{2}):(\d{2})(?::(\d{2}))?/);
  if (match) {
    const h24 = parseInt(match[1], 10);
    const m = match[2];
    const h12 = h24 % 12 || 12;
    const ampm = h24 < 12 ? 'AM' : 'PM';
    return `${h12}:${m} ${ampm}`;
  }
  return '—';
}

/** Local wall-clock 24h (no UTC conversion). */
export function formatTime24(ts: string): string {
  const match = ts.match(/T(\d{2}):(\d{2})/);
  if (match) return `${match[1]}:${match[2]}`;
  return '—';
}

export function getQuickRange(type: QuickRangeKey): { from: string; to: string } {
  const now = new Date();
  const today = formatLocalDateKey(now);
  if (type === 'today') return { from: today, to: today };
  if (type === 'yesterday') {
    const d = new Date(now);
    d.setDate(d.getDate() - 1);
    const y = formatLocalDateKey(d);
    return { from: y, to: y };
  }
  if (type === 'week') {
    const d = new Date(now);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return { from: formatLocalDateKey(d), to: today };
  }
  const d = new Date(now);
  d.setDate(1);
  return { from: formatLocalDateKey(d), to: today };
}

export function isFilterActive(filter: DateFilter, type: QuickRangeKey): boolean {
  const r = getQuickRange(type);
  return filter.fromDate === r.from && filter.toDate === r.to;
}

export function displayName(name: string | undefined, deviceUserId: string): string {
  const trimmed = name?.trim();
  return trimmed || deviceUserId;
}

export function buildLocalTimestamp(date: string, time: string): string {
  const [h, mi] = time.split(':');
  return `${date}T${(h || '00').padStart(2, '0')}:${(mi || '00').padStart(2, '0')}:00.000`;
}

/** Local calendar date from an attendance timestamp string (no UTC conversion). */
export function timestampToDateKey(ts: string): string {
  const head = ts.trim().slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(head)) return head;
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return head;
  return formatLocalDateKey(d);
}

export function shiftDateKey(dateKey: string, deltaDays: number): string {
  const parts = dateKey.split('-').map((p) => parseInt(p, 10));
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return dateKey;
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  d.setDate(d.getDate() + deltaDays);
  return formatLocalDateKey(d);
}

export function isValidDateKey(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) return false;
  const parts = value.split('-').map((p) => parseInt(p, 10));
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  return (
    d.getFullYear() === parts[0] &&
    d.getMonth() === parts[1] - 1 &&
    d.getDate() === parts[2]
  );
}
