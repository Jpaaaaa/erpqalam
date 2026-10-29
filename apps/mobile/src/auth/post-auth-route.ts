import type { AuthUser } from '../types/auth';

export type PostAuthRoute = 'main' | 'set-credentials' | 'change-password';

export function getPostAuthRoute(user: AuthUser): PostAuthRoute {
  if (user.needsSetupCredentials) {
    return 'set-credentials';
  }
  if (user.mustChangePassword) {
    return 'change-password';
  }
  return 'main';
}
