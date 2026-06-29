import { HashingService } from '@/common/services/hashing.service';
import { maskEmail } from '@/common/utils/mask.util';
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomInt } from 'crypto';
import Redis from 'ioredis';
import { Purpose } from '../common/types/purpose.type';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  private readonly otpTtl: number;

  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly hashingService: HashingService,
    private readonly configService: ConfigService,
  ) {
    this.otpTtl = Number(this.configService.getOrThrow<string>('OTP_TTL'));
  }

  private generate(): string {
    return randomInt(100000, 1000000).toString();
  }

  private generateKey(email: string, purpose: Purpose): string {
    return `${purpose}:${email}`;
  }

  async generateAndStore(email: string, purpose: Purpose): Promise<string> {
    const key = this.generateKey(email, purpose);
    const otp = this.generate();
    await this.redis.set(
      key,
      await this.hashingService.hash(otp),
      'EX',
      this.otpTtl,
    );
    return otp;
  }

  async verifyAndDelete(payload: {
    email: string;
    purpose: Purpose;
    otp: string;
  }): Promise<void> {
    const { email, otp, purpose } = payload;
    const key = this.generateKey(email, purpose);

    const existingOtp = await this.redis.get(key);
    if (!existingOtp) {
      this.logger.warn(
        { email: maskEmail(email), purpose },
        'OTP verification failed: code not found or expired',
      );
      throw new BadRequestException('Invalid or expired verification code.');
    }

    const isValid = await this.hashingService.compare(otp, existingOtp);
    if (!isValid) {
      this.logger.warn(
        { email: maskEmail(email), purpose },
        'OTP verification failed: code mismatch',
      );
      throw new BadRequestException('Invalid or expired verification code.');
    }

    await this.redis.del(key);
  }
}
