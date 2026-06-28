import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class PermissionService {
  private readonly logger = new Logger(PermissionService.name);
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async create(payload: CreatePermissionDto) {
    const existing = await this.permissionRepository.findOne({
      where: { key: payload.key },
    });
    if (existing) {
      this.logger.warn(
        { key: payload.key },
        'Permission creation failed: key already exists',
      );
      throw new BadRequestException('Permission already exists');
    }

    const permission = this.permissionRepository.create(payload);
    const saved = await this.permissionRepository.save(permission);
    this.logger.log({ key: saved.key }, 'Permission created');
    return saved;
  }

  async update(id: string, payload: UpdatePermissionDto) {
    const permission = await this.permissionRepository.findOne({
      where: { id },
    });
    if (!permission) {
      this.logger.warn(
        { permissionId: id },
        'Update failed: permission not found',
      );
      throw new NotFoundException('Permission not found');
    }

    Object.assign(permission, payload);
    const updated = await this.permissionRepository.save(permission);
    this.logger.log({ permissionId: id }, 'Permission updated');
    return updated;
  }

  async delete(id: string) {
    const permission = await this.permissionRepository.findOne({
      where: { id },
    });
    if (!permission) {
      this.logger.warn(
        { permissionId: id },
        'Delete failed: permission not found',
      );
      throw new NotFoundException('Permission not found');
    }

    await this.permissionRepository.delete({ id });
    this.logger.log({ permissionId: id }, 'Permission deleted');
  }

  async findOneByKey(key: string): Promise<Permission | null> {
    return await this.permissionRepository.findOne({
      where: { key },
    });
  }

  async findAll() {
    return this.permissionRepository.find();
  }
}
