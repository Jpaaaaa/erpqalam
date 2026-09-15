import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  saveSession,
} from '../auth/storage';
import { createApiClient } from './clientCore';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'https://api.erpqalam.dev/api/v1';

const client = createApiClient({
  apiBaseUrl: API_BASE_URL,
  getAccessToken,
  getRefreshToken,
  saveSession,
  clearSession,
  fetch: globalThis.fetch.bind(globalThis),
});

export const {
  apiFetch,
  apiRequest,
  getCurrentUser,
  login,
  googleLogin,
  logout,
  onSessionInvalidated,
  getRefreshCallCount,
  resetRefreshCallCount,
} = client;

export { ApiClientError, SessionExpiredError } from './clientCore';
