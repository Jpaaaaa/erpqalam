import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  saveSession,
  updateTokens,
} from '@/lib/auth/storage';
import type {
  ApiError,
  AuthResponse,
  AuthUser,
  LoginPayload,
  RegisterPayload,
  Session,
} from '@/lib/types/auth';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

export class ApiClientError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
  }
}

async function parseError(response: Response): Promise<ApiClientError> {
  let message = response.statusText;
  try {
    const body = (await response.json()) as ApiError;
    message = Array.isArray(body.message)
      ? body.message.join(', ')
      : body.message;
  } catch {
    // ignore parse errors
  }
  return new ApiClientError(message, response.status);
}

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    clearSession();
    return false;
  }

  const data = (await response.json()) as AuthResponse;
  saveSession({ user: data.user, tokens: data.tokens });
  return true;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getAccessToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    cache: 'no-store',
  });

  if (response.status === 401 && retry) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return apiRequest<T>(path, options, false);
    }
  }

  if (!response.ok) {
    throw await parseError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function getCurrentUser(): Promise<AuthUser> {
  return apiRequest<AuthUser>('/auth/me');
}

export async function login(payload: LoginPayload): Promise<Session> {
  const data = await apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, false);

  const session = { user: data.user, tokens: data.tokens };
  saveSession(session);
  return session;
}

export async function register(payload: RegisterPayload): Promise<void> {
  await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, false);
}

export async function logout(): Promise<void> {
  const refreshToken = getRefreshToken();
  if (refreshToken) {
    try {
      await apiRequest('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      }, false);
    } catch {
      // clear local session even if API call fails
    }
  }
  clearSession();
}

export { API_BASE_URL, updateTokens };
