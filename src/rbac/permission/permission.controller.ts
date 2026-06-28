import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { PermissionService } from './permission.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Permission } from './entities/permission.entity';

@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post()
  create(@Body() payload: CreatePermissionDto): Promise<Permission> {
    return this.permissionService.create(payload);
  }

  @Get()
  findAll(): Promise<Permission[]> {
    return this.permissionService.findAll();
  }

  @Get(':key')
  findOne(@Param('key') key: string): Promise<Permission | null> {
    return this.permissionService.findOneByKey(key);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() payload: UpdatePermissionDto,
  ): Promise<Permission> {
    return this.permissionService.update(id, payload);
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<void> {
    return this.permissionService.delete(id);
  }
}
