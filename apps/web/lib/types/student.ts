export interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
}

export interface PendingStudent {
  id: string;
  firstName: string;
  secondName: string;
  thirdName?: string | null;
  fourthName?: string | null;
  section?: string | null;
  phoneNumbers: string[];
  guardianInfo?: string | null;
  comeViaWho?: string | null;
  schoolId: string;
  submittedByUserId?: string | null;
  submittedBy?: StaffMember | null;
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id: string;
  firstName: string;
  secondName: string;
  thirdName?: string | null;
  fourthName?: string | null;
  section: string;
  phoneNumbers: string[];
  guardianInfo?: string | null;
  comeViaWho?: string | null;
  schoolId: string;
  registeredByUserId?: string | null;
  registeredBy?: StaffMember | null;
  registeredAt?: string | null;
  pendingStudentId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedPendingStudents {
  data: PendingStudent[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedStudents {
  data: Student[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateStudentCheckInPayload {
  firstName: string;
  secondName: string;
  schoolCode: string;
  comeViaWho?: string;
}

export interface CreatePendingStudentPayload {
  firstName: string;
  secondName: string;
  thirdName: string;
  fourthName: string;
  section: string;
  phoneNumbers: string[];
  guardianInfo?: string;
  comeViaWho: string;
}

export interface UpdatePendingStudentPayload {
  firstName?: string;
  secondName?: string;
  thirdName?: string;
  fourthName?: string;
  section?: string;
  phoneNumbers?: string[];
  guardianInfo?: string;
  comeViaWho?: string;
}
