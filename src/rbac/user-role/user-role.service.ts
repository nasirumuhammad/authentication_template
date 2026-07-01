import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from './entities/user-roles.entity';
import { RoleService } from '@/rbac/role/role.service';
import { AuthorizationCacheService } from '@/common/services/authorization-cache.service';
import { UserService } from '@/user/user.service';

@Injectable()
export class UserRoleService {
  private readonly logger = new Logger(UserRoleService.name);

  constructor(
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    private readonly userService: UserService,
    private readonly roleService: RoleService,
    private readonly authCacheService: AuthorizationCacheService,
  ) {}

  async assign(userId: string, roleName: string): Promise<UserRole> {
    const user = await this.userService.findOneById(userId);
    if (!user) {
      this.logger.warn({ userId }, 'user-role assign failed: user not found');
      throw new NotFoundException('User not found');
    }

    const role = await this.roleService.findOneByName(roleName);
    if (!role) {
      this.logger.warn({ roleName }, 'user-role assign failed: role not found');
      throw new NotFoundException('Role not found');
    }

    const existing = await this.userRoleRepository.findOne({
      where: { user: { id: userId }, role: { id: role.id } },
    });
    if (existing) {
      this.logger.warn(
        { userId, roleName },
        'user-role assign failed: role already assigned to user',
      );
      throw new ConflictException('Role already assigned to this user');
    }

    const userRole = this.userRoleRepository.create({
      user: { id: userId },
      role: { id: role.id },
    });
    const saved = await this.userRoleRepository.save(userRole);

    await this.authCacheService.invalidate(userId);
    this.logger.log({ userId, roleName }, 'role assigned to user');
    return saved;
  }

  async revoke(id: string): Promise<void> {
    const userRole = await this.userRoleRepository.findOne({
      where: { id },
      relations: { user: true, role: true },
    });
    if (!userRole) {
      this.logger.warn({ id }, 'user-role revoke failed: record not found');
      throw new NotFoundException('User role not found');
    }

    await this.userRoleRepository.delete({ id });

    await this.authCacheService.invalidate(userRole.user.id);
    this.logger.log(
      { userId: userRole.user.id, roleName: userRole.role.name },
      'role revoked from user',
    );
  }

  async findByUser(userId: string): Promise<UserRole[]> {
    return this.userRoleRepository.find({
      where: { user: { id: userId } },
      relations: { role: true },
    });
  }
}
