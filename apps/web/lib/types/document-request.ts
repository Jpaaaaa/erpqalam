import type { StaffMember } from '@/lib/types/student';

export interface BodyParagraphFields {
  introText: string;
  afterStudentText: string;
  instituteName: string;
  beforeYearText: string;
  closingText: string;
}

export const DEFAULT_BODY_PARAGRAPH_FIELDS: BodyParagraphFields = {
  introText: 'نظراً للقبول الطالب/ـة',
  afterStudentText: 'في معهدنا',
  instituteName: 'معهد القلم الأهلي',
  beforeYearText: 'للعام الدراسي',
  closingText: 'يرجى تزويدنا بالوثيقة لآخر المرحلة الدراسية.',
};

export interface DocumentRequestSettings {
  prefix: string;
  nextNumber: number;
  nextDocumentNumber: string;
  defaultAcademicYear?: string | null;
  bodyParagraph: BodyParagraphFields;
}

export interface UpdateDocumentRequestSettingsPayload {
  prefix?: string;
  nextNumber?: number;
  bodyParagraph?: BodyParagraphFields;
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

export type DocumentRequestLanguage = 'ar' | 'ku';

export interface CreateDocumentRequestPayload {
  previousSchoolName: string;
  academicYear?: string;
  documentNumber?: string;
  language?: DocumentRequestLanguage;
  studentId?: string;
  pendingStudentId?: string;
}

export interface DocumentRequestCreateDefaults {
  prefix: string;
  nextNumber: number;
  nextDocumentNumber: string;
  academicYear: string;
}

export interface CreateDocumentRequestTarget {
  studentName: string;
  studentId?: string;
  pendingStudentId?: string;
}
