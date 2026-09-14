'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';

export function StudentsFilterToggle({
  open,
  activeCount,
  onToggle,
}: {
  open: boolean;
  activeCount: number;
  onToggle: () => void;
}) {
  const t = useTranslations('students');

  return (
    <Button type="button" variant="secondary" onClick={onToggle}>
      {open ? t('filters.hideAdvanced') : t('filters.showAdvanced')}
      {!open && activeCount > 0 && (
        <span className="ms-2 rounded-full bg-teal-100 px-2 py-0.5 text-xs font-semibold text-teal-800">
          {activeCount}
        </span>
      )}
    </Button>
  );
}

export function StudentsAdvancedFilterPanel({
  open,
  children,
  onApply,
  onClear,
}: {
  open: boolean;
  children: ReactNode;
  onApply: () => void;
  onClear: () => void;
}) {
  const t = useTranslations('students');

  if (!open) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
      {children}
      <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="ghost" onClick={onClear}>
          {t('filters.clear')}
        </Button>
        <Button type="button" onClick={onApply}>
          {t('filters.apply')}
        </Button>
      </div>
    </div>
  );
}
