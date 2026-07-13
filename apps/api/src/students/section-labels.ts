import type { DocumentRequestLanguage } from '../document-requests/document-request-language';

export const STUDENT_SECTION_KEYS = [
  'computer',
  'oil_and_gas',
  'management',
  'accounting',
] as const;

export type StudentSectionKey = (typeof STUDENT_SECTION_KEYS)[number];

const SECTION_LABELS_AR: Record<StudentSectionKey, string> = {
  computer: 'حاسوب',
  oil_and_gas: 'النفط والغاز',
  management: 'إدارة',
  accounting: 'محاسبة',
};

const SECTION_LABELS_KU: Record<StudentSectionKey, string> = {
  computer: 'کۆمپیوتەر',
  oil_and_gas: 'نەوت و گاز',
  management: 'بەڕێوەبردن',
  accounting: 'ژمێریاری',
};

export function isStudentSectionKey(value: string): value is StudentSectionKey {
  return (STUDENT_SECTION_KEYS as readonly string[]).includes(value);
}

export function formatStudentSectionLabel(
  section: string | null | undefined,
  language: DocumentRequestLanguage = 'ar',
): string {
  const trimmed = section?.trim();
  if (!trimmed) {
    return '';
  }

  if (trimmed === 'Unassigned') {
    return '';
  }

  if (isStudentSectionKey(trimmed)) {
    return language === 'ku'
      ? SECTION_LABELS_KU[trimmed]
      : SECTION_LABELS_AR[trimmed];
  }

  return trimmed;
}

export function formatStudentSectionLabelAr(
  section: string | null | undefined,
): string {
  return formatStudentSectionLabel(section, 'ar');
}
