import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { LessThan, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { InjectPinoLogger, Logger } from 'nestjs-pino';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    @InjectPinoLogger(RefreshTokenService.name) private readonly logger: Logger,
    private readonly configService: ConfigService,
  ) {}

  private parseExpiry(expiry: string): Date {
    const units: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
      w: 7 * 24 * 60 * 60 * 1000,
    };

    const match = expiry.trim().match(/^(\d+)([smhdw])$/i);
    if (!match)
      throw new Error(`Invalid JWT_REFRESH_EXPIRY format: "${expiry}"`);

    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();

    return new Date(Date.now() + value * units[unit]);
  }

  async create(userId: string, token: string): Promise<void> {
    const expiresIn =
      this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRY');
    const expiredAt = this.parseExpiry(expiresIn);

    const refreshToken = this.refreshTokenRepository.create({
      user: { id: userId },
      hashedToken: token,
      expiredAt,
    });

    await this.refreshTokenRepository.save(refreshToken);
  }

  async findAllByUserId(userId: string): Promise<RefreshToken[]> {
    return this.refreshTokenRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'ASC' },
    });
  }

  async deleteAllUserTokens(userId: string): Promise<void> {
    await this.refreshTokenRepository.delete({ user: { id: userId } });
  }

  async deleteById(id: string): Promise<void> {
    await this.refreshTokenRepository.delete({ id });
  }

  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async deleteExpiredTokens(): Promise<void> {
    this.logger.log('Running expired refresh token cleanup...');
    const result = await this.refreshTokenRepository.delete({
      expiredAt: LessThan(new Date()),
    });
    this.logger.log(`Deleted ${result.affected} expired refresh tokens`);
  }
}
