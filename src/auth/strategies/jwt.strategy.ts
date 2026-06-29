import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Payload } from '../types/payload.type';
import { UserService } from '@/user/user.service';
import { User } from '@/user/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private logger = new Logger(JwtStrategy.name);
  constructor(
    private readonly userService: UserService,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: Payload): Promise<User & { jti: string }> {
    const user = await this.userService.findOneById(payload.sub);
    if (!user) {
      this.logger.warn(
        { userId: payload.sub },
        'validate user: user not found',
      );
      throw new UnauthorizedException();
    }
    if (user.tokenVersion != payload.version) {
      this.logger.warn(
        { userId: payload.sub },
        'jwt strategy: token version mismatch — token revoked',
      );
      throw new UnauthorizedException();
    }

    return { ...user, jti: payload.jti };
  }
}
