import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolePermission } from './entities/role-permission.entity';
import { RolePermissionService } from './role-permission.service';
import { RoleModule } from '../role/role.module';
import { PermissionModule } from '../permission/permission.module';
import { RolePermissionController } from './role-permission.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([RolePermission]),
    RoleModule,
    PermissionModule,
  ],
  providers: [RolePermissionService],
  controllers: [RolePermissionController],
  exports: [RolePermissionService],
})
export class RolePermissionModule {}
