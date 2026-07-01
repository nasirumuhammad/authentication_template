import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';
import { Roles } from '@/common/decorators/role.decorator';
import { DEFAULT_ROLE } from './constants/roles.constant';
import { DEFAULT_PERMISSIONS } from '../permission/constants/permission.constant';
import { Permissions } from '@/common/decorators/permission.decorator';
import { JwtAuthGuard } from '@/auth/guards/jwt.guard';
import { AuthorizationGuard } from '@/common/guards/authorization.guard';

@Controller('roles')
@UseGuards(JwtAuthGuard, AuthorizationGuard)
@Roles(DEFAULT_ROLE.ADMIN)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @Permissions(DEFAULT_PERMISSIONS.ROLE_CREATE)
  create(@Body() payload: CreateRoleDto): Promise<Role> {
    return this.roleService.create(payload);
  }

  @Get()
  @Permissions(DEFAULT_PERMISSIONS.ROLE_READ)
  findAll(): Promise<Role[]> {
    return this.roleService.findAll();
  }

  @Get(':name')
  @Permissions(DEFAULT_PERMISSIONS.ROLE_READ)
  findOne(@Param('name') name: string): Promise<Role | null> {
    return this.roleService.findOneByName(name);
  }

  @Patch(':id')
  @Permissions(DEFAULT_PERMISSIONS.ROLE_UPDATE)
  update(
    @Param('id') id: string,
    @Body() payload: UpdateRoleDto,
  ): Promise<Role> {
    return this.roleService.update(id, payload);
  }

  @Delete(':id')
  @Permissions(DEFAULT_PERMISSIONS.ROLE_DELETE)
  delete(@Param('id') id: string): Promise<void> {
    return this.roleService.delete(id);
  }
}
