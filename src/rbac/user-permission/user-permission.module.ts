import { UserModule } from '@/user/user.module';
import { Module } from '@nestjs/common';
import { UserPermissionService } from './user-permission.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPermission } from './entities/user-permission.entity';
import { PermissionModule } from '../permission/permission.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserPermission]),
    UserModule,
    PermissionModule,
  ],
  providers: [UserPermissionService],
  exports: [UserPermissionService],
})
export class UserPermissionModule {}
