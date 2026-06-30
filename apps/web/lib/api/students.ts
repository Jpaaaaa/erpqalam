import { apiRequest, API_BASE_URL, ApiClientError } from '@/lib/api/client';
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
import type { ApiError } from '@/lib/types/auth';

export { ApiClientError };

export async function submitStudentCheckIn(
  payload: CreateStudentCheckInPayload,
): Promise<PendingStudent> {
  const response = await fetch(`${API_BASE_URL}/students/pending`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = response.statusText;
    try {
      const body = (await response.json()) as ApiError;
      message = Array.isArray(body.message)
        ? body.message.join(', ')
        : body.message;
    } catch {
      // ignore
    }
    throw new ApiClientError(message, response.status);
  }

  return response.json() as Promise<PendingStudent>;
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
}): Promise<PaginatedPendingStudents> {
  const search = new URLSearchParams();
  if (params?.page) search.set('page', String(params.page));
  if (params?.limit) search.set('limit', String(params.limit));
  const query = search.toString();
  return apiRequest<PaginatedPendingStudents>(
    `/pending-students${query ? `?${query}` : ''}`,
  );
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
