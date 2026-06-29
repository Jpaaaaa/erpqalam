import type { PendingStudent, Student, StaffMember } from '@/lib/types/student';

type NameFields = Pick<
  Student | PendingStudent,
  'firstName' | 'secondName' | 'thirdName' | 'fourthName'
>;

export function formatStudentName(student: NameFields) {
  return [
    student.firstName,
    student.secondName,
    student.thirdName,
    student.fourthName,
  ]
    .filter(Boolean)
    .join(' ');
}

export function formatPhoneNumbers(phones: string[]) {
  return phones.filter(Boolean).join(' · ');
}

export function formatStaffName(staff: StaffMember) {
  return `${staff.firstName} ${staff.lastName}`;
}

/** @deprecated Use formatStaffName */
export function formatRegistrarName(staff: StaffMember) {
  return formatStaffName(staff);
}
