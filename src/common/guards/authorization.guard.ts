import { UserService } from '@/user/user.service';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  AuthorizationCacheService,
  UserAuthorization,
} from '../services/authorization-cache.service';
import { ROLES_KEY } from '../decorators/role.decorator';
import { PERMISSIONS_KEY } from '../decorators/permission.decorator';
import { User } from '@/user/entities/user.entity';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  private readonly logger = new Logger(AuthorizationGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly userService: UserService,
    private readonly authCacheService: AuthorizationCacheService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles?.length && !requiredPermissions?.length) return true;

    const request = context.switchToHttp().getRequest();
    const user: User = request.user;
    if (!user) throw new ForbiddenException('Access denied');

    const { roles, permissions } = await this.resolveAuthorization(user.id);

    const roleMatch =
      !!requiredRoles?.length && requiredRoles.some((r) => roles.includes(r));
    const permissionMatch =
      !!requiredPermissions?.length &&
      requiredPermissions.some((p) => permissions.includes(p));

    const accessGranted = roleMatch || permissionMatch;

    if (!accessGranted) {
      this.logger.warn(
        { userId: user.id, requiredRoles, requiredPermissions },
        'authorization guard: access denied',
      );
      throw new ForbiddenException('Access denied');
    }

    return true;
  }

  private async resolveAuthorization(
    userId: string,
  ): Promise<UserAuthorization> {
    const cached = await this.authCacheService.get(userId);
    if (cached) return cached;

    const userWithRelations = await this.userService.findOneByIdWithAuthorization(userId);

    const roles = userWithRelations?.userRoles?.map((ur) => ur.role.name) ?? [];

    const fromRoles =
      userWithRelations?.userRoles?.flatMap(
        (ur) => ur.role.rolePermissions?.map((rp) => rp.permission.key) ?? [],
      ) ?? [];
    const fromDirectGrant =
      userWithRelations?.userPermissions?.map((up) => up.permission.key) ?? [];
    const permissions = [...new Set([...fromRoles, ...fromDirectGrant])];

    const resolved: UserAuthorization = { roles, permissions };
    await this.authCacheService.set(userId, resolved);

    return resolved;
  }
}
