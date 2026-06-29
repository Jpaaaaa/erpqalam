export type StudentStatus = 'PENDING' | 'REGISTERED';

export interface StudentRegistrar {
  id: string;
  firstName: string;
  lastName: string;
}

export interface Student {
  id: string;
  firstName: string;
  secondName: string;
  thirdName?: string | null;
  mobilePrimary?: string | null;
  mobileSecondary?: string | null;
  comeViaWho?: string | null;
  status: StudentStatus;
  schoolId: string;
  registeredByUserId?: string | null;
  registeredBy?: StudentRegistrar | null;
  registeredAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedStudents {
  data: Student[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateStudentPendingPayload {
  firstName: string;
  secondName: string;
  schoolCode: string;
}

export interface CreateStudentPendingFullPayload {
  firstName: string;
  secondName: string;
  thirdName?: string;
  mobilePrimary: string;
  mobileSecondary?: string;
  comeViaWho: string;
}
