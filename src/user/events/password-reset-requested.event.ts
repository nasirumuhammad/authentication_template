import { User } from '../entities/user.entity';

export class PasswordResetRequestedEvent {
  constructor(
    public readonly user: User,
    public readonly otp: string,
  ) {}
}
