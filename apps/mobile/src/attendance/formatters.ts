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
