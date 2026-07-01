import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { LoggerModule } from 'nestjs-pino';
import { pinoConfig } from './common/configs/logger.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './database/config/database.config';
import { RoleModule } from './rbac/role/role.module';
import { PermissionModule } from './rbac/permission/permission.module';
import { RolePermissionModule } from './rbac/role-permission/role-permission.module';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { BullModule } from '@nestjs/bullmq';
import { bullConfig } from './common/configs/bull.config';
import { MailModule } from './mail/mail.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    LoggerModule.forRootAsync(pinoConfig),
    TypeOrmModule.forRootAsync(databaseConfig),
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    BullModule.forRootAsync(bullConfig),
    RedisModule,
    CommonModule,
    RoleModule,
    PermissionModule,
    RolePermissionModule,
    AuthModule,
    MailModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
