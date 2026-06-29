import type { Student, StudentRegistrar } from '@/lib/types/student';

export function formatStudentName(
  student: Pick<Student, 'firstName' | 'secondName' | 'thirdName'>,
) {
  return [student.firstName, student.secondName, student.thirdName]
    .filter(Boolean)
    .join(' ');
}

export function formatRegistrarName(registrar: StudentRegistrar) {
  return `${registrar.firstName} ${registrar.lastName}`;
}
