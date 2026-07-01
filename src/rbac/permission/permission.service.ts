import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { Repository } from 'typeorm';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { SEED_PERMISSIONS } from './constants/permission.constant';

@Injectable()
export class PermissionService {
  private readonly logger = new Logger(PermissionService.name);

  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async seed(): Promise<void> {
    await this.permissionRepository.upsert(SEED_PERMISSIONS, {
      conflictPaths: ['key'],
    });
    this.logger.log(
      { permissions: SEED_PERMISSIONS.map((p) => p.key) },
      'Permissions seeded',
    );
  }

  async create(payload: CreatePermissionDto): Promise<Permission> {
    const existing = await this.permissionRepository.findOne({
      where: { key: payload.key },
    });
    if (existing) {
      this.logger.warn(
        { permissionKey: payload.key },
        'Permission creation failed: key already exists',
      );
      throw new ConflictException('Permission already exists');
    }

    const permission = this.permissionRepository.create(payload);
    const saved = await this.permissionRepository.save(permission);
    this.logger.log({ permissionKey: saved.key }, 'Permission created');
    return saved;
  }

  async update(id: string, payload: UpdatePermissionDto): Promise<Permission> {
    const existing = await this.permissionRepository.findOne({ where: { id } });
    if (!existing) {
      this.logger.warn(
        { permissionId: id },
        'Update failed: permission not found',
      );
      throw new NotFoundException('Permission not found');
    }

    Object.assign(existing, payload);
    const updated = await this.permissionRepository.save(existing);
    this.logger.log({ permissionId: id }, 'Permission updated');
    return updated;
  }

  async delete(id: string): Promise<void> {
    const existing = await this.permissionRepository.findOne({ where: { id } });
    if (!existing) {
      this.logger.warn(
        { permissionId: id },
        'Delete failed: permission not found',
      );
      throw new NotFoundException('Permission not found');
    }

    await this.permissionRepository.delete({ id });
    this.logger.log({ permissionId: id }, 'Permission deleted');
  }

  async findOneById(id: string): Promise<Permission | null> {
    return this.permissionRepository.findOne({ where: { id } });
  }

  async findOneByKey(key: string): Promise<Permission | null> {
    return this.permissionRepository.findOne({ where: { key } });
  }

  async findAll(): Promise<Permission[]> {
    return this.permissionRepository.find();
  }
}
