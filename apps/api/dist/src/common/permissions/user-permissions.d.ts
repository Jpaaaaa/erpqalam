import { UserPermission, UserRole } from '@generated/prisma/client';
export { UserPermission };
export declare const ALL_USER_PERMISSIONS: UserPermission[];
export declare function hasPermission(role: UserRole, permissions: UserPermission[] | undefined, required: UserPermission): boolean;
export declare function hasAnyPermission(role: UserRole, permissions: UserPermission[] | undefined, required: UserPermission[]): boolean;
