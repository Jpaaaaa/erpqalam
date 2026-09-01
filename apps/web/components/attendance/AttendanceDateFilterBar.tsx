'use client';

import { useTranslations } from 'next-intl';
import type { DateFilter } from '@/lib/types/attendance';
import { getQuickRange, isFilterActive } from '@/lib/attendance/formatters';
import { Button } from '@/components/ui/Button';

interface AttendanceDateFilterBarProps {
  filter: DateFilter;
  onChange: (filter: DateFilter) => void;
}

export function AttendanceDateFilterBar({
  filter,
  onChange,
}: AttendanceDateFilterBarProps) {
  const t = useTranslations('attendance.dateFilter');

  const quickRanges = [
    { key: 'today' as const, label: t('today') },
    { key: 'yesterday' as const, label: t('yesterday') },
    { key: 'week' as const, label: t('thisWeek') },
    { key: 'month' as const, label: t('thisMonth') },
  ];

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-card sm:flex-row sm:flex-wrap sm:items-center">
      <span className="text-sm font-medium text-slate-700">{t('label')}</span>
      <div className="flex flex-wrap gap-2">
        {quickRanges.map((r) => {
          const range = getQuickRange(r.key);
          const active = isFilterActive(filter, r.key);
          return (
            <button
              key={r.key}
              type="button"
              onClick={() => onChange({ fromDate: range.from, toDate: range.to })}
              className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                active
                  ? 'bg-orange-100 text-orange-600'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {r.label}
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <span>{t('from')}</span>
          <input
            type="date"
            value={filter.fromDate}
            onChange={(e) => onChange({ ...filter, fromDate: e.target.value })}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <span>{t('to')}</span>
          <input
            type="date"
            value={filter.toDate}
            onChange={(e) => onChange({ ...filter, toDate: e.target.value })}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
        </label>
        <Button
          type="button"
          variant="secondary"
          onClick={() => onChange({ fromDate: '', toDate: '' })}
        >
          {t('clear')}
        </Button>
      </div>
    </div>
  );
}
