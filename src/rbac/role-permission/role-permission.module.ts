import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolePermission } from './entities/role-permission.entity';
import { RolePermissionService } from './role-permission.service';
import { RolePermissionContoller } from './role-permission.controller';
import { RoleModule } from '../role/role.module';
import { PermissionModule } from '../permission/permission.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RolePermission]),
    RoleModule,
    PermissionModule,
  ],
  providers: [RolePermissionService],
  controllers: [RolePermissionContoller],
  exports: [RolePermissionService],
})
export class RolePermissionModule {}
