import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { EntityManager, LessThan, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { HashingService } from '@/common/services/hashing.service';

@Injectable()
export class RefreshTokenService {
  private logger = new Logger(RefreshTokenService.name);
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly configService: ConfigService,
    private readonly hashingService: HashingService,
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
    const hashedToken = await this.hashingService.hash(token);
    const refreshToken = this.refreshTokenRepository.create({
      user: { id: userId },
      hashedToken: hashedToken,
      expiredAt,
    });

    await this.refreshTokenRepository.save(refreshToken);
  }

  async createWithManager(payload: {
    manager: EntityManager;
    userId: string;
    token: string;
    jti: string;
  }): Promise<void> {
    const { manager, token, userId, jti } = payload;
    const expiresIn =
      this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRY');
    const expiredAt = this.parseExpiry(expiresIn);
    const hashedToken = await this.hashingService.hash(token);

    const refreshToken = manager.create(RefreshToken, {
      user: { id: userId },
      hashedToken,
      expiredAt,
      jti,
    });

    await manager.save(refreshToken);
  }

  async findByJti(jti: string): Promise<RefreshToken | null> {
    return this.refreshTokenRepository.findOne({
      where: { jti },
    });
  }

  async deleteAllUserTokens(userId: string): Promise<void> {
    await this.refreshTokenRepository.delete({ user: { id: userId } });
  }

  async deleteByJti(jti: string) {
    await this.refreshTokenRepository.delete({ jti });
  }

  async deleteByIdWithManager(
    manager: EntityManager,
    id: string,
  ): Promise<void> {
    await manager.delete(RefreshToken, { id });
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async deleteExpiredTokens(): Promise<void> {
    this.logger.log('Running expired refresh token cleanup');
    try {
      const result = await this.refreshTokenRepository.delete({
        expiredAt: LessThan(new Date()),
      });
      this.logger.log(`Deleted ${result.affected ?? 0} expired refresh tokens`);
    } catch (error) {
      this.logger.error({ error }, 'Failed to delete expired refresh tokens');
    }
  }
}
