export type { UserRole, UserStatus } from '@/lib/types/user';

export interface AuthUser {
  id: string;
  email: string;
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
  email: string;
  password: string;
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
