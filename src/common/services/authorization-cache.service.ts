import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export type UserAuthorization = {
  roles: string[];
  permissions: string[];
};

@Injectable()
export class AuthorizationCacheService {
  private readonly logger = new Logger(AuthorizationCacheService.name);
  private readonly ttlSeconds: string;

  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    configService: ConfigService,
  ) {
    this.ttlSeconds = configService.getOrThrow<string>('TTL');
  }

  private buildKey(userId: string): string {
    return `auth:user:${userId}`;
  }

  async get(userId: string): Promise<UserAuthorization | null> {
    const raw = await this.redis.get(this.buildKey(userId));
    if (!raw) return null;

    try {
      return JSON.parse(raw) as UserAuthorization;
    } catch (error) {
      this.logger.error(
        { userId, error },
        'failed to parse cached authorization',
      );
      return null;
    }
  }

  async set(userId: string, data: UserAuthorization): Promise<void> {
    await this.redis.set(
      this.buildKey(userId),
      JSON.stringify(data),
      'EX',
      this.ttlSeconds,
    );
  }

  async invalidate(userId: string): Promise<void> {
    await this.redis.del(this.buildKey(userId));
    this.logger.log({ userId }, 'authorization cache invalidated');
  }
}
