import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from '@/auth/guards/jwt.guard';
import { AuthorizationGuard } from '@/common/guards/authorization.guard';
import { Roles } from '@/common/decorators/role.decorator';
import { Permissions } from '@/common/decorators/permission.decorator';
import { DEFAULT_ROLE } from '@/rbac/role/constants/roles.constant';
import { DEFAULT_PERMISSIONS } from '@/rbac/permission/constants/permission.constant';

@Controller('users')
@UseGuards(JwtAuthGuard, AuthorizationGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @HttpCode(HttpStatus.OK)
  me(@Request() req: Request & { user: User }): User {
    return req.user;
  }

  @Patch('me')
  @HttpCode(HttpStatus.OK)
  @Permissions(DEFAULT_PERMISSIONS.USER_UPDATE)
  updateMe(
    @Request() req: Request & { user: User },
    @Body() payload: UpdateUserDto,
  ): Promise<User> {
    return this.userService.update(req.user.id, payload);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles(DEFAULT_ROLE.ADMIN)
  @Permissions(DEFAULT_PERMISSIONS.USER_READ)
  findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(DEFAULT_ROLE.ADMIN)
  @Permissions(DEFAULT_PERMISSIONS.USER_READ)
  findOne(@Param('id') id: string): Promise<User | null> {
    return this.userService.findOneById(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(DEFAULT_ROLE.ADMIN)
  @Permissions(DEFAULT_PERMISSIONS.USER_UPDATE)
  update(
    @Param('id') id: string,
    @Body() payload: UpdateUserDto,
  ): Promise<User> {
    return this.userService.update(id, payload);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(DEFAULT_ROLE.ADMIN)
  @Permissions(DEFAULT_PERMISSIONS.USER_DELETE)
  delete(@Param('id') id: string): Promise<void> {
    return this.userService.softDelete(id);
  }
}
