import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Module({
  providers: [
    OtpService,
    {
      provide: 'REDIS_CLIENT',
      inject: [ConfigService],
      useFactory(configService: ConfigService) {
        return new Redis();
      },
    },
  ],
  exports: [OtpService],
})
export class OtpModule {}
