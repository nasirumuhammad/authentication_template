import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RolePermission } from './entities/role-permission.entity';
import { RoleService } from '../role/role.service';
import { PermissionService } from '../permission/permission.service';
import { SEED_ROLE_PERMISSIONS } from './constants/role-permission.constant';

@Injectable()
export class RolePermissionService implements OnApplicationBootstrap {
  private logger = new Logger(RolePermissionService.name);
  constructor(
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: Repository<RolePermission>,
    private readonly roleService: RoleService,
    private readonly permissionService: PermissionService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    setImmediate(async () => await this.seed());
  }

  async seed(): Promise<void> {
    for (const { roleName, permissionKey } of SEED_ROLE_PERMISSIONS) {
      const role = await this.roleService.findOneByName(roleName);
      const permission =
        await this.permissionService.findOneByKey(permissionKey);

      if (!role || !permission) {
        this.logger.warn(
          { roleName, permissionKey },
          'Seed skipped: role or permission not found',
        );
        continue;
      }

      const existing = await this.rolePermissionRepository.findOne({
        where: { role: { id: role.id }, permission: { id: permission.id } },
      });
      if (existing) continue;

      await this.rolePermissionRepository.save(
        this.rolePermissionRepository.create({ role, permission }),
      );
    }
    console.log('Role permissions seeded');
  }

  async create(
    roleName: string,
    permissionKey: string,
  ): Promise<RolePermission> {
    const role = await this.roleService.findOneByName(roleName);
    if (!role) {
      this.logger.warn(
        { roleName },
        'Role permission assignment failed: role not found',
      );
      throw new NotFoundException('Role not found');
    }

    const permission = await this.permissionService.findOneByKey(permissionKey);
    if (!permission) {
      this.logger.warn(
        { permissionKey },
        'Role permission assignment failed: permission not found',
      );
      throw new NotFoundException('Permission not found');
    }

    const existing = await this.rolePermissionRepository.findOne({
      where: { role: { id: role.id }, permission: { id: permission.id } },
    });
    if (existing) {
      this.logger.warn(
        { roleId: role.id, permissionKey },
        'Role permission assignment failed: already exists',
      );
      throw new ConflictException('Permission already assigned to this role');
    }

    const rolePermission = this.rolePermissionRepository.create({
      role,
      permission,
    });
    const saved = await this.rolePermissionRepository.save(rolePermission);
    this.logger.log(
      { roleId: role.id, permissionKey },
      'Permission assigned to role',
    );
    return saved;
  }

  async delete(id: string): Promise<void> {
    const rolePermission = await this.rolePermissionRepository.findOne({
      where: { id },
    });
    if (!rolePermission) {
      this.logger.warn({ id }, 'Delete failed: role permission not found');
      throw new NotFoundException('Role permission not found');
    }

    await this.rolePermissionRepository.delete({ id });
    this.logger.log({ id }, 'Role permission removed');
  }

  async findByRole(roleId: string): Promise<RolePermission[]> {
    return this.rolePermissionRepository.find({
      where: { role: { id: roleId } },
      relations: {
        permission: true,
      },
    });
  }
}
