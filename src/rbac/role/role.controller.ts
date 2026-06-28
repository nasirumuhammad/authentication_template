import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';

@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  create(@Body() payload: CreateRoleDto): Promise<Role> {
    return this.roleService.create(payload);
  }

  @Get()
  findAll(): Promise<Role[]> {
    return this.roleService.findAll();
  }

  @Get(':name')
  findOne(@Param('name') name: string): Promise<Role | null> {
    return this.roleService.findOneByName(name);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() payload: UpdateRoleDto,
  ): Promise<Role> {
    return this.roleService.update(id, payload);
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<void> {
    return this.roleService.delete(id);
  }
}
