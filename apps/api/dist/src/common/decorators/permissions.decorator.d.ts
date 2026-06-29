import { UserPermission } from '@generated/prisma/client';
export declare const PERMISSIONS_KEY = "permissions";
export declare const Permissions: (...permissions: UserPermission[]) => import("@nestjs/common").CustomDecorator<string>;
