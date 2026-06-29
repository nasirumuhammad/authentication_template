import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class HashingService {
  private readonly salt: string;
  constructor(configService: ConfigService) {
    this.salt = configService.getOrThrow<string>('SALT_ROUND');
  }

  async hash(token: string) {
    return await bcrypt.hash(token, Number(this.salt));
  }

  async compare(token: string, hash: string) {
    return await bcrypt.compare(token, hash);
  }
}
