import type { DateFilter } from '@/lib/types/attendance';

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
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function formatDisplayTime(ts: string): string {
  const match = ts.match(
    /T(\d{2}):(\d{2})(?::(\d{2}))?/,
  );
  if (match) {
    const h24 = parseInt(match[1], 10);
    const m = match[2];
    const h12 = h24 % 12 || 12;
    const ampm = h24 < 12 ? 'AM' : 'PM';
    return `${h12}:${m} ${ampm}`;
  }
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return '—';
  const h24 = d.getHours();
  const h12 = h24 % 12 || 12;
  const m = String(d.getMinutes()).padStart(2, '0');
  const ampm = h24 < 12 ? 'AM' : 'PM';
  return `${h12}:${m} ${ampm}`;
}

export function formatTimeFromHHMM(hhmm: string): string {
  if (!hhmm?.trim()) return '—';
  const [hRaw, mRaw] = hhmm.trim().split(':');
  const h24 = parseInt(hRaw || '0', 10);
  const m = (mRaw || '00').padStart(2, '0');
  const h12 = h24 % 12 || 12;
  const ampm = h24 < 12 ? 'AM' : 'PM';
  return `${h12}:${m} ${ampm}`;
}

export function buildLocalTimestamp(date: string, time: string): string {
  const [h, mi] = time.split(':');
  return `${date}T${(h || '00').padStart(2, '0')}:${(mi || '00').padStart(2, '0')}:00.000`;
}

export function getQuickRange(
  type: 'today' | 'yesterday' | 'week' | 'month',
): { from: string; to: string } {
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

export function isFilterActive(
  filter: DateFilter,
  type: 'today' | 'yesterday' | 'week' | 'month',
): boolean {
  const r = getQuickRange(type);
  return filter.fromDate === r.from && filter.toDate === r.to;
}
