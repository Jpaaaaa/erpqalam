import { UserPermission, UserRole, UserStatus } from '@generated/prisma/client';
export declare class CreateUserDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: UserRole;
    permissions?: UserPermission[];
}
export declare class UpdateUserDto {
    firstName?: string;
    lastName?: string;
    phone?: string;
    role?: UserRole;
    permissions?: UserPermission[];
    status?: UserStatus;
}
export declare class ApproveUserDto {
    permissions?: UserPermission[];
}
export declare class ListUsersQueryDto {
    role?: UserRole;
    status?: UserStatus;
    page?: number;
    limit?: number;
}
export declare class UserResponseDto {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string | null;
    role: UserRole;
    permissions: UserPermission[];
    status: UserStatus;
    schoolId: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class PaginatedUsersResponseDto {
    data: UserResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
