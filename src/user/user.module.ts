import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserRole } from './entities/user-roles.entity';
import { RoleModule } from '@/rbac/role/role.module';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserRole]), RoleModule],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
