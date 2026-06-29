import { SetMetadata } from '@nestjs/common';
import { UserPermission } from '@generated/prisma/client';

export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (...permissions: UserPermission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
