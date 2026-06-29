export type UserPermission = 'USER_MANAGEMENT' | 'STUDENT_REGISTRATION';

export const ALL_USER_PERMISSIONS: UserPermission[] = [
  'USER_MANAGEMENT',
  'STUDENT_REGISTRATION',
];

export type UserRole = 'MANAGER' | 'EMPLOYEE';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING';

export interface UserRecord {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  role: UserRole;
  permissions: UserPermission[];
  status: UserStatus;
  schoolId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedUsers {
  data: UserRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateUserPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  permissions?: UserPermission[];
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: UserRole;
  permissions?: UserPermission[];
  status?: UserStatus;
}
