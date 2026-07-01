import { JwtAuthGuard } from '@/auth/guards/jwt.guard';
import { AuthorizationGuard } from '@/common/guards/authorization.guard';
import {
  Controller,
  UseGuards,
  Post,
  Get,
  Delete,
  Patch,
  Body,
  Param,
} from '@nestjs/common';
import { DEFAULT_ROLE } from '../role/constants/roles.constant';
import { Roles } from '@/common/decorators/role.decorator';
import { PermissionService } from './permission.service';
import { Permissions } from '@/common/decorators/permission.decorator';
import { DEFAULT_PERMISSIONS } from './constants/permission.constant';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { Permission } from './entities/permission.entity';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Controller('permissions')
@UseGuards(JwtAuthGuard, AuthorizationGuard)
@Roles(DEFAULT_ROLE.ADMIN)
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post()
  @Permissions(DEFAULT_PERMISSIONS.PERMISSION_CREATE)
  create(@Body() payload: CreatePermissionDto): Promise<Permission> {
    return this.permissionService.create(payload);
  }

  @Get()
  @Permissions(DEFAULT_PERMISSIONS.PERMISSION_READ)
  findAll(): Promise<Permission[]> {
    return this.permissionService.findAll();
  }

  @Get(':key')
  @Permissions(DEFAULT_PERMISSIONS.PERMISSION_READ)
  findOne(@Param('key') key: string): Promise<Permission | null> {
    return this.permissionService.findOneByKey(key);
  }

  @Patch(':id')
  @Permissions(DEFAULT_PERMISSIONS.PERMISSION_UPDATE)
  update(
    @Param('id') id: string,
    @Body() payload: UpdatePermissionDto,
  ): Promise<Permission> {
    return this.permissionService.update(id, payload);
  }

  @Delete(':id')
  @Permissions(DEFAULT_PERMISSIONS.PERMISSION_DELETE)
  delete(@Param('id') id: string): Promise<void> {
    return this.permissionService.delete(id);
  }
}
