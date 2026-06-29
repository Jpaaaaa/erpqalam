import { UserPermission, UserRole } from '@generated/prisma/client';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  permissions: UserPermission[];
  schoolId: string;
}
