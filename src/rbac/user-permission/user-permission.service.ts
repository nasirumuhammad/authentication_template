import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserPermission } from './entities/user-permission.entity';
import { UserService } from '@/user/user.service';
import { PermissionService } from '@/rbac/permission/permission.service';
import { AuthorizationCacheService } from '@/common/services/authorization-cache.service';

@Injectable()
export class UserPermissionService {
  private readonly logger = new Logger(UserPermissionService.name);

  constructor(
    @InjectRepository(UserPermission)
    private readonly userPermissionRepository: Repository<UserPermission>,
    private readonly userService: UserService,
    private readonly permissionService: PermissionService,
    private readonly authCacheService: AuthorizationCacheService,
  ) {}

  async grant(userId: string, permissionKey: string): Promise<UserPermission> {
    const user = await this.userService.findOneById(userId);
    if (!user) {
      this.logger.warn(
        { userId },
        'user-permission grant failed: user not found',
      );
      throw new NotFoundException('User not found');
    }

    const permission = await this.permissionService.findOneByKey(permissionKey);
    if (!permission) {
      this.logger.warn(
        { permissionKey },
        'user-permission grant failed: permission not found',
      );
      throw new NotFoundException('Permission not found');
    }

    const existing = await this.userPermissionRepository.findOne({
      where: { user: { id: userId }, permission: { id: permission.id } },
    });
    if (existing) {
      this.logger.warn(
        { userId, permissionKey },
        'user-permission grant failed: already granted',
      );
      throw new ConflictException('Permission already granted to this user');
    }

    const userPermission = this.userPermissionRepository.create({
      user: { id: userId },
      permission: { id: permission.id },
    });
    const saved = await this.userPermissionRepository.save(userPermission);

    await this.authCacheService.invalidate(userId);
    this.logger.log({ userId, permissionKey }, 'permission granted to user');
    return saved;
  }

  async revoke(id: string): Promise<void> {
    const userPermission = await this.userPermissionRepository.findOne({
      where: { id },
      relations: { user: true, permission: true },
    });
    if (!userPermission) {
      this.logger.warn(
        { id },
        'user-permission revoke failed: record not found',
      );
      throw new NotFoundException('User permission not found');
    }

    await this.userPermissionRepository.delete({ id });

    await this.authCacheService.invalidate(userPermission.user.id);
    this.logger.log(
      {
        userId: userPermission.user.id,
        permissionKey: userPermission.permission.key,
      },
      'permission revoked from user',
    );
  }

  async findByUser(userId: string): Promise<UserPermission[]> {
    return this.userPermissionRepository.find({
      where: { user: { id: userId } },
      relations: { permission: true },
    });
  }
}
