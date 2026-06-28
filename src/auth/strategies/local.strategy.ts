import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { SignInDto } from '../dto/sign-in.dto';
import { formatValidationErrors } from '@/common/utils/validation.util';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<any> {
    console.log('validate called');
    const dto = plainToInstance(SignInDto, { email, password });
    const errors = await validate(dto, {
      skipMissingProperties: false,
      whitelist: true,
    });
    if (errors.length > 0) {
      throw new BadRequestException(formatValidationErrors(errors));
    }

    const user = await this.authService.validateUser(email, password);
    console.log('validate result:', user);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
