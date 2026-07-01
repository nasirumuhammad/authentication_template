import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserRoleService } from './user-role.service';
import { UserRole } from './entities/user-roles.entity';
import { JwtAuthGuard } from '@/auth/guards/jwt.guard';
import { AuthorizationGuard } from '@/common/guards/authorization.guard';
import { Roles } from '@/common/decorators/role.decorator';
import { Permissions } from '@/common/decorators/permission.decorator';
import { DEFAULT_ROLE } from '@/rbac/role/constants/roles.constant';
import { DEFAULT_PERMISSIONS } from '@/rbac/permission/constants/permission.constant';
import { AssignUserRoleDto } from './dto/assign-user-role.dto';

@Controller('user-roles')
@UseGuards(JwtAuthGuard, AuthorizationGuard)
@Roles(DEFAULT_ROLE.ADMIN)
export class UserRoleController {
  constructor(private readonly userRoleService: UserRoleService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @Permissions(DEFAULT_PERMISSIONS.USER_ROLE_ASSIGN)
  assign(@Body() payload: AssignUserRoleDto): Promise<UserRole> {
    return this.userRoleService.assign(payload.userId, payload.roleName);
  }

  @Get(':userId')
  @HttpCode(HttpStatus.OK)
  @Permissions(DEFAULT_PERMISSIONS.USER_READ)
  findByUser(@Param('userId') userId: string): Promise<UserRole[]> {
    return this.userRoleService.findByUser(userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Permissions(DEFAULT_PERMISSIONS.USER_ROLE_REVOKE)
  revoke(@Param('id') id: string): Promise<void> {
    return this.userRoleService.revoke(id);
  }
}
