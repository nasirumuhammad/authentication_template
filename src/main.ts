import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { formatValidationErrors } from './common/utils/validation.util';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      exceptionFactory(errors) {
        return new BadRequestException(formatValidationErrors(errors));
      },
    }),
  );
  app.useLogger(app.get(Logger));
  app.flushLogs();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
