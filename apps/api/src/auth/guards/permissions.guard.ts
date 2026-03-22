import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      throw new ForbiddenException('No user context');
    }

    // Director (level 1) has wildcard access
    if (user.permissions?.includes('*')) {
      return true;
    }

    const hasPermission = requiredPermissions.some((perm) => {
      // Check exact match
      if (user.permissions?.includes(perm)) return true;

      // Check wildcard read access (e.g. "*:read" matches "hrm:read")
      const [module, action] = perm.split(':');
      if (user.permissions?.includes(`*:${action}`)) return true;
      if (user.permissions?.includes(`${module}:*`)) return true;

      return false;
    });

    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
