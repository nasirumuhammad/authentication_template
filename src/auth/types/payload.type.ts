import { Role } from '@/rbac/role/entities/role.entity';

export type Payload = {
  sub: string;
  jti: string;
  version: number;
};

export type ResetPasswordPayload = {
  sub: string;
  email: string;
  purpose: 'reset-password';
};
