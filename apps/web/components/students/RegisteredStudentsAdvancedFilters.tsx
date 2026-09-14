'use client';

import { useTranslations } from 'next-intl';
import {
  CAME_VIA_SOURCES,
  type CameViaSource,
} from '@/lib/students/came-via';
import {
  LEGACY_UNASSIGNED_SECTION,
  SECTION_OPTIONS,
  type SectionOption,
} from '@/lib/students/sections';
import type {
  DetailsStatusFilter,
  RegisteredStudentFilters,
} from '@/lib/students/registered-filters';
import { Input } from '@/components/ui/Input';
import { SelectField } from '@/components/ui/SelectField';
import { StudentsAdvancedFilterPanel } from '@/components/students/StudentsListFilters';

interface RegisteredStudentsAdvancedFiltersProps {
  open: boolean;
  filters: RegisteredStudentFilters;
  onChange: (filters: RegisteredStudentFilters) => void;
  onApply: () => void;
  onClear: () => void;
}

export function RegisteredStudentsAdvancedFilters({
  open,
  filters,
  onChange,
  onApply,
  onClear,
}: RegisteredStudentsAdvancedFiltersProps) {
  const t = useTranslations('students');

  function update<K extends keyof RegisteredStudentFilters>(
    key: K,
    value: RegisteredStudentFilters[K],
  ) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <StudentsAdvancedFilterPanel open={open} onApply={onApply} onClear={onClear}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Input
          label={t('filters.searchName')}
          name="filter-q"
          value={filters.q}
          onChange={(e) => update('q', e.target.value)}
          placeholder={t('filters.searchNamePlaceholder')}
        />

        <SelectField
          label={t('section')}
          name="filter-section"
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

        <SelectField
          label={t('filters.detailsStatus')}
          name="filter-details"
          value={filters.detailsStatus}
          onChange={(e) =>
            update('detailsStatus', e.target.value as DetailsStatusFilter)
          }
        >
          <option value="">{t('filters.allDetailsStatuses')}</option>
          <option value="complete">{t('filters.detailsComplete')}</option>
          <option value="incomplete">{t('filters.detailsIncomplete')}</option>
        </SelectField>

        <SelectField
          label={t('cameViaWhat')}
          name="filter-cameVia"
          value={filters.cameVia}
          onChange={(e) => update('cameVia', e.target.value as CameViaSource | '')}
        >
          <option value="">{t('filters.allSources')}</option>
          {CAME_VIA_SOURCES.map((source) => (
            <option key={source} value={source}>
              {t(`cameViaOptions.${source}`)}
            </option>
          ))}
        </SelectField>

        <Input
          label={t('phoneNumbers')}
          name="filter-phone"
          type="tel"
          value={filters.phone}
          onChange={(e) => update('phone', e.target.value)}
          placeholder={t('filters.phonePlaceholder')}
        />

        <Input
          label={t('detailsForm.stage')}
          name="filter-stage"
          value={filters.stage}
          onChange={(e) => update('stage', e.target.value)}
          placeholder={t('filters.stagePlaceholder')}
        />
      </div>
    </StudentsAdvancedFilterPanel>
  );
}
