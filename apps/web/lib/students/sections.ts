export const SECTION_OPTIONS = [
  'oil_and_gas',
  'computer',
  'management',
  'accounting',
] as const;

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

  if (isSectionOption(value)) {
    return t(`sectionOptions.${value}`);
  }

  return value;
}
