import type { StaffMember } from '@/lib/types/student';

export interface DocumentRequestSettings {
  prefix: string;
  nextNumber: number;
  nextDocumentNumber: string;
}

export interface UpdateDocumentRequestSettingsPayload {
  prefix?: string;
  nextNumber?: number;
}

export interface DocumentRequestLetter {
  id: string;
  documentNumber: string;
  documentDate: string;
  studentFullName: string;
  previousSchoolName: string;
  studentId?: string | null;
  pendingStudentId?: string | null;
  generatedBy: StaffMember;
  createdAt: string;
}

export interface PaginatedDocumentRequests {
  data: DocumentRequestLetter[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateDocumentRequestPayload {
  previousSchoolName: string;
  studentId?: string;
  pendingStudentId?: string;
}

export interface CreateDocumentRequestTarget {
  studentName: string;
  studentId?: string;
  pendingStudentId?: string;
}
