import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

export interface StandardResponse<T> {
  message: string;
  data: T | null;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  StandardResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<StandardResponse<T>> {
    return next.handle().pipe(
      map((response) => {
        if (typeof response === 'string') {
          return { message: response, data: null };
        }

        if (response && typeof response === 'object' && 'message' in response) {
          return {
            message: response.message,
            data: response.data ?? null,
          };
        }

        return {
          message: 'Request successful',
          data: response ?? null,
        };
      }),
    );
  }
}
