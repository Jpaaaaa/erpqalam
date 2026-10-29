export type { UserRole, UserStatus } from '@/lib/types/user';

export interface AuthUser {
  id: string;
  email: string;
  username?: string | null;
  mustChangePassword: boolean;
  needsSetupCredentials: boolean;
  firstName: string;
  lastName: string;
  phone?: string | null;
  role: import('@/lib/types/user').UserRole;
  permissions: string[];
  status: import('@/lib/types/user').UserStatus;
  schoolId: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

export interface LoginPayload {
  login: string;
  password: string;
}

export interface SetCredentialsPayload {
  username: string;
  password: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  schoolCode: string;
}

export interface ApiError {
  message: string | string[];
  statusCode: number;
  error?: string;
}

export interface Session {
  user: AuthUser;
  tokens: AuthTokens;
}
