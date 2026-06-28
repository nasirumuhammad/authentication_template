import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class HashingService {
  constructor(private readonly configService: ConfigService) {}

  async hash(token: string) {
    return await bcrypt.hash(
      token,
      Number(await this.configService.getOrThrow('SALT_ROUND')),
    );
  }

  async compare(token: string, hash: string) {
    return await bcrypt.compare(token, hash);
  }
}
