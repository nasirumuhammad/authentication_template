import { UserModule } from '@/user/user.module';
import { Module } from '@nestjs/common';
import { UserPermissionService } from './user-permission.service';

@Module({
  imports: [UserModule],
  providers: [UserPermissionService],
  exports: [UserPermissionService],
})
export class UserPermissionModule {}
