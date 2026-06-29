import type { AuthTokens, AuthUser, Session } from '@/lib/types/auth';

const ACCESS_TOKEN_KEY = 'erpqalam_access_token';
const REFRESH_TOKEN_KEY = 'erpqalam_refresh_token';
const USER_KEY = 'erpqalam_user';

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function getAccessToken(): string | null {
  if (!isBrowser()) return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (!isBrowser()) return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (!isBrowser()) return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function saveSession(session: Session): void {
  if (!isBrowser()) return;
  localStorage.setItem(ACCESS_TOKEN_KEY, session.tokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, session.tokens.refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(session.user));
}

export function updateTokens(tokens: AuthTokens): void {
  if (!isBrowser()) return;
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
}

export function clearSession(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getSession(): Session | null {
  const user = getStoredUser();
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();
  if (!user || !accessToken || !refreshToken) return null;
  return { user, tokens: { accessToken, refreshToken } };
}
