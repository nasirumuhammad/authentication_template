import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserRole } from '@/user/entities/user-roles.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { HashingService } from '@/common/services/hashing.service';
import { RoleService } from '@/rbac/role/role.service';
import { maskEmail } from '@/common/utils/mask.util';
import { DEFAULT_ROLE } from '@/rbac/role/constants/roles.constant';

@Injectable()
export class UserService {
  private logger = new Logger(UserService.name);
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly hashingService: HashingService,
    private readonly roleService: RoleService,
    private readonly datasource: DataSource,
  ) {}

  async create(payload: CreateUserDto): Promise<User> {
    const existing = await this.userRepository.findOne({
      where: { email: payload.email },
    });
    if (existing) {
      this.logger.warn(
        { email: maskEmail(payload.email) },
        'User creation failed: email already registered',
      );
      throw new ConflictException('User already registered');
    }

    const customerRole = await this.roleService.findOneByName(
      DEFAULT_ROLE.CUSTOMER,
    );
    if (!customerRole) {
      this.logger.error(
        { roleName: DEFAULT_ROLE.CUSTOMER },
        'User creation failed: default customer role not seeded',
      );
      throw new InternalServerErrorException(
        'Something went wrong, contact admin',
      );
    }

    const hashedPassword = await this.hashingService.hash(payload.password);
    return this.datasource.transaction(async (manager) => {
      const user = manager.create(User, {
        ...payload,
        password: hashedPassword,
      });
      const savedUser = await manager.save(User, user);

      const userRole = manager.create(UserRole, {
        user: savedUser,
        role: customerRole,
      });
      await manager.save(userRole);
      return savedUser;
    });
  }

  async findOneById(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: { userRoles: { role: true } },
    });
    return user;
  }

  async findOneByEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: { userRoles: { role: true } },
    });
    return user;
  }

  async update(id: string, payload: UpdateUserDto): Promise<User> {
    const user = await this.findOneById(id);

    if (!user) {
      this.logger.warn({ userId: id }, 'update user: user not found');
      throw new NotFoundException();
    }

    if (payload.password) {
      payload.password = await this.hashingService.hash(payload.password);
    }

    Object.assign(user, payload);
    const updated = await this.userRepository.save(user);
    this.logger.log({ userId: id }, 'User updated');
    return updated;
  }

  async softDelete(id: string): Promise<void> {
    const user = await this.findOneById(id);
    if (!user) throw new NotFoundException();
    await this.userRepository.softDelete({ id });
    this.logger.log({ userId: id }, 'User soft-deleted');
  }

  async markEmailVerified(email: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      this.logger.log(
        { email: maskEmail(email) },
        'mark email verfied: could not find user by email',
      );
      throw new NotFoundException('request failed');
    }
    user.isEmailVerified = true;
    await this.userRepository.save(user);
  }

  async resetPassword(email: string, password: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      this.logger.log(
        { email: maskEmail(email) },
        'reset password:user not found',
      );
      throw new BadRequestException('Invalid request');
    }
    const hashedPassword = await this.hashingService.hash(password);
    user.tokenVersion += 1;
    Object.assign(user, { password: hashedPassword });
    await this.userRepository.save(user);
  }
}
