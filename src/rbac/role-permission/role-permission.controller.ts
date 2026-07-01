import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RolePermissionService } from './role-permission.service';
import { RolePermission } from './entities/role-permission.entity';
import { JwtAuthGuard } from '@/auth/guards/jwt.guard';
import { AuthorizationGuard } from '@/common/guards/authorization.guard';
import { Roles } from '@/common/decorators/role.decorator';
import { Permissions } from '@/common/decorators/permission.decorator';
import { DEFAULT_ROLE } from '../role/constants/roles.constant';
import { DEFAULT_PERMISSIONS } from '../permission/constants/permission.constant';
import { AssignRolePermissionDto } from './dto/assign-role-permission.dto';

@Controller('role-permissions')
@UseGuards(JwtAuthGuard, AuthorizationGuard)
@Roles(DEFAULT_ROLE.ADMIN)
export class RolePermissionController {
  constructor(private readonly rolePermissionService: RolePermissionService) {}

  @Post()
  @Permissions(DEFAULT_PERMISSIONS.ROLE_PERMISSION_ASSIGN)
  assign(@Body() payload: AssignRolePermissionDto): Promise<RolePermission> {
    return this.rolePermissionService.create(
      payload.roleName,
      payload.permissionKey,
    );
  }

  @Get(':roleId')
  @Permissions(DEFAULT_PERMISSIONS.ROLE_READ)
  findByRole(@Param('roleId') roleId: string): Promise<RolePermission[]> {
    return this.rolePermissionService.findByRole(roleId);
  }

  @Delete(':id')
  @Permissions(DEFAULT_PERMISSIONS.ROLE_PERMISSION_REVOKE)
  remove(@Param('id') id: string): Promise<void> {
    return this.rolePermissionService.delete(id);
  }
}
