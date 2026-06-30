import { User } from '@/user/entities/user.entity';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger('AuditInterceptor');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<Request>();
    const startMs = Date.now();
    const requestId = req.headers['x-request-id'] ?? randomUUID();

    return next.handle().pipe(
      tap((data) => {
        const res = context.switchToHttp().getResponse<Response>();
        this.logger.log(
          {
            requestId,
            userId: (req.user as User)?.id ?? null,
            method: req.method,
            route: req.route?.path ?? req.url,
            ip: req.ip,
            statusCode: res.statusCode,
            durationMs: Date.now() - startMs,
          },
          'Request completed',
        );
      }),
    );
  }
}
