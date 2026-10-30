import { parseLocalTimestamp } from '../attendance-rules';

export function formatDateFromKey(dateKey: string): string {
  if (!dateKey) return '–';
  const d = parseLocalTimestamp(`${dateKey}T12:00:00.000`);
  if (!d) return dateKey;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/** HRAT-style 12h time with seconds (local wall clock). */
export function formatTimeFromLocalTs(ts: string | null | undefined): string {
  if (!ts) return '–';
  const d = parseLocalTimestamp(ts);
  if (!d) return '–';
  const h24 = d.getHours();
  const h12 = h24 % 12 || 12;
  const m = String(d.getMinutes()).padStart(2, '0');
  const s = String(d.getSeconds()).padStart(2, '0');
  const ampm = h24 < 12 ? 'ص' : 'م';
  return `${h12}:${m}:${s} ${ampm}`;
}

export function formatTime12FromHHMM(hhmm: string): string {
  if (!hhmm || typeof hhmm !== 'string') return '–';
  const parts = String(hhmm).trim().split(':');
  const h24 = parseInt(parts[0] || '0', 10);
  const m = (parts[1] || '00').padStart(2, '0');
  const h12 = h24 % 12 || 12;
  const ampm = h24 < 12 ? 'ص' : 'م';
  return `${h12}:${m} ${ampm}`;
}

export function formatExportDate(now = new Date()): string {
  const y = now.getFullYear();
  const mo = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${y}-${mo}-${day}`;
  const h24 = now.getHours();
  const h12 = h24 % 12 || 12;
  const m = String(now.getMinutes()).padStart(2, '0');
  const ampm = h24 < 12 ? 'ص' : 'م';
  return `${dateStr} ${h12}:${m} ${ampm}`;
}
