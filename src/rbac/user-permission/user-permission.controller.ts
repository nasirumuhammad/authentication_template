import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserPermissionService } from './user-permission.service';
import { UserPermission } from './entities/user-permission.entity';
import { JwtAuthGuard } from '@/auth/guards/jwt.guard';
import { AuthorizationGuard } from '@/common/guards/authorization.guard';
import { Roles } from '@/common/decorators/role.decorator';
import { Permissions } from '@/common/decorators/permission.decorator';
import { DEFAULT_ROLE } from '@/rbac/role/constants/roles.constant';
import { DEFAULT_PERMISSIONS } from '@/rbac/permission/constants/permission.constant';
import { GrantUserPermissionDto } from './dto/grant-user-permission.dto';

@Controller('user-permissions')
@UseGuards(JwtAuthGuard, AuthorizationGuard)
@Roles(DEFAULT_ROLE.ADMIN)
export class UserPermissionController {
  constructor(private readonly userPermissionService: UserPermissionService) {}

  @Post()
  @Permissions(DEFAULT_PERMISSIONS.USER_PERMISSION_GRANT)
  grant(@Body() payload: GrantUserPermissionDto): Promise<UserPermission> {
    return this.userPermissionService.grant(
      payload.userId,
      payload.permissionKey,
    );
  }

  @Get(':userId')
  @Permissions(DEFAULT_PERMISSIONS.USER_READ)
  findByUser(@Param('userId') userId: string): Promise<UserPermission[]> {
    return this.userPermissionService.findByUser(userId);
  }

  @Delete(':id')
  @Permissions(DEFAULT_PERMISSIONS.USER_PERMISSION_REVOKE)
  revoke(@Param('id') id: string): Promise<void> {
    return this.userPermissionService.revoke(id);
  }
}
