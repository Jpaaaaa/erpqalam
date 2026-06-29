import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserPermission } from '@generated/prisma/client';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { hasAnyPermission } from '../permissions/user-permissions';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<UserPermission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user: JwtPayload }>();
    const user = request.user;

    if (
      !user ||
      !hasAnyPermission(user.role, user.permissions, requiredPermissions)
    ) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
