'use client';

import { useTranslations } from 'next-intl';

interface FormFieldLabelProps {
  labelKey: string;
}

export function FormFieldLabel({ labelKey }: FormFieldLabelProps) {
  const t = useTranslations('students.detailsForm');

  return (
    <span className="block text-sm font-medium text-slate-700">{t(labelKey)}</span>
  );
}
