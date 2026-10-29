import { ApiClientError, SessionExpiredError } from './clientCore';

export class NetworkError extends Error {
  constructor(cause?: unknown) {
    super('Network request failed');
    this.name = 'NetworkError';
    if (cause !== undefined) {
      (this as Error & { cause?: unknown }).cause = cause;
    }
  }
}

export function isNetworkFailure(err: unknown): boolean {
  if (err instanceof NetworkError) return true;
  if (err instanceof TypeError) return true;
  if (err instanceof ApiClientError && err.status === 0) return true;
  return false;
}

export function resolveUserFacingError(
  err: unknown,
  t: (key: string) => string,
  fallbackKey: string,
): { message: string; isNetwork: boolean; sessionExpired: boolean } {
  if (err instanceof SessionExpiredError) {
    return { message: '', isNetwork: false, sessionExpired: true };
  }
  if (isNetworkFailure(err)) {
    return {
      message: t('common:noConnection'),
      isNetwork: true,
      sessionExpired: false,
    };
  }
  if (err instanceof ApiClientError) {
    return { message: err.message, isNetwork: false, sessionExpired: false };
  }
  return {
    message: t(fallbackKey),
    isNetwork: false,
    sessionExpired: false,
  };
}
