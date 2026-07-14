import type { PendingStudent, Student } from '@/lib/types/student';
import type { UpdateStudentDetailsPayload } from '@/lib/types/student-details';
import { isSectionOption, type SectionOption } from '@/lib/students/sections';

export type StudentDetailsRecord = Pick<
  PendingStudent | Student,
  | 'id'
  | 'firstName'
  | 'secondName'
  | 'thirdName'
  | 'fourthName'
  | 'section'
  | 'phoneNumbers'
  | 'homeAddress'
  | 'birthPlace'
  | 'birthDate'
  | 'nationalIdNumber'
  | 'residenceCardNumber'
  | 'foodRationCardNumber'
  | 'guardianName'
  | 'guardianMobile'
  | 'stage'
>;

export interface DetailsFormState {
  firstName: string;
  secondName: string;
  thirdName: string;
  fourthName: string;
  section: SectionOption | '';
  homeAddress: string;
  birthPlace: string;
  birthDate: string;
  nationalIdNumber: string;
  residenceCardNumber: string;
  foodRationCardNumber: string;
  guardianName: string;
  guardianMobile: string;
  studentMobile: string;
  stage: string;
}

export function formatBirthDateForInput(value?: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

export function recordToDetailsForm(record: StudentDetailsRecord): DetailsFormState {
  const sectionValue = record.section?.trim();
  const section =
    sectionValue && isSectionOption(sectionValue) ? sectionValue : '';

  return {
    firstName: record.firstName ?? '',
    secondName: record.secondName ?? '',
    thirdName: record.thirdName ?? '',
    fourthName: record.fourthName ?? '',
    section,
    homeAddress: record.homeAddress ?? '',
    birthPlace: record.birthPlace ?? '',
    birthDate: formatBirthDateForInput(record.birthDate),
    nationalIdNumber: record.nationalIdNumber ?? '',
    residenceCardNumber: record.residenceCardNumber ?? '',
    foodRationCardNumber: record.foodRationCardNumber ?? '',
    guardianName: record.guardianName ?? '',
    guardianMobile: record.guardianMobile ?? record.phoneNumbers[1] ?? '',
    studentMobile: record.phoneNumbers[0] ?? '',
    stage: record.stage ?? '',
  };
}

export function editFormToStudentPayload(form: DetailsFormState) {
  return {
    section: form.section,
    firstName: form.firstName.trim(),
    secondName: form.secondName.trim(),
    thirdName: form.thirdName.trim() || undefined,
    fourthName: form.fourthName.trim() || undefined,
  };
}

export function detailsFormToPayload(form: DetailsFormState): UpdateStudentDetailsPayload {
  return {
    homeAddress: form.homeAddress.trim() || undefined,
    birthPlace: form.birthPlace.trim() || undefined,
    birthDate: form.birthDate || undefined,
    nationalIdNumber: form.nationalIdNumber.trim() || undefined,
    residenceCardNumber: form.residenceCardNumber.trim() || undefined,
    foodRationCardNumber: form.foodRationCardNumber.trim() || undefined,
    guardianName: form.guardianName.trim() || undefined,
    guardianMobile: form.guardianMobile.trim() || undefined,
    studentMobile: form.studentMobile.trim() || undefined,
    stage: form.stage.trim() || undefined,
  };
}
