import type { UserRole } from '../permissions';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  role: UserRole;
  permissions: string[];
  status: UserStatus;
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

export interface ApiError {
  message: string | string[];
  statusCode: number;
  error?: string;
}

export interface Session {
  user: AuthUser;
  tokens: AuthTokens;
}
