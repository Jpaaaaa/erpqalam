import type { useTranslations } from 'next-intl';
import { formatCameViaValue, formatSectionValue } from '@/lib/students/format';

type StudentsT = ReturnType<typeof useTranslations<'students'>>;
type DetailsT = ReturnType<typeof useTranslations<'students.detailsForm'>>;

const DETAILS_FORM_KEYS = new Set([
  'homeAddress',
  'birthPlace',
  'birthDate',
  'nationalIdNumber',
  'residenceCardNumber',
  'foodRationCardNumber',
  'studentMobile',
  'guardianName',
  'guardianMobile',
  'stage',
]);

export function getStudentAuditFieldLabel(
  field: string,
  tStudents: StudentsT,
  tDetails: DetailsT,
): string {
  switch (field) {
    case 'firstName':
      return tStudents('firstName');
    case 'secondName':
      return tStudents('secondName');
    case 'thirdName':
      return tStudents('thirdName');
    case 'fourthName':
      return tStudents('fourthName');
    case 'section':
      return tStudents('section');
    case 'comeViaWho':
      return tStudents('comeViaWho');
    case 'guardianInfo':
      return tStudents('guardianInfo');
    default:
      if (DETAILS_FORM_KEYS.has(field)) {
        return tDetails(field as 'homeAddress');
      }
      return field;
  }
}

export function formatStudentAuditFieldValue(
  field: string,
  value: string | null,
  tStudents: StudentsT,
): string {
  if (value == null || value.trim() === '') {
    return '—';
  }

  if (field === 'section') {
    return formatSectionValue(value, tStudents);
  }

  if (field === 'comeViaWho') {
    return formatCameViaValue(value, tStudents);
  }

  return value;
}
