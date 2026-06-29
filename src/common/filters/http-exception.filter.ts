import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

export interface ErrorResponse {
  message: string;
  errors: Record<string, string[]> | null;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse = this.buildErrorResponse(exception);

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        { url: request.url, method: request.method, status, exception },
        'Unhandled exception',
      );
    }

    response.status(status).json(errorResponse);
  }

  private buildErrorResponse(exception: unknown): ErrorResponse {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();

      if (typeof response === 'object' && 'message' in response) {
        const message = (response as any).message;

        if (typeof message === 'object' && !Array.isArray(message)) {
          return {
            message: 'Validation failed',
            errors: message as Record<string, string[]>,
          };
        }

        if (typeof message === 'string') {
          return { message, errors: null };
        }
      }

      if (typeof response === 'string') {
        return { message: response, errors: null };
      }
    }

    return {
      message: 'An unexpected error occurred',
      errors: null,
    };
  }
}
