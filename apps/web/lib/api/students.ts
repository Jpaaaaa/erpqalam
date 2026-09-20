import { apiRequest, ApiClientError } from '@/lib/api/client';
import type {
  CreateStudentCheckInPayload,
  CreatePendingStudentPayload,
  PaginatedPendingStudents,
  PaginatedStudents,
  PendingStudent,
  Student,
  UpdatePendingStudentPayload,
} from '@/lib/types/student';
import type { UpdateStudentDetailsPayload } from '@/lib/types/student-details';
import type { StudentAuditLogEntry } from '@/lib/types/student-audit';
import type { PendingStudentFilters } from '@/lib/students/pending-filters';
import { pendingFiltersToQueryParams } from '@/lib/students/pending-filters';

export { ApiClientError };

export async function submitStudentCheckIn(
  payload: CreateStudentCheckInPayload,
): Promise<PendingStudent> {
  return apiRequest<PendingStudent>('/students/pending', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, false);
}

export async function createPendingStudent(
  payload: CreatePendingStudentPayload,
): Promise<PendingStudent> {
  return apiRequest<PendingStudent>('/pending-students', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function listPendingStudents(params?: {
  page?: number;
  limit?: number;
  search?: string;
} & Partial<PendingStudentFilters>): Promise<PaginatedPendingStudents> {
  const search = new URLSearchParams();
  if (params?.page) search.set('page', String(params.page));
  if (params?.limit) search.set('limit', String(params.limit));
  if (params?.search?.trim()) search.set('search', params.search.trim());

  const filterParams = pendingFiltersToQueryParams({
    section: params?.section ?? '',
    createdFrom: params?.createdFrom ?? '',
    createdTo: params?.createdTo ?? '',
    hasGuardianMobile: params?.hasGuardianMobile ?? '',
  });
  for (const [key, value] of Object.entries(filterParams)) {
    search.set(key, value);
  }

  const query = search.toString();
  return apiRequest<PaginatedPendingStudents>(
    `/pending-students${query ? `?${query}` : ''}`,
  );
}

export async function getStudentCounts(): Promise<{
  pending: number;
  registered: number;
}> {
  return apiRequest<{ pending: number; registered: number }>('/students/counts');
}

export async function updatePendingStudent(
  id: string,
  payload: UpdatePendingStudentPayload,
): Promise<PendingStudent> {
  return apiRequest<PendingStudent>(`/pending-students/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function approvePendingStudent(id: string): Promise<Student> {
  return apiRequest<Student>(`/pending-students/${id}/approve`, {
    method: 'PATCH',
  });
}

export async function deletePendingStudent(id: string): Promise<void> {
  await apiRequest<void>(`/pending-students/${id}`, {
    method: 'DELETE',
  });
}

export async function restoreStudentToPending(
  id: string,
  payload?: { reason?: string },
): Promise<PendingStudent> {
  return apiRequest<PendingStudent>(`/students/${id}/restore-to-pending`, {
    method: 'PATCH',
    body: JSON.stringify(payload ?? {}),
  });
}

export async function deleteStudent(id: string): Promise<void> {
  await apiRequest<void>(`/students/${id}`, {
    method: 'DELETE',
  });
}

import type { RegisteredStudentFilters } from '@/lib/students/registered-filters';
import { filtersToQueryParams } from '@/lib/students/registered-filters';

export async function listStudents(
  params?: {
    page?: number;
    limit?: number;
  } & Partial<RegisteredStudentFilters>,
): Promise<PaginatedStudents> {
  const search = new URLSearchParams();
  if (params?.page) search.set('page', String(params.page));
  if (params?.limit) search.set('limit', String(params.limit));

  const filterParams = filtersToQueryParams({
    q: params?.q ?? '',
    section: params?.section ?? '',
    detailsStatus: params?.detailsStatus ?? '',
    cameVia: params?.cameVia ?? '',
    phone: params?.phone ?? '',
    stage: params?.stage ?? '',
  });

  for (const [key, value] of Object.entries(filterParams)) {
    search.set(key, value);
  }

  const query = search.toString();
  return apiRequest<PaginatedStudents>(`/students${query ? `?${query}` : ''}`);
}

export interface UpdateStudentPayload {
  firstName?: string;
  secondName?: string;
  thirdName?: string;
  fourthName?: string;
  section?: string;
}

export async function updateStudent(
  id: string,
  payload: UpdateStudentPayload,
): Promise<Student> {
  return apiRequest<Student>(`/students/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function updatePendingStudentDetails(
  id: string,
  payload: UpdateStudentDetailsPayload,
): Promise<PendingStudent> {
  return apiRequest<PendingStudent>(`/pending-students/${id}/details`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function updateStudentDetails(
  id: string,
  payload: UpdateStudentDetailsPayload,
): Promise<Student> {
  return apiRequest<Student>(`/students/${id}/details`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function fetchStudentAudit(
  studentId: string,
): Promise<StudentAuditLogEntry[]> {
  return apiRequest<StudentAuditLogEntry[]>(`/students/${studentId}/audit`);
}

export async function fetchPendingStudentAudit(
  pendingStudentId: string,
): Promise<StudentAuditLogEntry[]> {
  return apiRequest<StudentAuditLogEntry[]>(
    `/pending-students/${pendingStudentId}/audit`,
  );
}

/** @deprecated Use approvePendingStudent */
export async function registerStudent(id: string): Promise<Student> {
  return approvePendingStudent(id);
}

/** @deprecated Use createPendingStudent */
export async function createPendingStudentFull(
  payload: CreatePendingStudentPayload,
): Promise<PendingStudent> {
  return createPendingStudent(payload);
}

/** @deprecated Use submitStudentCheckIn */
export async function submitStudentPending(
  payload: CreateStudentCheckInPayload,
): Promise<PendingStudent> {
  return submitStudentCheckIn(payload);
}
