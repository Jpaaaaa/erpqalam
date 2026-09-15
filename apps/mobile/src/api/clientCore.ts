import type {
  ApiError,
  AuthResponse,
  AuthUser,
  LoginPayload,
  Session,
} from '../types/auth';
import { assertDatedAttendancePath } from './datedAttendanceGuard';

export class ApiClientError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
  }
}

export class SessionExpiredError extends Error {
  constructor() {
    super('Session expired');
    this.name = 'SessionExpiredError';
  }
}

export type ApiClientDeps = {
  apiBaseUrl: string;
  getAccessToken: () => Promise<string | null>;
  getRefreshToken: () => Promise<string | null>;
  saveSession: (session: Session) => Promise<void>;
  clearSession: () => Promise<void>;
  fetch: typeof fetch;
};

type SessionInvalidatedListener = () => void;

export async function parseApiError(
  response: Response,
): Promise<ApiClientError> {
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

export function createApiClient(deps: ApiClientDeps) {
  const sessionInvalidatedListeners = new Set<SessionInvalidatedListener>();
  let refreshPromise: Promise<boolean> | null = null;
  let refreshCallCount = 0;

  function onSessionInvalidated(listener: SessionInvalidatedListener): () => void {
    sessionInvalidatedListeners.add(listener);
    return () => {
      sessionInvalidatedListeners.delete(listener);
    };
  }

  async function invalidateSession(): Promise<never> {
    await deps.clearSession();
    sessionInvalidatedListeners.forEach((listener) => listener());
    throw new SessionExpiredError();
  }

  async function refreshAccessToken(): Promise<boolean> {
    if (refreshPromise) {
      return refreshPromise;
    }

    refreshPromise = (async () => {
      const refreshToken = await deps.getRefreshToken();
      if (!refreshToken) return false;

      try {
        refreshCallCount += 1;
        const response = await deps.fetch(`${deps.apiBaseUrl}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
          return false;
        }

        const data = (await response.json()) as AuthResponse;
        await deps.saveSession({ user: data.user, tokens: data.tokens });
        return true;
      } catch {
        return false;
      }
    })();

    try {
      return await refreshPromise;
    } finally {
      refreshPromise = null;
    }
  }

  async function apiFetch(
    path: string,
    options: RequestInit = {},
    retry = true,
  ): Promise<Response> {
    assertDatedAttendancePath(path);

    const headers = new Headers(options.headers);
    if (
      !headers.has('Content-Type') &&
      options.body &&
      !(options.body instanceof FormData)
    ) {
      headers.set('Content-Type', 'application/json');
    }

    const token = await deps.getAccessToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await deps.fetch(`${deps.apiBaseUrl}${path}`, {
      ...options,
      headers,
    });

    if (response.status === 401 && retry) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return apiFetch(path, options, false);
      }
      await invalidateSession();
    }

    return response;
  }

  async function apiRequest<T>(
    path: string,
    options: RequestInit = {},
    retry = true,
  ): Promise<T> {
    const response = await apiFetch(path, options, retry);

    if (!response.ok) {
      throw await parseApiError(response);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  }

  async function getCurrentUser(): Promise<AuthUser> {
    return apiRequest<AuthUser>('/auth/me');
  }

  async function login(payload: LoginPayload): Promise<Session> {
    const data = await apiRequest<AuthResponse>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      false,
    );

    const session = { user: data.user, tokens: data.tokens };
    await deps.saveSession(session);
    return session;
  }

  async function googleLogin(idToken: string): Promise<Session> {
    const data = await apiRequest<AuthResponse>(
      '/auth/google/mobile',
      {
        method: 'POST',
        body: JSON.stringify({ idToken }),
      },
      false,
    );

    const session = { user: data.user, tokens: data.tokens };
    await deps.saveSession(session);
    return session;
  }

  async function logout(): Promise<void> {
    const refreshToken = await deps.getRefreshToken();
    if (refreshToken) {
      try {
        await apiRequest(
          '/auth/logout',
          {
            method: 'POST',
            body: JSON.stringify({ refreshToken }),
          },
          false,
        );
      } catch {
        // clear local session even if API call fails
      }
    }
    await deps.clearSession();
  }

  return {
    apiFetch,
    apiRequest,
    getCurrentUser,
    login,
    googleLogin,
    logout,
    onSessionInvalidated,
    getRefreshCallCount: () => refreshCallCount,
    resetRefreshCallCount: () => {
      refreshCallCount = 0;
    },
  };
}
