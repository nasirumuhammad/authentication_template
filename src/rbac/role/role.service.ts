import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Repository } from 'typeorm';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { SEED_ROLES } from './constants/roles.constant';

@Injectable()
export class RoleService implements OnApplicationBootstrap {
  private readonly logger = new Logger(RoleService.name);
  constructor(
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
  ) {}

  async onApplicationBootstrap() {
    setImmediate(async () => {
      await this.seed();
    });
  }

  async seed() {
    await this.roleRepository.upsert(SEED_ROLES, { conflictPaths: ['name'] });
    console.log(
      `${JSON.stringify({ roles: SEED_ROLES.map((r) => r.name) })} Roles seeded`,
    );
  }

  async create(payload: CreateRoleDto) {
    const existingRole = await this.roleRepository.findOne({
      where: { name: payload.name },
    });
    if (existingRole) {
      this.logger.warn(
        { roleName: payload.name },
        'Role creation failed: name already taken',
      );
      throw new ConflictException('Role already exists');
    }

    const role = this.roleRepository.create(payload);
    const saved = await this.roleRepository.save(role);
    this.logger.log({ roleName: saved.name }, 'Role created');
    return saved;
  }

  async update(id: string, payload: UpdateRoleDto) {
    const existingRole = await this.roleRepository.findOne({ where: { id } });
    if (!existingRole) {
      this.logger.warn({ roleId: id }, 'Update failed: role not found');
      throw new NotFoundException();
    }
    Object.assign(existingRole, payload);
    const updated = await this.roleRepository.save(existingRole);
    this.logger.log({ roleId: id }, 'Role updated');
    return updated;
  }

  async delete(id: string) {
    const role = await this.roleRepository.findOne({ where: { id } });
    if (!role) {
      this.logger.warn({ roleId: id }, 'Delete failed: role not found');
      throw new NotFoundException('Role not found');
    }

    await this.roleRepository.delete({ id });
    this.logger.log({ roleId: id }, 'Role adeleted');
  }

  async findOneByName(name: string): Promise<Role | null> {
    return this.roleRepository.findOne({ where: { name } });
  }

  async findAll() {
    return this.roleRepository.find();
  }
}
