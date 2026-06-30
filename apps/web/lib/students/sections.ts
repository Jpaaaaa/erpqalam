export const SECTION_OPTIONS = [
  'oil_and_gas',
  'computer',
  'management',
  'accounting',
] as const;

/** Legacy placeholder from DB migration for students registered before section existed. */
export const LEGACY_UNASSIGNED_SECTION = 'Unassigned';

export type SectionOption = (typeof SECTION_OPTIONS)[number];

export function isSectionOption(value: string): value is SectionOption {
  return (SECTION_OPTIONS as readonly string[]).includes(value);
}

type TranslateFn = (key: string) => string;

export function formatSectionValue(
  value: string | null | undefined,
  t: TranslateFn,
): string {
  if (!value?.trim()) {
    return '';
  }

  if (value === LEGACY_UNASSIGNED_SECTION) {
    return t('sectionUnassigned');
  }

  if (isSectionOption(value)) {
    return t(`sectionOptions.${value}`);
  }

  return value;
}
