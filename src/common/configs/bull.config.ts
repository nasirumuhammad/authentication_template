import { SharedBullAsyncConfiguration } from "@nestjs/bullmq";
import { ConfigService } from "@nestjs/config";

export const bullConfig:SharedBullAsyncConfiguration = {
      inject: [ConfigService],
      useFactory(configService: ConfigService) {
        const host = configService.getOrThrow<string>('REDIS_HOST');
        const port = Number(configService.getOrThrow<number>('REDIS_PORT'));
        return {
          connection: {
            host,
            port,
          },
        };
      },
    }