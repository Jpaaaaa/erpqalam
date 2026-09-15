import * as SecureStore from 'expo-secure-store';
import type { AuthTokens, AuthUser, Session } from '../types/auth';

const ACCESS_TOKEN_KEY = 'erpqalam_access_token';
const REFRESH_TOKEN_KEY = 'erpqalam_refresh_token';
const USER_KEY = 'erpqalam_user';

function normalizeUser(user: AuthUser): AuthUser {
  return {
    ...user,
    permissions: user.permissions ?? [],
  };
}

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function getStoredUser(): Promise<AuthUser | null> {
  const raw = await SecureStore.getItemAsync(USER_KEY);
  if (!raw) return null;
  try {
    return normalizeUser(JSON.parse(raw) as AuthUser);
  } catch {
    return null;
  }
}

export async function saveSession(session: Session): Promise<void> {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, session.tokens.accessToken);
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, session.tokens.refreshToken);
  await SecureStore.setItemAsync(
    USER_KEY,
    JSON.stringify(normalizeUser(session.user)),
  );
}

export async function updateTokens(tokens: AuthTokens): Promise<void> {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.accessToken);
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken);
}

export async function overwriteAccessToken(accessToken: string): Promise<void> {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
}

export async function clearSession(): Promise<void> {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  await SecureStore.deleteItemAsync(USER_KEY);
}

export async function getSession(): Promise<Session | null> {
  const user = await getStoredUser();
  const accessToken = await getAccessToken();
  const refreshToken = await getRefreshToken();
  if (!user || !accessToken || !refreshToken) return null;
  return { user, tokens: { accessToken, refreshToken } };
}
