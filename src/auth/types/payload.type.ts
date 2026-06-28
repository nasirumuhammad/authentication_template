import { Role } from '@/rbac/role/entities/role.entity';

export type Payload = {
  sub: string;
  jti: string;
  version: number;
  role: Role[];
};

export type ResetPasswordPayload = {
  sub: string; // userId
  email: string;
  purpose: 'reset-password';
};
