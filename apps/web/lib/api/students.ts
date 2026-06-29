import { apiRequest, API_BASE_URL, ApiClientError } from '@/lib/api/client';
import type {
  CreateStudentPendingPayload,
  CreateStudentPendingFullPayload,
  PaginatedStudents,
  Student,
  StudentStatus,
} from '@/lib/types/student';
import type { ApiError } from '@/lib/types/auth';

export { ApiClientError };

export async function submitStudentPending(
  payload: CreateStudentPendingPayload,
): Promise<Student> {
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

  return response.json() as Promise<Student>;
}

export async function createPendingStudentFull(
  payload: CreateStudentPendingFullPayload,
): Promise<Student> {
  return apiRequest<Student>('/students/pending/full', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function listStudents(params?: {
  status?: StudentStatus;
  page?: number;
  limit?: number;
}): Promise<PaginatedStudents> {
  const search = new URLSearchParams();
  if (params?.status) search.set('status', params.status);
  if (params?.page) search.set('page', String(params.page));
  if (params?.limit) search.set('limit', String(params.limit));
  const query = search.toString();
  return apiRequest<PaginatedStudents>(
    `/students${query ? `?${query}` : ''}`,
  );
}

export async function registerStudent(id: string): Promise<Student> {
  return apiRequest<Student>(`/students/${id}/register`, {
    method: 'PATCH',
  });
}
