import { Permission } from '@/rbac/permission/entities/permission.entity';
import { RolePermission } from '@/rbac/role-permission/entities/role-permission.entity';
import { Role } from '@/rbac/role/entities/role.entity';
import { UserPermission } from '@/rbac/shared/user-permission.entity';
import { RefreshToken } from '@/refresh-token/entities/refresh-token.entity';
import { UserRole } from '@/user/entities/user-roles.entity';
import { User } from '@/user/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleAsyncOptions = {
  inject: [ConfigService],
  useFactory(configService: ConfigService) {
    const isProduction =
      configService.getOrThrow<string>('NODE_ENV') === 'production';
    const username = configService.getOrThrow('DB_USERNAME');
    const password = configService.getOrThrow('DB_PASSWORD');
    const database = configService.getOrThrow('DB_NAME');
    const host = configService.getOrThrow('DB_HOST');
    const port = configService.getOrThrow('DB_PORT');
    return {
      type: 'postgres',
      host,
      port,
      username,
      password,
      database,
      synchronize: !isProduction,
      entities: [
        User,
        Role,
        Permission,
        UserRole,
        UserPermission,
        RefreshToken,
        RolePermission,
      ],
      ssl: isProduction
        ? {
            rejectUnauthorized: false,
          }
        : false,

      logging: !isProduction,
    };
  },
};
