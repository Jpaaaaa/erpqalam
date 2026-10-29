export const USERNAME_REGEX = /^[a-zA-Z0-9._]{3,30}$/;

export function normalizeUsername(value: string): string {
  return value.trim().toLowerCase();
}

export function isValidUsername(value: string): boolean {
  return USERNAME_REGEX.test(value);
}

/** True when the login identifier should be resolved by email. */
export function loginLooksLikeEmail(login: string): boolean {
  return login.includes('@');
}
