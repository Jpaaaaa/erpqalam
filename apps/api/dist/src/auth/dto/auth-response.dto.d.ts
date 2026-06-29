import { UserPermission, UserRole, UserStatus } from '@generated/prisma/client';
export declare class AuthUserDto {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string | null;
    role: UserRole;
    permissions: UserPermission[];
    status: UserStatus;
    schoolId: string;
}
export declare class AuthTokensDto {
    accessToken: string;
    refreshToken: string;
}
export declare class AuthResponseDto {
    user: AuthUserDto;
    tokens: AuthTokensDto;
}
export declare class MessageResponseDto {
    message: string;
}
