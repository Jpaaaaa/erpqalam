'use client';

import { useTranslations } from 'next-intl';
import {
  LEGACY_UNASSIGNED_SECTION,
  SECTION_OPTIONS,
  type SectionOption,
} from '@/lib/students/sections';
import type {
  GuardianMobileFilter,
  PendingStudentFilters,
} from '@/lib/students/pending-filters';
import { Input } from '@/components/ui/Input';
import { SelectField } from '@/components/ui/SelectField';
import { StudentsAdvancedFilterPanel } from '@/components/students/StudentsListFilters';

interface PendingStudentsAdvancedFiltersProps {
  open: boolean;
  filters: PendingStudentFilters;
  onChange: (filters: PendingStudentFilters) => void;
  onApply: () => void;
  onClear: () => void;
}

export function PendingStudentsAdvancedFilters({
  open,
  filters,
  onChange,
  onApply,
  onClear,
}: PendingStudentsAdvancedFiltersProps) {
  const t = useTranslations('students');

  function update<K extends keyof PendingStudentFilters>(
    key: K,
    value: PendingStudentFilters[K],
  ) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <StudentsAdvancedFilterPanel open={open} onApply={onApply} onClear={onClear}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SelectField
          label={t('section')}
          name="pending-filter-section"
          value={filters.section}
          onChange={(e) =>
            update('section', e.target.value as SectionOption | '' | 'Unassigned')
          }
        >
          <option value="">{t('filters.allSections')}</option>
          {SECTION_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {t(`sectionOptions.${option}`)}
            </option>
          ))}
          <option value={LEGACY_UNASSIGNED_SECTION}>
            {t('sectionUnassigned')}
          </option>
        </SelectField>

        <Input
          label={t('filters.createdFrom')}
          name="pending-filter-created-from"
          type="date"
          value={filters.createdFrom}
          onChange={(e) => update('createdFrom', e.target.value)}
        />

        <Input
          label={t('filters.createdTo')}
          name="pending-filter-created-to"
          type="date"
          value={filters.createdTo}
          onChange={(e) => update('createdTo', e.target.value)}
        />

        <SelectField
          label={t('filters.hasGuardianMobile')}
          name="pending-filter-guardian-mobile"
          value={filters.hasGuardianMobile}
          onChange={(e) =>
            update('hasGuardianMobile', e.target.value as GuardianMobileFilter)
          }
        >
          <option value="">{t('filters.allGuardianMobile')}</option>
          <option value="true">{t('filters.guardianMobileYes')}</option>
          <option value="false">{t('filters.guardianMobileNo')}</option>
        </SelectField>
      </div>
    </StudentsAdvancedFilterPanel>
  );
}
