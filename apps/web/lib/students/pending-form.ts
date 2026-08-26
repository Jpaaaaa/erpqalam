import {
  buildCameViaValue,
  parseCameViaValue,
  type CameViaSource,
} from '@/lib/students/came-via';
import { isSectionOption, type SectionOption } from '@/lib/students/sections';
import type {
  CreatePendingStudentPayload,
  PendingStudent,
  UpdatePendingStudentPayload,
} from '@/lib/types/student';

export interface PendingStudentFormState {
  firstName: string;
  secondName: string;
  thirdName: string;
  fourthName: string;
  section: SectionOption | '';
  phoneNumbers: [string, string];
  guardianInfo: string;
  cameViaSource: CameViaSource | '';
  cameViaFriendDetail: string;
}

export type PendingFormValidationError =
  | 'nameRequired'
  | 'phoneNumbersRequired'
  | 'phonePartial'
  | 'sectionRequired'
  | 'cameViaRequired';

export function emptyPendingStudentForm(): PendingStudentFormState {
  return {
    firstName: '',
    secondName: '',
    thirdName: '',
    fourthName: '',
    section: '',
    phoneNumbers: ['', ''],
    guardianInfo: '',
    cameViaSource: '',
    cameViaFriendDetail: '',
  };
}

export function pendingStudentToForm(student: PendingStudent): PendingStudentFormState {
  const { source, friendDetail } = parseCameViaValue(student.comeViaWho);
  const sectionValue = student.section?.trim();
  const section =
    sectionValue && isSectionOption(sectionValue) ? sectionValue : '';

  return {
    firstName: student.firstName ?? '',
    secondName: student.secondName ?? '',
    thirdName: student.thirdName ?? '',
    fourthName: student.fourthName ?? '',
    section,
    phoneNumbers: [student.phoneNumbers[0] ?? '', student.phoneNumbers[1] ?? ''],
    guardianInfo: student.guardianInfo ?? '',
    cameViaSource: source,
    cameViaFriendDetail: friendDetail,
  };
}

function trimmedPhones(form: PendingStudentFormState): [string, string] {
  return [form.phoneNumbers[0].trim(), form.phoneNumbers[1].trim()];
}

function buildComeViaWho(form: PendingStudentFormState): string | undefined {
  if (!form.cameViaSource) return undefined;
  return buildCameViaValue(form.cameViaSource, form.cameViaFriendDetail);
}

export function validatePendingFormForCreate(
  form: PendingStudentFormState,
): PendingFormValidationError | null {
  if (!form.firstName.trim() || !form.secondName.trim()) {
    return 'nameRequired';
  }

  const phones = trimmedPhones(form);
  if (phones.some((phone) => !phone)) {
    return 'phoneNumbersRequired';
  }

  if (!form.section) {
    return 'sectionRequired';
  }

  if (!form.cameViaSource) {
    return 'cameViaRequired';
  }

  return null;
}

export function validatePendingFormForEdit(
  form: PendingStudentFormState,
): PendingFormValidationError | null {
  if (!form.firstName.trim() || !form.secondName.trim()) {
    return 'nameRequired';
  }

  const phones = trimmedPhones(form);
  const filledCount = phones.filter(Boolean).length;
  if (filledCount === 1) {
    return 'phonePartial';
  }

  return null;
}

export function formToCreatePayload(
  form: PendingStudentFormState,
): CreatePendingStudentPayload {
  const phoneNumbers = trimmedPhones(form);
  const comeViaWho = buildComeViaWho(form);

  return {
    firstName: form.firstName.trim(),
    secondName: form.secondName.trim(),
    thirdName: form.thirdName.trim(),
    fourthName: form.fourthName.trim(),
    section: form.section,
    phoneNumbers,
    guardianInfo: form.guardianInfo.trim() || undefined,
    comeViaWho: comeViaWho!,
  };
}

export function formToUpdatePayload(
  form: PendingStudentFormState,
): UpdatePendingStudentPayload {
  const phoneNumbers = trimmedPhones(form);
  const comeViaWho = form.cameViaSource
    ? buildCameViaValue(form.cameViaSource, form.cameViaFriendDetail)
    : '';

  return {
    firstName: form.firstName.trim(),
    secondName: form.secondName.trim(),
    thirdName: form.thirdName.trim() || undefined,
    fourthName: form.fourthName.trim() || undefined,
    ...(form.section ? { section: form.section } : {}),
    ...(phoneNumbers.every(Boolean) ? { phoneNumbers } : {}),
    guardianInfo: form.guardianInfo.trim(),
    comeViaWho,
  };
}
