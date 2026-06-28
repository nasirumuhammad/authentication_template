import { UserModule } from '@/user/user.module';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { RefreshTokenModule } from '@/refresh-token/refresh-token.module';
import { OtpModule } from '@/otp/otp.module';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory(configService: ConfigService) {
        const secret = configService.getOrThrow('JWT_SECRET');
        const expiresIn = configService.getOrThrow('JWT_EXPIRY');
        return {
          secret,
          signOptions: {
            expiresIn,
          },
        };
      },
    }),
    UserModule,
    RefreshTokenModule,
    OtpModule,
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
