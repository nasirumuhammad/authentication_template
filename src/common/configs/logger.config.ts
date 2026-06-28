import { LoggerModuleAsyncParams, Params } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';

export const pinoConfig: LoggerModuleAsyncParams = {
  inject: [ConfigService],
  useFactory: (configService: ConfigService): Params => ({
    pinoHttp: {
      level: configService.get<string>('LOG_LEVEL', 'info'),

      transport:
        configService.get<string>('NODE_ENV') !== 'production'
          ? {
              target: 'pino-pretty',
              options: {
                colorize: true,
                singleLine: false,
                translateTime: 'SYS:standard',
                ignore: 'pid,hostname',
              },
            }
          : undefined,

      genReqId: (req) => {
        return req.headers['x-request-id']?.toString() ?? crypto.randomUUID();
      },

      redact: {
        paths: [
          'req.headers.authorization',
          'req.headers.cookie',
          'req.body.password',
          'req.body.confirmPassword',
          'req.body.token',
          'req.body.refreshToken',
          'req.body.accessToken',
        ],
        censor: '[REDACTED]',
      },

      autoLogging: {
        ignore: (req) => req.url === '/health' || req.url === '/favicon.ico',
      },

      serializers: {
        req(req) {
          return {
            id: req.id,
            method: req.method,
            url: req.url,
            query: req.query,
            params: req.params,
          };
        },

        res(res) {
          return {
            statusCode: res.statusCode,
          };
        },

        err(err) {
          return {
            type: err.name,
            message: err.message,
            stack: err.stack,
          };
        },
      },

      customSuccessMessage(req, res) {
        return `${req.method} ${req.url} completed with ${res.statusCode}`;
      },

      customErrorMessage(req, res, error) {
        return `${req.method} ${req.url} failed: ${error.message}`;
      },

      customReceivedMessage(req) {
        return `${req.method} ${req.url} received`;
      },
    },
  }),
};
