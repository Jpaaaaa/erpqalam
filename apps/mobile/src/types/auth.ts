import type { UserRole } from '../permissions';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING';

export interface AuthUser {
  id: string;
  email: string;
  username?: string | null;
  mustChangePassword: boolean;
  needsSetupCredentials: boolean;
  firstName: string;
  lastName: string;
  phone?: string | null;
  role: UserRole;
  permissions: string[];
  status: UserStatus;
  schoolId: string;
  schoolName?: string;
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

export interface ApiError {
  message: string | string[];
  statusCode: number;
  error?: string;
}

export interface Session {
  user: AuthUser;
  tokens: AuthTokens;
}
