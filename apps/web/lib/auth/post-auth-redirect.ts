import type { AuthUser } from '@/lib/types/auth';

export function getPostAuthPath(user: AuthUser): string {
  if (user.needsSetupCredentials) {
    return '/set-credentials';
  }
  if (user.mustChangePassword) {
    return '/change-password';
  }
  return '/dashboard';
}
