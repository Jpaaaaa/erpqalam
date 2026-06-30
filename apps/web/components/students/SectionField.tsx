'use client';

import { useTranslations } from 'next-intl';
import { SECTION_OPTIONS, type SectionOption } from '@/lib/students/sections';
import { SelectField } from '@/components/ui/SelectField';

interface SectionFieldProps {
  value: SectionOption | '';
  onChange: (value: SectionOption | '') => void;
  required?: boolean;
}

export function SectionField({ value, onChange, required = false }: SectionFieldProps) {
  const t = useTranslations('students');

  return (
    <SelectField
      label={t('section')}
      name="section"
      required={required}
      value={value}
      onChange={(e) => onChange(e.target.value as SectionOption | '')}
    >
      <option value="" disabled>
        {t('sectionSelectPlaceholder')}
      </option>
      {SECTION_OPTIONS.map((option) => (
        <option key={option} value={option}>
          {t(`sectionOptions.${option}`)}
        </option>
      ))}
    </SelectField>
  );
}
