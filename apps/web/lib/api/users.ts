import { apiRequest, ApiClientError } from '@/lib/api/client';
import type {
  CreateUserPayload,
  PaginatedUsers,
  UpdateUserPayload,
  UserPermission,
  UserRecord,
  UserRole,
  UserStatus,
} from '@/lib/types/user';

export { ApiClientError };

export async function listUsers(params?: {
  status?: UserStatus;
  role?: UserRole;
  page?: number;
  limit?: number;
}): Promise<PaginatedUsers> {
  const search = new URLSearchParams();
  if (params?.status) search.set('status', params.status);
  if (params?.role) search.set('role', params.role);
  if (params?.page) search.set('page', String(params.page));
  if (params?.limit) search.set('limit', String(params.limit));
  const query = search.toString();
  return apiRequest<PaginatedUsers>(`/users${query ? `?${query}` : ''}`);
}

export async function createUser(payload: CreateUserPayload): Promise<UserRecord> {
  return apiRequest<UserRecord>('/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateUser(
  id: string,
  payload: UpdateUserPayload,
): Promise<UserRecord> {
  return apiRequest<UserRecord>(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function approveUser(
  id: string,
  permissions?: UserPermission[],
): Promise<UserRecord> {
  return apiRequest<UserRecord>(`/users/${id}/approve`, {
    method: 'PATCH',
    body: JSON.stringify({ permissions }),
  });
}

export async function deactivateUser(id: string): Promise<UserRecord> {
  return apiRequest<UserRecord>(`/users/${id}`, {
    method: 'DELETE',
  });
}
